# DLX Studios

[![CI](https://github.com/Dunker007/Blot.new-DLX/actions/workflows/ci.yml/badge.svg)](https://github.com/Dunker007/Blot.new-DLX/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Dunker007/Blot.new-DLX/branch/main/graph/badge.svg)](https://codecov.io/gh/Dunker007/Blot.new-DLX)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> AI-Powered Web Development Platform with Intelligent Token Management

DLX Studios is a comprehensive development environment that combines the power of AI-assisted coding with intelligent token tracking, cost optimization, and hybrid cloud architecture. Build projects faster with local or cloud LLM providers while maintaining full control over your AI spending.

## 🚀 Features

### Core Platform
- **Development Lab**: Chat-based AI interface for planning and building projects
- **Code Workspace**: Real-time code editor with AI assistance
- **Project Management**: Organize and track multiple projects with templates
- **Trading Bots**: Build and test cryptocurrency trading strategies

### Token Management & Cost Optimization
- **Real-time Token Tracking**: Monitor every API call with detailed analytics
- **Cost Calculator**: Automatic cost estimation for different LLM providers
- **Budget Controls**: Set spending limits with automatic alerts
- **Smart Routing**: Automatically select optimal providers based on cost and performance

### Hybrid Architecture (DIY + Cloud)
- **Local Mode**: Run completely offline with LM Studio or Ollama
- **Cloud Mode**: Access dlxstudios.ai with managed infrastructure
- **Hybrid Mode**: Best of both worlds with intelligent provider fallback

### Provider Management
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
