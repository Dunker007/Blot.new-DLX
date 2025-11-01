import { useState } from 'react';
import Layout from './components/Layout';
import AICommandCenter from './components/AICommandCenter';
import CryptoIntegration from './components/CryptoIntegration';
import CryptoTradingHub from './components/CryptoTradingHub';
import AIMagicDevLab from './components/AIMagicDevLab';
import Workspace from './components/Workspace';
import Projects from './components/Projects';
import EnhancedSettings from './components/EnhancedSettings';
import KnowledgeBase from './components/KnowledgeBase';
import ConnectionDashboard from './components/ConnectionDashboard';
import EnhancedAnalyticsDashboard from './components/EnhancedAnalyticsDashboard';
import BusinessModelGenerator from './components/BusinessModelGenerator';
import AutoAffiliateContentFactory from './components/AutoAffiliateContentFactory';
import PremiumPricing from './components/PremiumPricing';
import AIGuide from './components/AIGuide';
// Error boundary available for wrapping components
// import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AICommandCenter onNavigate={setCurrentView} />;
      case 'crypto':
        return <CryptoIntegration onNavigate={setCurrentView} />;
      case 'dev-lab':
        return <AIMagicDevLab />;
      case 'workspace':
        return <Workspace />;
      case 'projects':
        return <Projects />;
      case 'trading':
        return <CryptoTradingHub />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'connections':
        return <ConnectionDashboard />;
      case 'analytics':
        return <EnhancedAnalyticsDashboard />;
      case 'business-generator':
        return <BusinessModelGenerator isPremium={true} />;
      case 'content-factory':
        return <AutoAffiliateContentFactory isPremium={true} />;
      case 'pricing':
        return <PremiumPricing onSelectPlan={(planId) => console.log('Selected plan:', planId)} />;
      case 'settings':
        return <EnhancedSettings />;
      default:
        return <AICommandCenter onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
      <AIGuide currentView={currentView} onNavigate={setCurrentView} />
    </Layout>
  );
}

export default App;
