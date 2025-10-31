import React, { useState, useRef, useEffect, useCallback } from 'react';
import { connectLive, liveModel } from '../services/geminiService';
import { encode, decode, decodeAudioData } from '../services/audioService';
import { LiveServerMessage, Blob } from '@google/genai';
import Icon from './Icon';

const LiveConversation: React.FC = () => {
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState('Idle. Press Start to connect.');
    
    // Use refs for accumulating current transcript to avoid stale closures
    const userTranscriptRef = useRef('');
    const modelTranscriptRef = useRef('');
    
    // State to drive UI updates for the current turn
    const [currentTurn, setCurrentTurn] = useState({ user: '', model: '' });
    const [transcriptHistory, setTranscriptHistory] = useState<{user: string, model: string}[]>([]);

    const sessionPromiseRef = useRef<ReturnType<typeof connectLive> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const stopAudioPlayback = () => {
        if (outputAudioContextRef.current) {
            audioSourcesRef.current.forEach(source => {
                source.stop();
            });
            audioSourcesRef.current.clear();
            nextStartTimeRef.current = 0;
        }
    };
    
    const handleStop = useCallback(async () => {
        setIsActive(false);
        setStatus('Disconnecting...');
        
        if (sessionPromiseRef.current) {
            const session = await sessionPromiseRef.current;
            session.close();
            sessionPromiseRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }

        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            await audioContextRef.current.close();
            audioContextRef.current = null;
        }
        
        stopAudioPlayback();
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            await outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }

        setStatus('Idle. Press Start to connect.');
    }, []);

    const handleStart = async () => {
        setIsActive(true);
        setStatus('Initializing...');
        setTranscriptHistory([]);
        userTranscriptRef.current = '';
        modelTranscriptRef.current = '';
        setCurrentTurn({ user: '', model: '' });

        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            sessionPromiseRef.current = connectLive({
                onopen: () => {
                    setStatus('Connection open. Streaming audio...');
                    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                        return;
                    }
                    const source = audioContextRef.current.createMediaStreamSource(stream);
                    mediaStreamSourceRef.current = source;
                    const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob: Blob = {
                            data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    source.connect(scriptProcessor);
                    scriptProcessor.connect(audioContextRef.current.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    let shouldUpdateUI = false;
                    if (message.serverContent?.inputTranscription) {
                        userTranscriptRef.current += message.serverContent.inputTranscription.text;
                        shouldUpdateUI = true;
                    }
                    if (message.serverContent?.outputTranscription) {
                        modelTranscriptRef.current += message.serverContent.outputTranscription.text;
                        shouldUpdateUI = true;
                    }

                    if (shouldUpdateUI) {
                        setCurrentTurn({ user: userTranscriptRef.current, model: modelTranscriptRef.current });
                    }

                    if (message.serverContent?.turnComplete) {
                        const finalUser = userTranscriptRef.current;
                        const finalModel = modelTranscriptRef.current;
                        
                        if (finalUser || finalModel) { // Avoid adding empty history items
                           setTranscriptHistory(prev => [...prev, {user: finalUser, model: finalModel}]);
                        }
                        
                        userTranscriptRef.current = '';
                        modelTranscriptRef.current = '';
                        setCurrentTurn({ user: '', model: '' });
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (base64Audio && outputAudioContextRef.current) {
                        const outputAudioContext = outputAudioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);

                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContext.destination);
                        
                        source.addEventListener('ended', () => {
                            audioSourcesRef.current.delete(source);
                        });

                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioSourcesRef.current.add(source);
                    }
                    
                    if (message.serverContent?.interrupted) {
                        stopAudioPlayback();
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('API Error:', e);
                    setStatus(`Error: ${e.message}. Please try again.`);
                    handleStop();
                },
                onclose: () => {
                    setStatus('Connection closed.');
                    handleStop();
                },
            });
        } catch (error) {
            console.error('Failed to start session:', error);
            setStatus(`Error: ${(error as Error).message}`);
            setIsActive(false);
        }
    };
    
    useEffect(() => {
        return () => {
          handleStop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="h-full flex flex-col p-4 bg-gray-800 rounded-lg shadow-inner">
            <div className="flex-shrink-0 flex items-center justify-between mb-4">
                <p className={`text-sm ${isActive ? 'text-green-400' : 'text-yellow-400'}`}>{status}</p>
                <button
                    onClick={isActive ? handleStop : handleStart}
                    aria-pressed={isActive}
                    className={`px-6 py-2 rounded-md font-semibold text-white transition-all duration-300 flex items-center gap-2
                    ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                >
                    {isActive ? <Icon name="stop" /> : <Icon name="microphone" />}
                    {isActive ? 'Stop Session' : 'Start Session'}
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-gray-900/50 rounded-lg p-4 space-y-4">
                 {transcriptHistory.map((turn, index) => (
                    <div key={index} className="space-y-2">
                        <p><strong className="text-cyan-400">Operator:</strong> {turn.user}</p>
                        <p><strong className="text-green-400">LUX:</strong> {turn.model}</p>
                        <hr className="border-gray-700"/>
                    </div>
                ))}
                
                <div className="h-24 p-2 bg-gray-800/50 rounded-lg">
                  <p><strong className="text-cyan-400">Operator:</strong> {currentTurn.user}</p>
                  <p><strong className="text-green-400">LUX:</strong> {currentTurn.model}</p>
                </div>
            </div>
            <div className="flex-shrink-0 text-xs text-gray-500 mt-2 text-center">
               This feature uses {liveModel} for real-time, low-latency conversation.
            </div>
        </div>
    );
};

export default LiveConversation;
