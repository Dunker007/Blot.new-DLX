import React, { useState, useMemo } from 'react';
import { Tool } from './types';
import Sidebar from './components/Sidebar';
import LiveConversation from './components/LiveConversation';
import Chatbot from './components/Chatbot';
import ImageAnalysis from './components/ImageAnalysis';
import VideoAnalysis from './components/VideoAnalysis';
import ImageGenerator from './components/ImageGenerator';
import AudioTranscriber from './components/AudioTranscriber';
import Header from './components/Header';
import Welcome from './components/Welcome';

const App: React.FC = () => {
    const [activeTool, setActiveTool] = useState<Tool | null>(null);

    const renderActiveTool = () => {
        switch (activeTool) {
            case Tool.LIVE_CONVERSATION:
                return <LiveConversation />;
            case Tool.CHATBOT:
                return <Chatbot />;
            case Tool.IMAGE_ANALYSIS:
                return <ImageAnalysis />;
            case Tool.VIDEO_ANALYSIS:
                return <VideoAnalysis />;
            case Tool.IMAGE_GENERATION:
                return <ImageGenerator />;
            case Tool.AUDIO_TRANSCRIPTION:
                return <AudioTranscriber />;
            default:
                return <Welcome />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
            <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header tool={activeTool} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-800/50">
                    {renderActiveTool()}
                </main>
            </div>
        </div>
    );
};

export default App;
