import { useState, useEffect } from 'react';
import { Star, TrendingUp, Zap, Brain, Clock } from 'lucide-react';
import { modelDiscoveryService } from '../services/modelDiscovery';
import { Model } from '../types';

interface ModelRecommendationsProps {
  useCase?: 'coding' | 'analysis' | 'creative' | 'general';
  preferLocal?: boolean;
  onSelectModel?: (model: Model) => void;
}

export default function ModelRecommendations({
  useCase,
  preferLocal,
  onSelectModel,
}: ModelRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUseCase, setSelectedUseCase] = useState<string>(useCase || 'general');
  const [preferLocalModels, setPreferLocalModels] = useState(preferLocal ?? true);

  useEffect(() => {
    loadRecommendations();
  }, [selectedUseCase, preferLocalModels]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const results = await modelDiscoveryService.getModelRecommendations(
        selectedUseCase as any,
        preferLocalModels
      );
      setRecommendations(results);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-cyan-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-slate-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'bg-cyan-500/10 border-cyan-500/20';
    if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-slate-800 border-slate-700';
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Analyzing models...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain size={24} className="text-cyan-400" />
          <div>
            <h3 className="text-xl font-bold">AI Model Recommendations</h3>
            <p className="text-slate-400 text-sm">Intelligent suggestions based on your needs</p>
          </div>
        </div>
        <button
          onClick={loadRecommendations}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Use Case:</span>
          <select
            value={selectedUseCase}
            onChange={(e) => setSelectedUseCase(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="general">General</option>
            <option value="coding">Coding</option>
            <option value="analysis">Analysis</option>
            <option value="creative">Creative</option>
          </select>
        </div>

        <button
          onClick={() => setPreferLocalModels(!preferLocalModels)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            preferLocalModels
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          <Zap size={14} />
          Prefer Local
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <Star size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No recommendations available</p>
          <p className="text-slate-500 text-sm mt-2">
            Add some providers and models to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={rec.model.id}
              className={`border rounded-xl p-4 hover:border-cyan-500/50 transition-all cursor-pointer ${getScoreBgColor(rec.score)}`}
              onClick={() => onSelectModel?.(rec.model)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {index === 0 && (
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    )}
                    <h4 className="font-semibold">{rec.model.display_name}</h4>
                    <span className={`text-xs font-medium ${getScoreColor(rec.score)}`}>
                      {rec.score}% match
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{rec.model.model_name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {rec.reasons.map((reason: string, idx: number) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded-full"
                  >
                    <TrendingUp size={10} />
                    {reason}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Brain size={12} />
                  <span>{rec.useCase}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={12} />
                  <span>{rec.model.context_window.toLocaleString()} tokens</span>
                </div>
                {rec.model.performance_metrics?.avg_response_time && (
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{Math.round(rec.model.performance_metrics.avg_response_time)}ms</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
