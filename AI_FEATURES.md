# AI-Powered Features Guide

This document describes the advanced AI features implemented in DLX Studios, designed to optimize your development workflow with intelligent model management, recommendations, and orchestration.

## Live Model Discovery & Management

### Automatic Model Detection
The system now queries your LM Studio (and other providers) to discover available models in real-time.

**Features:**
- **Live Model Query**: Click the lightning bolt icon (⚡) next to any active provider to discover available models
- **Model Metadata**: See context window sizes, quantization levels, loaded status, and architecture details
- **One-Click Import**: Add models individually or bulk import all discovered models at once
- **Smart Defaults**: Auto-populate display names and infer use cases based on model characteristics

**How to Use:**
1. Navigate to Settings > Providers & Models
2. Ensure your provider (LM Studio, Ollama) is active
3. Click the lightning bolt icon to discover models
4. Select models to add individually or click "Import All Models"

### Model Status Indicators
- 🟢 **Loaded**: Model is currently loaded in the provider and ready to use
- ⚪ **Available**: Model exists but is not currently loaded
- 🔴 **Offline**: Model cannot be reached or has been removed

## AI-Powered Model Recommendations

The system analyzes your usage patterns and requirements to suggest the best models for your tasks.

### Recommendation Engine
Located in **Settings > AI Recommendations**, this feature provides:

**Intelligent Scoring System:**
- Analyzes model performance history
- Considers use case alignment (coding, analysis, creative, general)
- Factors in response times and success rates
- Prioritizes local models when "Prefer Local" is enabled
- Evaluates context window requirements

**Customization Options:**
- Filter by use case (coding, analysis, creative, general)
- Toggle local preference for cost-free operations
- Real-time refresh to get latest recommendations

**Recommendation Factors:**
- ✅ Success rate from historical usage
- ⚡ Average response time
- 🎯 Use case optimization
- 💰 Cost efficiency (local vs cloud)
- 📊 Popularity among your projects
- 🧠 Context window capacity

## Model Performance Dashboard

Track real-time analytics and insights for all your models.

### Performance Metrics
Located in **Settings > Performance**, view:

**Per-Model Analytics:**
- **Success Rate**: Percentage of successful requests (color-coded: green >95%, yellow >80%, red <80%)
- **Average Response Time**: How fast the model responds to requests
- **Average Tokens**: Typical token usage per request
- **Total Cost**: Cumulative cost (shows "Free" for local models)
- **Performance Score**: Composite score combining success rate and speed

**Time Period Filtering:**
- Last 7 days
- Last 30 days
- All time

**Visual Indicators:**
- 🏆 Award icon for models with >95% success rate
- Color-coded metrics for quick health assessment
- Performance trend bars

## Smart Context Management

Automatically optimize conversation context to fit within model token limits.

### Context Optimization Strategies

**Sliding Window:**
- Keeps the most recent messages
- Ideal for conversations with >20 messages
- Maintains conversation flow

**Selective Retention:**
- Preserves important messages (containing keywords like "error", "bug", "architecture")
- Keeps recent messages for continuity
- Used for conversations with 10-20 messages

**Truncation:**
- Used for shorter conversations
- Intelligently truncates long messages when needed
- Always preserves the most recent context

### Context Statistics
The system tracks:
- Total message count
- Token usage
- Context window utilization (%)
- Message breakdown (system/user/assistant)
- Optimization recommendations

### Auto-Compression
When context reaches 80% of the model's limit, the system:
1. Alerts you with a warning
2. Suggests optimization strategies
3. Can automatically compress context while preserving important information
4. Maintains conversation coherence

## Multi-Model Orchestration

Intelligently route requests to the best model based on task complexity and requirements.

### Task Complexity Analysis

The system automatically analyzes your prompts to determine complexity:

**Complexity Levels:**
- **Simple** (0-25%): Basic questions, quick fixes, formatting
- **Moderate** (25-50%): Standard development tasks, explanations
- **Complex** (50-75%): Architecture decisions, refactoring, advanced features
- **Expert** (75-100%): System design, complex algorithms, production optimizations

**Analysis Factors:**
- Message length
- Technical keywords (complex vs simple)
- Code block presence
- Implementation requirements
- Question complexity

### Automatic Model Selection

Based on complexity, the system selects:

**Simple Tasks:**
- Fast, lightweight models
- Lower context windows acceptable
- Optimized for speed

**Moderate Tasks:**
- Coding-specialized models
- Medium context windows (8K+)
- Balance of speed and capability

**Complex Tasks:**
- High-capacity models
- Large context windows (16K+)
- Optimized for accuracy

**Expert Tasks:**
- Most powerful available models
- Maximum context windows (32K+)
- Multiple fallback options

### Fallback Strategies

The orchestrator provides:
- **Primary Model**: Best match for the task
- **Fallback Model**: Backup if primary fails
- **Alternative Model**: Different approach option

If the primary model fails, the system automatically tries the fallback, ensuring high availability.

### Parallel Querying

For critical tasks, query multiple models simultaneously and:
- Compare responses
- Select the best answer based on quality scoring
- Leverage different model strengths
- Increase confidence in results

## AI Assistant Panel

Real-time intelligent suggestions and warnings.

### Smart Suggestions

**Types of Suggestions:**
1. **Optimizations**: Improve performance and efficiency
2. **Warnings**: Prevent issues before they happen
3. **Tips**: Best practices and helpful hints
4. **Insights**: Task complexity and model recommendations

**Contextual Awareness:**
- Monitors conversation length
- Tracks context window usage
- Detects code-heavy discussions
- Identifies task complexity changes

**Priority Levels:**
- 🔴 High: Immediate attention required
- 🟡 Medium: Should address soon
- 🟢 Low: Informational

### Real-Time Monitoring

The AI Assistant continuously monitors:
- Context window utilization
- Task complexity evolution
- Model performance
- Conversation health

## Advanced Features

### Model Discovery Service

**API Endpoints Supported:**
- LM Studio: `http://localhost:1234/v1/models`
- Ollama: `http://localhost:11434/v1/models`
- OpenAI-compatible endpoints
- Custom provider endpoints

**Response Parsing:**
- Extracts model IDs, names, and metadata
- Detects quantization types
- Identifies model architectures
- Determines load status

**Caching:**
- 30-second cache for discovered models
- Reduces API calls
- Improves performance
- Automatic refresh capability

### Model Insights

For each model, track:
- Total usage count
- Success rate percentage
- Average response time
- Average tokens per request
- Total cost accumulated
- Last usage timestamp

### Bulk Operations

**Bulk Import:**
- Import all discovered models at once
- Skip existing models automatically
- Track import success/failure
- Detailed results reporting

**Bulk Sync:**
- Sync model availability across all providers
- Update database with current status
- Detect removed models
- Mark unavailable models

## Best Practices

### For Optimal Performance

1. **Keep Providers Active**: Regularly test provider connections
2. **Monitor Performance**: Check the Performance Dashboard weekly
3. **Update Models**: Sync model availability after provider updates
4. **Use Recommendations**: Let the AI suggest models for your use cases
5. **Watch Context**: Monitor context usage to avoid truncation

### For Cost Optimization

1. **Prefer Local Models**: Enable "Prefer Local" in recommendations
2. **Right-Size Models**: Use task complexity to match appropriate models
3. **Track Costs**: Monitor the Performance Dashboard for cost insights
4. **Optimize Context**: Keep conversations focused to reduce token usage

### For Best Results

1. **Use Specialized Models**: Match model use case to your task
2. **Leverage Orchestration**: Let the system select optimal models
3. **Monitor Success Rates**: Switch models if success rate drops
4. **Provide Context**: Clear, detailed prompts improve all metrics

## Troubleshooting

### Model Discovery Issues

**Problem**: No models discovered
- **Solution**: Verify provider is running and endpoint is correct
- **Check**: Test connection using the refresh icon

**Problem**: Models shown as "Not Loaded"
- **Solution**: Load models in LM Studio/Ollama
- **Note**: Models can still be added but won't be immediately usable

### Performance Issues

**Problem**: Slow response times
- **Solution**: Check Performance Dashboard for model speed metrics
- **Action**: Switch to faster models for simple tasks

**Problem**: Low success rates
- **Solution**: Review error logs in Token Analytics
- **Action**: Update provider configuration or try different models

### Context Issues

**Problem**: Context window full warnings
- **Solution**: Use context optimization features
- **Action**: Start a new focused conversation

**Problem**: Important information lost
- **Solution**: Use selective retention strategy
- **Action**: Summarize key points before optimization

## API Reference

### Model Discovery Service

```typescript
// Discover models from a provider
const result = await modelDiscoveryService.discoverModels(provider);

// Get model recommendations
const recommendations = await modelDiscoveryService.getModelRecommendations(
  'coding',  // use case
  true       // prefer local
);

// Bulk import models
const importResult = await modelDiscoveryService.bulkImportModels(
  providerId,
  discoveredModels
);

// Get model insights
const insights = await modelDiscoveryService.getModelInsights(modelId);
```

### Multi-Model Orchestrator

```typescript
// Analyze task complexity
const complexity = await multiModelOrchestrator.analyzeTaskComplexity(userMessage);

// Select optimal strategy
const strategy = await multiModelOrchestrator.selectOptimalStrategy(
  messages,
  complexity
);

// Send with automatic fallback
const response = await multiModelOrchestrator.sendWithStrategy(
  messages,
  strategy,
  onStream
);

// Parallel query multiple models
const responses = await multiModelOrchestrator.parallelQuery(
  messages,
  modelIds
);
```

### Context Manager

```typescript
// Estimate tokens
const tokens = contextManager.estimateTokens(text);

// Optimize context
const result = contextManager.optimizeContext(
  messages,
  maxTokens,
  preserveSystemMessages
);

// Get context statistics
const stats = contextManager.getContextStats(messages, maxTokens);

// Summarize conversation
const summary = contextManager.summarizeConversation(messages);
```

## Future Enhancements

Planned features include:
- Model fine-tuning recommendations
- Automatic model rotation based on performance
- Cost prediction and budgeting tools
- A/B testing framework for models
- Collaborative filtering for model suggestions
- Advanced caching strategies
- Real-time model load prediction
- Automatic model updates and migrations

---

**Built with ❤️ by DLX Studios**

For support or feature requests, please open an issue on the repository.
