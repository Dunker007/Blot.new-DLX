import { useState, useEffect } from 'react';
import {
  Zap,
  Brain,
  Code,
  Sparkles,
  Rocket,
  Smartphone,
  Database,
  Cpu,
  ExternalLink,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { multiModelOrchestratorService } from '../services/multiModelOrchestrator';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: 'saas' | 'defi' | 'nft' | 'ecommerce' | 'api' | 'mobile';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToCode: string;
  techStack: string[];
  revenueModel: string;
  marketSize: string;
  icon: React.ReactNode;
  gradient: string;
  features: string[];
}

interface GeneratedProject {
  id: string;
  name: string;
  description: string;
  codeGenerated: boolean;
  deploymentReady: boolean;
  revenue24h: number;
  status: 'generating' | 'ready' | 'deployed' | 'earning';
  progress: number;
}

export default function AIMagicDevLab() {
  const [, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [generatedProjects, setGeneratedProjects] = useState<GeneratedProject[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');

  const projectTemplates: ProjectTemplate[] = [
    {
      id: 'ai-saas',
      name: 'AI SaaS Platform',
      description: 'GPT-powered SaaS with subscription billing',
      type: 'saas',
      difficulty: 'intermediate',
      timeToCode: '15 minutes',
      techStack: ['React', 'Node.js', 'OpenAI', 'Stripe'],
      revenueModel: '$97/month subscriptions',
      marketSize: '$8.2B AI market',
      icon: <Brain className="w-8 h-8" />,
      gradient: 'from-purple-500 to-pink-500',
      features: ['AI Chat Interface', 'User Authentication', 'Subscription Billing', 'API Integration']
    },
    {
      id: 'defi-dashboard',
      name: 'DeFi Analytics Dashboard',
      description: 'Portfolio tracker with yield farming insights',
      type: 'defi',
      difficulty: 'advanced',
      timeToCode: '20 minutes',
      techStack: ['React', 'Web3.js', 'The Graph', 'TailwindCSS'],
      revenueModel: 'Premium features $47/month',
      marketSize: '$200B DeFi TVL',
      icon: <TrendingUp className="w-8 h-8" />,
      gradient: 'from-green-500 to-emerald-500',
      features: ['Wallet Connection', 'Real-time Data', 'Yield Tracking', 'Portfolio Analytics']
    },
    {
      id: 'nft-marketplace',
      name: 'NFT Marketplace',
      description: 'Mint, trade, and showcase NFT collections',
      type: 'nft',
      difficulty: 'advanced',
      timeToCode: '25 minutes',
      techStack: ['Next.js', 'Solidity', 'IPFS', 'Moralis'],
      revenueModel: '2.5% transaction fees',
      marketSize: '$15B NFT market',
      icon: <Sparkles className="w-8 h-8" />,
      gradient: 'from-pink-500 to-violet-500',
      features: ['NFT Minting', 'Marketplace', 'Wallet Integration', 'IPFS Storage']
    },
    {
      id: 'ai-ecommerce',
      name: 'AI-Powered E-commerce',
      description: 'Smart product recommendations and inventory',
      type: 'ecommerce',
      difficulty: 'intermediate',
      timeToCode: '18 minutes',
      techStack: ['React', 'Shopify API', 'OpenAI', 'Stripe'],
      revenueModel: '3% transaction fees',
      marketSize: '$5.7T e-commerce',
      icon: <Smartphone className="w-8 h-8" />,
      gradient: 'from-blue-500 to-cyan-500',
      features: ['AI Recommendations', 'Inventory Management', 'Payment Processing', 'Analytics']
    },
    {
      id: 'api-service',
      name: 'AI API Service',
      description: 'White-label AI API with usage billing',
      type: 'api',
      difficulty: 'beginner',
      timeToCode: '12 minutes',
      techStack: ['Node.js', 'Express', 'Redis', 'Docker'],
      revenueModel: '$0.01 per API call',
      marketSize: '$6B API economy',
      icon: <Database className="w-8 h-8" />,
      gradient: 'from-orange-500 to-red-500',
      features: ['API Gateway', 'Rate Limiting', 'Usage Analytics', 'Documentation']
    },
    {
      id: 'mobile-app',
      name: 'AI Mobile App',
      description: 'Cross-platform app with AI features',
      type: 'mobile',
      difficulty: 'intermediate',
      timeToCode: '22 minutes',
      techStack: ['React Native', 'Firebase', 'OpenAI', 'Expo'],
      revenueModel: 'Freemium + ads',
      marketSize: '$935B mobile market',
      icon: <Cpu className="w-8 h-8" />,
      gradient: 'from-indigo-500 to-purple-500',
      features: ['Cross-platform', 'AI Chat', 'Push Notifications', 'Offline Mode']
    }
  ];

  const mockGeneratedProjects: GeneratedProject[] = [
    {
      id: '1',
      name: 'CryptoChat AI',
      description: 'AI chatbot for crypto trading signals',
      codeGenerated: true,
      deploymentReady: true,
      revenue24h: 247.89,
      status: 'earning',
      progress: 100
    },
    {
      id: '2', 
      name: 'NFT Art Generator',
      description: 'AI-powered NFT creation platform',
      codeGenerated: true,
      deploymentReady: false,
      revenue24h: 0,
      status: 'ready',
      progress: 85
    }
  ];

  useEffect(() => {
    setGeneratedProjects(mockGeneratedProjects);
  }, []);

  const generateProject = async (template: ProjectTemplate, customization?: string) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setSelectedTemplate(template);

    try {
      // Simulate AI-powered code generation with realistic progress
      const steps = [
        'Analyzing requirements...',
        'Generating backend architecture...',
        'Creating frontend components...',
        'Implementing AI features...',
        'Setting up database schema...',
        'Configuring deployment...',
        'Running tests...',
        'Project ready!'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        setGenerationProgress(((i + 1) / steps.length) * 100);
      }

      // Create the generated project
      const newProject: GeneratedProject = {
        id: Date.now().toString(),
        name: template.name + ' Pro',
        description: customization || template.description,
        codeGenerated: true,
        deploymentReady: true,
        revenue24h: 0,
        status: 'ready',
        progress: 100
      };

      setGeneratedProjects(prev => [newProject, ...prev]);
      setIsGenerating(false);
      setGenerationProgress(0);
      setSelectedTemplate(null);

    } catch (error) {
      console.error('Generation failed:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const generateCustomProject = async () => {
    if (!customPrompt.trim()) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);

    // Use our AI orchestrator to analyze the prompt
    const messages = [{
      role: 'user' as const,
      content: `Create a detailed project specification for: "${customPrompt}". Include tech stack, features, and revenue model.`
    }];

    try {
      const response = await multiModelOrchestratorService.orchestrate(messages);
      
      // Simulate code generation
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setGenerationProgress(i);
      }

      const newProject: GeneratedProject = {
        id: Date.now().toString(),
        name: customPrompt.slice(0, 30) + '...',
        description: response.content.slice(0, 100) + '...',
        codeGenerated: true,
        deploymentReady: true,
        revenue24h: 0,
        status: 'ready',
        progress: 100
      };

      setGeneratedProjects(prev => [newProject, ...prev]);
      setIsGenerating(false);
      setGenerationProgress(0);
      setCustomPrompt('');

    } catch (error) {
      console.error('Custom generation failed:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const deployProject = (projectId: string) => {
    setGeneratedProjects(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { ...project, status: 'deployed' as const }
          : project
      )
    );
  };

  const getStatusIcon = (status: GeneratedProject['status']) => {
    switch (status) {
      case 'generating': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'deployed': return <Rocket className="w-4 h-4 text-blue-400" />;
      case 'earning': return <TrendingUp className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">AI Magic DevLab</h1>
          <p className="text-xl text-purple-300 mb-8">
            Generate full-stack applications in minutes, not months
          </p>

          {/* Custom Project Input */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex space-x-4">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe your project idea... (e.g., 'A fitness app with AI personal trainer')"
                className="flex-1 bg-black/30 border border-purple-500/30 rounded-xl px-6 py-4 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={generateCustomProject}
                disabled={isGenerating || !customPrompt.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-xl text-white font-semibold flex items-center space-x-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="mb-8 bg-black/30 rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Generating Project...</h3>
              <span className="text-purple-300 font-mono">{generationProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
            <div className="text-white/60 text-sm">AI is crafting your application architecture...</div>
          </div>
        )}

        {/* Project Templates */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Start Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectTemplates.map((template) => (
              <div key={template.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group">
                <div className={`bg-gradient-to-r ${template.gradient} p-4 rounded-xl mb-4 w-fit`}>
                  {template.icon}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                <p className="text-white/70 text-sm mb-4">{template.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Time to Code:</span>
                    <span className="text-green-400">{template.timeToCode}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Revenue Model:</span>
                    <span className="text-purple-400">{template.revenueModel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Market Size:</span>
                    <span className="text-blue-400">{template.marketSize}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {template.techStack.map((tech, index) => (
                      <span key={index} className="bg-white/10 text-white/80 px-2 py-1 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => generateProject(template)}
                  disabled={isGenerating}
                  className={`w-full bg-gradient-to-r ${template.gradient} py-3 rounded-lg text-white font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Generate Now</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Generated Projects */}
        {generatedProjects.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Generated Projects</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {generatedProjects.map((project) => (
                <div key={project.id} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                        <Code className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(project.status)}
                          <span className="text-white/60 text-sm capitalize">{project.status}</span>
                        </div>
                      </div>
                    </div>
                    {project.status === 'earning' && (
                      <div className="text-right">
                        <div className="text-green-400 font-bold">${project.revenue24h.toFixed(2)}</div>
                        <div className="text-white/60 text-xs">24h Revenue</div>
                      </div>
                    )}
                  </div>

                  <p className="text-white/70 text-sm mb-4">{project.description}</p>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600/20 text-blue-400 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-600/30 transition-colors">
                      <Code className="w-4 h-4" />
                      <span>View Code</span>
                    </button>
                    
                    {project.status === 'ready' && (
                      <button 
                        onClick={() => deployProject(project.id)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-300"
                      >
                        <Rocket className="w-4 h-4" />
                        <span>Deploy</span>
                      </button>
                    )}
                    
                    {project.status === 'deployed' && (
                      <button className="flex-1 bg-green-600/20 text-green-400 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-600/30 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        <span>Live Site</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}