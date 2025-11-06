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
import { useState } from 'react';

import {
  BarChart3,
  Calendar,
  Clock,
  Crown,
  DollarSign,
  Eye,
  FileText,
  Link,
  Pause,
  Play,
  Plus,
  Settings,
  Share2,
  Target,
  Zap,
  CheckCircle,
  X,
  RefreshCw,
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
  linkPlacements?: LinkPlacement[]; // A/B test placements
  autoInject?: boolean;
}

interface LinkPlacement {
  id: string;
  name: string;
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
  style: 'text' | 'button' | 'banner';
  ctr: number; // For A/B testing
  clicks: number;
  conversions: number;
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
  batchSize?: number; // Articles per batch generation
  platforms?: PublishingPlatform[];
  autoPublish?: boolean;
}

interface PublishingPlatform {
  id: string;
  name: 'WordPress' | 'Medium' | 'Substack' | 'Custom';
  enabled: boolean;
  url?: string;
  apiKey?: string;
  autoPublish: boolean;
  seoOptimized: boolean;
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
  onUpgrade,
}) => {
  const [activeTab, setActiveTab] = useState<'strategies' | 'content' | 'analytics' | 'settings' | 'scheduling' | 'links'>(
    'strategies'
  );
  const [_selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [scheduledJobs, setScheduledJobs] = useState<any[]>([]);

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
          autoInject: true,
          linkPlacements: [
            { id: 'lp1', name: 'Top Text Link', position: 'top', style: 'text', ctr: 2.8, clicks: 892, conversions: 45 },
            { id: 'lp2', name: 'Middle Button', position: 'middle', style: 'button', ctr: 3.2, clicks: 634, conversions: 38 },
            { id: 'lp3', name: 'Bottom Banner', position: 'bottom', style: 'banner', ctr: 1.9, clicks: 445, conversions: 22 },
          ],
        },
      ],
      contentSchedule: {
        frequency: 'weekly',
        articlesPerMonth: 12,
        publishTime: '09:00',
        contentTypes: ['review', 'comparison', 'guide'],
        batchSize: 5,
        autoPublish: true,
        platforms: [
          { id: 'wp1', name: 'WordPress', enabled: true, autoPublish: true, seoOptimized: true },
          { id: 'med1', name: 'Medium', enabled: true, autoPublish: true, seoOptimized: true },
        ],
      },
      performance: {
        articlesGenerated: 47,
        totalViews: 125430,
        totalClicks: 3247,
        totalCommissions: 1834.5,
        averageCTR: 2.6,
        topArticle: 'Best Wireless Headphones Under $100',
      },
      isActive: true,
    },
    {
      id: '2',
      name: 'Home Fitness Authority',
      niche: 'Health & Fitness',
      targetKeywords: [
        'home workout equipment',
        'fitness tracker reviews',
        'protein powder comparison',
      ],
      affiliatePrograms: [
        {
          id: 'fitness-affiliate',
          name: 'Fitness Equipment Co.',
          commission: 8.0,
          products: [],
          trackingCode: 'ref=fit123',
        },
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
          <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Content Strategies</h2>
          <p className="text-gray-300">Automated affiliate content generation</p>
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
        {mockStrategies.map(strategy => (
          <div
            key={strategy.id}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-lg border border-cyan-500/30 p-6 hover:border-cyan-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold text-white">{strategy.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      strategy.isActive
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-slate-700/60 text-gray-400 border border-slate-600/50'
                    }`}
                  >
                    {strategy.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
                <p className="text-gray-300 mb-3">{strategy.niche}</p>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-slate-800/60 rounded-lg border border-cyan-500/20">
                    <div className="text-2xl font-bold text-cyan-400">
                      {strategy.performance.articlesGenerated}
                    </div>
                    <div className="text-sm text-gray-400">Articles</div>
                  </div>
                  <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="text-2xl font-bold text-green-400">
                      ${strategy.performance.totalCommissions.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-400">Commissions</div>
                  </div>
                </div>
              </div>

              <button
                className={`p-2 rounded-lg border ${
                  strategy.isActive
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30'
                    : 'bg-slate-700/60 text-gray-400 hover:bg-slate-700 border-slate-600/50'
                }`}
              >
                {strategy.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            {/* Keywords */}
            <div className="mb-4">
              <div className="text-sm font-medium text-cyan-400 mb-2">Target Keywords:</div>
              <div className="flex flex-wrap gap-1">
                {strategy.targetKeywords.slice(0, 3).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded border border-cyan-500/30"
                  >
                    {keyword}
                  </span>
                ))}
                {strategy.targetKeywords.length > 3 && (
                  <span className="px-2 py-1 bg-slate-700/60 text-gray-400 text-xs rounded border border-slate-600/50">
                    +{strategy.targetKeywords.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedStrategy(strategy.id)}
                className="flex-1 bg-cyan-500/20 text-cyan-400 py-2 px-4 rounded-lg hover:bg-cyan-500/30 font-medium text-sm border border-cyan-500/30"
              >
                View Details
              </button>
              <button className="bg-slate-700/60 text-gray-300 py-2 px-4 rounded-lg hover:bg-slate-700 font-medium text-sm border border-slate-600/50">
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
          <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Generated Content</h2>
          <p className="text-gray-300">AI-generated affiliate articles and performance</p>
        </div>
      </div>

      {/* Content Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/60 rounded-lg p-4 border border-cyan-500/30 text-center">
          <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-cyan-400">79</div>
          <div className="text-sm text-gray-400">Articles Published</div>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-4 border border-cyan-500/30 text-center">
          <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-400">214.6K</div>
          <div className="text-sm text-gray-400">Total Views</div>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-4 border border-cyan-500/30 text-center">
          <Link className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-400">5,427</div>
          <div className="text-sm text-gray-400">Affiliate Clicks</div>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-4 border border-cyan-500/30 text-center">
          <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-400">$2,791</div>
          <div className="text-sm text-gray-400">Total Commissions</div>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-lg border border-cyan-500/30">
        <div className="px-6 py-4 border-b border-cyan-500/20">
          <h3 className="text-lg font-semibold text-white">Recent Articles</h3>
        </div>
        <div className="divide-y divide-cyan-500/20">
          {[
            {
              title: 'Best Wireless Gaming Mice for 2024',
              published: '2 hours ago',
              views: 1247,
              clicks: 34,
              commissions: 67.5,
              status: 'live',
            },
            {
              title: 'Budget Laptop Buying Guide Under $500',
              published: '1 day ago',
              views: 3891,
              clicks: 89,
              commissions: 156.25,
              status: 'live',
            },
            {
              title: 'Top 10 Bluetooth Headphones Comparison',
              published: '3 days ago',
              views: 7234,
              clicks: 178,
              commissions: 289.75,
              status: 'live',
            },
          ].map((article, index) => (
            <div key={index} className="px-6 py-4 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-white mb-1">{article.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Published {article.published}</span>
                    <span>{article.views.toLocaleString()} views</span>
                    <span>{article.clicks} clicks</span>
                    <span className="text-green-400 font-medium">${article.commissions}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                    {article.status}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-cyan-400 transition-colors">
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
        <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Performance Analytics</h2>
        <p className="text-gray-300">Track your content performance and revenue</p>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-lg border border-cyan-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend (Last 30 Days)</h3>
        <div className="h-64 bg-slate-900/60 rounded-lg flex items-center justify-center border border-cyan-500/20">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-cyan-400/50 mx-auto mb-2" />
            <p className="text-gray-400">Interactive revenue chart would be displayed here</p>
          </div>
        </div>
      </div>

      {/* Top Performing Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-lg border border-cyan-500/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Keywords</h3>
          <div className="space-y-3">
            {[
              { keyword: 'best gaming mouse', ranking: 3, clicks: 892, revenue: 234.5 },
              { keyword: 'wireless headphones review', ranking: 5, clicks: 634, revenue: 178.25 },
              { keyword: 'laptop buying guide', ranking: 7, clicks: 445, revenue: 123.75 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-white">{item.keyword}</div>
                  <div className="text-sm text-gray-400">
                    Rank #{item.ranking} • {item.clicks} clicks
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-400">${item.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-lg border border-cyan-500/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Converting Articles</h3>
          <div className="space-y-3">
            {[
              { title: 'Best Budget Gaming Setup 2024', ctr: 3.2, revenue: 345.75 },
              { title: 'Wireless Headphones Comparison', ctr: 2.8, revenue: 289.5 },
              { title: 'Home Office Equipment Guide', ctr: 2.4, revenue: 198.25 },
            ].map((item, index) => (
              <div key={index} className="py-2">
                <div className="font-medium text-white mb-1">{item.title}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">CTR: {item.ctr}%</span>
                  <span className="font-semibold text-green-400">${item.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchedulingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Smart Scheduling System</h2>
          <p className="text-gray-300">Automated batch content generation and publishing</p>
        </div>
        {isPremium && (
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            <Plus className="w-4 h-4 mr-2" />
            New Schedule
          </button>
        )}
      </div>

      {!isPremium && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-l-4 border-yellow-500/50 p-4 rounded-lg">
          <div className="flex items-center">
            <Crown className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-yellow-300 font-medium">
              Premium Feature - Schedule automated content generation and publishing
            </span>
          </div>
        </div>
      )}

      {/* Batch Generation Settings */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-lg border border-cyan-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-cyan-400" />
          Batch Content Generation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-lg border border-purple-500/30">
            <div className="text-sm text-gray-400 mb-1">Batch Size</div>
            <div className="text-2xl font-bold text-purple-400">5-10</div>
            <div className="text-xs text-gray-400 mt-1">Articles per batch</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
            <div className="text-sm text-gray-400 mb-1">Next Batch</div>
            <div className="text-xl font-bold text-green-400">Tonight 2:00 AM</div>
            <div className="text-xs text-gray-400 mt-1">Automated generation</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/30">
            <div className="text-sm text-gray-400 mb-1">This Month</div>
            <div className="text-2xl font-bold text-blue-400">47</div>
            <div className="text-xs text-gray-400 mt-1">Articles generated</div>
          </div>
        </div>

        {/* Scheduling Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/60 rounded-lg border border-cyan-500/20">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-cyan-400 mr-3" />
              <div>
                <div className="font-medium text-white">Nightly Batch Generation</div>
                <div className="text-sm text-gray-400">Generates 5-10 articles every night at 2:00 AM</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium border border-green-500/30">Active</span>
              <button className="p-2 text-gray-400 hover:text-cyan-400 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/60 rounded-lg border border-cyan-500/20">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 text-cyan-400 mr-3" />
              <div>
                <div className="font-medium text-white">Content Refresh Automator</div>
                <div className="text-sm text-gray-400">Re-runs old articles through AI for updates every 30 days</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium border border-green-500/30">Active</span>
              <button className="p-2 text-gray-400 hover:text-cyan-400 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Publishing Platforms */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-lg border border-cyan-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Share2 className="w-5 h-5 mr-2 text-green-400" />
          Auto-Publish Platforms
        </h3>
        <div className="space-y-3">
          {[
            { name: 'WordPress', enabled: true, articles: 32, autoPublish: true, seoOptimized: true },
            { name: 'Medium', enabled: true, articles: 28, autoPublish: true, seoOptimized: true },
            { name: 'Substack', enabled: false, articles: 0, autoPublish: false, seoOptimized: false },
          ].map((platform, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-cyan-500/20 rounded-lg bg-slate-800/40">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${platform.enabled ? 'bg-green-400' : 'bg-gray-500'}`} />
                <div>
                  <div className="font-medium text-white">{platform.name}</div>
                  <div className="text-sm text-gray-400">
                    {platform.articles} articles published • {platform.autoPublish ? 'Auto-publish ON' : 'Manual'} • {platform.seoOptimized ? 'SEO Optimized' : 'Not optimized'}
                  </div>
                </div>
              </div>
              <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                Configure
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Scheduled Jobs */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-lg border border-cyan-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Scheduled Jobs</h3>
        <div className="space-y-2">
          {[
            { time: 'Tonight 2:00 AM', task: 'Generate 5 articles: Tech Gadgets Review Hub', status: 'scheduled' },
            { time: 'Tomorrow 9:00 AM', task: 'Publish batch to WordPress & Medium', status: 'scheduled' },
            { time: 'Jan 15, 2:00 AM', task: 'Content refresh: Top 10 articles', status: 'scheduled' },
          ].map((job, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-cyan-500/20">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-cyan-400 mr-3" />
                <div>
                  <div className="font-medium text-white">{job.task}</div>
                  <div className="text-sm text-gray-400">{job.time}</div>
                </div>
              </div>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                {job.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLinkManagerTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Affiliate Link Manager</h2>
          <p className="text-gray-300">Auto-inject tracking codes, A/B test placements, track commissions</p>
        </div>
        {isPremium && (
          <button className="flex items-center px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 font-medium border border-cyan-500/30">
            <Plus className="w-4 h-4 mr-2" />
            Add Tracking Code
          </button>
        )}
      </div>

      {!isPremium && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-l-4 border-yellow-500/50 p-4 rounded-lg">
          <div className="flex items-center">
            <Crown className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-yellow-300 font-medium">
              Premium Feature - Advanced affiliate link management and A/B testing
            </span>
          </div>
        </div>
      )}

      {/* Affiliate Programs */}
      {mockStrategies.map(strategy => (
        <div key={strategy.id} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-lg border border-cyan-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
            <span className={`px-3 py-1 text-xs rounded-full border ${
              strategy.affiliatePrograms[0]?.autoInject 
                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                : 'bg-slate-700/60 text-gray-400 border-slate-600/50'
            }`}>
              {strategy.affiliatePrograms[0]?.autoInject ? 'Auto-Inject ON' : 'Manual'}
            </span>
          </div>

          {strategy.affiliatePrograms.map(program => (
            <div key={program.id} className="space-y-4">
              <div className="p-4 bg-slate-800/60 rounded-lg border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-white">{program.name}</div>
                  <div className="text-sm text-green-400 font-semibold">{program.commission}% commission</div>
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  Tracking Code: <code className="bg-slate-900/60 px-2 py-1 rounded border border-cyan-500/20 text-cyan-400">{program.trackingCode}</code>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={program.autoInject} 
                      className="mr-2"
                      disabled={!isPremium}
                    />
                    <span className="text-sm text-gray-300">Auto-inject tracking codes</span>
                  </label>
                </div>
              </div>

              {/* A/B Test Placements */}
              {program.linkPlacements && program.linkPlacements.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-cyan-400 mb-3">A/B Test Placements</h4>
                  <div className="space-y-2">
                    {program.linkPlacements.map(placement => (
                      <div key={placement.id} className="flex items-center justify-between p-3 border border-cyan-500/20 rounded-lg bg-slate-800/40">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            placement.ctr >= 3 ? 'bg-green-400' : 
                            placement.ctr >= 2 ? 'bg-yellow-400' : 'bg-red-400'
                          }`} />
                          <div>
                            <div className="font-medium text-white">{placement.name}</div>
                            <div className="text-xs text-gray-400">
                              {placement.position} • {placement.style} • CTR: {placement.ctr}%
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-cyan-400">{placement.clicks} clicks</div>
                          <div className="text-xs text-gray-400">{placement.conversions} conversions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <div className="text-xs text-blue-300">
                      <strong>Top Performer:</strong> {program.linkPlacements.reduce((top, p) => 
                        p.ctr > (top?.ctr || 0) ? p : top
                      )?.name} ({Math.max(...program.linkPlacements.map(p => p.ctr)).toFixed(1)}% CTR)
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Commission Tracking */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-lg border border-cyan-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Commission Tracking</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="text-sm text-gray-400 mb-1">Total Commissions</div>
            <div className="text-2xl font-bold text-green-400">$2,791</div>
            <div className="text-xs text-gray-400 mt-1">Last 30 days</div>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <div className="text-sm text-gray-400 mb-1">Total Clicks</div>
            <div className="text-2xl font-bold text-blue-400">5,427</div>
            <div className="text-xs text-gray-400 mt-1">Across all links</div>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <div className="text-sm text-gray-400 mb-1">Conversion Rate</div>
            <div className="text-2xl font-bold text-purple-400">2.8%</div>
            <div className="text-xs text-gray-400 mt-1">Average CTR</div>
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
            <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Auto-Affiliate Content Factory</h1>
            <p className="text-gray-300">AI-powered affiliate content generation on autopilot</p>
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
      <div className="border-b border-cyan-500/20 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'strategies', label: 'Content Strategies', icon: Target },
            { id: 'content', label: 'Generated Content', icon: FileText },
            { id: 'scheduling', label: 'Smart Scheduling', icon: Calendar },
            { id: 'links', label: 'Link Manager', icon: Link },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30'
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
        {activeTab === 'scheduling' && renderSchedulingTab()}
        {activeTab === 'links' && renderLinkManagerTab()}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Settings</h3>
            <p className="text-gray-300">
              Configure affiliate programs, content templates, and automation settings
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoAffiliateContentFactory;
