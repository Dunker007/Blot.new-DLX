import React, { useState, useCallback } from 'react';
import { Wand2, GitBranch, Check, X, RefreshCw, Eye, Loader2 } from 'lucide-react';
import { geminiService } from '../../services/gemini/geminiService';
// DiffViewer is defined inline below

interface RefactoringOperation {
  type: 'extract-function' | 'rename' | 'simplify' | 'extract-variable' | 'inline' | 'split-file';
  name: string;
  description: string;
}

interface RefactoringResult {
  originalCode: string;
  refactoredCode: string;
  diff: string;
  explanation: string;
}

interface RefactoringPanelProps {
  code: string;
  fileName: string;
  language: string;
  onApply: (refactoredCode: string) => void;
  onNavigateToReview?: () => void;
}

const RefactoringPanel: React.FC<RefactoringPanelProps> = ({
  code,
  fileName,
  language,
  onApply,
  onNavigateToReview,
}) => {
  const [selectedOperation, setSelectedOperation] = useState<RefactoringOperation | null>(null);
  const [result, setResult] = useState<RefactoringResult | null>(null);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [showDiff, setShowDiff] = useState(true);

  const operations: RefactoringOperation[] = [
    {
      type: 'extract-function',
      name: 'Extract Function',
      description: 'Extract selected code into a reusable function',
    },
    {
      type: 'rename',
      name: 'Rename Symbol',
      description: 'Rename variables, functions, or classes across the file',
    },
    {
      type: 'simplify',
      name: 'Simplify Code',
      description: 'Simplify complex logic and reduce nesting',
    },
    {
      type: 'extract-variable',
      name: 'Extract Variable',
      description: 'Extract complex expressions into named variables',
    },
    {
      type: 'inline',
      name: 'Inline Variable/Function',
      description: 'Inline variables or function calls to simplify code',
    },
    {
      type: 'split-file',
      name: 'Split File',
      description: 'Split large file into smaller, focused modules',
    },
  ];

  const handleRefactor = async (operation: RefactoringOperation) => {
    setIsRefactoring(true);
    setSelectedOperation(operation);
    
    try {
      const operationPrompts: Record<string, string> = {
        'extract-function': `Refactor the following code by extracting reusable logic into a well-named function. Provide the refactored code with the extracted function.

Code:
\`\`\`${language}
${code}
\`\`\``,
        'rename': `Refactor the following code by improving variable, function, and class names for better readability. Use descriptive, meaningful names.

Code:
\`\`\`${language}
${code}
\`\`\``,
        'simplify': `Refactor the following code to simplify it: reduce nesting, extract complex conditions, improve readability. Keep the same functionality but make it cleaner.

Code:
\`\`\`${language}
${code}
\`\`\``,
        'extract-variable': `Refactor the following code by extracting complex expressions into well-named variables. This improves readability and maintainability.

Code:
\`\`\`${language}
${code}
\`\`\``,
        'inline': `Refactor the following code by inlining variables or simple functions where appropriate to reduce unnecessary abstractions.

Code:
\`\`\`${language}
${code}
\`\`\``,
        'split-file': `Analyze the following code and suggest how to split it into smaller, focused modules. Provide the refactored code structure.

Code:
\`\`\`${language}
${code}
\`\`\``,
      };

      const prompt = operationPrompts[operation.type] || operationPrompts['simplify'];
      
      const refactoredCode = await geminiService.generateCode(prompt, code);
      
      // Generate explanation
      const explanationPrompt = `Explain what refactoring changes were made and why:

Original:
\`\`\`${language}
${code.substring(0, 500)}
\`\`\`

Refactored:
\`\`\`${language}
${refactoredCode.substring(0, 500)}
\`\`\`

Provide a brief explanation of the improvements.`;
      
      const explanation = await geminiService.generateText(explanationPrompt);

      // Simple diff generation (line-by-line comparison)
      const originalLines = code.split('\n');
      const refactoredLines = refactoredCode.split('\n');
      const diffLines: string[] = [];
      
      const maxLines = Math.max(originalLines.length, refactoredLines.length);
      for (let i = 0; i < maxLines; i++) {
        const original = originalLines[i] || '';
        const refactored = refactoredLines[i] || '';
        
        if (original === refactored) {
          diffLines.push(` ${original}`);
        } else if (original && refactored) {
          diffLines.push(`-${original}`);
          diffLines.push(`+${refactored}`);
        } else if (original) {
          diffLines.push(`-${original}`);
        } else if (refactored) {
          diffLines.push(`+${refactored}`);
        }
      }

      setResult({
        originalCode: code,
        refactoredCode,
        diff: diffLines.join('\n'),
        explanation,
      });
    } catch (error) {
      console.error('Refactoring failed:', error);
      setResult({
        originalCode: code,
        refactoredCode: code,
        diff: '',
        explanation: 'Refactoring failed. Please check your Gemini API key and try again.',
      });
    } finally {
      setIsRefactoring(false);
    }
  };

  const handleApply = () => {
    if (result && result.refactoredCode !== result.originalCode) {
      onApply(result.refactoredCode);
      setResult(null);
      setSelectedOperation(null);
    }
  };

  const handleCancel = () => {
    setResult(null);
    setSelectedOperation(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-800/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wand2 size={18} className="text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Refactoring Assistant</h3>
          </div>
          {onNavigateToReview && (
            <button
              onClick={onNavigateToReview}
              className="px-2 py-1 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded transition-colors"
            >
              Review Lab
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400">Improve code structure and maintainability</p>
      </div>

      {/* Operations */}
      {!result && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {operations.map((operation) => (
              <button
                key={operation.type}
                onClick={() => handleRefactor(operation)}
                disabled={isRefactoring}
                className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-white text-sm">{operation.name}</div>
                  {isRefactoring && selectedOperation?.type === operation.type && (
                    <Loader2 size={14} className="animate-spin text-cyan-400" />
                  )}
                </div>
                <div className="text-xs text-slate-400">{operation.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Refactoring Result</div>
            <button
              onClick={() => setShowDiff(!showDiff)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
              {showDiff ? <EyeOff size={12} /> : <Eye size={12} />}
              {showDiff ? 'Hide' : 'Show'} Diff
            </button>
          </div>

          {showDiff && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 max-h-64 overflow-y-auto">
              <DiffViewer
                original={result.originalCode}
                modified={result.refactoredCode}
              />
            </div>
          )}

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <div className="text-xs font-semibold text-slate-300 mb-2">Explanation</div>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {result.explanation}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 rounded-lg transition-opacity text-white font-medium"
            >
              <Check size={16} />
              Apply Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Diff Viewer Component
const SimpleDiffViewer: React.FC<{ original: string; modified: string }> = ({ original, modified }) => {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  const maxLines = Math.max(originalLines.length, modifiedLines.length);

  return (
    <div className="font-mono text-xs">
      {Array.from({ length: Math.min(maxLines, 50) }).map((_, index) => {
        const origLine = originalLines[index] || '';
        const modLine = modifiedLines[index] || '';
        const isChanged = origLine !== modLine;
        const isRemoved = origLine && !modLine;
        const isAdded = !origLine && modLine;

        return (
          <div
            key={index}
            className={`flex gap-2 ${
              isRemoved ? 'bg-red-500/10 text-red-400' :
              isAdded ? 'bg-green-500/10 text-green-400' :
              isChanged ? 'bg-yellow-500/10 text-yellow-400' :
              'text-slate-400'
            }`}
          >
            <span className="text-slate-600 w-8 text-right">{index + 1}</span>
            {isChanged && origLine && (
              <span className="text-red-400">-{origLine}</span>
            )}
            {isChanged && modLine && (
              <span className="text-green-400 ml-2">+{modLine}</span>
            )}
            {!isChanged && <span>{modLine || origLine}</span>}
          </div>
        );
      })}
      {maxLines > 50 && (
        <div className="text-slate-500 text-xs mt-2">... (showing first 50 lines)</div>
      )}
    </div>
  );
};

export default RefactoringPanel;

