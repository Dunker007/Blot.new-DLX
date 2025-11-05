/**
 * Comms Channel Lab
 * Real-time audio transcription interface
 * Uses Content Strategist agent for content analysis
 */

import React, { useState, useEffect, useRef } from 'react';
import { agentService } from '../../services/agentService';
import { Agent } from './types';
import AgentChat from '../../components/labs/AgentChat';
import { geminiService } from '../../services/gemini/geminiService';
import {
  Mic,
  MicOff,
  Square,
  FileText,
  Loader2,
  Volume2,
  Download,
} from 'lucide-react';

interface Transcription {
  id: string;
  audioBlob?: Blob;
  transcript: string;
  summary?: string;
  timestamp: string;
  duration?: number;
}

const CommsChannel: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const loadAgents = async () => {
      const labAgents = await agentService.getLabAgentList('comms');
      setAgents(labAgents);
    };
    loadAgents();
  }, []);

  const hasGlobalHelper = agentService.labUsesGlobalHelper('comms');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscribe(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access denied or not available');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribe = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError(null);

    const transcription: Transcription = {
      id: `trans-${Date.now()}`,
      audioBlob,
      transcript: '',
      timestamp: new Date().toISOString(),
    };

    setTranscriptions((prev) => [transcription, ...prev]);

    try {
      // Use Gemini for audio transcription
      const transcript = await geminiService.transcribeAudio(audioBlob);

      // Get summary using Content Strategist if available
      const contentStrategist = agents.find((a) => a.id === 'content-strategist');
      let summary: string | undefined;
      if (contentStrategist && transcript) {
        const summaryPrompt = `Summarize this transcription and extract key points:\n\n${transcript}`;
        summary = await geminiService.generateText(summaryPrompt, contentStrategist.model);
      }

      setTranscriptions((prev) =>
        prev.map((t) =>
          t.id === transcription.id
            ? {
                ...t,
                transcript,
                summary,
              }
            : t
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
      setTranscriptions((prev) =>
        prev.map((t) =>
          t.id === transcription.id
            ? {
                ...t,
                transcript: 'Transcription failed. Please try again.',
              }
            : t
        )
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-cyan-500/20 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-cyan-400">Comms Channel</h1>
        </div>
        <p className="text-gray-400">Real-time audio transcription interface</p>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Recording Interface */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 mb-6">
          <div className="text-center">
            <div className="mb-6">
              {isRecording ? (
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                    <MicOff className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-75"></div>
                </div>
              ) : (
                <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center mx-auto">
                  <Mic className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">
              {isRecording ? 'Recording...' : 'Ready to Record'}
            </h2>

            <div className="flex items-center justify-center gap-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <Mic className="w-5 h-5" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <Square className="w-5 h-5" />
                  Stop Recording
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Transcriptions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Transcriptions</h2>
          {isTranscribing && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                <span className="text-gray-300">Transcribing audio...</span>
              </div>
            </div>
          )}

          {transcriptions.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No transcriptions yet</p>
              <p className="text-sm text-gray-500 mt-2">Click "Start Recording" to begin</p>
            </div>
          ) : (
            transcriptions.map((transcription) => (
              <div
                key={transcription.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-gray-400">
                      {new Date(transcription.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {transcription.audioBlob && (
                    <button
                      onClick={() => {
                        const url = URL.createObjectURL(transcription.audioBlob!);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `recording-${transcription.id}.webm`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="p-2 hover:bg-slate-700 rounded transition-colors"
                      title="Download Audio"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Transcript</h3>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {transcription.transcript || 'Transcribing...'}
                      </p>
                    </div>
                  </div>

                  {transcription.summary && (
                    <div>
                      <h3 className="font-semibold text-cyan-400 mb-2">Summary</h3>
                      <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{transcription.summary}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Agent Chat */}
      {agents.length > 0 && (
        <AgentChat
          agents={hasGlobalHelper ? [...agents, agentService.getGlobalHelperAgent()] : agents}
          defaultAgentId={agents.find((a) => a.id === 'content-strategist')?.id || agents[0]?.id}
          labId="comms"
          compact={false}
        />
      )}
    </div>
  );
};

export default CommsChannel;

