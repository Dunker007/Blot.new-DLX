import React from 'react';
import { Tool } from '../types';
import Icon from './Icon';

interface SidebarProps {
    activeTool: Tool | null;
    setActiveTool: (tool: Tool) => void;
}

const tools: { name: Tool; icon: keyof typeof Icon.library }[] = [
    { name: Tool.LIVE_CONVERSATION, icon: 'microphone' },
    { name: Tool.CHATBOT, icon: 'chat' },
    { name: Tool.IMAGE_ANALYSIS, icon: 'image' },
    { name: Tool.VIDEO_ANALYSIS, icon: 'video' },
    { name: Tool.IMAGE_GENERATION, icon: 'sparkles' },
    { name: Tool.AUDIO_TRANSCRIPTION, icon: 'waveform' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool }) => {
    return (
        <nav className="w-20 md:w-64 bg-gray-900/80 backdrop-blur-md border-r border-cyan-500/20 flex flex-col items-center md:items-start p-2 md:p-4 space-y-2">
            <div className="flex items-center justify-center md:justify-start w-full mb-4 p-2">
                <Icon name="chip" className="w-8 h-8 text-cyan-400" />
                <span className="hidden md:inline text-lg font-semibold ml-3 text-white">LUX AI</span>
            </div>
            {tools.map(({ name, icon }) => (
                <button
                    key={name}
                    onClick={() => setActiveTool(name)}
                    aria-label={name}
                    className={`flex items-center justify-center md:justify-start w-full p-3 rounded-lg transition-all duration-200 ease-in-out
                        ${activeTool === name
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                        }`}
                >
                    <Icon name={icon} className="w-6 h-6" />
                    <span className="hidden md:inline ml-4 font-medium">{name}</span>
                </button>
            ))}
        </nav>
    );
};

export default Sidebar;
