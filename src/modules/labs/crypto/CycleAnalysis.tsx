/**
 * Cycle Analysis Component
 * ITC-style market cycle analysis with log regression and halving cycles
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { CycleAnalysis } from '../../../types/crypto';
import { cryptoApiService } from '../../../services/crypto/cryptoApiService';

const CycleAnalysisComponent: React.FC = () => {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [cycleData, setCycleData] = useState<CycleAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCycleAnalysis();
  }, [selectedCoin]);

  const loadCycleAnalysis = async () => {
    setLoading(true);
    try {
      const coin = await cryptoApiService.getCoin(selectedCoin);
      if (!coin) return;

      // Calculate cycle position (simplified)
      const historicalData = await cryptoApiService.getHistoricalData(selectedCoin, 365, 'daily');
      if (historicalData.length === 0) return;

      const prices = historicalData.map(d => d.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const currentPrice = coin.current_price;
      
      const cyclePercent = ((currentPrice - minPrice) / (maxPrice - minPrice)) * 100;
      
      let cyclePosition: 'early' | 'mid' | 'late' | 'bottom';
      if (cyclePercent < 25) cyclePosition = 'bottom';
      else if (cyclePercent < 50) cyclePosition = 'early';
      else if (cyclePercent < 75) cyclePosition = 'mid';
      else cyclePosition = 'late';

      // Calculate log regression bands (simplified)
      const logRegressionTop = maxPrice * 1.2;
      const logRegressionBottom = minPrice * 0.8;

      // Bitcoin halving cycle (if Bitcoin)
      let halvingCycle;
      if (selectedCoin === 'bitcoin') {
        const lastHalving = new Date('2024-04-20');
        const nextHalving = new Date('2028-04-20');
        const daysUntil = Math.ceil((nextHalving.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const cyclePositionNum = ((Date.now() - lastHalving.getTime()) / (nextHalving.getTime() - lastHalving.getTime())) * 100;
        
        halvingCycle = {
          nextHalving: nextHalving.toISOString(),
          daysUntil,
          cyclePosition: cyclePositionNum,
        };
      }

      const analysis: CycleAnalysis = {
        coinId: coin.id,
        symbol: coin.symbol,
        cyclePosition,
        cyclePercent,
        logRegressionTop,
        logRegressionBottom,
        currentPrice,
        distanceToTop: logRegressionTop - currentPrice,
        distanceToBottom: currentPrice - logRegressionBottom,
        halvingCycle,
      };

      setCycleData(analysis);
    } catch (error) {
      console.error('Failed to load cycle analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-800/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!cycleData) {
    return (
      <div className="p-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <p className="text-gray-400">Unable to load cycle analysis</p>
        </div>
      </div>
    );
  }

  const cycleColor = 
    cycleData.cyclePosition === 'bottom' ? 'text-green-400' :
    cycleData.cyclePosition === 'early' ? 'text-blue-400' :
    cycleData.cyclePosition === 'mid' ? 'text-yellow-400' :
    'text-red-400';

  return (
    <div className="p-6 space-y-6">
      {/* Coin Selector */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-400 mb-2">Select Coin</label>
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="w-full md:w-64 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
        >
          <option value="bitcoin">Bitcoin (BTC)</option>
          <option value="ethereum">Ethereum (ETH)</option>
          <option value="solana">Solana (SOL)</option>
        </select>
      </div>

      {/* Cycle Position */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Market Cycle Position</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Cycle Position</span>
              <span className={`text-lg font-bold ${cycleColor} capitalize`}>
                {cycleData.cyclePosition}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
              <div
                className={`h-4 rounded-full ${
                  cycleData.cyclePosition === 'bottom' ? 'bg-green-500' :
                  cycleData.cyclePosition === 'early' ? 'bg-blue-500' :
                  cycleData.cyclePosition === 'mid' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${cycleData.cyclePercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {cycleData.cyclePercent.toFixed(1)}% through current cycle
            </p>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Current Price</div>
            <div className="text-2xl font-bold text-white mb-2">
              {formatCurrency(cycleData.currentPrice)}
            </div>
            {cycleData.distanceToTop && (
              <div className="text-sm text-gray-400">
                {((cycleData.distanceToTop / cycleData.currentPrice) * 100).toFixed(1)}% below potential top
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Regression Bands */}
      {cycleData.logRegressionTop && cycleData.logRegressionBottom && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Log Regression Bands</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Potential Top</div>
              <div className="text-xl font-bold text-red-400">
                {formatCurrency(cycleData.logRegressionTop)}
              </div>
              {cycleData.distanceToTop && (
                <div className="text-xs text-gray-500 mt-1">
                  {formatCurrency(cycleData.distanceToTop)} away
                </div>
              )}
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Potential Bottom</div>
              <div className="text-xl font-bold text-green-400">
                {formatCurrency(cycleData.logRegressionBottom)}
              </div>
              {cycleData.distanceToBottom && (
                <div className="text-xs text-gray-500 mt-1">
                  {formatCurrency(cycleData.distanceToBottom)} away
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Halving Cycle (Bitcoin only) */}
      {cycleData.halvingCycle && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Bitcoin Halving Cycle</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Next Halving</div>
              <div className="text-lg font-bold text-white">
                {new Date(cycleData.halvingCycle.nextHalving).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Days Until</div>
              <div className="text-lg font-bold text-white">
                {cycleData.halvingCycle.daysUntil.toLocaleString()} days
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Cycle Progress</div>
              <div className="text-lg font-bold text-white">
                {cycleData.halvingCycle.cyclePosition.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cycle Interpretation */}
      <div className="bg-cyan-600/10 border border-cyan-500/20 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Cycle Interpretation</h4>
        <div className="text-sm text-gray-300 space-y-2">
          {cycleData.cyclePosition === 'bottom' && (
            <p>Market is at or near cycle bottom. Historically good entry point, but high risk. Consider DCA strategy.</p>
          )}
          {cycleData.cyclePosition === 'early' && (
            <p>Early cycle phase. Potential for significant gains, but volatility remains high. Accumulation phase.</p>
          )}
          {cycleData.cyclePosition === 'mid' && (
            <p>Mid-cycle phase. Market showing strength. Monitor for signs of late-cycle behavior.</p>
          )}
          {cycleData.cyclePosition === 'late' && (
            <p>Late cycle phase. High risk of correction. Consider taking profits and reducing exposure.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CycleAnalysisComponent;

