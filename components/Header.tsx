import React from 'react';
import { Tool } from '../types';

interface HeaderProps {
    tool: Tool | null;
}

const Header: React.FC<HeaderProps> = ({ tool }) => {
    return (
        <header className="bg-gray-900/70 backdrop-blur-sm p-4 border-b border-cyan-500/20 shadow-lg">
            <h1 className="text-xl font-bold text-cyan-400">
                DLX Cognitive Co-Pilot
                {tool && <span className="text-gray-400 font-normal"> / {tool}</span>}
            </h1>
        </header>
    );
};

export default Header;
