/**
 * Price Charts Component
 * Google Finance Beta charts integration
 */

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { Coin, PriceChartData } from '../../../types/crypto';
import { cryptoApiService } from '../../../services/crypto/cryptoApiService';

const PriceCharts: React.FC = () => {
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [chartData, setChartData] = useState<PriceChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    // Load Bitcoin by default
    loadCoin('bitcoin');
  }, []);

  useEffect(() => {
    if (selectedCoin) {
      loadChartData();
    }
  }, [selectedCoin, timeframe]);

  const loadCoin = async (coinId: string) => {
    try {
      setLoading(true);
      const coin = await cryptoApiService.getCoin(coinId);
      setSelectedCoin(coin);
    } catch (error) {
      console.error('Failed to load coin:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    if (!selectedCoin) return;
    try {
      setLoading(true);
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
      const data = await cryptoApiService.getHistoricalData(selectedCoin.id, days, 'daily');
      setChartData(data);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (value >= 1) return value.toFixed(2);
    if (value >= 0.01) return value.toFixed(4);
    return value.toFixed(8);
  };

  // Simple line chart rendering
  const renderChart = () => {
    if (chartData.length === 0) return null;

    const maxPrice = Math.max(...chartData.map(d => d.price));
    const minPrice = Math.min(...chartData.map(d => d.price));
    const range = maxPrice - minPrice;
    const width = 800;
    const height = 400;
    const padding = 40;

    const points = chartData.map((d, i) => {
      const x = padding + (i / (chartData.length - 1)) * (width - 2 * padding);
      const y = padding + height - padding - ((d.price - minPrice) / range) * (height - 2 * padding);
      return { x, y, price: d.price, timestamp: d.timestamp };
    });

    const pathData = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    return (
      <svg width={width} height={height} className="w-full h-auto">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`}
          fill="url(#chartGradient)"
        />
        <path
          d={pathData}
          fill="none"
          stroke="rgb(34, 211, 238)"
          strokeWidth="2"
        />
        {points.map((p, i) => (
          i % Math.floor(points.length / 10) === 0 && (
            <g key={i}>
              <line
                x1={p.x}
                y1={height - padding}
                x2={p.x}
                y2={height - padding + 5}
                stroke="rgb(148, 163, 184)"
                strokeWidth="1"
              />
              <text
                x={p.x}
                y={height - padding + 20}
                fill="rgb(148, 163, 184)"
                fontSize="10"
                textAnchor="middle"
              >
                {new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            </g>
          )
        ))}
      </svg>
    );
  };

  return (
    <div className="p-6 space-y-4">
      {/* Coin Selector */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search coin (e.g., bitcoin, ethereum)..."
            onKeyPress={async (e) => {
              if (e.key === 'Enter') {
                const query = (e.target as HTMLInputElement).value;
                if (query) {
                  const coins = await cryptoApiService.searchCoins(query);
                  if (coins.length > 0) {
                    setSelectedCoin(coins[0]);
                  }
                }
              }
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeframe === tf
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {selectedCoin && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              {selectedCoin.image && (
                <img src={selectedCoin.image} alt={selectedCoin.name} className="w-10 h-10 rounded-full" />
              )}
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedCoin.name}</h3>
                <p className="text-gray-400">{selectedCoin.symbol.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-white">
                ${formatPrice(selectedCoin.current_price)}
              </span>
              <span className={`text-lg font-medium ${
                selectedCoin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}
                {selectedCoin.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          </div>
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {renderChart()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceCharts;

