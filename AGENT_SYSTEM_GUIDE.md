# 🤖 Agent System Guide

## Overview

The Agent System allows specialized AI agents to be assigned to labs. Agents can "live" in multiple labs when it makes sense, and each lab can have its own set of agents plus an optional global helper bot.

## 🎯 Key Concepts

### 1. **Specialized Agents**
Pre-built agents for specific domains:
- **Crypto Analyst** - Cryptocurrency and market analysis
- **Wealth Advisor** - Personal finance and wealth management
- **DeFi Specialist** - DeFi protocols and yield farming
- **Code Reviewer** - Code analysis and best practices
- **Research Agent** - Information gathering and synthesis
- **Data Analyst** - Data analysis and insights
- **Content Strategist** - Content planning and marketing
- **Creative Director** - Creative concept development
- **Global Helper** - General platform assistance

### 2. **Lab-Agent Assignments**
Agents are automatically assigned to labs based on their purpose:

| Lab | Assigned Agents |
|-----|----------------|
| Crypto Lab | Crypto Analyst, DeFi Specialist |
| Code Review | Code Reviewer |
| Data Weave | Data Analyst, Research Agent |
| Signal Lab | Research Agent |
| Creator Studio | Creative Director, Content Strategist |
| Comms Channel | Content Strategist |
| Dataverse | Research Agent, Data Analyst |
| System Matrix | System Architect |

### 3. **Multi-Lab Agents**
Agents can be assigned to multiple labs when it makes sense:
- **Research Agent** → Signal Lab, Data Weave, Dataverse
- **Content Strategist** → Creator Studio, Comms Channel
- **Data Analyst** → Data Weave, Dataverse

## 🛠️ Using Agents in Labs

### Basic Integration

```tsx
import { agentService } from '../../services/agentService';
import AgentChat from '../../components/labs/AgentChat';
import { Agent } from './types';

const MyLab: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const loadAgents = async () => {
      const labAgents = await agentService.getLabAgentList('my-lab-id');
      setAgents(labAgents);
    };
    loadAgents();
  }, []);

  const hasGlobalHelper = agentService.labUsesGlobalHelper('my-lab-id');

  return (
    <div>
      {/* Your lab content */}
      
      {/* Floating agent chat */}
      {agents.length > 0 && (
        <AgentChat
          agents={hasGlobalHelper ? [...agents, agentService.getGlobalHelperAgent()] : agents}
          defaultAgentId={agents[0]?.id}
          labId="my-lab-id"
        />
      )}
    </div>
  );
};
```

### Agent Chat Component Props

- `agents: Agent[]` - List of agents available in this lab
- `defaultAgentId?: string` - ID of agent to select by default
- `labId: string` - Lab identifier
- `compact?: boolean` - Start minimized (default: false)
- `onAgentSelect?: (agent: Agent) => void` - Callback when agent changes

## 📋 Default Lab Assignments

Default assignments are defined in `agentService.ts`:

```typescript
export const DEFAULT_LAB_AGENTS: Record<string, string[]> = {
  crypto: ['crypto-analyst', 'defi-specialist'],
  review: ['code-reviewer'],
  'data-weave': ['data-analyst', 'researcher'],
  signal: ['researcher'],
  creator: ['creative-director', 'content-strategist'],
  comms: ['content-strategist'],
  dataverse: ['researcher', 'data-analyst'],
  'system-matrix': ['architect'],
};
```

## 🔧 Customizing Assignments

### Add Agent to Lab Programmatically

```typescript
// Assign a custom agent to a lab
agentService.assignAgentToLab('crypto', 'my-custom-agent-id', 'primary');

// Assign specialized agent
agentService.assignAgentToLab('my-lab', 'crypto-analyst', 'assistant');
```

### Remove Agent from Lab

```typescript
agentService.removeAgentFromLab('crypto', 'defi-specialist');
```

### Toggle Global Helper

```typescript
// Enable global helper for a lab
agentService.setGlobalHelper('crypto', true);

// Disable global helper
agentService.setGlobalHelper('crypto', false);
```

## 🎨 Agent Roles

Agents can have different roles:
- **primary** - Main agent for the lab
- **assistant** - Supporting agent
- **specialist** - Domain-specific expert

## 🚀 Creating New Labs with Agents

### Step 1: Create Lab Component

```tsx
import { agentService } from '../../services/agentService';
import AgentChat from '../../components/labs/AgentChat';

const MyNewLab: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const loadAgents = async () => {
      const labAgents = await agentService.getLabAgentList('my-new-lab');
      setAgents(labAgents);
    };
    loadAgents();
  }, []);

  return (
    <div>
      {/* Lab content */}
      {agents.length > 0 && (
        <AgentChat agents={agents} labId="my-new-lab" />
      )}
    </div>
  );
};
```

### Step 2: Add to Labs Router

```tsx
const MyNewLab = lazy(() => import('./MyNewLab'));

// In switch statement:
case 'my-new-lab':
  return <MyNewLab />;
```

### Step 3: Add Default Agent Assignment (Optional)

```typescript
// In agentService.ts
export const DEFAULT_LAB_AGENTS: Record<string, string[]> = {
  // ... existing
  'my-new-lab': ['appropriate-agent-id'],
};
```

## 💡 Best Practices

1. **Use Specialized Agents** - Leverage pre-built agents when possible
2. **Multi-Lab Sharing** - Assign agents to multiple labs when they serve similar purposes
3. **Global Helper** - Enable for labs that might need general assistance
4. **Agent Selection** - Let users choose between agents when multiple are available
5. **Default Agent** - Set a sensible default agent for each lab

## 🔮 Future Enhancements

- Agent-to-agent communication
- Agent collaboration workflows
- Custom agent creation from lab context
- Agent performance analytics
- Agent marketplace

---

**Note:** All agents use Gemini Pro models (gemini-2.0-flash-exp or gemini-2.5-pro) which are "free" since you have Gemini Pro subscription.

