import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Loader2, Eye, EyeOff } from 'lucide-react';
import { geminiService } from '../../services/gemini/geminiService';
import type { editor } from 'monaco-editor';

interface CodeExplanation {
  line: number;
  content: string;
  explanation: string;
  complexity: 'simple' | 'moderate' | 'complex';
}

interface CodeExplanationPanelProps {
  code: string;
  fileName: string;
  language: string;
  editorInstance?: editor.IStandaloneCodeEditor | null;
  learningMode?: boolean;
}

const CodeExplanationPanel: React.FC<CodeExplanationPanelProps> = ({
  code,
  fileName,
  language,
  editorInstance,
  learningMode = false,
}) => {
  const [explanations, setExplanations] = useState<Map<number, CodeExplanation>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [highlightedLines, setHighlightedLines] = useState<Set<number>>(new Set());
  const [showExplanations, setShowExplanations] = useState(true);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  useEffect(() => {
    if (learningMode && code) {
      generateExplanations();
    }
  }, [code, learningMode]);

  const generateExplanations = async () => {
    setIsGenerating(true);
    try {
      // Break code into logical sections
      const lines = code.split('\n');
      const sections: Array<{ start: number; end: number; code: string }> = [];
      
      let currentSection = { start: 0, end: 0, code: '' };
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Start new section on function/class declarations
        if (trimmed.match(/^(function|class|const|let|var|export|import|def|class)\s+/)) {
          if (currentSection.code) {
            sections.push({ ...currentSection, end: i });
          }
          currentSection = { start: i, end: i, code: line };
        } else {
          currentSection.code += '\n' + line;
          currentSection.end = i;
        }
      }
      if (currentSection.code) {
        sections.push({ ...currentSection, end: lines.length - 1 });
      }

      // Generate explanations for each section
      const newExplanations = new Map<number, CodeExplanation>();
      
      for (const section of sections.slice(0, 10)) { // Limit to first 10 sections
        try {
          const sectionCode = lines.slice(section.start, section.end + 1).join('\n');
          const prompt = `Explain this code section in detail, focusing on what it does, how it works, and any important concepts:

\`\`\`${language}
${sectionCode}
\`\`\`

Provide a clear, educational explanation suitable for ${learningMode ? 'beginners' : 'developers'}.`;

          const explanation = await geminiService.generateText(prompt);
          
          // Determine complexity
          let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
          if (sectionCode.match(/if|for|while|switch|try|catch/g)) {
            complexity = sectionCode.match(/if|for|while|switch|try|catch/g)!.length > 3 ? 'complex' : 'moderate';
          }

          newExplanations.set(section.start + 1, {
            line: section.start + 1,
            content: sectionCode,
            explanation: explanation,
            complexity,
          });

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to explain section ${section.start}:`, error);
        }
      }

      setExplanations(newExplanations);
    } catch (error) {
      console.error('Explanation generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLineClick = async (lineNumber: number) => {
    if (explanations.has(lineNumber)) {
      setSelectedLine(selectedLine === lineNumber ? null : lineNumber);
      return;
    }

    // Generate explanation on demand
    setIsGenerating(true);
    try {
      const lines = code.split('\n');
      const line = lines[lineNumber - 1];
      const context = lines.slice(Math.max(0, lineNumber - 5), Math.min(lines.length, lineNumber + 5)).join('\n');

      const prompt = `Explain this specific line of code in detail:

Line ${lineNumber}: ${line}

Context:
\`\`\`${language}
${context}
\`\`\`

Provide a clear explanation of what this line does and why it's important.`;

      const explanation = await geminiService.generateText(prompt);
      
      const newExplanations = new Map(explanations);
      newExplanations.set(lineNumber, {
        line: lineNumber,
        content: line,
        explanation,
        complexity: line.match(/if|for|while|switch|try|catch/) ? 'moderate' : 'simple',
      });
      setExplanations(newExplanations);
      setSelectedLine(lineNumber);
    } catch (error) {
      console.error('Line explanation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const highlightLineInEditor = (lineNumber: number) => {
    if (!editorInstance) return;

    const newHighlighted = new Set(highlightedLines);
    newHighlighted.add(lineNumber);
    setHighlightedLines(newHighlighted);

    // Scroll to line
    editorInstance.revealLine(lineNumber);
    editorInstance.setPosition({ lineNumber, column: 1 });
    editorInstance.focus();

    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightedLines(prev => {
        const updated = new Set(prev);
        updated.delete(lineNumber);
        return updated;
      });
    }, 3000);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'complex':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'moderate':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-800/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Code Explanation</h3>
          </div>
          <button
            onClick={() => setShowExplanations(!showExplanations)}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
          >
            {showExplanations ? <EyeOff size={14} className="text-slate-400" /> : <Eye size={14} className="text-slate-400" />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateExplanations}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-xs text-cyan-400 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={12} />
                Explain Code
              </>
            )}
          </button>
          {learningMode && (
            <span className="text-xs text-slate-400">Learning Mode</span>
          )}
        </div>
      </div>

      {/* Explanations */}
      {showExplanations && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isGenerating && explanations.size === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Loader2 size={32} className="animate-spin text-cyan-400 mb-3" />
              <div className="text-sm text-slate-400">Analyzing code structure...</div>
            </div>
          )}

          {explanations.size === 0 && !isGenerating && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BookOpen size={32} className="text-slate-600 mb-3" />
              <div className="text-sm font-semibold text-white mb-1">No Explanations Yet</div>
              <div className="text-xs text-slate-400 mb-4">Click "Explain Code" to analyze</div>
              <div className="text-xs text-slate-500">Or click on any line in the editor to get instant explanations</div>
            </div>
          )}

          {Array.from(explanations.entries()).map(([lineNumber, explanation]) => (
            <div
              key={lineNumber}
              className={`p-3 rounded-lg border ${selectedLine === lineNumber ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-slate-800/50 border-slate-700'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-cyan-400">Line {lineNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${getComplexityColor(explanation.complexity)}`}>
                    {explanation.complexity}
                  </span>
                </div>
                <button
                  onClick={() => highlightLineInEditor(lineNumber)}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Show in Editor
                </button>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded p-2 mb-2">
                <code className="text-xs text-slate-300 font-mono">{explanation.content}</code>
              </div>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {explanation.explanation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {!showExplanations && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-slate-400 text-sm">
            Click the eye icon to show explanations
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeExplanationPanel;

