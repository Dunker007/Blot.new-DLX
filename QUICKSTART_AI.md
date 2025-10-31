# AI Features Quick Start Guide

Get up and running with DLX Studios' AI-powered features in 5 minutes.

## Step 1: Set Up Your Provider (1 minute)

1. Start LM Studio and load at least one model
2. Enable the local server in LM Studio (usually runs on `http://localhost:1234`)
3. In DLX Studios, go to **Settings > Providers & Models**
4. Click **Add Provider** if LM Studio isn't already added
5. Test the connection using the refresh icon (🔄)

## Step 2: Discover Models (30 seconds)

1. Find your active LM Studio provider
2. Click the lightning bolt icon (⚡) next to it
3. Browse discovered models with their details:
   - Context window sizes
   - Quantization levels
   - Load status (Loaded/Not Loaded)
   - Architecture information

## Step 3: Import Models (30 seconds)

Choose one of two methods:

### Quick Method: Bulk Import
- Click the download icon (⬇️) next to your provider
- Confirm the bulk import
- All available models are added instantly

### Selective Method: Choose Specific Models
- Click the lightning bolt (⚡) to open the model picker
- Click "Add Model" on each model you want
- Close the picker when done

## Step 4: Get AI Recommendations (1 minute)

1. Navigate to **Settings > AI Recommendations**
2. Select your use case:
   - **General**: Everyday tasks
   - **Coding**: Development work
   - **Analysis**: Data and research
   - **Creative**: Content generation
3. Toggle **Prefer Local** if you want free, local-only models
4. Review recommendations sorted by match score
5. Click on any recommendation to see why it was selected

## Step 5: View Performance Metrics (1 minute)

1. Go to **Settings > Performance**
2. See real-time analytics for all your models:
   - Success rates
   - Response times
   - Token usage
   - Costs (local models show "Free")
3. Switch time periods (7d, 30d, all time) to see trends
4. Models with 🏆 have excellent performance (>95% success rate)

## Step 6: Start Using AI Features (1 minute)

Now you're ready to leverage the intelligent features:

### Automatic Model Selection
The system will automatically:
- Analyze your prompt complexity
- Select the best model for the task
- Use fallback models if needed
- Optimize context window usage

### Monitor Context Health
Watch for suggestions like:
- "Context Window Nearly Full" → Time to optimize
- "Complex Task Detected" → Using powerful model
- "Code-Heavy Conversation" → Switched to coding model

### Track Performance
Check the Performance Dashboard regularly to:
- See which models work best
- Identify slow or failing models
- Monitor costs and usage
- Make informed decisions

## Pro Tips

### Maximize Local Performance
1. Keep frequently-used models loaded in LM Studio
2. Use quantized models (Q4, Q5) for faster responses
3. Enable "Prefer Local" in recommendations

### Optimize for Quality
1. Let complex tasks use high-capacity models (32K+ context)
2. Monitor success rates and switch models if <90%
3. Use specialized models for specific use cases

### Reduce Costs
1. Use local models whenever possible (shows as "Free")
2. Monitor token usage in Performance Dashboard
3. Optimize context to reduce token consumption
4. Start fresh conversations instead of very long ones

### Best Practices
1. **Test connections regularly** - Providers can go offline
2. **Sync model availability** - After loading/unloading models
3. **Review recommendations** - AI learns from your usage patterns
4. **Monitor performance** - Catch issues before they impact work
5. **Optimize context** - Keep conversations focused and efficient

## Common Tasks

### Add a New Model
```
Settings → Providers & Models → ⚡ (Lightning) → Add Model
```

### Check Model Performance
```
Settings → Performance → View metrics for each model
```

### Get Model Recommendations
```
Settings → AI Recommendations → Select use case → Review suggestions
```

### Import All Models at Once
```
Settings → Providers & Models → ⬇️ (Download) → Confirm
```

### Test Provider Connection
```
Settings → Providers & Models → 🔄 (Refresh) → See result
```

### View Context Usage
```
AI Assistant Panel → Context Usage → See token utilization
```

## Troubleshooting Quick Fixes

### "No models discovered"
- **Fix**: Ensure LM Studio server is running
- **Check**: Verify endpoint URL is correct (usually `http://localhost:1234`)

### "Connection failed"
- **Fix**: Test connection and check LM Studio is running
- **Try**: Restart LM Studio server

### "Model not responding"
- **Fix**: Check if model is loaded in LM Studio
- **Action**: Load model or select a different one

### "Context window full"
- **Fix**: Click "Optimize context" in AI Assistant
- **Alternative**: Start a new conversation

### "Low success rate"
- **Fix**: Switch to a different model
- **Check**: Performance Dashboard for better options

## What's Next?

### Explore Advanced Features
- **Multi-model orchestration**: Let AI manage model selection
- **Parallel querying**: Compare responses from multiple models
- **Context optimization**: Automatic compression and summarization
- **Performance tracking**: Historical analytics and trends

### Customize Your Experience
- Set preferred models for different use cases
- Configure fallback strategies
- Adjust context optimization thresholds
- Create custom model collections

### Monitor and Optimize
- Weekly review of Performance Dashboard
- Adjust model selection based on metrics
- Optimize costs by preferring local models
- Track usage patterns and trends

## Need Help?

- 📚 Full documentation: `AI_FEATURES.md`
- 🐛 Issues: Open an issue on the repository
- 💡 Feature requests: We're always improving!

---

**You're all set!** 🚀

Start using your AI-powered workspace and let the intelligent features optimize your development workflow.
