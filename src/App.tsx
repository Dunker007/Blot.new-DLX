import { useState } from 'react';
import SafeLayout from './components/SafeLayout';
// Gradually restoring components with error boundaries
import AICommandCenter from './components/AICommandCenter';
// import CryptoIntegration from './components/CryptoIntegration';
// import CryptoTradingHub from './components/CryptoTradingHub';
// import AIMagicDevLab from './components/AIMagicDevLab';
import Workspace from './components/Workspace';
import Projects from './components/Projects';
import EnhancedSettings from './components/EnhancedSettings';
// import KnowledgeBase from './components/KnowledgeBase';
import ConnectionDashboard from './components/ConnectionDashboard';
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
      {renderView()}
      {/* AIGuide temporarily disabled for debugging */}
    </SafeLayout>
  );
}

export default App;
