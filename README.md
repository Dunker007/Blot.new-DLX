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
- **Mind Map**: Visual brainstorming and idea organization
- **Agent Designer**: Build custom AI agents with visual tools (coming soon)
- **Story Writer**: Automated narrative tracking and timeline visualization (coming soon)
- **Feature Flags**: Advanced feature management and A/B testing (coming soon)

### 📊 **Command Center Features**
- **Idea Board**: Kanban-style brainstorming system (coming soon)
- **Task Management**: Project tracking with priorities and deadlines (coming soon)
- **Crypto Lab**: Cryptocurrency analysis and portfolio tracking (coming soon)
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
git clone https://github.com/yourusername/dlx-studios.git
cd dlx-studios

# Install dependencies
npm install

# Set up environment variables (interactive setup)
npm run setup

# Or manually copy and edit
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see your app running!

### Database Setup

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key to `.env`
4. Migrations will be applied automatically on first run

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

Required for all deployments:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: Vercel, Netlify, Railway, Docker

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

## 🎯 Roadmap

- [ ] User authentication with Supabase Auth
- [ ] Team collaboration features
- [ ] Advanced code generation with context awareness
- [ ] Plugin system for extensibility
- [ ] Mobile app for iOS and Android
- [ ] Self-hosted version with docker-compose
- [ ] Integration with GitHub/GitLab
- [ ] Template marketplace

## 📚 Documentation

- **[API Documentation](./docs/API.md)** - Detailed API reference for all services
- **[Architecture Guide](./docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project

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
