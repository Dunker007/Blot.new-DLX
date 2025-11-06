/**
 * Business Model Generator - Premium Component
 *
 * High-value feature that generates complete business models
 * Premium tier: $97/month for unlimited business model generation
 */
import { useState } from 'react';
import { LocalStorageManager } from '../utils/localStorage';
import {
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  Crown,
  DollarSign,
  Download,
  Rocket,
  Share2,
  Target,
  Zap,
} from 'lucide-react';

import {
  BusinessModel,
  BusinessModelInput,
  businessModelGeneratorService as businessModelGenerator,
} from '../services/businessModelGenerator';

interface BusinessModelGeneratorProps {
  onUpgrade?: () => void;
  isPremium?: boolean;
}

const BusinessModelGenerator: React.FC<BusinessModelGeneratorProps> = ({
  onUpgrade,
  isPremium = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedModel, setGeneratedModel] = useState<BusinessModel | null>(null);
  const [input, setInput] = useState<BusinessModelInput>({
    industry: '',
    targetMarket: '',
    uniqueValue: '',
    initialBudget: 0,
    timeframe: '90-days',
    experience: 'beginner',
    niche: '',
    targetAudience: '',
    budget: 'bootstrap',
    timeline: '90-days',
    preferredModels: [],
  });

  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  // Revenue Model Presets - High-impact quick wins
  const revenuePresets = [
    {
      id: 'content-crusher',
      name: 'Content Crusher',
      description: 'Fast, affordable, SEO-optimized content generation',
      icon: '📝',
      industry: 'Digital Marketing',
      niche: 'SEO Content & Affiliate Marketing',
      targetAudience: 'Small business owners seeking passive income',
      budget: 'bootstrap',
      timeline: '30-days',
      experience: 'beginner',
      preferredModels: ['affiliate', 'digital-products'],
      expectedROI: { month1: 500, month3: 2500, month6: 8500, month12: 25500 },
      monthlyPotential: '$850-$2,500',
    },
    {
      id: 'sales-genius',
      name: 'Sales Genius',
      description: 'Persuasive, conversion-driven sales automation',
      icon: '💼',
      industry: 'Digital Marketing',
      niche: 'Sales Automation & Conversion Optimization',
      targetAudience: 'E-commerce stores and online businesses',
      budget: 'small',
      timeline: '90-days',
      experience: 'intermediate',
      preferredModels: ['saas', 'services'],
      expectedROI: { month1: 1000, month3: 5000, month6: 15000, month12: 50000 },
      monthlyPotential: '$2,000-$10,000',
    },
    {
      id: 'code-wizard',
      name: 'Code Wizard',
      description: 'Automation scripts, trading bots, SaaS builders',
      icon: '⚡',
      industry: 'AI/Machine Learning',
      niche: 'Automation Tools & Trading Bots',
      targetAudience: 'Developers and crypto traders',
      budget: 'medium',
      timeline: '90-days',
      experience: 'expert',
      preferredModels: ['saas', 'digital-products'],
      expectedROI: { month1: 2000, month3: 10000, month6: 30000, month12: 100000 },
      monthlyPotential: '$5,000-$20,000',
    },
    {
      id: 'market-prophet',
      name: 'Market Prophet',
      description: 'Analysis, predictions, trends, market intelligence',
      icon: '🔮',
      industry: 'Finance/FinTech',
      niche: 'Market Analysis & Financial Intelligence',
      targetAudience: 'Traders, investors, financial advisors',
      budget: 'small',
      timeline: '90-days',
      experience: 'intermediate',
      preferredModels: ['saas', 'digital-products', 'services'],
      expectedROI: { month1: 1500, month3: 7500, month6: 24000, month12: 75000 },
      monthlyPotential: '$3,000-$12,000',
    },
  ];

  const industries = [
    'SaaS/Software',
    'E-commerce',
    'Digital Marketing',
    'Consulting',
    'Education/Training',
    'Health & Wellness',
    'Finance/FinTech',
    'Real Estate',
    'Entertainment',
    'Food & Beverage',
    'Travel',
    'Cryptocurrency/Blockchain',
    'AI/Machine Learning',
    'Other',
  ];

  const businessModels = [
    { id: 'saas', name: 'SaaS/Subscription', desc: 'Recurring revenue software' },
    { id: 'ecommerce', name: 'E-commerce', desc: 'Online product sales' },
    { id: 'affiliate', name: 'Affiliate Marketing', desc: 'Commission-based promotion' },
    { id: 'digital-products', name: 'Digital Products', desc: 'Courses, templates, tools' },
    { id: 'services', name: 'Service Business', desc: 'Consulting, agency, freelancing' },
    { id: 'marketplace', name: 'Marketplace', desc: 'Platform connecting buyers/sellers' },
  ];

  const handleGenerate = async () => {
    if (!isPremium) {
      onUpgrade?.();
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setCurrentTask('Initializing AI business analysis...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return Math.min(newProgress, 90);
        });
      }, 1000);

      const taskUpdates = [
        'Analyzing market opportunities...',
        'Researching competition landscape...',
        'Designing revenue streams...',
        'Creating implementation roadmap...',
        'Calculating financial projections...',
        'Finalizing business model...',
      ];

      taskUpdates.forEach((task, index) => {
        setTimeout(() => setCurrentTask(task), index * 2000);
      });

      // Generate business model
      const model = await businessModelGenerator.generateBusinessModel(input, (step, progress) => {
        console.log(`${step}: ${progress}%`);
      });

      clearInterval(progressInterval);
      setProgress(100);
      setCurrentTask('Business model generated successfully!');
      setGeneratedModel(model);
      setCurrentStep(3);
    } catch (error) {
      console.error('Generation failed:', error);
      setCurrentTask('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/30 rounded-full mb-4">
          <Crown className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">AI Business Model Generator</h2>
        <p className="text-xl text-gray-300">
          Generate complete business models with AI-powered analysis
        </p>

        {!isPremium && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-l-4 border-yellow-500/50 rounded-lg">
            <div className="flex items-center">
              <Crown className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-yellow-300 font-medium">
                Premium Feature - Upgrade to unlock unlimited business models
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Model Presets */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-6">
        <label className="block text-sm font-semibold text-cyan-400 mb-3">
          🚀 Quick Start: Revenue Model Presets
        </label>
        <p className="text-xs text-gray-400 mb-4">
          Select a preset to auto-fill optimized settings based on proven revenue models
        </p>
        <select
          value={selectedPreset}
          onChange={e => {
            const presetId = e.target.value;
            setSelectedPreset(presetId);
            if (presetId) {
              const preset = revenuePresets.find(p => p.id === presetId);
              if (preset) {
                setInput({
                  industry: preset.industry,
                  targetMarket: preset.targetAudience,
                  uniqueValue: '',
                  initialBudget: 0,
                  timeframe: preset.timeline,
                  experience: preset.experience as any,
                  niche: preset.niche,
                  targetAudience: preset.targetAudience,
                  budget: preset.budget as any,
                  timeline: preset.timeline as any,
                  preferredModels: preset.preferredModels as any,
                });
              }
            }
          }}
          className="w-full p-3 border border-cyan-500/30 rounded-lg bg-slate-800/60 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 font-medium"
        >
          <option value="">-- Select a Revenue Model Preset (Optional) --</option>
          {revenuePresets.map(preset => (
            <option key={preset.id} value={preset.id}>
              {preset.icon} {preset.name} - {preset.description} ({preset.monthlyPotential}/mo potential)
            </option>
          ))}
        </select>
        {selectedPreset && (
          <div className="mt-4 p-4 bg-slate-800/60 rounded-lg border border-cyan-500/30">
            {(() => {
              const preset = revenuePresets.find(p => p.id === selectedPreset);
              if (!preset) return null;
              return (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">{preset.name} Model</h4>
                    <span className="text-sm font-bold text-green-400">{preset.monthlyPotential}/mo</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-gray-400">Month 1 ROI</div>
                      <div className="font-semibold text-white">${preset.expectedROI.month1.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Month 3 ROI</div>
                      <div className="font-semibold text-white">${preset.expectedROI.month3.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Month 6 ROI</div>
                      <div className="font-semibold text-white">${preset.expectedROI.month6.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Year 1 ROI</div>
                      <div className="font-semibold text-green-400">${preset.expectedROI.month12.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Industry Selection */}
      <div>
        <label className="block text-sm font-medium text-cyan-400 mb-3">Industry *</label>
        <select
          value={input.industry}
          onChange={e => setInput(prev => ({ ...prev, industry: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select your industry</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>

      {/* Niche */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Specific Niche (Optional)
        </label>
        <input
          type="text"
          value={input.niche}
          onChange={e => setInput(prev => ({ ...prev, niche: e.target.value }))}
          placeholder="e.g., B2B productivity tools, sustainable fashion, crypto trading"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Target Audience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Target Audience</label>
        <input
          type="text"
          value={input.targetAudience}
          onChange={e => setInput(prev => ({ ...prev, targetAudience: e.target.value }))}
          placeholder="e.g., Small business owners, millennials, tech entrepreneurs"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Budget & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Budget</label>
          <select
            value={input.budget}
            onChange={e => setInput(prev => ({ ...prev, budget: e.target.value as any }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="bootstrap">Bootstrap ($0-1K)</option>
            <option value="small">Small ($1K-10K)</option>
            <option value="medium">Medium ($10K-50K)</option>
            <option value="large">Large ($50K+)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Timeline</label>
          <select
            value={input.timeline}
            onChange={e => setInput(prev => ({ ...prev, timeline: e.target.value as any }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="30-days">30 Days</option>
            <option value="90-days">90 Days</option>
            <option value="6-months">6 Months</option>
            <option value="1-year">1 Year</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Experience</label>
          <select
            value={input.experience}
            onChange={e => setInput(prev => ({ ...prev, experience: e.target.value as any }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Business Models */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preferred Business Models
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {businessModels.map(model => (
            <label
              key={model.id}
              className="flex items-start p-3 border border-cyan-500/20 rounded-lg hover:bg-slate-800/60 cursor-pointer bg-slate-800/40"
            >
              <input
                type="checkbox"
                checked={input.preferredModels?.includes(model.id as any) ?? false}
                onChange={e => {
                  const newModels = e.target.checked
                    ? [...(input.preferredModels || []), model.id as any]
                    : (input.preferredModels || []).filter((m: string) => m !== model.id);
                  setInput(prev => ({ ...prev, preferredModels: newModels }));
                }}
                className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <div className="ml-3">
                <div className="font-medium text-white">{model.name}</div>
                <div className="text-sm text-gray-400">{model.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={() => setCurrentStep(2)}
        disabled={!input.industry}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        Continue to Generation
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="text-center space-y-8">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6">
        <Zap className="w-10 h-10 text-white" />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Generate Your Business Model</h2>
        <p className="text-xl text-gray-300 mb-8">
          AI will analyze your industry, research competitors, design revenue streams, and create a
          complete implementation roadmap.
        </p>
      </div>

      {/* Premium Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="text-center p-4">
          <BarChart3 className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
          <h3 className="font-semibold text-white">Market Analysis</h3>
          <p className="text-sm text-gray-400">Deep market research & competitive intelligence</p>
        </div>
        <div className="text-center p-4">
          <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h3 className="font-semibold text-white">Revenue Streams</h3>
          <p className="text-sm text-gray-400">Multiple monetization strategies & projections</p>
        </div>
        <div className="text-center p-4">
          <Rocket className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h3 className="font-semibold text-white">Implementation</h3>
          <p className="text-sm text-gray-400">Step-by-step roadmap with timelines</p>
        </div>
        <div className="text-center p-4">
          <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h3 className="font-semibold text-white">Strategy</h3>
          <p className="text-sm text-gray-400">Competitive positioning & differentiation</p>
        </div>
      </div>

      {isGenerating ? (
        <div className="space-y-6">
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-center space-x-2 text-indigo-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
            <span className="text-lg font-medium">{currentTask}</span>
          </div>
          <p className="text-gray-400">This may take 30-60 seconds for comprehensive analysis</p>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={handleGenerate}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
              isPremium
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
            }`}
          >
            {isPremium ? (
              <span className="flex items-center justify-center">
                <Zap className="w-5 h-5 mr-2" />
                Generate Business Model with AI
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Generate ($97/month)
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentStep(1)}
            className="w-full text-gray-300 hover:text-white py-2"
          >
            ← Back to Edit Details
          </button>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Business Model Generated!</h2>
        <p className="text-xl text-gray-300">Your AI-powered business plan is ready</p>
      </div>

      {generatedModel && (
        <div className="space-y-6">
          {/* Business Model Overview */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-lg p-6 border border-cyan-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">{generatedModel.title}</h3>
            <p className="text-gray-300 mb-4">{generatedModel.description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-1" />
                Confidence: {Math.round((generatedModel.confidence ?? 0) * 100)}%
              </span>
              <span className="flex items-center text-cyan-400">
                <Clock className="w-4 h-4 mr-1" />
                Generated: {new Date(generatedModel.generatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Revenue Projections */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 rounded-lg p-4 border border-cyan-500/30 text-center">
              <div className="text-2xl font-bold text-cyan-400">
                ${(generatedModel.financialProjections.month1 ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Month 1</div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-4 border border-cyan-500/30 text-center">
              <div className="text-2xl font-bold text-cyan-400">
                ${(generatedModel.financialProjections.month3 ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Month 3</div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-4 border border-cyan-500/30 text-center">
              <div className="text-2xl font-bold text-cyan-400">
                ${(generatedModel.financialProjections.month6 ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Month 6</div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-4 border border-cyan-500/30 text-center">
              <div className="text-2xl font-bold text-green-400">
                ${(generatedModel.financialProjections.month12 ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Year 1</div>
            </div>
          </div>

          {/* ROI Calculator */}
          {selectedPreset && (
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-6 border-2 border-green-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                ROI Calculator - {revenuePresets.find(p => p.id === selectedPreset)?.name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(() => {
                  const preset = revenuePresets.find(p => p.id === selectedPreset);
                  if (!preset) return null;
                  const projections = generatedModel?.financialProjections || preset.expectedROI;
                  return (
                    <>
                      <div className="bg-slate-800/60 rounded-lg p-4 border border-green-500/30">
                        <div className="text-xs text-gray-400 mb-1">Month 1</div>
                        <div className="text-2xl font-bold text-green-400">${projections.month1?.toLocaleString() || 0}</div>
                        <div className="text-xs text-green-300 mt-1">ROI: {preset.budget === 'bootstrap' ? '∞' : '200%'}</div>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-4 border border-green-500/30">
                        <div className="text-xs text-gray-400 mb-1">Month 3</div>
                        <div className="text-2xl font-bold text-green-400">${projections.month3?.toLocaleString() || 0}</div>
                        <div className="text-xs text-green-300 mt-1">ROI: 500%</div>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-4 border border-green-500/30">
                        <div className="text-xs text-gray-400 mb-1">Month 6</div>
                        <div className="text-2xl font-bold text-green-400">${projections.month6?.toLocaleString() || 0}</div>
                        <div className="text-xs text-green-300 mt-1">ROI: 1500%</div>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-4 border-2 border-green-500/50">
                        <div className="text-xs text-gray-400 mb-1">Year 1</div>
                        <div className="text-2xl font-bold text-green-400">${projections.month12?.toLocaleString() || 0}</div>
                        <div className="text-xs text-green-300 mt-1 font-semibold">ROI: 5000%+</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                const content = generatePDFContent(generatedModel!);
                const element = document.createElement('a');
                const file = new Blob([content], { type: 'text/plain' });
                element.href = URL.createObjectURL(file);
                element.download = `business-model-${generatedModel?.title?.replace(/\s+/g, '-').toLowerCase() || 'report'}.txt`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Export PDF Report
            </button>
            <button
              onClick={() => {
                const content = generateWordContent(generatedModel!);
                const element = document.createElement('a');
                const file = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                element.href = URL.createObjectURL(file);
                element.download = `business-model-${generatedModel?.title?.replace(/\s+/g, '-').toLowerCase() || 'report'}.docx`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Export Word Doc
            </button>
            <button
              onClick={() => {
                const content = generateCSVContent(generatedModel!);
                const element = document.createElement('a');
                const file = new Blob([content], { type: 'text/csv' });
                element.href = URL.createObjectURL(file);
                element.download = `business-model-${generatedModel?.title?.replace(/\s+/g, '-').toLowerCase() || 'report'}.csv`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => {
                const content = generateHTMLContent(generatedModel!);
                const element = document.createElement('a');
                const file = new Blob([content], { type: 'text/html' });
                element.href = URL.createObjectURL(file);
                element.download = `business-model-${generatedModel?.title?.replace(/\s+/g, '-').toLowerCase() || 'report'}.html`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Export HTML
            </button>
            <button className="flex items-center px-6 py-3 bg-slate-700/60 text-gray-300 rounded-lg hover:bg-slate-700 font-medium transition-colors border border-slate-600/50">
              <Share2 className="w-5 h-5 mr-2" />
              Share Model
            </button>
            <button className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors">
              <BookOpen className="w-5 h-5 mr-2" />
              View Full Analysis
            </button>
            <button
              onClick={() => {
                // Integration with Revenue Streams Dashboard
                const revenueStream = {
                  id: `model-${Date.now()}`,
                  name: generatedModel?.title || 'New Business Model',
                  type: 'content' as const,
                  dailyRevenue: (generatedModel?.financialProjections.month1 || 0) / 30,
                  monthlyRevenue: generatedModel?.financialProjections.month1 || 0,
                  trend: 'up' as const,
                  trendPercent: 0,
                  status: 'active' as const,
                  automationHealth: 'green' as const,
                  lastUpdated: new Date().toISOString(),
                };
                const streams = LocalStorageManager.get<any[]>('dlx-revenue-streams', []);
                streams.push(revenueStream);
                LocalStorageManager.set('dlx-revenue-streams', streams);
                alert('Business model added to Revenue Streams Dashboard!');
              }}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Add to Revenue Dashboard
            </button>
          </div>

          {/* Start New Model */}
          <div className="text-center pt-6 border-t">
            <button
              onClick={() => {
                setCurrentStep(1);
                setGeneratedModel(null);
                setInput({
                  industry: '',
                  targetMarket: '',
                  uniqueValue: '',
                  initialBudget: 0,
                  timeframe: '90-days',
                  experience: 'beginner',
                  niche: '',
                  targetAudience: '',
                  budget: 'bootstrap',
                  timeline: '90-days',
                  preferredModels: [],
                });
              }}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Generate Another Business Model
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-gray-400'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-xl border border-cyan-500/20 p-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
};

// Helper functions for export
const generatePDFContent = (model: BusinessModel): string => {
  const title = model.title || 'Business Model Report';
  const desc = model.description || model.executiveSummary || '';
  const confidence = Math.round((model.confidence ?? 0) * 100);
  const generated = new Date(model.generatedAt).toLocaleDateString();
  
  return `═══════════════════════════════════════════════════════════
  BUSINESS MODEL REPORT
═══════════════════════════════════════════════════════════

${title}
Generated: ${generated}
Confidence: ${confidence}%

───────────────────────────────────────────────────────────
EXECUTIVE SUMMARY
───────────────────────────────────────────────────────────
${model.executiveSummary || desc}

───────────────────────────────────────────────────────────
VALUE PROPOSITION
───────────────────────────────────────────────────────────
${model.valueProposition || 'N/A'}

───────────────────────────────────────────────────────────
TARGET CUSTOMERS
───────────────────────────────────────────────────────────
${(model.targetCustomers || []).map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

───────────────────────────────────────────────────────────
FINANCIAL PROJECTIONS
───────────────────────────────────────────────────────────
Month 1:    $${(model.financialProjections?.month1 ?? 0).toLocaleString()}
Month 3:    $${(model.financialProjections?.month3 ?? 0).toLocaleString()}
Month 6:    $${(model.financialProjections?.month6 ?? 0).toLocaleString()}
Year 1:     $${(model.financialProjections?.month12 ?? 0).toLocaleString()}

───────────────────────────────────────────────────────────
REVENUE STREAMS
───────────────────────────────────────────────────────────
${(model.revenueStreams || []).map((stream: any, i: number) => 
  `${i + 1}. ${stream.name || 'Revenue Stream'}
   Description: ${stream.description || 'N/A'}
   Projected Revenue: $${(stream.projectedRevenue || 0).toLocaleString()}/month
   Time to Realize: ${stream.timeToRealize || 'TBD'}`
).join('\n\n')}

───────────────────────────────────────────────────────────
MARKET ANALYSIS
───────────────────────────────────────────────────────────
Market Size: ${model.marketAnalysis?.marketSize || 'N/A'}
Growth Rate: ${model.marketAnalysis?.growthRate || 'N/A'}
Trends: ${(model.marketAnalysis?.trends || []).join(', ') || 'N/A'}
Opportunities: ${(model.marketAnalysis?.opportunities || []).join(', ') || 'N/A'}

───────────────────────────────────────────────────────────
IMPLEMENTATION PLAN
───────────────────────────────────────────────────────────
${(model.implementationPlan?.phases || []).map((phase: any, i: number) => 
  `Phase ${i + 1}: ${phase.name || 'Phase'}
  Duration: ${phase.duration || 'N/A'}
  Tasks: ${(phase.tasks || []).join(', ')}`
).join('\n\n')}

───────────────────────────────────────────────────────────
RISK ASSESSMENT
───────────────────────────────────────────────────────────
${(model.riskAssessment?.risks || []).map((risk: any, i: number) => 
  `Risk ${i + 1}: ${risk.risk || risk.description || 'Risk'}
  Impact: ${risk.impact || 'N/A'}
  Probability: ${risk.probability || 'N/A'}
  Mitigation: ${model.riskAssessment?.mitigation?.[i] || 'N/A'}`
).join('\n\n')}

───────────────────────────────────────────────────────────
Report generated by DLX Studios Business Model Generator
═══════════════════════════════════════════════════════════
`;
};

const generateWordContent = (model: BusinessModel): string => {
  const title = model.title || 'Business Model Report';
  const desc = model.description || model.executiveSummary || '';
  
  // Enhanced Word XML with better formatting
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>${title}</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t>Generated: ${new Date(model.generatedAt).toLocaleDateString()}</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Executive Summary</w:t></w:r></w:p>
    <w:p><w:r><w:t>${desc}</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Value Proposition</w:t></w:r></w:p>
    <w:p><w:r><w:t>${model.valueProposition || 'N/A'}</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Financial Projections</w:t></w:r></w:p>
    <w:p><w:r><w:t>Month 1: $${(model.financialProjections?.month1 ?? 0).toLocaleString()}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Month 3: $${(model.financialProjections?.month3 ?? 0).toLocaleString()}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Month 6: $${(model.financialProjections?.month6 ?? 0).toLocaleString()}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Year 1: $${(model.financialProjections?.month12 ?? 0).toLocaleString()}</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Revenue Streams</w:t></w:r></w:p>
    ${(model.revenueStreams || []).map((stream: any, i: number) => 
      `<w:p><w:r><w:t>${i + 1}. ${stream.name || 'Revenue Stream'}: $${(stream.projectedRevenue || 0).toLocaleString()}/month</w:t></w:r></w:p>`
    ).join('')}
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Implementation Plan</w:t></w:r></w:p>
    ${(model.implementationPlan?.phases || []).map((phase: any, i: number) => 
      `<w:p><w:r><w:t>Phase ${i + 1}: ${phase.name || 'Phase'} - ${phase.duration || ''}</w:t></w:r></w:p>`
    ).join('')}
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Risks & Mitigation</w:t></w:r></w:p>
    ${(model.riskAssessment?.risks || []).map((risk: any, i: number) => 
      `<w:p><w:r><w:t>${i + 1}. ${risk.risk || risk.description || 'Risk'}: ${model.riskAssessment?.mitigation?.[i] || 'N/A'}</w:t></w:r></w:p>`
    ).join('')}
  </w:body>
</w:document>`;
};

const generateCSVContent = (model: BusinessModel): string => {
  const rows: string[] = [];
  
  // Header
  rows.push('Field,Value');
  rows.push(`Title,"${model.title || ''}"`);
  rows.push(`Generated,"${new Date(model.generatedAt).toLocaleDateString()}"`);
  rows.push(`Confidence,${Math.round((model.confidence ?? 0) * 100)}%`);
  rows.push(`Executive Summary,"${(model.executiveSummary || '').replace(/"/g, '""')}"`);
  rows.push(`Value Proposition,"${(model.valueProposition || '').replace(/"/g, '""')}"`);
  rows.push('');
  
  // Financial Projections
  rows.push('Financial Projections');
  rows.push(`Month 1,$${(model.financialProjections?.month1 ?? 0).toLocaleString()}`);
  rows.push(`Month 3,$${(model.financialProjections?.month3 ?? 0).toLocaleString()}`);
  rows.push(`Month 6,$${(model.financialProjections?.month6 ?? 0).toLocaleString()}`);
  rows.push(`Year 1,$${(model.financialProjections?.month12 ?? 0).toLocaleString()}`);
  rows.push('');
  
  // Revenue Streams
  rows.push('Revenue Streams,Name,Description,Projected Revenue,Time to Realize');
  (model.revenueStreams || []).forEach((stream: any, i: number) => {
    rows.push(`Stream ${i + 1},"${(stream.name || '').replace(/"/g, '""')}","${(stream.description || '').replace(/"/g, '""')}",$${(stream.projectedRevenue || 0).toLocaleString()},"${stream.timeToRealize || 'TBD'}"`);
  });
  rows.push('');
  
  // Implementation Plan
  rows.push('Implementation Plan,Phase,Duration,Tasks');
  (model.implementationPlan?.phases || []).forEach((phase: any, i: number) => {
    rows.push(`Phase ${i + 1},"${(phase.name || '').replace(/"/g, '""')}","${phase.duration || ''}","${(phase.tasks || []).join('; ').replace(/"/g, '""')}"`);
  });
  rows.push('');
  
  // Risks
  rows.push('Risks,Risk,Impact,Probability,Mitigation');
  (model.riskAssessment?.risks || []).forEach((risk: any, i: number) => {
    rows.push(`Risk ${i + 1},"${(risk.risk || risk.description || '').replace(/"/g, '""')}","${risk.impact || ''}","${risk.probability || ''}","${(model.riskAssessment?.mitigation?.[i] || '').replace(/"/g, '""')}"`);
  });
  
  return rows.join('\n');
};

const generateHTMLContent = (model: BusinessModel): string => {
  const title = model.title || 'Business Model Report';
  const generated = new Date(model.generatedAt).toLocaleDateString();
  const confidence = Math.round((model.confidence ?? 0) * 100);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; background: #1a1a2e; color: #fff; }
    h1 { color: #00ffff; border-bottom: 2px solid #00ffff; padding-bottom: 10px; }
    h2 { color: #a855f7; margin-top: 30px; }
    .section { background: #0f0f1a; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #00ffff; }
    .revenue-stream { background: #151520; padding: 15px; margin: 10px 0; border-radius: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #333; }
    th { background: #1a1a2e; color: #00ffff; }
    .financial { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0; }
    .financial-item { background: #151520; padding: 15px; border-radius: 5px; }
    .value { color: #00ffff; font-size: 1.2em; font-weight: bold; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p><strong>Generated:</strong> ${generated} | <strong>Confidence:</strong> ${confidence}%</p>
  
  <div class="section">
    <h2>Executive Summary</h2>
    <p>${(model.executiveSummary || model.description || '').replace(/\n/g, '<br>')}</p>
  </div>
  
  <div class="section">
    <h2>Value Proposition</h2>
    <p>${(model.valueProposition || '').replace(/\n/g, '<br>')}</p>
  </div>
  
  <div class="section">
    <h2>Financial Projections</h2>
    <div class="financial">
      <div class="financial-item">
        <div>Month 1</div>
        <div class="value">$${(model.financialProjections?.month1 ?? 0).toLocaleString()}</div>
      </div>
      <div class="financial-item">
        <div>Month 3</div>
        <div class="value">$${(model.financialProjections?.month3 ?? 0).toLocaleString()}</div>
      </div>
      <div class="financial-item">
        <div>Month 6</div>
        <div class="value">$${(model.financialProjections?.month6 ?? 0).toLocaleString()}</div>
      </div>
      <div class="financial-item">
        <div>Year 1</div>
        <div class="value">$${(model.financialProjections?.month12 ?? 0).toLocaleString()}</div>
      </div>
    </div>
  </div>
  
  <div class="section">
    <h2>Revenue Streams</h2>
    ${(model.revenueStreams || []).map((stream: any, i: number) => 
      `<div class="revenue-stream">
        <h3>${i + 1}. ${stream.name || 'Revenue Stream'}</h3>
        <p>${stream.description || ''}</p>
        <p><strong>Projected Revenue:</strong> $${(stream.projectedRevenue || 0).toLocaleString()}/month</p>
        <p><strong>Time to Realize:</strong> ${stream.timeToRealize || 'TBD'}</p>
      </div>`
    ).join('')}
  </div>
  
  <div class="section">
    <h2>Implementation Plan</h2>
    <table>
      <tr><th>Phase</th><th>Duration</th><th>Tasks</th></tr>
      ${(model.implementationPlan?.phases || []).map((phase: any, i: number) => 
        `<tr>
          <td>${i + 1}. ${phase.name || 'Phase'}</td>
          <td>${phase.duration || 'N/A'}</td>
          <td>${(phase.tasks || []).join(', ')}</td>
        </tr>`
      ).join('')}
    </table>
  </div>
  
  <div class="section">
    <h2>Risk Assessment</h2>
    <table>
      <tr><th>Risk</th><th>Impact</th><th>Probability</th><th>Mitigation</th></tr>
      ${(model.riskAssessment?.risks || []).map((risk: any, i: number) => 
        `<tr>
          <td>${risk.risk || risk.description || 'Risk'}</td>
          <td>${risk.impact || 'N/A'}</td>
          <td>${risk.probability || 'N/A'}</td>
          <td>${model.riskAssessment?.mitigation?.[i] || 'N/A'}</td>
        </tr>`
      ).join('')}
    </table>
  </div>
  
  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; text-align: center; color: #666;">
    <p>Generated by DLX Studios Business Model Generator</p>
  </footer>
</body>
</html>`;
};

export default BusinessModelGenerator;
