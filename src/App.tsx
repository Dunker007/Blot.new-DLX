import { Suspense, lazy, useState } from 'react';

import CompactLayout from './components/CompactLayout';

// Lazy load components for code splitting
const AICommandCenter = lazy(() => import('./components/AICommandCenter'));
const ConnectionDashboard = lazy(() => import('./components/ConnectionDashboard'));
const EnhancedSettings = lazy(() => import('./components/EnhancedSettings'));
const Projects = lazy(() => import('./components/Projects'));
const Workspace = lazy(() => import('./components/Workspace'));

// New DLX-Studios-Ultimate modules
const MonacoEditorPage = lazy(() => import('./modules/monaco-editor/MonacoEditorPage'));
const AudioTranscriber = lazy(() => import('./modules/multimodal/AudioTranscriber'));
const ImageAnalysis = lazy(() => import('./modules/multimodal/ImageAnalysis'));
const MindMapPage = lazy(() => import('./modules/mind-map/MindMapPage'));
const FeatureFlags = lazy(() => import('./components/FeatureFlags'));
const IdeaLab = lazy(() => import('./components/IdeaLab'));
const LabsRouter = lazy(() => import('./modules/labs/LabsRouter'));
const TaskManagement = lazy(() => import('./components/TaskManagement'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-400">Loading...</p>
    </div>
  </div>
);

// import EnhancedAnalyticsDashboard from './components/EnhancedAnalyticsDashboard';
import BusinessModelGenerator from './components/BusinessModelGenerator';
import AutoAffiliateContentFactory from './components/AutoAffiliateContentFactory';
// import PremiumPricing from './components/PremiumPricing';
import AIGuide from './components/AIGuide';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeLabId, setActiveLabId] = useState<string | null>(null);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <ErrorBoundary level="component" fallback={(error, errorInfo, retry) => (
            <div className="p-8 text-white">
              <h1 className="text-3xl font-bold mb-4 text-red-400">Dashboard Error</h1>
              <p className="mb-4">AICommandCenter failed to load.</p>
              <button onClick={retry} className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700">
                Retry
              </button>
            </div>
          )}>
            <AICommandCenter onNavigate={setCurrentView} />
          </ErrorBoundary>
        );
      case 'workspace':
        return (
          <ErrorBoundary level="component">
            <Workspace />
          </ErrorBoundary>
        );
      case 'projects':
        return (
          <ErrorBoundary level="component">
            <Projects />
          </ErrorBoundary>
        );
      case 'connections':
        return (
          <ErrorBoundary level="component">
            <ConnectionDashboard />
          </ErrorBoundary>
        );
      case 'settings':
        return (
          <ErrorBoundary level="component">
            <EnhancedSettings />
          </ErrorBoundary>
        );
      case 'feature-flags':
        return (
          <ErrorBoundary level="component">
            <FeatureFlags />
          </ErrorBoundary>
        );
      case 'idea-lab':
        return (
          <ErrorBoundary level="component">
            <IdeaLab />
          </ErrorBoundary>
        );
      case 'labs':
        return (
          <ErrorBoundary level="component">
            <LabsRouter activeLabId={activeLabId as any} onSelectLab={setActiveLabId} />
          </ErrorBoundary>
        );
      case 'tasks':
        return (
          <ErrorBoundary level="component">
            <TaskManagement />
          </ErrorBoundary>
        );
      case 'monaco-editor':
        return (
          <ErrorBoundary level="component">
            <MonacoEditorPage />
          </ErrorBoundary>
        );
      case 'audio-transcriber':
        return (
          <ErrorBoundary level="component">
            <AudioTranscriber />
          </ErrorBoundary>
        );
      case 'image-analysis':
        return (
          <ErrorBoundary level="component">
            <ImageAnalysis />
          </ErrorBoundary>
        );
      case 'mind-map':
        return (
          <ErrorBoundary level="component">
            <MindMapPage />
          </ErrorBoundary>
        );
      case 'business-generator':
        return (
          <ErrorBoundary level="component">
            <BusinessModelGenerator />
          </ErrorBoundary>
        );
      case 'affiliate-factory':
        return (
          <ErrorBoundary level="component">
            <AutoAffiliateContentFactory />
          </ErrorBoundary>
        );
      case 'crypto':
        return (
          <ErrorBoundary level="component">
            <LabsRouter activeLabId="crypto" onSelectLab={() => {}} />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary level="component">
            <AICommandCenter onNavigate={setCurrentView} />
          </ErrorBoundary>
        );
    }
  };

  return (
    <ErrorBoundary level="page" onError={(error) => console.error('App-level error:', error)}>
      <CompactLayout currentView={currentView} onViewChange={setCurrentView}>
        <ErrorBoundary level="component">
          <Suspense fallback={<LoadingFallback />}>{renderView()}</Suspense>
        </ErrorBoundary>
        <AIGuide currentView={currentView} onNavigate={setCurrentView} />
      </CompactLayout>
    </ErrorBoundary>
  );
}

export default App;
