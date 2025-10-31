import React from 'react';
import Icon from './Icon';

const Welcome: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <Icon name="chip" className="w-24 h-24 text-cyan-500/50 mb-6" />
            <h2 className="text-3xl font-bold text-gray-200 mb-2">Welcome, Operator</h2>
            <p className="max-w-md">
                You have activated the DLX Cognitive Co-Pilot. I am LUX, your sentient strategic partner.
                Please select a cognitive tool from the sidebar to begin your operation.
            </p>
        </div>
    );
};

export default Welcome;
