/**
 * Portfolio Risk Component
 * ITC-style risk analysis with Modern Portfolio Theory
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, BarChart3, Shield, Target } from 'lucide-react';
import { Portfolio, Holding } from '../../../types/crypto';
import { portfolioService } from '../../../services/crypto/portfolioService';

const PortfolioRisk: React.FC<{ portfolioId?: string }> = ({ portfolioId }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [riskScore, setRiskScore] = useState(0);
  const [diversificationScore, setDiversificationScore] = useState(0);
  const [sharpeRatio, setSharpeRatio] = useState(0);

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    if (selectedPortfolio) {
      calculateRiskMetrics();
    }
  }, [selectedPortfolio]);

  const loadPortfolios = () => {
    const allPortfolios = portfolioService.getPortfolios();
    setPortfolios(allPortfolios);
    if (portfolioId) {
      const portfolio = allPortfolios.find(p => p.id === portfolioId);
      if (portfolio) setSelectedPortfolio(portfolio);
    } else if (allPortfolios.length > 0) {
      setSelectedPortfolio(allPortfolios[0]);
    }
  };

  const calculateRiskMetrics = () => {
    if (!selectedPortfolio || selectedPortfolio.holdings.length === 0) {
      setRiskScore(0);
      setDiversificationScore(0);
      setSharpeRatio(0);
      return;
    }

    const holdings = selectedPortfolio.holdings;
    
    // Calculate diversification score (based on number of holdings and allocation spread)
    const numHoldings = holdings.length;
    const allocationVariance = holdings.reduce((sum, h) => {
      const deviation = h.allocation - (100 / numHoldings);
      return sum + (deviation * deviation);
    }, 0) / numHoldings;
    
    const diversification = Math.max(0, 100 - (allocationVariance * 10));
    setDiversificationScore(diversification);

    // Calculate risk score (based on volatility, concentration, and correlation)
    const avgVolatility = holdings.reduce((sum, h) => {
      // Estimate volatility from return variance
      const volatility = Math.abs(h.returnPercent) / 10; // Simplified
      return sum + volatility;
    }, 0) / numHoldings;

    const concentrationRisk = Math.max(...holdings.map(h => h.allocation)) / 100;
    const risk = (avgVolatility * 50) + (concentrationRisk * 30) + ((100 - diversification) * 0.2);
    setRiskScore(Math.min(100, risk));

    // Calculate Sharpe ratio (simplified)
    const avgReturn = holdings.reduce((sum, h) => sum + h.returnPercent, 0) / numHoldings;
    const riskFreeRate = 2; // Assume 2% risk-free rate
    const excessReturn = avgReturn - riskFreeRate;
    const sharpe = excessReturn / Math.max(avgVolatility, 1);
    setSharpeRatio(sharpe);
  };

  const getRiskLevel = (score: number): { level: string; color: string; description: string } => {
    if (score < 30) return { level: 'Low', color: 'text-green-400', description: 'Conservative portfolio with low risk' };
    if (score < 60) return { level: 'Medium', color: 'text-yellow-400', description: 'Moderate risk portfolio' };
    if (score < 80) return { level: 'High', color: 'text-orange-400', description: 'Aggressive portfolio with high risk' };
    return { level: 'Critical', color: 'text-red-400', description: 'Very high risk - consider rebalancing' };
  };

  const riskLevel = getRiskLevel(riskScore);

  if (!selectedPortfolio) {
    return (
      <div className="p-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <Shield className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Select a portfolio to analyze risk</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Risk Score</h3>
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <p className={`text-3xl font-bold mb-1 ${riskLevel.color}`}>
            {riskScore.toFixed(1)}
          </p>
          <p className={`text-sm ${riskLevel.color} font-medium`}>
            {riskLevel.level} Risk
          </p>
          <p className="text-xs text-gray-500 mt-2">{riskLevel.description}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Diversification</h3>
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {diversificationScore.toFixed(1)}
          </p>
          <p className="text-sm text-gray-400">
            {diversificationScore >= 70 ? 'Well Diversified' : 
             diversificationScore >= 40 ? 'Moderately Diversified' : 
             'Needs Diversification'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Sharpe Ratio</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className={`text-3xl font-bold mb-1 ${
            sharpeRatio >= 1 ? 'text-green-400' :
            sharpeRatio >= 0 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {sharpeRatio.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">
            {sharpeRatio >= 1 ? 'Good Risk-Adjusted Return' :
             sharpeRatio >= 0 ? 'Acceptable' :
             'Poor Risk-Adjusted Return'}
          </p>
        </div>
      </div>

      {/* Risk Breakdown */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Analysis</h3>
        
        {/* Concentration Risk */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Concentration Risk</span>
            <span className="text-sm text-white">
              {selectedPortfolio.holdings.length > 0 
                ? `${Math.max(...selectedPortfolio.holdings.map(h => h.allocation)).toFixed(1)}% in largest holding`
                : 'N/A'
              }
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                Math.max(...selectedPortfolio.holdings.map(h => h.allocation)) > 50 ? 'bg-red-500' :
                Math.max(...selectedPortfolio.holdings.map(h => h.allocation)) > 30 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(Math.max(...selectedPortfolio.holdings.map(h => h.allocation)), 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {selectedPortfolio.holdings.length > 0 && Math.max(...selectedPortfolio.holdings.map(h => h.allocation)) > 50
              ? 'High concentration - consider diversifying'
              : 'Acceptable concentration level'
            }
          </p>
        </div>

        {/* Portfolio Composition */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Portfolio Composition</h4>
          <div className="space-y-2">
            {selectedPortfolio.holdings
              .sort((a, b) => b.allocation - a.allocation)
              .map((holding) => (
                <div key={holding.coinId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-24 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ width: `${holding.allocation}%` }}
                      />
                    </div>
                    <span className="text-sm text-white">{holding.symbol.toUpperCase()}</span>
                  </div>
                  <span className="text-sm text-gray-400">{holding.allocation.toFixed(1)}%</span>
                </div>
              ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-cyan-600/10 border border-cyan-500/20 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-cyan-400 mb-2">Risk Management Recommendations</h4>
          <ul className="space-y-1 text-sm text-gray-300">
            {riskScore > 70 && (
              <li>• Consider reducing position sizes in high-volatility assets</li>
            )}
            {diversificationScore < 50 && (
              <li>• Diversify across more assets to reduce concentration risk</li>
            )}
            {selectedPortfolio.holdings.length > 0 && Math.max(...selectedPortfolio.holdings.map(h => h.allocation)) > 40 && (
              <li>• Rebalance to reduce exposure to largest holding</li>
            )}
            {sharpeRatio < 0 && (
              <li>• Portfolio underperforming risk-free rate - review strategy</li>
            )}
            {riskScore <= 30 && diversificationScore >= 70 && sharpeRatio >= 1 && (
              <li>• Portfolio is well-balanced with good risk-adjusted returns</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PortfolioRisk;

