/**
 * DLX Logo Components
 * Multiple variations for DLX branding
 */

import React from 'react';

interface DLXLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  className?: string;
}

export const DLXLogo: React.FC<DLXLogoProps> = ({
  variant = 'full',
  size = 'md',
  glow = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const glowClass = glow ? 'dlx-glow-text' : 'text-cyan-400';

  if (variant === 'icon') {
    return (
      <div className={`dlx-hex ${className}`}>
        <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
          <span className={`font-bold ${sizeClasses[size]} text-white`}>DLX</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">D</span>
        </div>
        <span className={`font-bold ${sizeClasses[size]} ${glowClass}`}>DLX</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg group">
          <span className="text-white font-bold text-xl relative z-10">DLX</span>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur-sm"></div>
        </div>
        <div className="flex flex-col">
          <span className={`font-bold ${sizeClasses[size]} ${glowClass} tracking-tight`}>DLX STUDIOS</span>
          <span className="text-xs text-gray-400 font-mono">DLXStudios.ai</span>
        </div>
      </div>
    </div>
  );
};

export const DLXCommandCenter: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-24 h-24 border-4 border-cyan-500 rounded-lg rotate-45 flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-magenta-500 rounded-lg -rotate-45 flex items-center justify-center">
            <span className="text-cyan-400 font-bold text-lg">DLX</span>
          </div>
        </div>
        <div className="absolute inset-0 border-4 border-cyan-500 rounded-lg animate-pulse opacity-50"></div>
      </div>
      <span className="text-cyan-400 font-semibold text-sm dlx-glow-text">COMMAND CENTER</span>
    </div>
  );
};

export const DLXNeuralNetwork: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <svg width="120" height="120" viewBox="0 0 120 120" className="absolute inset-0">
        {/* Neural network nodes */}
        {[20, 40, 60, 80, 100].map((x, i) =>
          [20, 40, 60, 80, 100].map((y, j) => (
            <g key={`${i}-${j}`}>
              <circle
                cx={x}
                cy={y}
                r="3"
                fill={i % 2 === 0 ? '#00ffff' : '#ff00ff'}
                className="animate-pulse"
                style={{ animationDelay: `${(i + j) * 0.1}s` }}
              />
              {i < 4 && (
                <line
                  x1={x}
                  y1={y}
                  x2={x + 20}
                  y2={y}
                  stroke={i % 2 === 0 ? '#00ffff' : '#ff00ff'}
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              )}
              {j < 4 && (
                <line
                  x1={x}
                  y1={y}
                  x2={x}
                  y2={y + 20}
                  stroke={i % 2 === 0 ? '#00ffff' : '#ff00ff'}
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              )}
            </g>
          ))
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-cyan-400 font-bold text-xl dlx-glow-text">DLX</span>
      </div>
    </div>
  );
};

