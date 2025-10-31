import { TrendingUp, Sparkles } from 'lucide-react';

export default function TradingBots() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <TrendingUp size={64} className="mx-auto mb-4 text-cyan-400" />
        <h2 className="text-3xl font-bold mb-3">Crypto Trading Bot Studio</h2>
        <p className="text-slate-400 text-lg mb-6 max-w-2xl mx-auto">
          Visual strategy designer, backtesting engine, and AI-powered market
          analysis for building sophisticated trading bots. Coming soon!
        </p>
        <div className="flex items-center justify-center gap-2 text-cyan-400">
          <Sparkles size={20} />
          <span className="font-medium">Under Development</span>
        </div>
      </div>
    </div>
  );
}
