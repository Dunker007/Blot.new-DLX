import { GoogleGenAI } from '@google/genai';

// Simplified Gemini service for DLX-Studios-Ultimate
class GeminiService {
  private apiKey: string | null = null;

  public setApiKey(key: string) {
    this.apiKey = key;
  }

  private getClient() {
    if (!this.apiKey) {
      throw new Error('Gemini API key not set. Please configure in settings.');
    }
    return new GoogleGenAI({ apiKey: this.apiKey });
  }

  public async generateText(prompt: string, model: string = 'gemini-2.0-flash-exp'): Promise<string> {
    const client = this.getClient();
    const response = await client.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
}

export const geminiService = new GeminiService();

