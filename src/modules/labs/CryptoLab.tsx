/**
 * Crypto Lab
 * Comprehensive cryptocurrency analysis, portfolio tracking, trading bots, and research tools
 * Inspired by Kubera, 3Commas, CoinMarketCap, and Into the Cryptoverse
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, Wallet, TrendingUp, BarChart3, 
  Search, Bot, Newspaper, Settings, Coins, Filter, 
  Calculator, Activity, AlertTriangle, Flame, BookOpen,
  PieChart, FileText, TrendingDown, Wrench, Zap, Target
} from 'lucide-react';
import Dashboard from './crypto/Dashboard';
import PortfolioTracker from './crypto/PortfolioTracker';
import Holdings from './crypto/Holdings';
import Transactions from './crypto/Transactions';
import PortfolioRisk from './crypto/PortfolioRisk';
import MarketOverview from './crypto/MarketOverview';
import MarketScreener from './crypto/MarketScreener';
import Trending from './crypto/Trending';
import PriceCharts from './crypto/PriceCharts';
import NewsFeed from './crypto/NewsFeed';
import MemeTracker from './crypto/MemeTracker';
import SocialSentiment from './crypto/SocialSentiment';
import BotBuilder from './crypto/BotBuilder';
import BotLibrary from './crypto/BotLibrary';
import BotBacktester from './crypto/BotBacktester';
import BotManager from './crypto/BotManager';
import DCA from './crypto/DCA';
import OnChainAnalytics from './crypto/OnChainAnalytics';
import RiskIndicators from './crypto/RiskIndicators';
import CycleAnalysis from './crypto/CycleAnalysis';
import CustomIndicators from './crypto/CustomIndicators';
import ExitStrategies from './crypto/ExitStrategies';
import ArbitrageFinder from './crypto/ArbitrageFinder';
import YieldOptimizer from './crypto/YieldOptimizer';

type TabId = 'dashboard' | 'portfolio' | 'markets' | 'charts' | 'news' | 'bots' | 'research' | 'tools';
type SubTabId = 'overview' | 'screener' | 'tracker' | 'dca' | 'onchain' | 'risk' | 'holdings' | 'transactions' | 'risk-analysis' | 'trending' | 'sentiment' | 'builder' | 'library' | 'backtester' | 'manager' | 'cycle' | 'indicators' | 'exit' | 'arbitrage' | 'yield';

const CryptoLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('tracker');

  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode; hasSubTabs?: boolean }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'portfolio', label: 'Portfolio', icon: <Wallet className="w-4 h-4" />, hasSubTabs: true },
    { id: 'markets', label: 'Markets', icon: <TrendingUp className="w-4 h-4" />, hasSubTabs: true },
    { id: 'charts', label: 'Charts', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'research', label: 'Research', icon: <BookOpen className="w-4 h-4" />, hasSubTabs: true },
    { id: 'news', label: 'News', icon: <Newspaper className="w-4 h-4" />, hasSubTabs: true },
    { id: 'bots', label: 'Bots', icon: <Bot className="w-4 h-4" />, hasSubTabs: true },
    { id: 'tools', label: 'Tools', icon: <Wrench className="w-4 h-4" />, hasSubTabs: true },
  ];

  const getSubTabs = (): Array<{ id: SubTabId; label: string; icon: React.ReactNode }> | null => {
    switch (activeTab) {
      case 'portfolio':
        return [
          { id: 'tracker', label: 'Tracker', icon: <Wallet className="w-4 h-4" /> },
          { id: 'holdings', label: 'Holdings', icon: <PieChart className="w-4 h-4" /> },
          { id: 'transactions', label: 'Transactions', icon: <FileText className="w-4 h-4" /> },
          { id: 'risk-analysis', label: 'Risk Analysis', icon: <AlertTriangle className="w-4 h-4" /> },
          { id: 'dca', label: 'DCA Simulator', icon: <Calculator className="w-4 h-4" /> },
        ];
      case 'markets':
        return [
          { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'screener', label: 'Screener', icon: <Filter className="w-4 h-4" /> },
          { id: 'trending', label: 'Trending', icon: <TrendingDown className="w-4 h-4" /> },
        ];
      case 'research':
        return [
          { id: 'onchain', label: 'On-Chain', icon: <Activity className="w-4 h-4" /> },
          { id: 'risk', label: 'Risk Indicators', icon: <AlertTriangle className="w-4 h-4" /> },
          { id: 'cycle', label: 'Cycle Analysis', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'indicators', label: 'Custom Indicators', icon: <Settings className="w-4 h-4" /> },
        ];
      case 'news':
        return [
          { id: 'overview', label: 'News Feed', icon: <Newspaper className="w-4 h-4" /> },
          { id: 'tracker', label: 'Meme Tracker', icon: <Flame className="w-4 h-4" /> },
          { id: 'sentiment', label: 'Social Sentiment', icon: <TrendingUp className="w-4 h-4" /> },
        ];
      case 'bots':
        return [
          { id: 'builder', label: 'Bot Builder', icon: <Bot className="w-4 h-4" /> },
          { id: 'library', label: 'Library', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'backtester', label: 'Backtester', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'manager', label: 'Manager', icon: <Settings className="w-4 h-4" /> },
        ];
      case 'tools':
        return [
          { id: 'exit', label: 'Exit Strategies', icon: <Target className="w-4 h-4" /> },
          { id: 'arbitrage', label: 'Arbitrage', icon: <Zap className="w-4 h-4" /> },
          { id: 'yield', label: 'Yield Optimizer', icon: <TrendingUp className="w-4 h-4" /> },
        ];
      default:
        return null;
    }
  };

  const renderContent = () => {
    // Handle sub-tabs
    if (activeTab === 'portfolio') {
      switch (activeSubTab) {
        case 'tracker':
          return <PortfolioTracker />;
        case 'holdings':
          return <Holdings />;
        case 'transactions':
          return <Transactions />;
        case 'risk-analysis':
          return <PortfolioRisk />;
        case 'dca':
          return <DCA />;
        default:
          return <PortfolioTracker />;
      }
    }
    if (activeTab === 'markets') {
      switch (activeSubTab) {
        case 'overview':
          return <MarketOverview />;
        case 'screener':
          return <MarketScreener />;
        case 'trending':
          return <Trending />;
        default:
          return <MarketOverview />;
      }
    }
    if (activeTab === 'research') {
      switch (activeSubTab) {
        case 'onchain':
          return <OnChainAnalytics />;
        case 'risk':
          return <RiskIndicators />;
        case 'cycle':
          return <CycleAnalysis />;
        case 'indicators':
          return <CustomIndicators />;
        default:
          return <OnChainAnalytics />;
      }
    }
    if (activeTab === 'news') {
      switch (activeSubTab) {
        case 'overview':
          return <NewsFeed />;
        case 'tracker':
          return <MemeTracker />;
        case 'sentiment':
          return <SocialSentiment />;
        default:
          return <NewsFeed />;
      }
    }
    if (activeTab === 'bots') {
      switch (activeSubTab) {
        case 'builder':
          return <BotBuilder />;
        case 'library':
          return <BotLibrary />;
        case 'backtester':
          return <BotBacktester />;
        case 'manager':
          return <BotManager />;
        default:
          return <BotBuilder />;
      }
    }
    if (activeTab === 'tools') {
      switch (activeSubTab) {
        case 'exit':
          return <ExitStrategies />;
        case 'arbitrage':
          return <ArbitrageFinder />;
        case 'yield':
          return <YieldOptimizer />;
        default:
          return <ExitStrategies />;
      }
    }

    // Main tabs
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'charts':
        return <PriceCharts />;
      default:
        return <Dashboard />;
    }
  };

  const subTabs = getSubTabs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-cyan-500/20 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-lg">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-cyan-400">Crypto Lab</h1>
        </div>
        <p className="text-gray-400">Comprehensive cryptocurrency analysis, portfolio tracking, and trading tools</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                // Set appropriate default sub-tab based on tab
                if (tab.id === 'portfolio') {
                  setActiveSubTab('tracker');
                } else if (tab.id === 'markets') {
                  setActiveSubTab('overview');
                } else if (tab.id === 'research') {
                  setActiveSubTab('onchain');
                } else if (tab.id === 'news') {
                  setActiveSubTab('overview');
                } else if (tab.id === 'bots') {
                  setActiveSubTab('builder');
                } else if (tab.id === 'tools') {
                  setActiveSubTab('exit');
                } else {
                  setActiveSubTab('overview');
                }
              }}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400 bg-slate-800/50'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
        {/* Sub-tabs */}
        {subTabs && subTabs.length > 0 && (
          <div className="flex overflow-x-auto border-t border-slate-700/50 bg-slate-800/20">
            {subTabs.map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => setActiveSubTab(subTab.id)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  activeSubTab === subTab.id
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {subTab.icon}
                <span className="text-sm font-medium">{subTab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[calc(100vh-200px)]">
        {renderContent()}
      </div>
    </div>
  );
};

export default CryptoLab;

