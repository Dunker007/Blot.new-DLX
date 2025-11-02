import { useEffect, useState } from 'react';

import {
  Brain,
  ChevronRight,
  Code2,
  Coins,
  DollarSign,
  Play,
  Rocket,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';

// import TurboHubCore from './TurboHubCore';
import { components, gradients, spacing, utils } from '../styles/designSystem';
import CostSavingsDashboard from './CostSavingsDashboard';
import HolographicBrain from './HolographicBrain';
import LuxRigTester from './LuxRigTester';

interface AICommandCenterProps {
  onNavigate: (view: string) => void;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'crypto' | 'trend' | 'revenue';
  title: string;
  description: string;
  action: string;
  confidence: number;
  potential: string;
  icon: React.ReactNode;
}

export default function AICommandCenter({ onNavigate }: AICommandCenterProps) {
  const [currentInsight, setCurrentInsight] = useState(0);
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    activeProjects: 0,
    aiCallsToday: 0,
    revenueToday: 0,
    cryptoValue: 0,
  });

  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'AI Trading Bot Opportunity',
      description: 'Market conditions perfect for DeFi arbitrage bot deployment',
      action: 'Generate Trading Bot',
      confidence: 94,
      potential: '$2,400/month',
      icon: <Coins className="w-6 h-6 text-yellow-500" />,
    },
    {
      id: '2',
      type: 'crypto',
      title: 'NFT Collection Launch',
      description: 'AI-generated art collections trending +340% this week',
      action: 'Create NFT Project',
      confidence: 87,
      potential: '$12K launch',
      icon: <Sparkles className="w-6 h-6 text-purple-500" />,
    },
    {
      id: '3',
      type: 'revenue',
      title: 'Affiliate Content Factory',
      description: 'High-converting affiliate content for trending products',
      action: 'Start Content Factory',
      confidence: 91,
      potential: '$850/day',
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
    },
    {
      id: '4',
      type: 'trend',
      title: 'AI SaaS Template',
      description: 'GPT wrapper demand surge - 5 templates ready to deploy',
      action: 'Deploy SaaS',
      confidence: 96,
      potential: '$5K/month',
      icon: <Brain className="w-6 h-6 text-blue-500" />,
    },
  ];

  const quickActions = [
    {
      title: 'AI Business Generator',
      subtitle: 'Create $10K/month business in 60 seconds',
      icon: <Rocket className="w-8 h-8" />,
      gradient: 'from-purple-500 to-pink-500',
      action: () => onNavigate('business-generator'),
    },
    {
      title: 'Crypto Trading Bot',
      subtitle: 'Deploy DeFi arbitrage bot instantly',
      icon: <Coins className="w-8 h-8" />,
      gradient: 'from-yellow-400 to-orange-500',
      action: () => onNavigate('trading'),
    },
    {
      title: 'Content Factory',
      subtitle: 'AI-powered affiliate content engine',
      icon: <Zap className="w-8 h-8" />,
      gradient: 'from-green-400 to-blue-500',
      action: () => onNavigate('content-factory'),
    },
    {
      title: 'AI Code Studio',
      subtitle: 'Generate full-stack apps with AI',
      icon: <Code2 className="w-8 h-8" />,
      gradient: 'from-blue-500 to-purple-600',
      action: () => onNavigate('dev-lab'),
    },
  ];

  const realtimeUpdates = [
    '🚀 New AI model: Claude-3.5 Sonnet connected',
    '💰 Revenue stream detected: $1,247 potential',
    '🔥 Crypto opportunity: ETH arbitrage available',
    '⚡ Performance boost: 340% faster responses',
    '🎯 Market trend: AI wrapper demand +89%',
  ];

  const [currentUpdate, setCurrentUpdate] = useState(0);

  useEffect(() => {
    // Simulate realtime metrics
    const interval = setInterval(() => {
      setRealtimeMetrics(prev => ({
        activeProjects: prev.activeProjects + Math.floor(Math.random() * 3),
        aiCallsToday: prev.aiCallsToday + Math.floor(Math.random() * 5) + 1,
        revenueToday: prev.revenueToday + Math.floor(Math.random() * 50) + 10,
        cryptoValue: prev.cryptoValue + Math.floor(Math.random() * 100) + 25,
      }));
    }, 3000);

    // Cycle through insights
    const insightInterval = setInterval(() => {
      setCurrentInsight(prev => (prev + 1) % aiInsights.length);
    }, 4000);

    // Cycle through updates
    const updateInterval = setInterval(() => {
      setCurrentUpdate(prev => (prev + 1) % realtimeUpdates.length);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(insightInterval);
      clearInterval(updateInterval);
    };
  }, []);

  return (
    <div className={`${spacing.container} ${spacing.section}`}>
      {/* AI Command Header */}
      <div className="mb-12">
        <div className={`${utils.spaceBetween} mb-6`}>
          <div className="flex items-center space-x-4">
            <div className={`bg-gradient-to-r ${gradients.primary} p-4 rounded-xl shadow-lg`}>
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">AI Command Center</h1>
              <p className="text-white/70 text-lg">
                Revenue-generating AI workspace powered by LuxRig
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className={`${components.buttonPrimary.replace('bg-gradient-to-r from-purple-600 to-pink-600', 'bg-gradient-to-r from-emerald-500 to-cyan-500')} flex items-center space-x-2`}
            >
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </button>
            <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-lg">
              <span className="text-emerald-400 font-mono font-bold">⚡ LIVE</span>
            </div>
          </div>
        </div>

        {/* Realtime Updates Ticker */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-black animate-pulse" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-white font-semibold text-lg animate-pulse">
                {realtimeUpdates[currentUpdate]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Realtime Metrics Grid */}
      <div className={`${utils.gridResponsive} gap-6 mb-12`}>
        {[
          {
            label: 'Active Projects',
            value: realtimeMetrics.activeProjects,
            icon: <Rocket className="w-7 h-7" />,
            color: 'from-cyan-500 to-blue-500',
            textColor: 'text-cyan-300',
            borderColor: 'border-cyan-500/30',
            bgColor: 'bg-cyan-500/20',
            prefix: '',
          },
          {
            label: 'AI Calls Today',
            value: realtimeMetrics.aiCallsToday,
            icon: <Brain className="w-7 h-7" />,
            color: gradients.primary,
            textColor: 'text-purple-300',
            borderColor: 'border-purple-500/30',
            bgColor: 'bg-purple-500/20',
            prefix: '',
          },
          {
            label: 'Revenue Today',
            value: realtimeMetrics.revenueToday,
            icon: <DollarSign className="w-7 h-7" />,
            color: 'from-emerald-500 to-green-500',
            textColor: 'text-emerald-300',
            borderColor: 'border-emerald-500/30',
            bgColor: 'bg-emerald-500/20',
            prefix: '$',
          },
          {
            label: 'Crypto Value',
            value: realtimeMetrics.cryptoValue,
            icon: <Coins className="w-7 h-7" />,
            color: 'from-amber-500 to-orange-500',
            textColor: 'text-amber-300',
            borderColor: 'border-amber-500/30',
            bgColor: 'bg-amber-500/20',
            prefix: '$',
          },
        ].map((metric, index) => (
          <div
            key={index}
            className={`${components.card} ${components.cardInteractive} ${utils.hoverGlow} group backdrop-blur-xl border-white/20`}
          >
            <div className={`${utils.spaceBetween} mb-6`}>
              <div
                className={`bg-gradient-to-r ${metric.color} p-3 rounded-lg shadow-lg ${utils.hoverScale}`}
              >
                {metric.icon}
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${metric.bgColor} ${metric.textColor} border ${metric.borderColor}`}
              >
                LIVE
              </span>
            </div>
            <div className="text-4xl font-bold text-white mb-3 group-hover:scale-105 transition-transform">
              {metric.prefix}
              {metric.value.toLocaleString()}
            </div>
            <div className={`${metric.textColor} font-medium`}>{metric.label}</div>
          </div>
        ))}
      </div>

      {/* AI Insights Carousel */}
      <div
        className={`${components.card} bg-gradient-to-r ${gradients.primary}/10 border-purple-500/30 mb-12 backdrop-blur-xl`}
      >
        <div className={`${utils.spaceBetween} mb-6`}>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            <span>AI Market Insights</span>
          </h2>
          <div className="text-purple-300 font-medium">Live Analysis • Updated every 30s</div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <div className="flex items-center space-x-6 mb-6">
            <div className="text-purple-400 scale-125">{aiInsights[currentInsight].icon}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-3">
                <h3 className="text-xl font-bold text-white">{aiInsights[currentInsight].title}</h3>
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold border border-emerald-500/30">
                  {aiInsights[currentInsight].confidence}% confidence
                </span>
              </div>
              <p className="text-white/80 text-lg leading-relaxed">
                {aiInsights[currentInsight].description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-400 mb-1">
                {aiInsights[currentInsight].potential}
              </div>
              <div className="text-white/60 font-medium">Potential Revenue</div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('business-generator')}
            className={`w-full ${components.buttonPrimary} ${utils.hoverGlow} py-4 flex items-center justify-center space-x-3 text-lg font-bold`}
          >
            <Play className="w-6 h-6" />
            <span>{aiInsights[currentInsight].action}</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Holographic AI Brain Visualization */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">AI Neural Core</h2>
          <p className="text-white/70 text-lg">Real-time AI processing visualization</p>
        </div>
        <HolographicBrain />
      </div>

      {/* Turbo Hub Core System */}
      {/* <div className="mb-12">
        <TurboHubCore />
      </div> */}

      {/* LuxRig Cost Savings Dashboard */}
      <CostSavingsDashboard />

      {/* LuxRig Integration Tester */}
      <div className="mt-6">
        <LuxRigTester />
      </div>

      {/* Quick Actions Grid */}
      <div className={`${utils.gridResponsive} gap-6 mt-12`}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`group ${components.cardInteractive} ${utils.hoverScale} ${utils.hoverGlow} backdrop-blur-xl text-left`}
          >
            <div
              className={`bg-gradient-to-r ${action.gradient} p-4 rounded-xl mb-6 w-fit group-hover:shadow-2xl transition-all duration-300`}
            >
              {action.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
              {action.title}
            </h3>
            <p className="text-white/70 mb-6 leading-relaxed">{action.subtitle}</p>
            <div className="flex items-center text-purple-400 font-bold group-hover:text-purple-300">
              <span>Launch Now</span>
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
