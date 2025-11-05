import React, { useState, useCallback } from 'react';
import { geminiService } from '../../services/gemini/geminiService';

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
      if (file.size > 4 * 1024 * 1024) {
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

  const handleSubmit = useCallback(async () => {
    if (!prompt || !imageFile) {
      setError('Please provide both an image and a prompt.');
      return;
    }
    setIsLoading(true);
    setResponse('');
    setError('');
    try {
      const result = await geminiService.analyzeImage(imageFile, prompt);
      setResponse(result);
    } catch (e) {
      console.error(e);
      setError('Failed to analyze image. Please check your Gemini API key.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, imageFile]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-4 bg-gray-900">
      <div className="flex flex-col bg-gray-800 rounded-lg shadow-inner p-4">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Image Analysis</h2>
        
        <div className="mb-4">
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">
            Upload Image
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
          />
        </div>

        {image && (
          <img
            src={image}
            alt="Preview"
            className="w-full h-auto object-contain rounded-md mb-4 max-h-80"
          />
        )}

        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
            Your Prompt
          </label>
          <textarea
            id="prompt"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., What is in this image? Describe the main subject."
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !image || !prompt}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Image'}
        </button>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>

      <div className="flex flex-col bg-gray-800 rounded-lg shadow-inner p-4">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Analysis Result</h3>
        <div className="flex-1 bg-gray-900/50 rounded-md p-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin text-4xl">⚙️</div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-white">{response || 'Analysis will appear here.'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysis;

