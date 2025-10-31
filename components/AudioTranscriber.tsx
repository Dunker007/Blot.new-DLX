import React, { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../services/geminiService';
import Icon from './Icon';

const AudioTranscriber: React.FC = () => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [transcription, setTranscription] = useState<string>('');
    const [error, setError] = useState<string>('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const fileToBase64 = (file: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const startRecording = async () => {
        setTranscription('');
        setError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = async () => {
                setIsLoading(true);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                audioChunksRef.current = [];
                 try {
                    const base64Data = await fileToBase64(audioBlob);
                    const result = await transcribeAudio(base64Data, audioBlob.type);
                    setTranscription(result);
                } catch (e) {
                    console.error(e);
                    setError('Failed to transcribe audio.');
                } finally {
                    setIsLoading(false);
                }
                stream.getTracks().forEach(track => track.stop());
            };
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            setError('Could not access microphone.');
            console.error('Error accessing microphone:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-inner p-6 text-center">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">Audio Transcription</h2>
                <p className="text-gray-400 mb-6">
                    Click the button to start recording your voice. Click again to stop and transcribe.
                </p>

                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoading}
                    className={`px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 mx-auto mb-6
                    ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                >
                    <Icon name={isRecording ? 'stop' : 'microphone'} className="w-6 h-6" />
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>

                <div className="w-full h-48 bg-gray-900/50 rounded-md p-4 text-left overflow-y-auto">
                    {isLoading ? (
                         <div className="flex items-center justify-center h-full">
                            <Icon name="chip" className="w-12 h-12 text-cyan-500 animate-spin" />
                         </div>
                    ) : transcription ? (
                        <p className="whitespace-pre-wrap">{transcription}</p>
                    ): (
                        <p className="text-gray-500">Transcription will appear here.</p>
                    )}
                </div>
                 {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
            </div>
        </div>
    );
};

export default AudioTranscriber;
