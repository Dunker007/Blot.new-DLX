/**
 * Holographic Card Component
 * Card with holographic effects inspired by command center aesthetic
 */

import React, { ReactNode } from 'react';

interface HolographicCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'cyan' | 'magenta' | 'purple' | 'none';
  compact?: boolean;
  popoutable?: boolean;
  onPopout?: () => void;
}

export const HolographicCard: React.FC<HolographicCardProps> = ({
  children,
  className = '',
  glow = 'cyan',
  compact = true,
  popoutable = false,
  onPopout,
}) => {
  const glowClasses = {
    cyan: 'border-[rgba(0,255,255,0.3)] shadow-[0_0_12px_rgba(0,255,255,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]',
    magenta: 'border-[rgba(255,0,255,0.3)] shadow-[0_0_12px_rgba(255,0,255,0.2)] hover:shadow-[0_0_20px_rgba(255,0,255,0.4)]',
    purple: 'border-[rgba(168,85,247,0.3)] shadow-[0_0_12px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    none: 'border-[rgba(255,255,255,0.1)]',
  };

  const padding = compact ? 'p-2' : 'p-3';

  return (
    <div
      className={`relative bg-[#1a1a2e]/80 backdrop-blur-sm border rounded-lg ${padding} ${glowClasses[glow]} transition-all duration-300 hover:border-opacity-60 group ${className}`}
    >
      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400/50 opacity-50"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400/50 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400/50 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400/50 opacity-50"></div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Popout indicator */}
      {popoutable && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onPopout}
            className="p-1 hover:bg-[rgba(0,255,255,0.1)] rounded text-cyan-400"
            title="Pop out to new window"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

