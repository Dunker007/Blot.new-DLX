import { GoogleGenAI } from '@google/genai';
import { apiKeyManager } from '../apiKeyManager';

// Simplified Gemini service for DLX-Studios-Ultimate
class GeminiService {
  private apiKey: string | null = null;

  constructor() {
    // Auto-load API key from centralized manager on initialization
    this.loadApiKey();
  }

  private loadApiKey() {
    try {
      // Use centralized API key manager (Google key works for Gemini)
      const storedKey = apiKeyManager.getGoogleKey();
      if (storedKey) {
        this.apiKey = storedKey;
      }
    } catch (error) {
      console.error('Failed to load Gemini API key from APIKeyManager:', error);
    }
  }

  public setApiKey(key: string) {
    this.apiKey = key;
    // Save to centralized API key manager (Google key works for Gemini, Notebook LM, etc.)
    try {
      apiKeyManager.setGoogleKey(key);
    } catch (error) {
      console.error('Failed to save Gemini API key to APIKeyManager:', error);
    }
  }

  private getClient() {
    // Always check centralized manager first (in case of hot reload or key update)
    if (!this.apiKey) {
      this.loadApiKey();
    }
    // Also check if key was updated externally
    const currentKey = apiKeyManager.getGoogleKey();
    if (currentKey && currentKey !== this.apiKey) {
      this.apiKey = currentKey;
    }
    if (!this.apiKey) {
      throw new Error('Gemini API key not set. Please configure in settings.');
    }
    return new GoogleGenAI({ apiKey: this.apiKey });
  }

  public async generateText(
    prompt: string, 
    model: string = 'gemini-2.0-flash-exp',
    temperature: number = 0.7
  ): Promise<string> {
    const client = this.getClient();
    const response = await client.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature,
      },
    });
    return response.text || '';
  }

  public async generateChatResponse(prompt: string): Promise<{ text: string }> {
    const text = await this.generateText(prompt);
    return { text };
  }

  public async analyzeImage(file: File, prompt: string): Promise<string> {
    const client = this.getClient();
    const base64Data = await this.fileToBase64(file);
    
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: file.type, data: base64Data } }
        ]
      }]
    });
    
    return response.text || '';
  }

  public async transcribeAudio(audioBlob: Blob): Promise<string> {
    const client = this.getClient();
    const base64Data = await this.blobToBase64(audioBlob);
    
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{
        role: 'user',
        parts: [
          { text: 'Transcribe this audio:' },
          { inlineData: { mimeType: audioBlob.type, data: base64Data } }
        ]
      }]
    });
    
    return response.text || '';
  }

  public async generateCode(prompt: string, context?: string): Promise<string> {
    const fullPrompt = context 
      ? `${context}\n\nUser Request: ${prompt}`
      : prompt;
    
    return this.generateText(fullPrompt, 'gemini-2.5-pro');
  }

  public async generateMultiFileCode(
    prompt: string,
    files: Array<{ name: string; content: string }>,
    operations: Array<{ type: 'create' | 'modify' | 'delete'; file: string; content?: string }>
  ): Promise<Array<{ file: string; content: string; operation: 'create' | 'modify' | 'delete' }>> {
    const client = this.getClient();
    
    // Build context from existing files
    const fileContext = files.map(f => `File: ${f.name}\n${f.content}`).join('\n\n---\n\n');
    
    // Build operations description
    const operationsDesc = operations.map(op => {
      if (op.type === 'create') return `CREATE ${op.file}${op.content ? ` with content:\n${op.content}` : ''}`;
      if (op.type === 'modify') return `MODIFY ${op.file}${op.content ? `:\n${op.content}` : ''}`;
      return `DELETE ${op.file}`;
    }).join('\n');
    
    const fullPrompt = `You are a code assistant. The user wants to perform multi-file operations.
    
Current Project Files:
${fileContext}

Operations Requested:
${operationsDesc}

User Request: ${prompt}

Please respond with a JSON array of file operations, each with:
- file: string (file path/name)
- content: string (full file content, or null for delete)
- operation: 'create' | 'modify' | 'delete'

Format: [{"file": "path/to/file.ts", "content": "...", "operation": "create"}, ...]`;

    try {
      const response = await this.generateText(fullPrompt, 'gemini-2.5-pro');
      
      // Try to extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
      
      // Fallback: parse operations from text
      const results: Array<{ file: string; content: string; operation: 'create' | 'modify' | 'delete' }> = [];
      for (const op of operations) {
        if (op.type === 'delete') {
          results.push({ file: op.file, content: '', operation: 'delete' });
        } else {
          // For create/modify, try to extract content from response
          // Escape special regex characters in filename
          const escapedFile = op.file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // Match code blocks that might contain the file content
          const codeBlockPattern = new RegExp(`\`\`\`[\\w]*\\n([\\s\\S]*?)\`\`\``, 'gi');
          const codeBlocks = response.match(codeBlockPattern);
          
          if (codeBlocks && codeBlocks.length > 0) {
            // Use the first code block found, or try to find one matching the file
            const matchedBlock = codeBlocks[0].replace(/```[\w]*\n?/, '').replace(/```$/, '').trim();
            results.push({
              file: op.file,
              content: matchedBlock || op.content || '',
              operation: op.type
            });
          } else {
            // Fallback to original content
            results.push({
              file: op.file,
              content: op.content || '',
              operation: op.type
            });
          }
        }
      }
      return results;
    } catch (error) {
      console.error('Multi-file generation failed:', error);
      throw error;
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return this.fileToBase64(new File([blob], 'audio.webm'));
  }

  public async generateDocumentation(
    code: string,
    language: string,
    format: 'jsdoc' | 'tsdoc' | 'python' | 'java' = 'jsdoc'
  ): Promise<string> {
    const formatInstructions = {
      jsdoc: 'Generate JSDoc comments for JavaScript/TypeScript functions, classes, and methods. Use @param, @returns, @throws tags.',
      tsdoc: 'Generate TSDoc comments for TypeScript code. Use @param, @returns, @throws, @example tags.',
      python: 'Generate Python docstrings following PEP 257. Use Google or NumPy style.',
      java: 'Generate JavaDoc comments for Java classes and methods. Use @param, @return, @throws tags.',
    };

    const prompt = `Generate ${format} documentation for the following code.

${formatInstructions[format]}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide the complete code with documentation comments inserted inline. Return only the code with documentation, no explanations.`;

    return this.generateText(prompt, 'gemini-2.5-pro');
  }
}

export const geminiService = new GeminiService();

