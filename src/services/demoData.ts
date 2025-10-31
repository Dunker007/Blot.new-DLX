import { Project, LLMProvider, Model, Conversation, Message } from '../types';

// Demo data for when Supabase is not configured
export const demoProjects: Project[] = [
  {
    id: 'demo-1',
    user_id: 'demo-user',
    name: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with React and Node.js',
    project_type: 'saas',
    tech_stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe'],
    status: 'in_progress',
    repository_url: 'https://github.com/demo/ecommerce',
    deployment_url: 'https://demo-ecommerce.vercel.app',
    settings: {},
    metadata: {},
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    user_id: 'demo-user',
    name: 'Portfolio Website',
    description: 'Personal portfolio with blog and project showcase',
    project_type: 'landing_page',
    tech_stack: ['React', 'Tailwind CSS', 'Vite'],
    status: 'deployed',
    deployment_url: 'https://demo-portfolio.netlify.app',
    settings: {},
    metadata: {},
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    user_id: 'demo-user',
    name: 'Trading Bot',
    description: 'Cryptocurrency trading bot with ML predictions',
    project_type: 'trading_bot',
    tech_stack: ['Python', 'TensorFlow', 'FastAPI', 'Redis'],
    status: 'planning',
    settings: {},
    metadata: {},
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const demoProviders: LLMProvider[] = [
  {
    id: 'demo-provider-1',
    user_id: 'demo-user',
    name: 'lm_studio',
    endpoint_url: 'http://localhost:1234/v1',
    is_active: true,
    priority: 1,
    config: { timeout: 30000 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-provider-2',
    user_id: 'demo-user',
    name: 'ollama',
    endpoint_url: 'http://localhost:11434/api',
    is_active: true,
    priority: 2,
    config: { timeout: 30000 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const demoModels: Model[] = [
  {
    id: 'demo-model-1',
    provider_id: 'demo-provider-1',
    model_name: 'codellama-7b',
    display_name: 'CodeLlama 7B',
    context_window: 4096,
    use_case: 'coding',
    is_available: true,
    performance_metrics: {
      tokens_per_second: 45,
      avg_response_time: 1200,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-model-2',
    provider_id: 'demo-provider-2',
    model_name: 'llama2',
    display_name: 'Llama 2 13B',
    context_window: 4096,
    use_case: 'general',
    is_available: true,
    performance_metrics: {
      tokens_per_second: 32,
      avg_response_time: 1800,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const demoConversations: Conversation[] = [
  {
    id: 'demo-conv-1',
    project_id: 'demo-1',
    user_id: 'demo-user',
    title: 'E-Commerce Architecture Discussion',
    context: { topic: 'architecture', tags: ['backend', 'database'] },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const demoMessages: Message[] = [
  {
    id: 'demo-msg-1',
    conversation_id: 'demo-conv-1',
    role: 'user',
    content: 'Help me design the database schema for the e-commerce platform',
    metadata: {},
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-msg-2',
    conversation_id: 'demo-conv-1',
    role: 'assistant',
    content: 'I\'ll help you design a robust database schema. Here are the key tables you\'ll need:\n\n1. **Users** - Customer accounts\n2. **Products** - Product catalog\n3. **Orders** - Order management\n4. **OrderItems** - Order line items\n5. **Cart** - Shopping cart\n6. **Payments** - Payment transactions\n\nWould you like me to detail the schema for each table?',
    metadata: {
      model: 'codellama-7b',
      tokens: 156,
    },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5000).toISOString(),
  },
];

// Demo stats for dashboard
export const demoStats = {
  totalProjects: 3,
  activeProjects: 1,
  deployedProjects: 1,
  conversations: 1,
  totalTokens: 125000,
  totalCost: 0.0, // Free with local models
  totalRequests: 47,
  avgResponseTime: 1450,
};

// Helper to check if we should use demo data
export const shouldUseDemoData = (isDemoMode: boolean) => isDemoMode;

