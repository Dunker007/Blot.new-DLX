/**
 * Labs Router - Routes to individual lab components
 */

import React, { Suspense, lazy } from 'react';
import { LabId } from './types';
import LabsHub from './LabsHub';

// Lazy load lab components
const AuraInterface = lazy(() => import('./AuraInterface'));

interface LabsRouterProps {
  activeLabId: LabId | 'hub' | null;
  onSelectLab: (labId: LabId | 'hub') => void;
}

const LabsRouter: React.FC<LabsRouterProps> = ({ activeLabId, onSelectLab }) => {
  const renderLab = () => {
    if (!activeLabId || activeLabId === 'hub') {
      return <LabsHub onSelectLab={onSelectLab} />;
    }

    switch (activeLabId) {
      case 'aura':
        return <AuraInterface />;
      case 'forge':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">⚙️</div>
              <h2 className="text-3xl font-bold text-cyan-400 mb-2">Agent Forge</h2>
              <p className="text-gray-400 mb-4">Coming soon - Create and manage AI agents</p>
              <button
                onClick={() => onSelectLab('hub')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg"
              >
                Back to Labs Hub
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-cyan-400 mb-2">Lab Coming Soon</h2>
              <p className="text-gray-400 mb-4">This lab is under development</p>
              <button
                onClick={() => onSelectLab('hub')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg"
              >
                Back to Labs Hub
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading lab...</p>
          </div>
        </div>
      }
    >
      {renderLab()}
    </Suspense>
  );
};

export default LabsRouter;

