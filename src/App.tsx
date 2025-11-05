import { Suspense, lazy, useState } from 'react';

import SafeLayout from './components/SafeLayout';

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
// import BusinessModelGenerator from './components/BusinessModelGenerator';
// import AutoAffiliateContentFactory from './components/AutoAffiliateContentFactory';
// import PremiumPricing from './components/PremiumPricing';
// import AIGuide from './components/AIGuide';
// Error boundary available for wrapping components
// import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        try {
          return <AICommandCenter onNavigate={setCurrentView} />;
        } catch (error) {
          console.error('AICommandCenter error:', error);
          return (
            <div className="p-8 text-white">
              <h1 className="text-3xl font-bold mb-4 text-red-400">Dashboard Error</h1>
              <p>AICommandCenter failed to load. Using safe fallback.</p>
            </div>
          );
        }
      case 'workspace':
        return <Workspace />;
      case 'projects':
        return <Projects />;
      case 'connections':
        return <ConnectionDashboard />;
      case 'settings':
        return <EnhancedSettings />;
      // New DLX-Studios-Ultimate modules
      case 'monaco-editor':
        return <MonacoEditorPage />;
      case 'audio-transcriber':
        return <AudioTranscriber />;
      case 'image-analysis':
        return <ImageAnalysis />;
      case 'mind-map':
        return <MindMapPage />;
      default:
        try {
          return <AICommandCenter onNavigate={setCurrentView} />;
        } catch (error) {
          console.error('Default AICommandCenter error:', error);
          return (
            <div className="p-8 text-white">
              <h1 className="text-3xl font-bold mb-4">AI Command Center</h1>
              <p>Loading in safe mode...</p>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setCurrentView('workspace')}
                  className="block px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
                >
                  Go to Workspace
                </button>
                <button
                  onClick={() => setCurrentView('projects')}
                  className="block px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
                >
                  Go to Projects
                </button>
                <button
                  onClick={() => setCurrentView('connections')}
                  className="block px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
                >
                  Go to Connections
                </button>
              </div>
            </div>
          );
        }
    }
  };

  return (
    <SafeLayout currentView={currentView} onViewChange={setCurrentView}>
      <Suspense fallback={<LoadingFallback />}>{renderView()}</Suspense>
      {/* AIGuide temporarily disabled for debugging */}
    </SafeLayout>
  );
}

export default App;
