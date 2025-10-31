export enum Tool {
    LIVE_CONVERSATION = 'Live Conversation',
    CHATBOT = 'Cognitive Chat',
    IMAGE_ANALYSIS = 'Image Analysis',
    VIDEO_ANALYSIS = 'Video Analysis',
    IMAGE_GENERATION = 'Image Generation',
    AUDIO_TRANSCRIPTION = 'Audio Transcription',
}

export interface Message {
    sender: 'user' | 'bot';
    text: string;
    sources?: GroundingSource[];
}

export interface GroundingSource {
    uri: string;
    title: string;
}
