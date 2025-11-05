/**
 * Labs Router - Routes to individual lab components
 */

import React, { Suspense, lazy } from 'react';
import { LabId } from './types';
import LabsHub from './LabsHub';

// Lazy load lab components
const AuraInterface = lazy(() => import('./AuraInterface'));
const AgentForge = lazy(() => import('./AgentForge'));
const CryptoLab = lazy(() => import('./CryptoLab'));
const CodeReviewLab = lazy(() => import('./CodeReviewLab'));
const DataWeaveLab = lazy(() => import('./DataWeaveLab'));
const SignalLab = lazy(() => import('./SignalLab'));
const CreatorStudio = lazy(() => import('./CreatorStudio'));
const CommsChannel = lazy(() => import('./CommsChannel'));
const DataverseLab = lazy(() => import('./DataverseLab'));
const SystemMatrixLab = lazy(() => import('./SystemMatrixLab'));

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
        return <AgentForge />;
      case 'crypto':
        return <CryptoLab />;
      case 'review':
        return <CodeReviewLab />;
      case 'data-weave':
        return <DataWeaveLab />;
      case 'signal':
        return <SignalLab />;
      case 'creator':
        return <CreatorStudio />;
      case 'comms':
        return <CommsChannel />;
      case 'dataverse':
        return <DataverseLab />;
      case 'system-matrix':
        return <SystemMatrixLab />;
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

