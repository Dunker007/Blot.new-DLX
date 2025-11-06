import React, { useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  editorRef?: React.MutableRefObject<editor.IStandaloneCodeEditor | null> | null;
  onContextChange?: (context: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language, value, onChange, editorRef, onContextChange }) => {
  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor) {
    if (editorRef) {
      editorRef.current = editor;
    }

    // Enable context-aware suggestions
    const model = editor.getModel();
    if (model) {
      // Enhanced autocomplete with context
      editor.updateOptions({
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnCommitCharacter: true,
        acceptSuggestionOnEnter: 'on',
        tabCompletion: 'on',
        wordBasedSuggestions: 'allDocuments',
        // Enable IntelliSense
        enableSuggestions: true,
        // Context-aware completion
        suggestSelection: 'first',
        // Show parameter hints
        parameterHints: {
          enabled: true,
        },
      });
    }

    // Listen for context changes (when user types)
    editor.onDidChangeModelContent(() => {
      if (onContextChange) {
        const currentValue = editor.getValue();
        const cursorPosition = editor.getPosition();
        
        // Extract context around cursor (200 chars before and after)
        if (cursorPosition) {
          const line = cursorPosition.lineNumber;
          const column = cursorPosition.column;
          const lines = currentValue.split('\n');
          const currentLine = lines[line - 1] || '';
          
          // Get surrounding context
          const startLine = Math.max(0, line - 5);
          const endLine = Math.min(lines.length, line + 5);
          const context = lines.slice(startLine, endLine).join('\n');
          
          onContextChange(context);
        }
      }
    });
  }

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={onChange}
      onMount={handleEditorDidMount}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        // Enhanced IntelliSense
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        tabSize: 2,
        insertSpaces: true,
        // Context-aware features
        wordBasedSuggestions: 'allDocuments',
        suggestSelection: 'first',
      }}
    />
  );
};

export default CodeEditor;

