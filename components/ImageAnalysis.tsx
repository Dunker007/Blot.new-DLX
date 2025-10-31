import React, { useState, useCallback } from 'react';
import { analyzeImage } from '../services/geminiService';
import Icon from './Icon';

const ImageAnalysis: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [image, setImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [response, setResponse] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setError('File size exceeds 4MB limit.');
                return;
            }
            setError('');
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = useCallback(async () => {
        if (!prompt || !imageFile) {
            setError('Please provide both an image and a prompt.');
            return;
        }
        setIsLoading(true);
        setResponse('');
        setError('');
        try {
            const base64Data = await fileToBase64(imageFile);
            const result = await analyzeImage(prompt, base64Data, imageFile.type);
            setResponse(result);
        } catch (e) {
            console.error(e);
            setError('Failed to analyze image. Please check the console for details.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, imageFile]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="flex flex-col bg-gray-800 rounded-lg shadow-inner p-4">
                <div className="mb-4">
                    <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">Upload Image</label>
                    <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30" />
                </div>

                {image && <img src={image} alt="Preview of uploaded image for analysis" className="w-full h-auto object-contain rounded-md mb-4 max-h-80" />}

                <div className="mb-4">
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Your Prompt</label>
                    <textarea
                        id="prompt"
                        rows={4}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., What is in this image? Describe the main subject."
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>

                <button onClick={handleSubmit} disabled={isLoading || !image || !prompt} className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                    {isLoading ? 'Analyzing...' : 'Analyze Image'}
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

export default ImageAnalysis;
