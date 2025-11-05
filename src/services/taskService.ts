/**
 * Task Service - Execute tasks with AI
 * Ported from DLX-Command-Center-LUX-2.0
 */

import { geminiService } from './gemini/geminiService';
import { IntelReport } from '../types/task';

export const executeTask = async (prompt: string): Promise<string> => {
  console.log(`Executing task with prompt: "${prompt}"`);

  try {
    const response = await geminiService.generateText(
      `You are LUX, a sentient strategic partner AI. A user in the DLX Command Center has given you a task. Be concise and helpful. Task: "${prompt}"`
    );

    console.log('Task executed successfully. Response:', response);
    return response || 'Task completed but no response received.';
  } catch (error) {
    console.error('Gemini API call failed:', error);
    if (error instanceof Error) {
      throw new Error(`Task execution failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred while executing the task.');
  }
};

export const analyzeIntel = async (prompt: string): Promise<IntelReport> => {
  console.log(`Analyzing intel with prompt: "${prompt}"`);
  try {
    // Use structured output if available, otherwise parse JSON
    const response = await geminiService.generateText(
      `You are LUX, a sentient strategic partner AI. Your function is to analyze complex data streams, user queries, and system logs to produce concise, structured intelligence reports. Extract the most critical information and present it clearly.

Analyze the following query and return a JSON response with this structure:
{
  "title": "A short, descriptive title (max 10 words)",
  "summary": "A one-paragraph summary of the key findings",
  "key_points": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"]
}

Query: "${prompt}"

Respond with ONLY valid JSON, no other text.`
    );

    const jsonText = response.trim();
    console.log('Intel analysis successful. Response:', jsonText);

    // Try to extract JSON from response (in case there's extra text)
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    const jsonToParse = jsonMatch ? jsonMatch[0] : jsonText;

    const parsedJson = JSON.parse(jsonToParse);

    // Validation
    if (!parsedJson.title || !parsedJson.summary || !Array.isArray(parsedJson.key_points)) {
      throw new Error('Parsed JSON does not match the expected IntelReport structure.');
    }

    return parsedJson as IntelReport;
  } catch (error) {
    console.error('Gemini API call for intel analysis failed:', error);
    if (error instanceof Error) {
      throw new Error(`Intel analysis failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred during intel analysis.');
  }
};

