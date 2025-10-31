import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DevLab from './components/DevLab';
import Workspace from './components/Workspace';
import Projects from './components/Projects';
import TradingBots from './components/TradingBots';
import EnhancedSettings from './components/EnhancedSettings';
import KnowledgeBase from './components/KnowledgeBase';
import ConnectionDashboard from './components/ConnectionDashboard';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'dev-lab':
        return <DevLab />;
      case 'workspace':
        return <Workspace />;
      case 'projects':
        return <Projects />;
      case 'trading':
        return <TradingBots />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'connections':
        return <ConnectionDashboard />;
      case 'settings':
        return <EnhancedSettings />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

export default App;
