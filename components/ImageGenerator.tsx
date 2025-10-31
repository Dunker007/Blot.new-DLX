import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import Icon from './Icon';

const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<string>('1:1');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string>('');

    const handleSubmit = useCallback(async () => {
        if (!prompt) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setGeneratedImage(null);
        setError('');

        try {
            const imageUrl = await generateImage(prompt, aspectRatio);
            setGeneratedImage(imageUrl);
        } catch (e) {
            console.error(e);
            setError('Failed to generate image. Please check the console for details.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, aspectRatio]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="flex flex-col bg-gray-800 rounded-lg shadow-inner p-4 space-y-4">
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Your Prompt</label>
                    <textarea
                        id="prompt"
                        rows={6}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A photorealistic image of a futuristic command center on Mars, with holographic displays."
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <div>
                    <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                    <select
                        id="aspect-ratio"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        {aspectRatios.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                    </select>
                </div>
                <button onClick={handleSubmit} disabled={isLoading || !prompt} className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                    {isLoading ? 'Generating...' : 'Generate Image'}
                </button>
                {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
            </div>
            <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg shadow-inner p-4">
                <div className="w-full h-full flex items-center justify-center bg-gray-900/50 rounded-md">
                    {isLoading ? (
                        <Icon name="chip" className="w-16 h-16 text-cyan-500 animate-spin" />
                    ) : generatedImage ? (
                        <img src={generatedImage} alt={prompt ? `AI generated image: ${prompt}` : 'AI generated image'} className="max-w-full max-h-full object-contain rounded-md" />
                    ) : (
                        <div className="text-center text-gray-500">
                            <Icon name="image" className="w-24 h-24 mx-auto mb-2" />
                            <p>Generated image will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageGenerator;
