/**
 * Auto-Affiliate Content Factory
 * 
 * Premium feature for automated SEO content generation with affiliate links
 * Revenue: $197/month for "Content Autopilot" tier
 * 
 * Features:
 * - AI-powered article generation
 * - Automatic affiliate link injection
 * - SEO optimization
 * - Content scheduling
 * - Performance tracking
 */

import React, { useState } from 'react';
import { 
  Zap, 
  Crown, 
  FileText, 
  Link, 
  Target,
  Settings,
  Play,
  Pause,
  BarChart3,
  DollarSign,
  Eye,
  Share2
} from 'lucide-react';

interface ContentStrategy {
  id: string;
  name: string;
  niche: string;
  targetKeywords: string[];
  affiliatePrograms: AffiliateProgram[];
  contentSchedule: ContentSchedule;
  performance: StrategyPerformance;
  isActive: boolean;
}

interface AffiliateProgram {
  id: string;
  name: string;
  commission: number;
  products: Product[];
  trackingCode: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  affiliateLink: string;
  category: string;
}

interface ContentSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  articlesPerMonth: number;
  publishTime: string;
  contentTypes: ('review' | 'comparison' | 'guide' | 'listicle')[];
}

interface StrategyPerformance {
  articlesGenerated: number;
  totalViews: number;
  totalClicks: number;
  totalCommissions: number;
  averageCTR: number;
  topArticle: string;
}

const AutoAffiliateContentFactory: React.FC<{ isPremium?: boolean; onUpgrade?: () => void }> = ({ 
  isPremium = false, 
  onUpgrade 
}) => {
  const [activeTab, setActiveTab] = useState<'strategies' | 'content' | 'analytics' | 'settings'>('strategies');
  const [_selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  // Mock data for demonstration
  const mockStrategies: ContentStrategy[] = [
    {
      id: '1',
      name: 'Tech Gadgets Review Hub',
      niche: 'Consumer Electronics',
      targetKeywords: ['best bluetooth headphones', 'gaming mouse review', 'laptop buying guide'],
      affiliatePrograms: [
        {
          id: 'amazon',
          name: 'Amazon Associates',
          commission: 4.5,
          products: [],
          trackingCode: 'tag=yourstore-20',
        }
      ],
      contentSchedule: {
        frequency: 'weekly',
        articlesPerMonth: 12,
        publishTime: '09:00',
        contentTypes: ['review', 'comparison', 'guide'],
      },
      performance: {
        articlesGenerated: 47,
        totalViews: 125430,
        totalClicks: 3247,
        totalCommissions: 1834.50,
        averageCTR: 2.6,
        topArticle: 'Best Wireless Headphones Under $100',
      },
      isActive: true,
    },
    {
      id: '2',
      name: 'Home Fitness Authority',
      niche: 'Health & Fitness',
      targetKeywords: ['home workout equipment', 'fitness tracker reviews', 'protein powder comparison'],
      affiliatePrograms: [
        {
          id: 'fitness-affiliate',
          name: 'Fitness Equipment Co.',
          commission: 8.0,
          products: [],
          trackingCode: 'ref=fit123',
        }
      ],
      contentSchedule: {
        frequency: 'weekly',
        articlesPerMonth: 8,
        publishTime: '06:00',
        contentTypes: ['review', 'guide'],
      },
      performance: {
        articlesGenerated: 32,
        totalViews: 89200,
        totalClicks: 2180,
        totalCommissions: 956.75,
        averageCTR: 2.4,
        topArticle: 'Complete Home Gym Setup Guide',
      },
      isActive: false,
    },
  ];

  const renderStrategiesTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Strategies</h2>
          <p className="text-gray-600">Automated affiliate content generation</p>
        </div>
        <button 
          onClick={isPremium ? () => {} : onUpgrade}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            isPremium 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
          }`}
        >
          {isPremium ? '+ New Strategy' : 'Upgrade to Premium'}
        </button>
      </div>

      {!isPremium && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <Crown className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Premium Feature - Generate unlimited affiliate content with AI autopilot
            </span>
          </div>
        </div>
      )}

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockStrategies.map((strategy) => (
          <div key={strategy.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{strategy.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    strategy.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {strategy.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{strategy.niche}</p>
                
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{strategy.performance.articlesGenerated}</div>
                    <div className="text-sm text-gray-500">Articles</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">${strategy.performance.totalCommissions.toFixed(0)}</div>
                    <div className="text-sm text-gray-500">Commissions</div>
                  </div>
                </div>
              </div>
              
              <button 
                className={`p-2 rounded-lg ${
                  strategy.isActive 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {strategy.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            {/* Keywords */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Target Keywords:</div>
              <div className="flex flex-wrap gap-1">
                {strategy.targetKeywords.slice(0, 3).map((keyword, index) => (
                  <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                    {keyword}
                  </span>
                ))}
                {strategy.targetKeywords.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{strategy.targetKeywords.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button 
                onClick={() => setSelectedStrategy(strategy.id)}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-medium text-sm"
              >
                View Details
              </button>
              <button className="bg-gray-100 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-200 font-medium text-sm">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContentTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Generated Content</h2>
          <p className="text-gray-600">AI-generated affiliate articles and performance</p>
        </div>
      </div>

      {/* Content Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <FileText className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">79</div>
          <div className="text-sm text-gray-500">Articles Published</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">214.6K</div>
          <div className="text-sm text-gray-500">Total Views</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <Link className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">5,427</div>
          <div className="text-sm text-gray-500">Affiliate Clicks</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">$2,791</div>
          <div className="text-sm text-gray-500">Total Commissions</div>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Articles</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            {
              title: 'Best Wireless Gaming Mice for 2024',
              published: '2 hours ago',
              views: 1247,
              clicks: 34,
              commissions: 67.50,
              status: 'live'
            },
            {
              title: 'Budget Laptop Buying Guide Under $500',
              published: '1 day ago',
              views: 3891,
              clicks: 89,
              commissions: 156.25,
              status: 'live'
            },
            {
              title: 'Top 10 Bluetooth Headphones Comparison',
              published: '3 days ago',
              views: 7234,
              clicks: 178,
              commissions: 289.75,
              status: 'live'
            }
          ].map((article, index) => (
            <div key={index} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 mb-1">{article.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Published {article.published}</span>
                    <span>{article.views.toLocaleString()} views</span>
                    <span>{article.clicks} clicks</span>
                    <span className="text-green-600 font-medium">${article.commissions}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {article.status}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
        <p className="text-gray-600">Track your content performance and revenue</p>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 30 Days)</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Interactive revenue chart would be displayed here</p>
          </div>
        </div>
      </div>

      {/* Top Performing Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Keywords</h3>
          <div className="space-y-3">
            {[
              { keyword: 'best gaming mouse', ranking: 3, clicks: 892, revenue: 234.50 },
              { keyword: 'wireless headphones review', ranking: 5, clicks: 634, revenue: 178.25 },
              { keyword: 'laptop buying guide', ranking: 7, clicks: 445, revenue: 123.75 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-gray-900">{item.keyword}</div>
                  <div className="text-sm text-gray-500">Rank #{item.ranking} • {item.clicks} clicks</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">${item.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Converting Articles</h3>
          <div className="space-y-3">
            {[
              { title: 'Best Budget Gaming Setup 2024', ctr: 3.2, revenue: 345.75 },
              { title: 'Wireless Headphones Comparison', ctr: 2.8, revenue: 289.50 },
              { title: 'Home Office Equipment Guide', ctr: 2.4, revenue: 198.25 }
            ].map((item, index) => (
              <div key={index} className="py-2">
                <div className="font-medium text-gray-900 mb-1">{item.title}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">CTR: {item.ctr}%</span>
                  <span className="font-semibold text-green-600">${item.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Auto-Affiliate Content Factory</h1>
            <p className="text-gray-600">AI-powered affiliate content generation on autopilot</p>
          </div>
          {!isPremium && (
            <div className="ml-auto">
              <button 
                onClick={onUpgrade}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'strategies', label: 'Content Strategies', icon: Target },
            { id: 'content', label: 'Generated Content', icon: FileText },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'strategies' && renderStrategiesTab()}
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600">Configure affiliate programs, content templates, and automation settings</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoAffiliateContentFactory;