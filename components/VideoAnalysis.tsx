import React, { useState, useCallback, useRef } from 'react';
import { analyzeVideoFrames } from '../services/geminiService';
import Icon from './Icon';

const FRAME_COUNT = 5;

const VideoAnalysis: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [response, setResponse] = useState<string>('');
    const [error, setError] = useState<string>('');
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                setError('File size exceeds 50MB limit.');
                return;
            }
            setError('');
            setVideoFile(file);
            setVideoSrc(URL.createObjectURL(file));
        }
    };
    
    const extractFrames = (): Promise<{data: string, mimeType: string}[]> => {
        return new Promise((resolve, reject) => {
            const video = videoRef.current;
            if (!video || video.readyState < 1) {
                reject("Video not ready");
                return;
            }

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const frames: {data: string, mimeType: string}[] = [];
            let capturedFrames = 0;

            video.onseeked = () => {
                if(capturedFrames < FRAME_COUNT && context) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    const dataUrl = canvas.toDataURL('image/jpeg');
                    frames.push({
                        data: dataUrl.split(',')[1],
                        mimeType: 'image/jpeg'
                    });
                    capturedFrames++;
                    if (capturedFrames === FRAME_COUNT) {
                        video.currentTime = 0;
                        video.onseeked = null; // Clean up
                        resolve(frames);
                    } else {
                        video.currentTime += video.duration / (FRAME_COUNT + 1);
                    }
                }
            };
            
            video.currentTime = video.duration / (FRAME_COUNT + 1);
        });
    };

    const handleSubmit = useCallback(async () => {
        if (!prompt || !videoFile) {
            setError('Please provide both a video and a prompt.');
            return;
        }
        setIsLoading(true);
        setResponse('');
        setError('');
        try {
            const frames = await extractFrames();
            const result = await analyzeVideoFrames(prompt, frames);
            setResponse(result);
        } catch (e) {
            console.error(e);
            setError('Failed to analyze video. Please check the console for details.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, videoFile]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="flex flex-col bg-gray-800 rounded-lg shadow-inner p-4">
                 <div className="mb-4">
                    <label htmlFor="video-upload" className="block text-sm font-medium text-gray-300 mb-2">Upload Video</label>
                    <input id="video-upload" type="file" accept="video/*" onChange={handleVideoChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30" />
                </div>
                {videoSrc && <video ref={videoRef} src={videoSrc} controls title="Preview of uploaded video for analysis" className="w-full rounded-md mb-4 max-h-80" />}
                <div className="mb-4">
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Your Prompt</label>
                    <textarea id="prompt" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., Summarize this video. What are the key events?" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <button onClick={handleSubmit} disabled={isLoading || !videoFile || !prompt} className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                    {isLoading ? 'Analyzing...' : 'Analyze Video'}
                </button>
                {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
            </div>
            <div className="flex flex-col bg-gray-800 rounded-lg shadow-inner p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Analysis Result</h3>
                <div className="flex-1 bg-gray-900/50 rounded-md p-4 overflow-y-auto">
                     {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Icon name="chip" className="w-12 h-12 text-cyan-500 animate-spin" />
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap">{response || "Analysis will appear here."}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoAnalysis;
