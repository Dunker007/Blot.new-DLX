import React, { useState, useRef } from 'react';
import { geminiService } from '../../services/gemini/geminiService';

const AudioTranscriber: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
          const result = await geminiService.transcribeAudio(audioBlob);
          setTranscription(result);
        } catch (e) {
          console.error(e);
          setError('Failed to transcribe audio. Please check your Gemini API key.');
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
    <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-900">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-inner p-6 text-center">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Audio Transcription</h2>
        <p className="text-gray-400 mb-6">
          Click the button to start recording your voice. Click again to stop and transcribe.
        </p>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          className={`px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 mx-auto mb-6
            ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? '🛑 Stop Recording' : '🎤 Start Recording'}
        </button>

        <div className="w-full h-48 bg-gray-900/50 rounded-md p-4 text-left overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin text-4xl">⚙️</div>
            </div>
          ) : transcription ? (
            <p className="whitespace-pre-wrap text-white">{transcription}</p>
          ) : (
            <p className="text-gray-500">Transcription will appear here.</p>
          )}
        </div>
        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default AudioTranscriber;

