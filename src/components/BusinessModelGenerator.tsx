/**
 * Business Model Generator - Premium Component
 *
 * High-value feature that generates complete business models
 * Premium tier: $97/month for unlimited business model generation
 */
import React, { useState } from 'react';

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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Business Model Generator</h2>
        <p className="text-xl text-gray-600">
          Generate complete business models with AI-powered analysis
        </p>

        {!isPremium && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg">
            <div className="flex items-center">
              <Crown className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-medium">
                Premium Feature - Upgrade to unlock unlimited business models
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Industry Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Industry *</label>
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
              className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
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
                <div className="font-medium text-gray-900">{model.name}</div>
                <div className="text-sm text-gray-500">{model.desc}</div>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Generate Your Business Model</h2>
        <p className="text-xl text-gray-600 mb-8">
          AI will analyze your industry, research competitors, design revenue streams, and create a
          complete implementation roadmap.
        </p>
      </div>

      {/* Premium Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="text-center p-4">
          <BarChart3 className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900">Market Analysis</h3>
          <p className="text-sm text-gray-600">Deep market research & competitive intelligence</p>
        </div>
        <div className="text-center p-4">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900">Revenue Streams</h3>
          <p className="text-sm text-gray-600">Multiple monetization strategies & projections</p>
        </div>
        <div className="text-center p-4">
          <Rocket className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900">Implementation</h3>
          <p className="text-sm text-gray-600">Step-by-step roadmap with timelines</p>
        </div>
        <div className="text-center p-4">
          <Target className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900">Strategy</h3>
          <p className="text-sm text-gray-600">Competitive positioning & differentiation</p>
        </div>
      </div>

      {isGenerating ? (
        <div className="space-y-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-center space-x-2 text-indigo-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
            <span className="text-lg font-medium">{currentTask}</span>
          </div>
          <p className="text-gray-500">This may take 30-60 seconds for comprehensive analysis</p>
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
            className="w-full text-gray-600 hover:text-gray-800 py-2"
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Business Model Generated!</h2>
        <p className="text-xl text-gray-600">Your AI-powered business plan is ready</p>
      </div>

      {generatedModel && (
        <div className="space-y-6">
          {/* Business Model Overview */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{generatedModel.title}</h3>
            <p className="text-gray-700 mb-4">{generatedModel.description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Confidence: {Math.round((generatedModel.confidence ?? 0) * 100)}%
              </span>
              <span className="flex items-center text-indigo-600">
                <Clock className="w-4 h-4 mr-1" />
                Generated: {new Date(generatedModel.generatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Revenue Projections */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${(generatedModel.financialProjections.month1 ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Month 1</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${(generatedModel.financialProjections.month3 ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Month 3</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${(generatedModel.financialProjections.month6 ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Month 6</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600">
                ${(generatedModel.financialProjections.month12 ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Year 1</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
              <Download className="w-5 h-5 mr-2" />
              Export PDF Report
            </button>
            <button className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              <Share2 className="w-5 h-5 mr-2" />
              Share Model
            </button>
            <button className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
              <BookOpen className="w-5 h-5 mr-2" />
              View Full Analysis
            </button>
            <button className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
              <Rocket className="w-5 h-5 mr-2" />
              Start Implementation
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
                  currentStep >= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default BusinessModelGenerator;
