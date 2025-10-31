# Quick Deploy Guide for DLX Studios

## 🚀 Deploy in 5 Minutes

### Option 1: Vercel (Recommended for dlxstudios.ai)

1. **Fork/Clone the repository to your GitHub account**

2. **Go to [vercel.com](https://vercel.com) and import your project**

3. **Configure environment variables:**
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Deploy!** Vercel will automatically build and deploy

**Custom Domain:**
- Go to Settings → Domains
- Add `dlxstudios.ai`
- Follow DNS configuration

### Option 2: Netlify

1. **Connect to [app.netlify.com](https://app.netlify.com)**

2. **Import from GitHub**

3. **Build settings (auto-detected from netlify.toml):**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Add environment variables** in Site settings

5. **Deploy!**

### Option 3: Railway

1. **Go to [railway.app](https://railway.app)**

2. **New Project → Deploy from GitHub**

3. **Add environment variables:**
   ```
   VITE_SUPABASE_URL=your_url_here
   VITE_SUPABASE_ANON_KEY=your_key_here
   ```

4. **Deploy automatically!**

### Option 4: Docker (Self-Hosted)

```bash
# Build the image
docker build -t dlx-studios .

# Run the container
docker run -d -p 8080:80 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  --name dlx-studios \
  dlx-studios
```

Access at `http://localhost:8080`

## 🗄️ Supabase Setup

1. **Create project at [supabase.com](https://supabase.com)**

2. **Get your credentials:**
   - Project URL: `https://your-project.supabase.co`
   - Anon Key: Found in Project Settings → API

3. **Migrations are already configured** - they'll run automatically!

4. **Tables created:**
   - `llm_providers` - Your AI providers (LM Studio, Ollama, etc.)
   - `models` - Available AI models
   - `projects` - Your development projects
   - `conversations` - Chat history
   - `messages` - Individual chat messages
   - `token_usage_logs` - Track every API call
   - `token_budgets` - Spending limits
   - `provider_configs` - Cost and rate limit settings
   - And more!

## ✅ Post-Deployment Checklist

1. **Visit your deployed site**
2. **Go to Settings → Providers**
3. **Add your first LLM provider:**
   - For local development: LM Studio at `http://localhost:1234`
   - For cloud: Add OpenAI, Anthropic, or Gemini with API key
4. **Create a test project**
5. **Start a conversation in Dev Lab**
6. **Check token analytics!**

## 🎉 You're Done!

Your DLX Studios instance is now live and ready to use.

## 🆘 Troubleshooting

**Build fails:**
- Check Node.js version (need 20+)
- Verify environment variables are set

**Can't connect to database:**
- Verify Supabase URL and key
- Check Supabase project is active
- Ensure RLS policies allow access

**LLM providers not working:**
- Local providers: Ensure LM Studio/Ollama is running
- Cloud providers: Verify API keys are correct
- Check provider health in Settings

## 📚 More Info

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment options and advanced configuration.
