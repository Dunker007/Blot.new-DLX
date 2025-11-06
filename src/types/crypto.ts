/**
 * Crypto Lab Types
 * Types for cryptocurrency data, portfolio, bots, and market analysis
 */

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation?: number;
  total_volume: number;
  high_24h?: number;
  low_24h?: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h?: number;
  market_cap_change_percentage_24h?: number;
  circulating_supply?: number;
  total_supply?: number;
  max_supply?: number;
  ath?: number;
  ath_change_percentage?: number;
  ath_date?: string;
  atl?: number;
  atl_change_percentage?: number;
  atl_date?: string;
  last_updated?: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalCost: number;
  totalReturn: number;
  totalReturnPercent: number;
  holdings: Holding[];
  createdAt: string;
  updatedAt: string;
}

export interface Holding {
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  costBasis: number;
  currentPrice: number;
  currentValue: number;
  return: number;
  returnPercent: number;
  allocation: number; // Percentage of portfolio
  firstPurchaseDate: string;
  lastPurchaseDate: string;
}

export interface Transaction {
  id: string;
  portfolioId: string;
  coinId: string;
  symbol: string;
  type: 'buy' | 'sell' | 'transfer' | 'swap';
  amount: number;
  price: number;
  total: number;
  fee?: number;
  exchange?: string;
  timestamp: string;
  notes?: string;
}

export interface MarketData {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  ethDominance: number;
  activeCryptocurrencies: number;
  marketCapChange24h: number;
  volumeChange24h: number;
}

export interface PriceChartData {
  timestamp: number;
  price: number;
  volume?: number;
  marketCap?: number;
}

export interface OnChainMetric {
  name: string;
  value: number;
  change24h?: number;
  change7d?: number;
  description: string;
  chartData?: PriceChartData[];
}

export interface RiskIndicator {
  name: string;
  value: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation?: string;
}

export interface TradingBot {
  id: string;
  name: string;
  type: 'dca' | 'grid' | 'futures' | 'scalping' | 'arbitrage' | 'custom';
  status: 'active' | 'paused' | 'stopped' | 'paper';
  strategy: BotStrategy;
  performance: BotPerformance;
  createdAt: string;
  updatedAt: string;
}

export interface BotStrategy {
  exchange: string;
  pair: string; // e.g., 'BTC/USDT'
  type: string;
  config: Record<string, any>;
  riskManagement: {
    stopLoss?: number;
    takeProfit?: number[];
    maxPositionSize?: number;
    maxDrawdown?: number;
  };
}

export interface BotPerformance {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalProfitPercent: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  currentDrawdown: number;
  roi: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  author?: string;
  publishedAt: string;
  imageUrl?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  coins: string[]; // Related coin symbols
  category: string;
}

export interface MemeCoin {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  change24h: number;
  viralityScore: number;
  socialMentions: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  pumpRisk: 'low' | 'medium' | 'high';
}

export interface DCAStrategy {
  coinId: string;
  symbol: string;
  amount: number; // Amount per purchase
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: string;
  endDate?: string;
  totalInvested: number;
  totalCoins: number;
  averagePrice: number;
  currentValue: number;
  return: number;
  returnPercent: number;
}

export interface ArbitrageOpportunity {
  exchange1: string;
  exchange2: string;
  pair: string;
  price1: number;
  price2: number;
  difference: number;
  differencePercent: number;
  estimatedProfit: number;
  risk: 'low' | 'medium' | 'high';
  executionTime: number; // Estimated seconds
}

export interface YieldOpportunity {
  protocol: string;
  asset: string;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
  description: string;
  impermanentLossRisk?: number;
}

export interface CycleAnalysis {
  coinId: string;
  symbol: string;
  cyclePosition: 'early' | 'mid' | 'late' | 'bottom';
  cyclePercent: number; // 0-100
  logRegressionTop?: number;
  logRegressionBottom?: number;
  currentPrice: number;
  distanceToTop?: number;
  distanceToBottom?: number;
  halvingCycle?: {
    nextHalving: string;
    daysUntil: number;
    cyclePosition: number;
  };
}

