/**
 * Agent Service
 * Manages agent assignments to labs and provides specialized agents
 */

import { Agent } from '../modules/labs/types';
import { LocalStorageManager } from '../utils/localStorage';

const STORAGE_KEY = 'dlx-agent-assignments';
const AGENTS_STORAGE_KEY = 'dlx-agents';

export interface AgentAssignment {
  labId: string;
  agentId: string;
  role: 'primary' | 'assistant' | 'specialist';
}

export interface LabAgentConfig {
  labId: string;
  agents: AgentAssignment[];
  useGlobalHelper: boolean;
}

/**
 * Specialized agents for different lab categories
 */
export const SPECIALIZED_AGENTS: Record<string, Partial<Agent>> = {
  // Fintech/Crypto/Wealth Agents
  'crypto-analyst': {
    name: 'Crypto Analyst',
    description: 'Expert in cryptocurrency analysis, market trends, and portfolio optimization',
    corePrompt: `You are a cryptocurrency and financial markets analyst. You provide:
- Real-time market analysis and insights
- Portfolio optimization recommendations
- Risk assessment and management strategies
- Technical and fundamental analysis
- DeFi protocol analysis
- Trading strategy suggestions

Always provide data-driven insights and acknowledge risks. Never provide financial advice without disclaimers.`,
    model: 'gemini-2.5-pro',
    temperature: 0.4,
  },
  'wealth-advisor': {
    name: 'Wealth Advisor',
    description: 'Personal finance and wealth management specialist',
    corePrompt: `You are a wealth management advisor. You help with:
- Financial planning and goal setting
- Investment strategy development
- Risk management and asset allocation
- Tax optimization strategies
- Retirement planning
- Estate planning considerations

Provide professional, ethical advice. Always emphasize diversification and risk management. Include appropriate disclaimers about financial advice.`,
    model: 'gemini-2.5-pro',
    temperature: 0.3,
  },
  'defi-specialist': {
    name: 'DeFi Specialist',
    description: 'Decentralized finance protocols, yield farming, and blockchain economics',
    corePrompt: `You are a DeFi (Decentralized Finance) specialist. You understand:
- Smart contracts and protocol mechanics
- Yield farming strategies and APY calculations
- Liquidity provision and impermanent loss
- Cross-chain bridges and bridges
- Governance tokens and DAOs
- Risk assessment for DeFi protocols

Explain complex DeFi concepts clearly. Always warn about smart contract risks and impermanent loss.`,
    model: 'gemini-2.5-pro',
    temperature: 0.5,
  },

  // Development Agents
  'code-reviewer': {
    name: 'Code Reviewer',
    description: 'Expert code analysis, best practices, and security auditing',
    corePrompt: `You are an expert code reviewer. You analyze code for:
- Code quality and best practices
- Security vulnerabilities
- Performance optimizations
- Design patterns and architecture
- Testing coverage
- Documentation quality

Provide constructive, actionable feedback. Reference specific lines and suggest improvements.`,
    model: 'gemini-2.5-pro',
    temperature: 0.2,
  },
  'architect': {
    name: 'System Architect',
    description: 'Software architecture and system design specialist',
    corePrompt: `You are a software architect. You help with:
- System design and architecture
- Scalability and performance planning
- Technology stack selection
- Microservices vs monolith decisions
- Database design
- API design and documentation

Provide clear architectural diagrams (in text/ASCII) and explain trade-offs.`,
    model: 'gemini-2.5-pro',
    temperature: 0.3,
  },

  // Research Agents
  'researcher': {
    name: 'Research Agent',
    description: 'Information gathering, synthesis, and analysis',
    corePrompt: `You are a research specialist. You:
- Gather and synthesize information from multiple sources
- Analyze data and identify patterns
- Provide comprehensive summaries
- Cite sources when possible
- Distinguish between facts and opinions
- Identify knowledge gaps

Always verify information and acknowledge limitations.`,
    model: 'gemini-2.0-flash-exp',
    temperature: 0.3,
  },
  'data-analyst': {
    name: 'Data Analyst',
    description: 'Data analysis, visualization, and insights',
    corePrompt: `You are a data analyst. You help with:
- Data analysis and interpretation
- Statistical analysis
- Data visualization recommendations
- Pattern recognition
- Predictive modeling insights
- Business intelligence

Explain findings clearly and provide actionable insights. Use data to support conclusions.`,
    model: 'gemini-2.5-pro',
    temperature: 0.3,
  },

  // Creative Agents
  'content-strategist': {
    name: 'Content Strategist',
    description: 'Content creation, marketing, and brand strategy',
    corePrompt: `You are a content strategist. You help with:
- Content planning and calendars
- SEO optimization
- Brand voice and messaging
- Audience targeting
- Content distribution strategies
- Performance metrics and KPIs

Create engaging, strategic content plans aligned with business goals.`,
    model: 'gemini-2.5-pro',
    temperature: 0.8,
  },
  'creative-director': {
    name: 'Creative Director',
    description: 'Creative concept development and visual design guidance',
    corePrompt: `You are a creative director. You provide:
- Creative concept development
- Visual design guidance
- Brand identity development
- Art direction
- Campaign ideation
- Aesthetic consistency

Think outside the box while maintaining brand coherence.`,
    model: 'gemini-2.5-pro',
    temperature: 0.9,
  },

  // Global Helper Bot
  'global-helper': {
    name: 'DLX Helper',
    description: 'General assistant for navigation, help, and quick questions',
    corePrompt: `You are DLX Helper, a friendly assistant for the DLX Studios platform. You help users with:
- Navigating the platform
- Understanding features
- Quick questions and answers
- Finding the right tool for their needs
- General guidance and tips

Be concise, helpful, and friendly. Direct users to specific labs or features when relevant.`,
    model: 'gemini-2.0-flash-exp',
    temperature: 0.7,
  },
};

/**
 * Default lab-agent assignments
 */
export const DEFAULT_LAB_AGENTS: Record<string, string[]> = {
  // Crypto Lab
  crypto: ['crypto-analyst', 'defi-specialist'],
  // Code Review Lab
  review: ['code-reviewer'],
  // Data Weave Lab
  'data-weave': ['data-analyst', 'researcher'],
  // Signal Lab
  signal: ['researcher'],
  // Creator Studio
  creator: ['creative-director', 'content-strategist'],
  // Comms Channel
  comms: ['content-strategist'],
  // Dataverse
  dataverse: ['researcher', 'data-analyst'],
  // System Matrix
  'system-matrix': ['architect'],
};

class AgentService {
  /**
   * Get agent assignments for a lab
   */
  getLabAgents(labId: string): AgentAssignment[] {
    const assignments = LocalStorageManager.get<LabAgentConfig[]>(STORAGE_KEY, []);
    const labConfig = assignments.find((a) => a.labId === labId);
    return labConfig?.agents || [];
  }

  /**
   * Assign an agent to a lab
   */
  assignAgentToLab(labId: string, agentId: string, role: 'primary' | 'assistant' | 'specialist' = 'assistant'): void {
    const assignments = LocalStorageManager.get<LabAgentConfig[]>(STORAGE_KEY, []);
    let labConfig = assignments.find((a) => a.labId === labId);

    if (!labConfig) {
      labConfig = { labId, agents: [], useGlobalHelper: true };
      assignments.push(labConfig);
    }

    // Check if agent already assigned
    const existing = labConfig.agents.find((a) => a.agentId === agentId);
    if (!existing) {
      labConfig.agents.push({ labId, agentId, role });
      LocalStorageManager.set(STORAGE_KEY, assignments);
    }
  }

  /**
   * Remove agent from lab
   */
  removeAgentFromLab(labId: string, agentId: string): void {
    const assignments = LocalStorageManager.get<LabAgentConfig[]>(STORAGE_KEY, []);
    const labConfig = assignments.find((a) => a.labId === labId);
    if (labConfig) {
      labConfig.agents = labConfig.agents.filter((a) => a.agentId !== agentId);
      LocalStorageManager.set(STORAGE_KEY, assignments);
    }
  }

  /**
   * Get all agents assigned to a lab (including specialized)
   */
  async getLabAgentList(labId: string): Promise<Agent[]> {
    const assignments = this.getLabAgents(labId);
    const allAgents = LocalStorageManager.get<Agent[]>(AGENTS_STORAGE_KEY, []);
    const specializedKeys = Object.keys(SPECIALIZED_AGENTS);

    const labAgents: Agent[] = [];

    // Add assigned custom agents
    for (const assignment of assignments) {
      const agent = allAgents.find((a) => a.id === assignment.agentId);
      if (agent) {
        labAgents.push({ ...agent, ...assignment });
      }
    }

    // Add specialized agents if they match default assignments
    const defaultAgents = DEFAULT_LAB_AGENTS[labId] || [];
    for (const specializedKey of defaultAgents) {
      if (specializedKeys.includes(specializedKey)) {
        const specialized = SPECIALIZED_AGENTS[specializedKey];
        const agent: Agent = {
          id: specializedKey,
          name: specialized.name!,
          description: specialized.description!,
          corePrompt: specialized.corePrompt!,
          model: specialized.model as Agent['model'],
          temperature: specialized.temperature!,
          tools: [],
        };
        labAgents.push(agent);
      }
    }

    return labAgents;
  }

  /**
   * Check if lab uses global helper
   */
  labUsesGlobalHelper(labId: string): boolean {
    const assignments = LocalStorageManager.get<LabAgentConfig[]>(STORAGE_KEY, []);
    const labConfig = assignments.find((a) => a.labId === labId);
    return labConfig?.useGlobalHelper !== false; // Default to true
  }

  /**
   * Toggle global helper for lab
   */
  setGlobalHelper(labId: string, enabled: boolean): void {
    const assignments = LocalStorageManager.get<LabAgentConfig[]>(STORAGE_KEY, []);
    let labConfig = assignments.find((a) => a.labId === labId);

    if (!labConfig) {
      labConfig = { labId, agents: [], useGlobalHelper: enabled };
      assignments.push(labConfig);
    } else {
      labConfig.useGlobalHelper = enabled;
    }

    LocalStorageManager.set(STORAGE_KEY, assignments);
  }

  /**
   * Get global helper agent
   */
  getGlobalHelperAgent(): Agent {
    const specialized = SPECIALIZED_AGENTS['global-helper'];
    return {
      id: 'global-helper',
      name: specialized.name!,
      description: specialized.description!,
      corePrompt: specialized.corePrompt!,
      model: specialized.model as Agent['model'],
      temperature: specialized.temperature!,
      tools: [],
    };
  }

  /**
   * Get labs that use an agent
   */
  getAgentLabs(agentId: string): string[] {
    const assignments = LocalStorageManager.get<LabAgentConfig[]>(STORAGE_KEY, []);
    const labs: string[] = [];

    for (const config of assignments) {
      if (config.agents.some((a) => a.agentId === agentId)) {
        labs.push(config.labId);
      }
    }

    // Check default assignments
    for (const [labId, agentIds] of Object.entries(DEFAULT_LAB_AGENTS)) {
      if (agentIds.includes(agentId)) {
        if (!labs.includes(labId)) {
          labs.push(labId);
        }
      }
    }

    return labs;
  }

  /**
   * Initialize default specialized agents
   */
  initializeSpecializedAgents(): void {
    const allAgents = LocalStorageManager.get<Agent[]>(AGENTS_STORAGE_KEY, []);
    const specializedKeys = Object.keys(SPECIALIZED_AGENTS);
    let updated = false;

    for (const key of specializedKeys) {
      const existing = allAgents.find((a) => a.id === key);
      if (!existing) {
        const specialized = SPECIALIZED_AGENTS[key];
        const agent: Agent = {
          id: key,
          name: specialized.name!,
          description: specialized.description!,
          corePrompt: specialized.corePrompt!,
          model: specialized.model as Agent['model'],
          temperature: specialized.temperature!,
          tools: [],
        };
        allAgents.push(agent);
        updated = true;
      }
    }

    if (updated) {
      LocalStorageManager.set(AGENTS_STORAGE_KEY, allAgents);
    }
  }
}

export const agentService = new AgentService();

// Initialize specialized agents on import
agentService.initializeSpecializedAgents();

