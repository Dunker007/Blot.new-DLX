import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DevLab from './components/DevLab';
import Workspace from './components/Workspace';
import Projects from './components/Projects';
import TradingBots from './components/TradingBots';
import Settings from './components/Settings';

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
      case 'settings':
        return <Settings />;
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
