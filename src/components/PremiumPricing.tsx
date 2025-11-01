/**
 * Premium Pricing Component
 * 
 * Showcases high-value premium tiers that justify top-dollar pricing
 * Focus on ROI and income-generating potential
 */

import React, { useState } from 'react';
import { 
  Crown, 
  Check, 
  Shield
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  popular?: boolean;
  features: PricingFeature[];
  roiHighlight: string;
  ctaText: string;
  badge?: string;
  color: string;
}

interface PricingFeature {
  name: string;
  included: boolean;
  limit?: string;
  premium?: boolean;
}

const PremiumPricing: React.FC<{ onSelectPlan?: (planId: string) => void }> = ({ onSelectPlan }) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const tiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: billingPeriod === 'monthly' ? 47 : 470,
      period: billingPeriod === 'monthly' ? 'month' : 'year',
      features: [
        { name: 'Basic AI Code Generation', included: true, limit: '50 requests/month' },
        { name: 'Simple Project Templates', included: true, limit: '5 templates' },
        { name: 'Standard Analytics', included: true },
        { name: 'Community Support', included: true },
        { name: 'Business Model Generator', included: false, premium: true },
        { name: 'Auto-Affiliate Content Factory', included: false, premium: true },
        { name: 'Advanced Trading Bots', included: false, premium: true },
        { name: 'White-Label Platform', included: false, premium: true },
      ],
      roiHighlight: 'Perfect for getting started with AI-powered development',
      ctaText: 'Start Building',
      color: 'blue',
    },
    {
      id: 'business',
      name: 'Business Pro',
      price: billingPeriod === 'monthly' ? 97 : 970,
      period: billingPeriod === 'monthly' ? 'month' : 'year',
      popular: true,
      badge: 'Most Popular',
      features: [
        { name: 'Unlimited AI Code Generation', included: true },
        { name: 'Business Model Generator', included: true, premium: true },
        { name: 'Advanced Project Templates', included: true, limit: '50+ templates' },
        { name: 'Revenue Analytics Dashboard', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Auto-Affiliate Content Factory', included: false, premium: true },
        { name: 'Advanced Trading Bots', included: false, premium: true },
        { name: 'White-Label Platform', included: false, premium: true },
      ],
      roiHighlight: 'Generate complete business models • ROI: $5K-50K potential',
      ctaText: 'Unlock Business AI',
      color: 'purple',
    },
    {
      id: 'income-factory',
      name: 'Income Factory',
      price: billingPeriod === 'monthly' ? 197 : 1970,
      period: billingPeriod === 'monthly' ? 'month' : 'year',
      features: [
        { name: 'Everything in Business Pro', included: true },
        { name: 'Auto-Affiliate Content Factory', included: true, premium: true },
        { name: 'Advanced Trading Bot Builder', included: true, premium: true },
        { name: 'SEO Content Automation', included: true },
        { name: 'Revenue Stream Optimizer', included: true },
        { name: 'Performance Tracking Suite', included: true },
        { name: 'Custom Integrations', included: true },
        { name: 'White-Label Platform', included: false, premium: true },
      ],
      roiHighlight: 'Automated content + trading • ROI: $10K-200K+ potential',
      ctaText: 'Launch Income Streams',
      color: 'green',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingPeriod === 'monthly' ? 497 : 4970,
      period: billingPeriod === 'monthly' ? 'month' : 'year',
      badge: 'Full Suite',
      features: [
        { name: 'Everything in Income Factory', included: true },
        { name: 'White-Label Platform Rights', included: true, premium: true },
        { name: 'Custom AI Model Training', included: true },
        { name: 'Dedicated Success Manager', included: true },
        { name: 'Custom Development Hours', included: true, limit: '10 hours/month' },
        { name: 'API Access & Webhooks', included: true },
        { name: 'Multi-User Team Access', included: true },
        { name: 'Revenue Share Program', included: true },
      ],
      roiHighlight: 'White-label + revenue sharing • ROI: $50K-1M+ potential',
      ctaText: 'Scale Your Empire',
      color: 'gold',
    },
  ];

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'button') => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        button: 'bg-purple-600 hover:bg-purple-700',
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        button: 'bg-green-600 hover:bg-green-700',
      },
      gold: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
        button: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
      },
    };
    return colors[color as keyof typeof colors]?.[type] || colors.blue[type];
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-6">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Premium AI Income Generator
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Transform DLX Studios into your personal income-generating factory. 
          Each tier is designed to pay for itself within weeks through automated revenue streams.
        </p>

        {/* ROI Highlight Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">$50K+</div>
              <div className="text-sm text-gray-600">Average User Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">3-6 weeks</div>
              <div className="text-sm text-gray-600">Typical ROI Timeline</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-gray-600">Automated Operation</div>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          {billingPeriod === 'yearly' && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Save 16%
            </span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative rounded-2xl border-2 p-8 shadow-lg ${
              tier.popular 
                ? 'border-purple-500 shadow-purple-200' 
                : getColorClasses(tier.color, 'border')
            } ${tier.popular ? 'scale-105' : ''} transition-all hover:shadow-xl`}
          >
            {/* Badge */}
            {tier.badge && (
              <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium ${
                tier.popular 
                  ? 'bg-purple-500 text-white'
                  : `${getColorClasses(tier.color, 'bg')} ${getColorClasses(tier.color, 'text')}`
              }`}>
                {tier.badge}
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
                <span className="text-gray-500">/{tier.period}</span>
              </div>
              <p className={`text-sm font-medium ${getColorClasses(tier.color, 'text')}`}>
                {tier.roiHighlight}
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {feature.included ? (
                      <Check className={`h-4 w-4 ${feature.premium ? 'text-purple-500' : 'text-green-500'}`} />
                    ) : (
                      <div className="h-4 w-4 border border-gray-300 rounded" />
                    )}
                  </div>
                  <div className="ml-3">
                    <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'} ${feature.premium ? 'font-semibold' : ''}`}>
                      {feature.name}
                      {feature.premium && (
                        <Crown className="inline h-3 w-3 ml-1 text-purple-500" />
                      )}
                    </span>
                    {feature.limit && (
                      <div className="text-xs text-gray-500">{feature.limit}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              onClick={() => onSelectPlan?.(tier.id)}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                getColorClasses(tier.color, 'button')
              }`}
            >
              {tier.ctaText}
            </button>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Detailed Feature Comparison</h2>
          <p className="text-gray-600">Everything you need to build automated income streams</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Starter</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Business Pro</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Income Factory</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                {
                  feature: 'AI Business Model Generator',
                  starter: false,
                  business: true,
                  income: true,
                  enterprise: true,
                  highlight: true,
                },
                {
                  feature: 'Auto-Affiliate Content Factory',
                  starter: false,
                  business: false,
                  income: true,
                  enterprise: true,
                  highlight: true,
                },
                {
                  feature: 'Advanced Trading Bot Builder',
                  starter: false,
                  business: false,
                  income: true,
                  enterprise: true,
                  highlight: true,
                },
                {
                  feature: 'White-Label Platform Rights',
                  starter: false,
                  business: false,
                  income: false,
                  enterprise: true,
                  highlight: true,
                },
                {
                  feature: 'Revenue Analytics & Tracking',
                  starter: 'Basic',
                  business: 'Advanced',
                  income: 'Premium',
                  enterprise: 'Enterprise',
                },
                {
                  feature: 'AI Code Generation Requests',
                  starter: '50/month',
                  business: 'Unlimited',
                  income: 'Unlimited',
                  enterprise: 'Unlimited',
                },
                {
                  feature: 'Project Templates',
                  starter: '5',
                  business: '50+',
                  income: '100+',
                  enterprise: 'Custom',
                },
                {
                  feature: 'Support Level',
                  starter: 'Community',
                  business: 'Priority',
                  income: 'Premium',
                  enterprise: 'Dedicated Manager',
                },
              ].map((row, index) => (
                <tr key={index} className={row.highlight ? 'bg-purple-50' : ''}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center">
                    {row.feature}
                    {row.highlight && <Crown className="ml-2 h-4 w-4 text-purple-500" />}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {typeof row.starter === 'boolean' ? (
                      row.starter ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : '–'
                    ) : (
                      row.starter
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {typeof row.business === 'boolean' ? (
                      row.business ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : '–'
                    ) : (
                      row.business
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {typeof row.income === 'boolean' ? (
                      row.income ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : '–'
                    ) : (
                      row.income
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {typeof row.enterprise === 'boolean' ? (
                      row.enterprise ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : '–'
                    ) : (
                      row.enterprise
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Stories */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Sarah K.',
              result: '$34K in 3 months',
              method: 'Affiliate content automation',
              plan: 'Income Factory',
            },
            {
              name: 'Mike R.',
              result: '$127K yearly revenue',
              method: 'White-label AI platform',
              plan: 'Enterprise',
            },
            {
              name: 'Alex T.',
              result: '$8K monthly passive',
              method: 'Trading bot + business models',
              plan: 'Business Pro',
            },
          ].map((story, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-2xl font-bold text-green-600 mb-2">{story.result}</div>
              <div className="font-medium text-gray-900 mb-1">{story.name}</div>
              <div className="text-sm text-gray-600 mb-3">{story.method}</div>
              <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full inline-block">
                {story.plan}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Money-Back Guarantee */}
      <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center">
        <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Revenue Guarantee</h3>
        <p className="text-lg text-gray-600 mb-4">
          Generate at least 2x your subscription cost in revenue within 90 days, or get a full refund.
        </p>
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
          <span>✓ 90-day money back guarantee</span>
          <span>✓ No setup fees</span>
          <span>✓ Cancel anytime</span>
        </div>
      </div>
    </div>
  );
};

export default PremiumPricing;