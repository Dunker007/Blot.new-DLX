/**
 * Intel Analysis Modal
 * AI-powered structured analysis (from TaskManagement)
 */

import React from 'react';
import { X, FileText } from 'lucide-react';
import { IntelReport } from '../../types/task';

interface IntelAnalysisModalProps {
  report: IntelReport | null;
  onClose: () => void;
}

export const IntelAnalysisModal: React.FC<IntelAnalysisModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-blue-400">Intel Analysis</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{report.title}</h3>
            <p className="text-gray-300">{report.summary}</p>
          </div>

          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Key Points:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {report.key_points.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
