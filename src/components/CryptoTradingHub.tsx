import { useEffect, useState } from 'react';

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Coins,
  DollarSign,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface TradingBot {
  id: string;
  name: string;
  type: 'arbitrage' | 'dca' | 'grid' | 'ai_momentum' | 'defi_yield';
  status: 'active' | 'paused' | 'stopped';
  profit24h: number;
  totalProfit: number;
  winRate: number;
  trades24h: number;
  pair: string;
  apy: number;
}

interface MarketOpportunity {
  type: string;
  description: string;
  confidence: number;
  potential: string;
  timeframe: string;
  risk: 'low' | 'medium' | 'high';
}

export default function CryptoTradingHub() {
  const [bots, setBots] = useState<TradingBot[]>([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(47563.89);
  const [totalPnL, setTotalPnL] = useState(3247.56);
  const [activeBots, setActiveBots] = useState(0);

  const mockBots: TradingBot[] = [
    {
      id: '1',
      name: 'ETH/USDC Arbitrage Pro',
      type: 'arbitrage',
      status: 'active',
      profit24h: 127.45,
      totalProfit: 2847.89,
      winRate: 94.7,
      trades24h: 23,
      pair: 'ETH/USDC',
      apy: 47.2,
    },
    {
      id: '2',
      name: 'BTC DCA Builder',
      type: 'dca',
      status: 'active',
      profit24h: 89.34,
      totalProfit: 1456.78,
      winRate: 87.3,
      trades24h: 4,
      pair: 'BTC/USDT',
      apy: 23.8,
    },
    {
      id: '3',
      name: 'AI Momentum Hunter',
      type: 'ai_momentum',
      status: 'paused',
      profit24h: -23.67,
      totalProfit: 534.21,
      winRate: 78.9,
      trades24h: 12,
      pair: 'MULTI',
      apy: 89.3,
    },
    {
      id: '4',
      name: 'DeFi Yield Optimizer',
      type: 'defi_yield',
      status: 'active',
      profit24h: 234.78,
      totalProfit: 3890.45,
      winRate: 96.1,
      trades24h: 8,
      pair: 'VARIOUS',
      apy: 156.7,
    },
  ];

  const marketOpportunities: MarketOpportunity[] = [
    {
      type: 'Arbitrage Opportunity',
      description: 'ETH price difference between Uniswap and Binance',
      confidence: 96,
      potential: '$340',
      timeframe: '15 min',
      risk: 'low',
    },
    {
      type: 'DeFi Yield Farm',
      description: 'New Compound farming pool with 240% APY',
      confidence: 84,
      potential: '$1,200/week',
      timeframe: '1 week',
      risk: 'medium',
    },
    {
      type: 'AI Momentum Signal',
      description: 'Machine learning detected bullish pattern on SOL',
      confidence: 78,
      potential: '$800',
      timeframe: '24 hours',
      risk: 'high',
    },
  ];

  useEffect(() => {
    setBots(mockBots);
    setActiveBots(mockBots.filter(bot => bot.status === 'active').length);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setTotalPnL(prev => prev + Math.random() * 10 - 5);
      setTotalPortfolioValue(prev => prev + Math.random() * 50 - 25);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getBotIcon = (type: TradingBot['type']) => {
    switch (type) {
      case 'arbitrage':
        return <Zap className="w-5 h-5" />;
      case 'dca':
        return <TrendingUp className="w-5 h-5" />;
      case 'ai_momentum':
        return <Brain className="w-5 h-5" />;
      case 'defi_yield':
        return <Coins className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getBotTypeColor = (type: TradingBot['type']) => {
    switch (type) {
      case 'arbitrage':
        return 'from-yellow-500 to-orange-500';
      case 'dca':
        return 'from-blue-500 to-cyan-500';
      case 'ai_momentum':
        return 'from-purple-500 to-pink-500';
      case 'defi_yield':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getStatusIcon = (status: TradingBot['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'paused':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'stopped':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
  };

  const deployNewBot = (type: TradingBot['type']) => {
    const newBot: TradingBot = {
      id: Date.now().toString(),
      name: `New ${type.replace('_', ' ').toUpperCase()} Bot`,
      type,
      status: 'active',
      profit24h: 0,
      totalProfit: 0,
      winRate: 0,
      trades24h: 0,
      pair: 'ETH/USDC',
      apy: 0,
    };
    setBots(prev => [newBot, ...prev]);
    setActiveBots(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Crypto Trading Hub</h1>
            <p className="text-purple-300">AI-powered trading bots and DeFi strategies</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">{activeBots} Bots Active</span>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-lg text-white font-semibold flex items-center space-x-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
              <Sparkles className="w-5 h-5" />
              <span>Deploy Bot</span>
            </button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
              <RefreshCw className="w-5 h-5 text-white/40" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              ${totalPortfolioValue.toLocaleString()}
            </div>
            <div className="text-white/60 text-sm">Total Portfolio</div>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`flex items-center space-x-1 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {totalPnL >= 0 ? (
                  <ArrowUpRight className="w-6 h-6" />
                ) : (
                  <ArrowDownRight className="w-6 h-6" />
                )}
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div
              className={`text-2xl font-bold mb-1 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </div>
            <div className="text-white/60 text-sm">24h P&L</div>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Brain className="w-8 h-8 text-purple-400" />
              <span className="text-green-400 text-xs bg-green-400/20 px-2 py-1 rounded">LIVE</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">87.3%</div>
            <div className="text-white/60 text-sm">Avg Win Rate</div>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">156</div>
            <div className="text-white/60 text-sm">Total Trades</div>
          </div>
        </div>

        {/* Quick Deploy Bots */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Deploy</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                type: 'arbitrage' as const,
                name: 'Arbitrage Bot',
                desc: 'Cross-DEX price differences',
              },
              { type: 'dca' as const, name: 'DCA Bot', desc: 'Dollar-cost averaging strategy' },
              {
                type: 'ai_momentum' as const,
                name: 'AI Momentum',
                desc: 'ML-powered trend detection',
              },
              { type: 'defi_yield' as const, name: 'DeFi Yield', desc: 'Yield farming optimizer' },
            ].map(botType => (
              <button
                key={botType.type}
                onClick={() => deployNewBot(botType.type)}
                className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300 text-left group"
              >
                <div
                  className={`bg-gradient-to-r ${getBotTypeColor(botType.type)} p-3 rounded-lg w-fit mb-3`}
                >
                  {getBotIcon(botType.type)}
                </div>
                <h3 className="text-white font-semibold mb-1 group-hover:text-purple-300 transition-colors">
                  {botType.name}
                </h3>
                <p className="text-white/60 text-sm">{botType.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Active Bots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Active Bots</h2>
            <div className="space-y-4">
              {bots.map(bot => (
                <div
                  key={bot.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`bg-gradient-to-r ${getBotTypeColor(bot.type)} p-2 rounded-lg`}
                      >
                        {getBotIcon(bot.type)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{bot.name}</h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(bot.status)}
                          <span className="text-white/60 text-sm capitalize">{bot.status}</span>
                          <span className="text-white/40">•</span>
                          <span className="text-white/60 text-sm">{bot.pair}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        {bot.status === 'active' ? (
                          <Pause className="w-4 h-4 text-white/60" />
                        ) : (
                          <Play className="w-4 h-4 text-white/60" />
                        )}
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Settings className="w-4 h-4 text-white/60" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div
                        className={`text-lg font-bold ${bot.profit24h >= 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {bot.profit24h >= 0 ? '+' : ''}${bot.profit24h.toFixed(2)}
                      </div>
                      <div className="text-white/60 text-xs">24h Profit</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{bot.winRate}%</div>
                      <div className="text-white/60 text-xs">Win Rate</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{bot.trades24h}</div>
                      <div className="text-white/60 text-xs">24h Trades</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-400">{bot.apy}%</div>
                      <div className="text-white/60 text-xs">APY</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Opportunities */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">AI Market Opportunities</h2>
            <div className="space-y-4">
              {marketOpportunities.map((opportunity, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{opportunity.type}</h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          opportunity.risk === 'low'
                            ? 'bg-green-500/20 text-green-400'
                            : opportunity.risk === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {opportunity.risk} risk
                      </span>
                      <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-medium">
                        {opportunity.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-4">{opportunity.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-green-400 font-bold">{opportunity.potential}</div>
                      <div className="text-white/60 text-xs">{opportunity.timeframe}</div>
                    </div>
                    <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg text-white font-medium hover:shadow-lg transition-all duration-300">
                      Deploy Bot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
