# DLX Studios - Deployment Guide

This guide covers deploying DLX Studios to various hosting platforms for permanent, production-ready hosting.

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- Supabase account with database configured
- Git repository (GitHub, GitLab, or Bitbucket)

## Environment Variables

All deployment platforms require these environment variables:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment Options

### 1. Vercel (Recommended for dlxstudios.ai)

**Quick Deploy:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Custom Domain Setup:**
1. Go to Vercel dashboard → Settings → Domains
2. Add `dlxstudios.ai` and `www.dlxstudios.ai`
3. Configure DNS records as shown
4. Enable automatic HTTPS

**Environment Variables:**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

**Continuous Deployment:**
- Push to `main` branch automatically deploys
- Preview deployments for all pull requests
- Uses `vercel.json` configuration

### 2. Netlify

**Quick Deploy:**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

**One-Click Deploy:**
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

**Configuration:**
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 20

**Environment Variables:**
Add in Netlify dashboard → Site settings → Environment variables

### 3. Railway

**Quick Deploy:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**From GitHub:**
1. Connect Railway to your GitHub repository
2. Select the DLX Studios repository
3. Add environment variables in Railway dashboard
4. Deploy automatically on push

**Custom Domain:**
- Go to Settings → Domains
- Add your custom domain
- Configure DNS records

### 4. Docker + Any Platform

**Build Docker Image:**
```bash
docker build -t dlx-studios .
docker run -p 8080:80 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  dlx-studios
```

**Deploy to:**
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Apps
- DigitalOcean App Platform
- Fly.io

**Example for Fly.io:**
```bash
fly launch
fly secrets set VITE_SUPABASE_URL=your_url
fly secrets set VITE_SUPABASE_ANON_KEY=your_key
fly deploy
```

### 5. GitHub Pages

**Setup:**
```bash
npm run build
npm install -g gh-pages
gh-pages -d dist
```

**Or use GitHub Actions:**
- Uses `.github/workflows/deploy.yml`
- Automatically deploys on push to main
- Requires GitHub Pages enabled in repository settings

### 6. Self-Hosted (VPS/Dedicated Server)

**Using Docker:**
```bash
# Clone repository
git clone https://github.com/yourusername/dlx-studios.git
cd dlx-studios

# Build and run
docker-compose up -d
```

**Using Nginx directly:**
```bash
# Build application
npm install
npm run build

# Copy to web root
sudo cp -r dist/* /var/www/html/

# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/dlxstudios.ai
sudo ln -s /etc/nginx/sites-available/dlxstudios.ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Database Setup

### Supabase Configuration

1. **Apply Migrations:**
```bash
# Migrations are in supabase/migrations/
# Apply via Supabase dashboard or CLI
```

2. **Set Row Level Security:**
All tables have RLS enabled. For production with auth:
- Update policies to use `auth.uid()`
- Remove public access policies
- Add user-specific policies

3. **API Keys:**
- Use the ANON key for client-side
- Never expose SERVICE_ROLE key in frontend
- Store keys in environment variables

## Post-Deployment Checklist

- [ ] Custom domain configured and SSL enabled
- [ ] Environment variables set correctly
- [ ] Supabase database migrations applied
- [ ] Health check endpoint responding (`/health`)
- [ ] All static assets loading with proper caching
- [ ] Settings page → Providers tab → Add LLM providers
- [ ] Settings page → Environment tab → Verify mode detection
- [ ] Create test project and conversation
- [ ] Verify token tracking in Analytics tab

## Monitoring and Maintenance

### Health Checks

The application exposes a health endpoint at `/health` that returns:
```
healthy
```

### Logs

**Vercel:**
```bash
vercel logs
```

**Netlify:**
```bash
netlify logs
```

**Railway:**
```bash
railway logs
```

### Analytics

Configure analytics in your hosting dashboard:
- Vercel Analytics (built-in)
- Netlify Analytics
- Custom analytics via environment variables

## Troubleshooting

### Build Fails

1. Check Node.js version (must be 20+)
2. Clear cache: `rm -rf node_modules package-lock.json && npm install`
3. Verify environment variables are set
4. Check build logs for specific errors

### Runtime Errors

1. Open browser console
2. Check Network tab for failed requests
3. Verify Supabase URL and key are correct
4. Check CORS settings in Supabase dashboard

### Database Connection Issues

1. Verify Supabase project is active
2. Check API keys are correct
3. Ensure RLS policies allow access
4. Test connection in Settings → Providers tab

## Updating Production

### Rolling Updates

```bash
git push origin main
# Automatic deployment via CI/CD
```

### Manual Deployment

```bash
npm run build
vercel --prod
# or
netlify deploy --prod
# or
railway up
```

### Database Migrations

```bash
# Create new migration
# Add SQL file to supabase/migrations/
# Apply via Supabase dashboard or CLI
```

## Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` files
   - Use platform secret management
   - Rotate keys regularly

2. **HTTPS:**
   - Always use HTTPS in production
   - Enable HSTS headers
   - Configure CSP headers

3. **Dependencies:**
   - Run `npm audit` regularly
   - Update dependencies monthly
   - Use Dependabot or similar

4. **Access Control:**
   - Implement authentication before public launch
   - Enable Supabase Auth
   - Update RLS policies for production

## Cost Optimization

### Free Tier Recommendations

- **Vercel:** Free for personal projects, good bandwidth
- **Netlify:** Free tier includes 100GB bandwidth
- **Railway:** $5/month starter plan recommended
- **Supabase:** Free tier up to 500MB database

### Scaling Considerations

- Enable caching headers (already configured)
- Use CDN for static assets
- Implement code splitting (Vite handles this)
- Monitor token usage in Analytics dashboard

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Test locally with production build: `npm run build && npm run preview`
4. Contact platform support with error details

## Backup Strategy

### Automatic Backups

- Supabase: Daily automatic backups (Pro plan)
- Export projects via Settings → Environment → Export Data

### Manual Backups

```bash
# Export all data
# Use Project Export feature in UI
# Store backups in secure location
```

## Next Steps

After successful deployment:

1. Configure custom domain
2. Set up monitoring and alerts
3. Enable authentication (optional)
4. Add your LLM provider API keys
5. Test token tracking and analytics
6. Share with users!
