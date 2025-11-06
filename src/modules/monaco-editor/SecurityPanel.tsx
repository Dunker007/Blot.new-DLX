import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react';
import { securityScanner, SecurityIssue } from '../../services/securityScanner';

interface SecurityPanelProps {
  code: string;
  fileName: string;
  onNavigateToReview?: () => void;
}

const SecurityPanel: React.FC<SecurityPanelProps> = ({ code, fileName, onNavigateToReview }) => {
  const [scanResult, setScanResult] = useState<{ issues: SecurityIssue[]; score: number; hasIssues: boolean } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  useEffect(() => {
    scanCode();
  }, [code, fileName]);

  const scanCode = () => {
    setIsScanning(true);
    try {
      const result = securityScanner.scanCode(code, fileName);
      setScanResult(result);
      setLastScanTime(new Date());
    } catch (error) {
      console.error('Security scan failed:', error);
    } finally {
      setIsScanning(false);
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!scanResult) {
    return (
      <div className="p-4 bg-slate-900 border-l border-slate-800">
        <div className="flex items-center gap-2 text-slate-400">
          <Shield size={16} />
          <span className="text-sm">Scanning...</span>
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
            <Shield size={18} className="text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Security Scan</h3>
          </div>
          <button
            onClick={scanCode}
            disabled={isScanning}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
            title="Rescan"
          >
            <RefreshCw size={14} className={`text-slate-400 ${isScanning ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 ${getScoreColor(scanResult.score)}`}>
            {scanResult.score >= 80 ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertTriangle size={14} />
            )}
            <span className="text-sm font-semibold">Score: {scanResult.score}/100</span>
          </div>
          {lastScanTime && (
            <span className="text-xs text-slate-500">
              {lastScanTime.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-4">
        {scanResult.hasIssues ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-300">
                {scanResult.issues.length} Issue{scanResult.issues.length !== 1 ? 's' : ''} Found
              </span>
              {onNavigateToReview && (
                <button
                  onClick={onNavigateToReview}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded transition-colors"
                >
                  <ExternalLink size={12} />
                  Review Lab
                </button>
              )}
            </div>

            {scanResult.issues.map((issue, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase">{issue.severity}</span>
                      <span className="text-xs text-slate-400">Line {issue.line}</span>
                      {issue.column && (
                        <span className="text-xs text-slate-400">Col {issue.column}</span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-white mb-1">{issue.message}</div>
                    <div className="text-xs text-slate-400 mb-2">
                      {securityScanner.getIssueTypeDescription(issue.type)}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded p-2 mb-2">
                  <code className="text-xs text-slate-300 font-mono">{issue.code}</code>
                </div>
                <div className="text-xs text-slate-400">
                  <span className="font-semibold">Suggestion:</span> {issue.suggestion}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CheckCircle2 size={48} className="text-green-400 mb-3" />
            <div className="text-lg font-semibold text-white mb-1">All Clear!</div>
            <div className="text-sm text-slate-400">
              No security issues detected in this file
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {scanResult.hasIssues && (
        <div className="p-4 border-t border-slate-800 bg-slate-800/50">
          <div className="text-xs text-slate-400">
            <div className="mb-1">Security Score: {scanResult.score}/100</div>
            <div>
              {scanResult.issues.filter(i => i.severity === 'high').length} high,{' '}
              {scanResult.issues.filter(i => i.severity === 'medium').length} medium,{' '}
              {scanResult.issues.filter(i => i.severity === 'low').length} low severity issues
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityPanel;

