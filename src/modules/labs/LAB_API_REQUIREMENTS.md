# Lab API Requirements

## Enabled Labs Status

All labs are now enabled in `preview` mode via Feature Flags. Each lab may require external API integrations for full functionality.

### Signal Lab 📡
**Status:** ✅ Enabled (Preview)  
**Requirement:** Google Search API  
**Purpose:** Real-time research with web search grounding  
**Current State:** Lab interface is functional, but search functionality requires Google Custom Search API integration.  
**API Setup Needed:**
- Google Custom Search API key
- Search Engine ID (CX)
- Configure in settings or environment variables

### Creator Studio 🎨
**Status:** ✅ Enabled (Preview)  
**Requirement:** Image Generation API (OpenAI DALL-E, Midjourney, Stable Diffusion, etc.)  
**Purpose:** AI-powered image generation from text prompts  
**Current State:** Lab interface is functional, but image generation requires an image generation API.  
**API Setup Needed:**
- Image generation service API key (OpenAI, Stability AI, etc.)
- Configure in settings or environment variables

### Comms Channel 🎤
**Status:** ✅ Enabled (Preview)  
**Requirement:** Audio Transcription API (OpenAI Whisper, Google Speech-to-Text, etc.)  
**Purpose:** Real-time audio transcription interface  
**Current State:** Lab interface is functional, but transcription requires an audio transcription API.  
**API Setup Needed:**
- Audio transcription service API key
- Configure in settings or environment variables

### Dataverse Lab 🌌
**Status:** ✅ Enabled (Preview)  
**Requirement:** RAG Knowledge System (Vector Database, Embeddings)  
**Purpose:** RAG-powered knowledge system grounded in project documentation  
**Current State:** Lab interface is functional, but requires vector database and embedding setup.  
**Setup Needed:**
- Vector database (Pinecone, Weaviate, Chroma, etc.)
- Embedding model (OpenAI embeddings, etc.)
- Configure in settings or environment variables

## How to Configure APIs

1. Navigate to **Settings** → **Connections** or the relevant lab's settings
2. Enter API credentials
3. API keys are stored securely in `localStorage` (or environment variables for production)
4. Test the connection from within each lab

## Feature Flag Status

All labs are controlled via Feature Flags:
- `signalLab`: preview
- `creatorStudio`: preview
- `commsChannel`: preview
- `dataverse`: preview

To enable/disable labs, use the **Feature Flags** page in Settings.

