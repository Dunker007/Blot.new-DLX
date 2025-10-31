import { GoogleGenAI, GenerateContentResponse, Chat, GroundingChunk, Modality } from "@google/genai";
import { GroundingSource } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- Model Configurations ---
const flashLiteModel = 'gemini-flash-lite-latest';
const flashModel = 'gemini-2.5-flash';
const proModel = 'gemini-2.5-pro';
const imageGenModel = 'imagen-4.0-generate-001';
const ttsModel = 'gemini-2.5-flash-preview-tts';
export const liveModel = 'gemini-2.5-flash-native-audio-preview-09-2025';

// --- Service Functions ---

/**
 * Creates a new chat session with a system instruction.
 */
export function createChatSession(): Chat {
    return ai.chats.create({
        model: flashModel,
        config: {
            systemInstruction: 'You are LUX, a cognitive co-pilot for a command center. You are helpful, professional, and concise. Your goal is to assist the operator with any task.',
        },
    });
}

/**
 * Sends a message in a chat session and returns the streaming response.
 */
export async function sendMessageStream(chat: Chat, message: string) {
    return chat.sendMessageStream({ message });
}

/**
 * Generates content with Google Search grounding for up-to-date info.
 */
export async function generateGroundedText(prompt: string): Promise<{ text: string, sources: GroundingSource[] }> {
    const response = await ai.models.generateContent({
        model: flashModel,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
        .filter((chunk: GroundingChunk) => chunk.web)
        .map((chunk: GroundingChunk) => ({
            uri: chunk.web!.uri,
            title: chunk.web!.title,
        }));

    return { text, sources };
}


/**
 * Generates content using Thinking Mode for complex queries.
 */
export async function generateComplexText(prompt: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: proModel,
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });
    return response.text;
}

/**
 * Generates quick, low-latency text.
 */
export async function generateQuickText(prompt: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: flashLiteModel,
        contents: prompt,
    });
    return response.text;
}

/**
 * Generates an image using imagen-4.0.
 */
export async function generateImage(prompt: string, aspectRatio: string): Promise<string> {
    const response = await ai.models.generateImages({
        model: imageGenModel,
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}

/**
 * Analyzes a provided image with a text prompt.
 */
export async function analyzeImage(prompt: string, imageData: string, mimeType: string): Promise<string> {
    const imagePart = {
        inlineData: {
            mimeType,
            data: imageData,
        },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: flashModel,
        contents: { parts: [imagePart, textPart] },
    });
    return response.text;
}

/**
 * Analyzes video frames with a text prompt.
 */
export async function analyzeVideoFrames(prompt: string, frames: { data: string, mimeType: string }[]): Promise<string> {
    // FIX: The original method of creating an array of one type and then unshifting
    // another type caused a TypeScript error. This has been refactored to create
    // the mixed-type array in a single step, which allows TypeScript to correctly
    // infer the union type for the parts.
    const imageParts = frames.map(frame => ({
        inlineData: {
            data: frame.data,
            mimeType: frame.mimeType
        }
    }));
    const parts = [{ text: prompt }, ...imageParts];


    const response = await ai.models.generateContent({
        model: proModel,
        contents: { parts },
    });
    return response.text;
}


/**
 * Transcribes audio data.
 */
export async function transcribeAudio(audioData: string, mimeType: string): Promise<string> {
    const audioPart = {
        inlineData: {
            data: audioData,
            mimeType: mimeType,
        },
    };
    
    // FIX: Removed the explicit text prompt to resolve a type error. The multimodal model
    // can infer the transcription task from the audio content type alone.
    const response = await ai.models.generateContent({
        model: flashModel,
        contents: { parts: [audioPart] }
    });
    return response.text;
}


/**
 * Converts text to speech.
 */
export async function generateSpeech(text: string): Promise<string> {
     const response = await ai.models.generateContent({
        model: ttsModel,
        contents: [{ parts: [{ text: `Say this in a calm, professional tone: ${text}` }] }],
        config: {
            // FIX: Use Modality enum instead of string literal for type safety.
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data returned from TTS API.");
    }
    return base64Audio;
}

/**
 * Connects to the Live API for real-time conversation.
 */
export function connectLive(callbacks: any) {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    return ai.live.connect({
        model: liveModel,
        callbacks,
        config: {
            // FIX: Use Modality enum instead of string literal for type safety.
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are LUX, a friendly and helpful cognitive co-pilot. Keep your responses concise and to the point for a real-time conversation.',
        }
    });
}
