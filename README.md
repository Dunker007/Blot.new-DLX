# DLX Studios Ultimate 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-purple.svg)](https://vitejs.dev/)

> **The Ultimate All-in-One AI Development Platform**

DLX Studios Ultimate is the consolidated powerhouse combining the best features from 8+ DLX repositories into one comprehensive platform. Build, analyze, create, and innovate with multi-LLM routing, Monaco code editor, multimodal AI, mind mapping, and 20+ specialized tools - all in one place.

## ✨ What's New in Ultimate

**DLX Studios Ultimate** consolidates features from:
- ✅ **Blot.new-DLX** - Multi-LLM routing, token management, cost optimization
- ✅ **DLX-3.0** - Monaco code editor, Story Writer, Feature Flags
- ✅ **DLX-Cognitive-Co-Pilot** - Multimodal AI (audio, image, video)
- ✅ **DLX-Ultra** - Mind mapping, Agent Designer, Voice Control
- ✅ **DLX-Ultra-2** - 10+ specialized labs, System Matrix
- ✅ **DLX-Command-Center-LUX-2.0** - Idea Board, Task Management, Crypto Lab

## 🚀 Features

### 🎨 **Development Tools**
- **Monaco Code Editor**: Full IDE experience with AI code generation (12+ languages)
- **AI Command Center**: Multi-LLM routing dashboard with intelligent provider selection
- **Code Workspace**: Real-time code editor with AI assistance
- **Project Management**: Organize and track multiple projects with templates

### 🤖 **Multimodal AI**
- **Audio Transcriber**: Voice-to-text transcription via Gemini
- **Image Analysis**: AI-powered image understanding and description
- **Image Generator**: Text-to-image generation (coming soon)
- **Video Analysis**: Video understanding and frame analysis (coming soon)

### 🧠 **AI Tools**
- **Mind Map**: Enhanced visual brainstorming with WebGL background, voice control, drag & drop nodes, and zoom/pan ✨ **NEW**
- **Feature Flags**: Advanced feature management system with 6 states (active, preview, labs, comingSoon, inactive, disabled) ✨ **NEW**
- **Agent Designer**: Build custom AI agents with visual tools (via Labs Hub - preview)
- **Story Writer**: Automated narrative tracking and timeline visualization (coming soon)

### 📊 **Command Center Features**
- **Idea Lab**: Kanban-style brainstorming system with 4 status columns (New → Discussion → Approved → Archived) ✨ **NEW**
- **Task Management**: AI-powered task execution with Gemini, Intel analysis mode, filtering and search ✨ **NEW**
- **Labs Hub**: Central hub for 11 specialized labs including AURA Interface, Agent Forge, Data Weave, and more ✨ **NEW**
- **Crypto Lab**: Cryptocurrency analysis and portfolio tracking (via Labs Hub - coming soon)
- **Knowledge Base**: Documentation system with search (coming soon)

### 🔧 **Token Management & Cost Optimization**
- **Real-time Token Tracking**: Monitor every API call with detailed analytics
- **Cost Calculator**: Automatic cost estimation for different LLM providers
- **Budget Controls**: Set spending limits with automatic alerts
- **Smart Routing**: Automatically select optimal providers based on cost and performance

### 🌐 **Provider Management**
- **Multi-Provider Support**: LM Studio, Ollama, OpenAI, Anthropic, Gemini
- **Health Monitoring**: Automatic provider health checks and failover
- **Priority Routing**: Configure fallback chains for maximum uptime
- **Cost Tiers**: Categorize models by cost (free, low, medium, high, premium)

## 📦 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/DLX-Studios-Ultimate.git
cd DLX-Studios-Ultimate

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see your app running!

### Production Server (LuxRig Hosting)

```bash
# Build frontend
npm run build

# Start production server (port 3001)
npm start
# or
npm run start:prod
```

Visit `http://localhost:3001` for the full-stack deployment.

### Gemini API Setup (Optional but Recommended)

For AI features (Task Management, AURA Interface, Mind Map voice control):

1. Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Navigate to Settings → Gemini API in the app
3. Enter your API key and save

### Add Your First LLM Provider

1. Install [LM Studio](https://lmstudio.ai/) or [Ollama](https://ollama.ai/)
2. Start the local server (default: `http://localhost:1234` for LM Studio)
3. Go to Settings → Providers → Add Provider
4. Configure your endpoint and test connection

## 🌐 Deployment

DLX Studios can be deployed to multiple platforms. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### One-Click Deploys

**Vercel:**
```bash
npm run deploy:vercel
```

**Netlify:**
```bash
npm run deploy:netlify
```

**Railway:**
```bash
npm run deploy:railway
```

**Docker:**
```bash
npm run docker:build
npm run docker:run
```

### Environment Variables

**No environment variables required!** DLX Studios Ultimate uses local storage by default.

Optional (for enhanced features):
- Gemini API key (set via Settings UI)
- LM Studio endpoint (default: `http://localhost:1234`)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 6
- **Backend**: Node.js + Express (production server)
- **Styling**: Tailwind CSS
- **Storage**: LocalStorage + IndexedDB (no database required!)
- **Icons**: Lucide React
- **AI**: Google Gemini API, LM Studio, Ollama
- **Deployment**: Standalone server, Vercel, Netlify, Railway, Docker

### Project Structure

```
dlx-studios/
├── src/
│   ├── components/      # React components
│   ├── services/        # Business logic
│   ├── lib/            # Utilities and configs
│   └── types/          # TypeScript definitions
├── supabase/
│   └── migrations/     # Database migrations
├── public/             # Static assets
└── dist/              # Production build
```

### Key Services

- **tokenTracking.ts**: Logs and analyzes token usage
- **providerRouter.ts**: Intelligent provider selection
- **environmentDetector.ts**: Detects local vs cloud deployment
- **projectSync.ts**: Handles project export/import
- **llm.ts**: Core LLM communication service

## 📊 Token Analytics

Track and optimize your AI spending with comprehensive analytics:

- **Usage Overview**: Total tokens, cost, requests, and response times
- **Budget Status**: Visual progress bars with alert thresholds
- **Provider Statistics**: Compare performance across providers
- **Top Providers**: Identify your most-used providers

## 🔒 Security

- Row Level Security (RLS) enabled on all database tables
- Secure credential storage
- HTTPS-only in production
- Content Security Policy headers
- XSS and CSRF protection

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run check`
5. Submit a pull request

## 📝 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
npm run check        # Run all checks before deployment
```

### Adding a New Provider

1. Add provider configuration in Settings
2. Create provider config with cost structure
3. Add models for the provider
4. Test connection and verify health

### Database Migrations

Migrations are located in `supabase/migrations/` and follow this naming convention:

```
YYYYMMDDHHMMSS_description.sql
```

## 🎯 Recent Updates

### ✨ Version 2.0 - Consolidation Complete!

All features from 10 repositories have been consolidated into Ultimate:

- ✅ **Feature Flags System** - Toggle features on/off in real-time
- ✅ **Idea Lab** - Kanban board for idea management
- ✅ **Enhanced Mind Map** - WebGL background + voice control
- ✅ **Labs Hub** - 11 specialized AI labs
- ✅ **Task Management** - AI-powered task execution

See [CONSOLIDATION_COMPLETE.md](./CONSOLIDATION_COMPLETE.md) for details.

## 🎯 Roadmap

- [ ] Complete remaining Labs (Agent Forge, Code Review, etc.)
- [ ] Enhanced collaboration features
- [ ] Plugin system for extensibility
- [ ] Mobile app for iOS and Android
- [ ] Integration with GitHub/GitLab
- [ ] Template marketplace

## 📚 Documentation

- **[Consolidation Complete](./CONSOLIDATION_COMPLETE.md)** - Full feature port summary
- **[Migration Guide](./MIGRATION_GUIDE.md)** - How to use new features
- **[Consolidation Plan](./CONSOLIDATION_PLAN.md)** - Original consolidation strategy
- **[Deployment Guide](./LUXRIG_DEPLOYMENT.md)** - LuxRig hosting instructions
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Vite](https://vitejs.dev) - Build tool
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Lucide](https://lucide.dev) - Icons
- [LM Studio](https://lmstudio.ai) - Local LLM provider
- [Ollama](https://ollama.ai) - Local LLM provider

## 📞 Support

- 📧 Email: support@dlxstudios.ai
- 💬 Discord: [Join our community](https://discord.gg/dlxstudios)
- 📖 Docs: [docs.dlxstudios.ai](https://docs.dlxstudios.ai)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/dlx-studios/issues)

---

Built with ❤️ by the DLX Studios team
