import { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  Coins,
  Zap,
  BarChart3,
  Copy,
  ExternalLink,
  Sparkles,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

interface CryptoIntegrationProps {
  onNavigate: (view: string) => void;
}

interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  balance: number;
  value: number;
}

interface DeFiOpportunity {
  protocol: string;
  apy: number;
  tvl: string;
  risk: 'low' | 'medium' | 'high';
  description: string;
}

export default function CryptoIntegration({ onNavigate }: CryptoIntegrationProps) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);

  // Mock crypto data - in real app would connect to APIs
  const mockAssets: CryptoAsset[] = [
    { symbol: 'ETH', name: 'Ethereum', price: 2847.32, change24h: 5.67, balance: 1.2847, value: 3657.89 },
    { symbol: 'BTC', name: 'Bitcoin', price: 67234.56, change24h: -2.14, balance: 0.0847, value: 5694.87 },
    { symbol: 'USDC', name: 'USD Coin', price: 1.00, change24h: 0.01, balance: 2500, value: 2500.00 },
    { symbol: 'UNI', name: 'Uniswap', price: 8.94, change24h: 12.34, balance: 150.5, value: 1345.47 }
  ];

  const defiOpportunities: DeFiOpportunity[] = [
    {
      protocol: 'Uniswap V3 ETH/USDC',
      apy: 18.7,
      tvl: '$2.4B',
      risk: 'medium',
      description: 'Provide liquidity to earn trading fees'
    },
    {
      protocol: 'Compound USDC Lending',
      apy: 4.2,
      tvl: '$1.8B', 
      risk: 'low',
      description: 'Lend USDC to earn interest'
    },
    {
      protocol: 'Arbitrum Farming',
      apy: 45.6,
      tvl: '$890M',
      risk: 'high',
      description: 'Farm ARB tokens with high rewards'
    }
  ];

  useEffect(() => {
    // Simulate wallet connection and data loading
    if (walletConnected) {
      setCryptoAssets(mockAssets);
      const total = mockAssets.reduce((sum, asset) => sum + asset.value, 0);
      setTotalPortfolioValue(total);
      setPortfolioChange(Math.random() * 10 - 5); // Random change
    }
  }, [walletConnected]);

  const connectWallet = async () => {
    // Simulate wallet connection
    setWalletConnected(true);
    setWalletAddress('0x742d35Cc6634C0532925a3b8D373d4C3553f4D8');
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setCryptoAssets([]);
    setTotalPortfolioValue(0);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl">
                <Wallet className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Connect Your Crypto Wallet
            </h1>
            <p className="text-xl text-purple-300 mb-8">
              Unlock DeFi opportunities and crypto-powered AI tools
            </p>

            <button
              onClick={connectWallet}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-xl text-white font-semibold text-lg flex items-center space-x-3 mx-auto hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              <Wallet className="w-6 h-6" />
              <span>Connect Wallet</span>
              <Sparkles className="w-6 h-6" />
            </button>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'DeFi Integration',
                description: 'Access yield farming, lending, and trading opportunities',
                icon: <TrendingUp className="w-8 h-8" />,
                color: 'from-green-500 to-emerald-500'
              },
              {
                title: 'Crypto Trading Bots',
                description: 'Deploy AI-powered arbitrage and DCA bots',
                icon: <Zap className="w-8 h-8" />,
                color: 'from-yellow-500 to-orange-500'
              },
              {
                title: 'Portfolio Analytics',
                description: 'Real-time portfolio tracking and AI insights',
                icon: <BarChart3 className="w-8 h-8" />,
                color: 'from-blue-500 to-cyan-500'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-lg w-fit mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Crypto Dashboard</h1>
            <p className="text-purple-300">Manage your portfolio and DeFi opportunities</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-black/30 rounded-lg px-4 py-2 flex items-center space-x-2">
              <span className="text-white/60 text-sm">Wallet:</span>
              <span className="text-white font-mono text-sm">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              <button onClick={copyAddress} className="text-purple-400 hover:text-purple-300">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={disconnectWallet}
              className="bg-red-600/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-600/30 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Portfolio Value</h2>
              <button className="text-purple-400 hover:text-purple-300">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-4xl font-bold text-white">
                ${totalPortfolioValue.toLocaleString()}
              </div>
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-lg ${
                portfolioChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {portfolioChange >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="font-semibold">{Math.abs(portfolioChange).toFixed(2)}%</span>
              </div>
            </div>
            <div className="text-white/60">Last 24 hours</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <Coins className="w-8 h-8 text-yellow-400" />
              <button
                onClick={() => onNavigate('trading')}
                className="text-purple-300 hover:text-white text-sm flex items-center space-x-1"
              >
                <span>Deploy Bot</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <div className="text-2xl font-bold text-white mb-2">Trading Bots</div>
            <div className="text-purple-300 text-sm mb-4">Automate your crypto strategies</div>
            <button
              onClick={() => onNavigate('trading')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-2 rounded-lg text-white font-medium hover:shadow-lg transition-all duration-300"
            >
              Launch Bot
            </button>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Holdings */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Holdings</h2>
            <div className="space-y-4">
              {cryptoAssets.map((asset, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{asset.symbol}</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{asset.name}</div>
                      <div className="text-white/60 text-sm">{asset.balance.toFixed(4)} {asset.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">${asset.value.toLocaleString()}</div>
                    <div className={`text-sm ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DeFi Opportunities */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">DeFi Opportunities</h2>
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">Live</span>
            </div>
            <div className="space-y-4">
              {defiOpportunities.map((opportunity, index) => (
                <div key={index} className="p-4 bg-black/20 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-semibold">{opportunity.protocol}</div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(opportunity.risk)}`}>
                        {opportunity.risk} risk
                      </span>
                      <div className="text-green-400 font-bold">{opportunity.apy}% APY</div>
                    </div>
                  </div>
                  <div className="text-white/60 text-sm mb-2">{opportunity.description}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">TVL: {opportunity.tvl}</span>
                    <button className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1">
                      <span>Participate</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Arbitrage Bot',
              description: 'Deploy cross-DEX arbitrage opportunities',
              action: () => onNavigate('trading'),
              color: 'from-green-500 to-emerald-500'
            },
            {
              title: 'DCA Strategy',
              description: 'Set up dollar-cost averaging for crypto',
              action: () => onNavigate('trading'), 
              color: 'from-blue-500 to-cyan-500'
            },
            {
              title: 'Yield Farming',
              description: 'Optimize yields across DeFi protocols',
              action: () => onNavigate('trading'),
              color: 'from-purple-500 to-pink-500'
            }
          ].map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300 text-left"
            >
              <div className={`bg-gradient-to-r ${action.color} p-3 rounded-lg w-fit mb-4`}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
              <p className="text-white/70 text-sm">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}