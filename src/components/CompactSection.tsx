/**
 * Compact Section Component
 * Ultra-compact section wrapper with minimal spacing
 */

import React, { ReactNode } from 'react';
import { HolographicCard } from './HolographicCard';

interface CompactSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  card?: boolean;
  glow?: 'cyan' | 'magenta' | 'purple' | 'none';
}

export const CompactSection: React.FC<CompactSectionProps> = ({
  title,
  children,
  className = '',
  card = false,
  glow = 'none',
}) => {
  const content = (
    <>
      {title && (
        <h3 className="text-xs font-semibold text-cyan-400 mb-1.5 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-1">{children}</div>
    </>
  );

  if (card) {
    return (
      <HolographicCard glow={glow} className={className}>
        {content}
      </HolographicCard>
    );
  }

  return <div className={className}>{content}</div>;
};

