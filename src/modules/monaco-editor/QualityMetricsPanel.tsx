import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle2, Code, RefreshCw } from 'lucide-react';

interface QualityMetrics {
  complexity: number;
  maintainabilityIndex: number;
  linesOfCode: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  codeDuplication: number;
  warnings: QualityWarning[];
}

interface QualityWarning {
  type: 'complexity' | 'duplication' | 'maintainability' | 'length';
  severity: 'high' | 'medium' | 'low';
  message: string;
  line?: number;
  suggestion: string;
}

interface QualityMetricsPanelProps {
  code: string;
  fileName: string;
  onRefactor?: () => void;
}

const QualityMetricsPanel: React.FC<QualityMetricsPanelProps> = ({ code, fileName, onRefactor }) => {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    calculateMetrics();
  }, [code, fileName]);

  const calculateMetrics = () => {
    setIsCalculating(true);
    try {
      const linesOfCode = code.split('\n').length;
      const cyclomaticComplexity = calculateCyclomaticComplexity(code);
      const cognitiveComplexity = calculateCognitiveComplexity(code);
      const codeDuplication = calculateDuplication(code);
      const maintainabilityIndex = calculateMaintainabilityIndex(code, cyclomaticComplexity, linesOfCode);
      const complexity = (cyclomaticComplexity + cognitiveComplexity) / 2;
      const warnings = generateWarnings(code, cyclomaticComplexity, cognitiveComplexity, codeDuplication, maintainabilityIndex, linesOfCode);

      setMetrics({
        complexity,
        maintainabilityIndex,
        linesOfCode,
        cyclomaticComplexity,
        cognitiveComplexity,
        codeDuplication,
        warnings,
      });
    } catch (error) {
      console.error('Metrics calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const calculateCyclomaticComplexity = (code: string): number => {
    let complexity = 1; // Base complexity
    
    // Count decision points
    const decisionPatterns = [
      /if\s*\(/gi,
      /else\s*{/gi,
      /else\s+if/gi,
      /switch\s*\(/gi,
      /case\s+/gi,
      /catch\s*\(/gi,
      /for\s*\(/gi,
      /while\s*\(/gi,
      /do\s*{/gi,
      /&&/g,
      /\|\|/g,
      /\?/g, // Ternary operator
    ];

    for (const pattern of decisionPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  };

  const calculateCognitiveComplexity = (code: string): number => {
    let complexity = 0;
    const lines = code.split('\n');
    let nestingLevel = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Increase nesting for control structures
      if (/^\s*(if|for|while|switch|catch|try)\s*\(/.test(trimmed)) {
        complexity += 1 + nestingLevel;
        nestingLevel++;
      } else if (/^\s*else/.test(trimmed)) {
        complexity += 1;
      } else if (/^\s*}\s*$/.test(trimmed)) {
        if (nestingLevel > 0) nestingLevel--;
      }
    }

    return complexity;
  };

  const calculateDuplication = (code: string): number => {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) return 0;

    const lineCounts = new Map<string, number>();
    for (const line of lines) {
      const normalized = line.trim().toLowerCase();
      lineCounts.set(normalized, (lineCounts.get(normalized) || 0) + 1);
    }

    let duplicates = 0;
    for (const count of lineCounts.values()) {
      if (count > 1) {
        duplicates += count - 1;
      }
    }

    return Math.round((duplicates / lines.length) * 100);
  };

  const calculateMaintainabilityIndex = (
    code: string,
    cyclomaticComplexity: number,
    linesOfCode: number
  ): number => {
    // Simplified Maintainability Index calculation
    // MI = 171 - 5.2 * ln(Halstead Volume) - 0.23 * Cyclomatic Complexity - 16.2 * ln(Lines of Code)
    // Simplified version:
    const halsteadVolume = code.length * Math.log2(code.length || 1);
    const mi = Math.max(0, Math.min(100, 
      171 - 5.2 * Math.log(halsteadVolume || 1) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode || 1)
    ));
    return Math.round(mi);
  };

  const generateWarnings = (
    code: string,
    cyclomaticComplexity: number,
    cognitiveComplexity: number,
    duplication: number,
    maintainability: number,
    linesOfCode: number
  ): QualityWarning[] => {
    const warnings: QualityWarning[] = [];

    if (cyclomaticComplexity > 15) {
      warnings.push({
        type: 'complexity',
        severity: 'high',
        message: `High cyclomatic complexity (${cyclomaticComplexity})`,
        suggestion: 'Consider breaking down complex functions into smaller, more manageable pieces',
      });
    } else if (cyclomaticComplexity > 10) {
      warnings.push({
        type: 'complexity',
        severity: 'medium',
        message: `Medium cyclomatic complexity (${cyclomaticComplexity})`,
        suggestion: 'Consider simplifying control flow',
      });
    }

    if (cognitiveComplexity > 20) {
      warnings.push({
        type: 'complexity',
        severity: 'high',
        message: `High cognitive complexity (${cognitiveComplexity})`,
        suggestion: 'Reduce nesting levels and simplify logic',
      });
    }

    if (duplication > 30) {
      warnings.push({
        type: 'duplication',
        severity: 'high',
        message: `High code duplication (${duplication}%)`,
        suggestion: 'Extract common code into reusable functions or utilities',
      });
    } else if (duplication > 15) {
      warnings.push({
        type: 'duplication',
        severity: 'medium',
        message: `Medium code duplication (${duplication}%)`,
        suggestion: 'Consider refactoring duplicated code',
      });
    }

    if (maintainability < 50) {
      warnings.push({
        type: 'maintainability',
        severity: 'high',
        message: `Low maintainability index (${maintainability})`,
        suggestion: 'Refactor code to improve maintainability',
      });
    } else if (maintainability < 70) {
      warnings.push({
        type: 'maintainability',
        severity: 'medium',
        message: `Medium maintainability index (${maintainability})`,
        suggestion: 'Consider improving code structure',
      });
    }

    if (linesOfCode > 500) {
      warnings.push({
        type: 'length',
        severity: 'medium',
        message: `Large file (${linesOfCode} lines)`,
        suggestion: 'Consider splitting into smaller modules',
      });
    }

    return warnings;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (!metrics) {
    return (
      <div className="p-4 bg-slate-900 border-l border-slate-800">
        <div className="flex items-center gap-2 text-slate-400">
          <BarChart3 size={16} />
          <span className="text-sm">Calculating metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-800/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Quality Metrics</h3>
          </div>
          <button
            onClick={calculateMetrics}
            disabled={isCalculating}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
            title="Recalculate"
          >
            <RefreshCw size={14} className={`text-slate-400 ${isCalculating ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className={`flex items-center gap-1 ${getScoreColor(metrics.maintainabilityIndex)}`}>
          <TrendingUp size={14} />
          <span className="text-sm font-semibold">Maintainability: {metrics.maintainabilityIndex}/100</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Cyclomatic Complexity</div>
            <div className="text-lg font-bold text-white">{metrics.cyclomaticComplexity}</div>
            <div className="text-xs text-slate-500 mt-1">
              {metrics.cyclomaticComplexity <= 10 ? 'Good' : metrics.cyclomaticComplexity <= 15 ? 'Moderate' : 'High'}
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Cognitive Complexity</div>
            <div className="text-lg font-bold text-white">{metrics.cognitiveComplexity}</div>
            <div className="text-xs text-slate-500 mt-1">
              {metrics.cognitiveComplexity <= 15 ? 'Good' : metrics.cognitiveComplexity <= 20 ? 'Moderate' : 'High'}
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Lines of Code</div>
            <div className="text-lg font-bold text-white">{metrics.linesOfCode}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Duplication</div>
            <div className="text-lg font-bold text-white">{metrics.codeDuplication}%</div>
            <div className="text-xs text-slate-500 mt-1">
              {metrics.codeDuplication <= 15 ? 'Low' : metrics.codeDuplication <= 30 ? 'Moderate' : 'High'}
            </div>
          </div>
        </div>

        {/* Warnings */}
        {metrics.warnings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-300">
                {metrics.warnings.length} Warning{metrics.warnings.length !== 1 ? 's' : ''}
              </span>
              {onRefactor && (
                <button
                  onClick={onRefactor}
                  className="px-2 py-1 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded transition-colors"
                >
                  Refactor
                </button>
              )}
            </div>

            <div className="space-y-2">
              {metrics.warnings.map((warning, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getSeverityColor(warning.severity)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} />
                    <span className="text-xs font-semibold uppercase">{warning.severity}</span>
                    {warning.line && (
                      <span className="text-xs text-slate-400">Line {warning.line}</span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-white mb-1">{warning.message}</div>
                  <div className="text-xs text-slate-400">{warning.suggestion}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {metrics.warnings.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <CheckCircle2 size={32} className="text-green-400 mb-2" />
            <div className="text-sm font-semibold text-white">No Issues</div>
            <div className="text-xs text-slate-400">Code quality is good!</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualityMetricsPanel;

