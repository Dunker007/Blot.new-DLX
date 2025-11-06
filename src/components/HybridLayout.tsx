/**
 * Hybrid Hub & Flow Layout - Enhanced
 * Combines Hub & Spoke with Flow Tabs navigation
 * Dynamic hub that updates based on selected category
 * Premium polish with smooth animations and better interactions
 */

import { ReactNode, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Brain,
  Code2,
  FlaskConical,
  Network,
  Lightbulb,
  Settings,
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  Activity,
  Mic,
  Image,
  Flag,
  DollarSign,
  TrendingUp,
  Coins,
  Home,
  Sparkles,
  BarChart3,
  Cpu,
  ShoppingCart,
  Code,
  Wand2,
  ArrowLeft,
} from 'lucide-react';
import { DLXLogo } from './DLXLogo';
import { LocalStorageManager } from '../utils/localStorage';
import { getLabById } from '../modules/labs/labsConfig';
import ProjectFlowCompact from './project-flow/ProjectFlowCompact';
import '../styles/dlx-theme.css';

interface HybridLayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onLabChange?: (labId: string | null) => void;
}

interface QuickAccessItem {
  id: string;
  icon: typeof LayoutDashboard;
  title: string;
  viewId: string;
  color: string;
}

interface TabData {
  id: string;
  icon: typeof LayoutDashboard;
  title: string;
  count: string;
  views: string[];
  hubTitle: string;
  hubSubtitle: string;
  hubStats: { value1: string; label1: string; value2: string; label2: string };
  iconColor: string;
  isTopTab?: boolean; // Special styling for top 2 tabs
  isSplitScreen?: boolean; // Enable split-screen layout for this tab
  autoOpenView?: boolean; // Auto-open the first view when tab is clicked (for single-view tabs)
}

const tabConfig: TabData[] = [
  {
    id: 'home',
    icon: Home,
    title: 'Home',
    count: 'Core Workspace',
    views: ['dashboard', 'project-flow'],
    hubTitle: 'Command Center',
    hubSubtitle: 'Core workspace & overview',
    hubStats: { value1: '2', label1: 'Core', value2: 'Active', label2: 'Status' },
    iconColor: 'text-cyan-400',
    isTopTab: true, // Special styling flag
    isSplitScreen: true, // Enable split-screen layout for home tab
  },
  {
    id: 'vibe',
    icon: Sparkles,
    title: 'Vibe.d.e',
    count: 'Natural Code',
    views: ['vibe-de'],
    hubTitle: 'DLX Vibe Development Environment',
    hubSubtitle: 'Natural Language Coding Without Code',
    hubStats: { value1: 'AI', label1: 'Powered', value2: 'Live', label2: 'Preview' },
    iconColor: 'text-pink-400',
    isTopTab: true, // Special styling flag
    autoOpenView: true, // Open directly into Vibe.d.e
  },
  {
    id: 'labs',
    icon: FlaskConical,
    title: 'Labs',
    count: '11 Specialized',
    views: ['labs', 'aura', 'forge', 'review', 'data-weave', 'signal', 'creator', 'comms', 'dataverse', 'system-matrix'],
    hubTitle: 'AI Labs',
    hubSubtitle: '11 Specialized Labs',
    hubStats: { value1: '6', label1: 'Active', value2: '5', label2: 'Preview' },
    iconColor: 'text-purple-400',
  },
  {
    id: 'ideas',
    icon: Lightbulb,
    title: 'Ideas',
    count: 'Lab',
    views: ['idea-lab'],
    hubTitle: 'Idea Lab',
    hubSubtitle: 'Concept Development',
    hubStats: { value1: 'Active', label1: 'Status', value2: 'Creative', label2: 'Mode' },
    iconColor: 'text-yellow-400',
    autoOpenView: true, // Open directly into Idea Lab
  },
  {
    id: 'revenue',
    icon: DollarSign,
    title: 'Revenue',
    count: '3 Streams',
    views: ['business-generator', 'affiliate-factory', 'crypto'],
    hubTitle: 'Revenue Hub',
    hubSubtitle: 'Passive Income Streams',
    hubStats: { value1: '3', label1: 'Streams', value2: '$2.4K', label2: 'Monthly' },
    iconColor: 'text-green-400',
  },
  {
    id: 'dev',
    icon: Code2,
    title: 'Development',
    count: 'Dev Tools',
    views: ['monaco-editor'],
    hubTitle: 'Dev Tools',
    hubSubtitle: 'Development workspace',
    hubStats: { value1: '1', label1: 'Tool', value2: 'Ready', label2: 'Status' },
    iconColor: 'text-orange-400',
  },
  {
    id: 'ai',
    icon: Brain,
    title: 'AI Tools',
    count: 'Multi-Modal',
    views: ['mind-map', 'audio-transcriber', 'image-analysis'],
    hubTitle: 'AI Tools',
    hubSubtitle: 'Multi-Modal AI',
    hubStats: { value1: '3', label1: 'Modes', value2: 'Active', label2: 'Status' },
    iconColor: 'text-pink-400',
  },
  {
    id: 'crypto',
    icon: Coins,
    title: 'Crypto',
    count: 'Trading Lab',
    views: ['crypto'],
    hubTitle: 'Crypto Lab',
    hubSubtitle: 'Market Analysis & Trading',
    hubStats: { value1: 'Live', label1: 'Status', value2: '24/7', label2: 'Market' },
    iconColor: 'text-yellow-400',
  },
  {
    id: 'system',
    icon: Settings,
    title: 'System',
    count: 'Config',
    views: ['settings', 'feature-flags', 'layout-playground', 'connections'],
    hubTitle: 'System',
    hubSubtitle: 'Settings & configuration',
    hubStats: { value1: '99.9%', label1: 'Uptime', value2: 'Active', label2: 'Status' },
    iconColor: 'text-blue-400',
  },
];

interface SpokeItem {
  id: string;
  icon: typeof LayoutDashboard;
  title: string;
  desc: string;
  category: string;
  position: number;
}

const spokes: SpokeItem[] = [
  // Home spokes - Core workspace
  { id: 'dashboard', icon: BarChart3, title: 'Dashboard', desc: 'Overview', category: 'home', position: 1 },
  { id: 'project-flow', icon: Network, title: 'Project Flow', desc: 'Ideas & Tasks', category: 'home', position: 2 },
  { id: 'connections', icon: Network, title: 'Connections', desc: 'Services', category: 'system', position: 5 },
  // Labs spokes - All specialized labs (removed redundant 'labs' hub)
  { id: 'aura', icon: Brain, title: 'AURA', desc: 'Interface', category: 'labs', position: 1 },
  { id: 'forge', icon: Sparkles, title: 'Agent Forge', desc: 'Create Agents', category: 'labs', position: 2 },
  { id: 'review', icon: Code2, title: 'Code Review', desc: 'AI Analysis', category: 'labs', position: 3 },
  { id: 'data-weave', icon: Network, title: 'Data Weave', desc: 'Multi-Agent', category: 'labs', position: 4 },
  { id: 'system-matrix', icon: Cpu, title: 'System Matrix', desc: 'Architecture', category: 'labs', position: 5 },
  { id: 'signal', icon: Activity, title: 'Signal', desc: 'Research', category: 'labs', position: 6 },
  { id: 'creator', icon: Wand2, title: 'Creator', desc: 'Studio', category: 'labs', position: 7 },
  { id: 'comms', icon: MessageSquare, title: 'Comms', desc: 'Channel', category: 'labs', position: 8 },
  { id: 'dataverse', icon: Network, title: 'Dataverse', desc: 'RAG System', category: 'labs', position: 9 },
  { id: 'crypto', icon: Coins, title: 'Crypto Lab', desc: 'Market Data', category: 'crypto', position: 1 },
  // Revenue spokes
  { id: 'business-generator', icon: DollarSign, title: 'Business Gen', desc: 'ROI Models', category: 'revenue', position: 1 },
  { id: 'affiliate-factory', icon: TrendingUp, title: 'Affiliate', desc: 'Factory', category: 'revenue', position: 2 },
  { id: 'crypto-revenue', icon: Coins, title: 'Crypto Lab', desc: 'Trading', category: 'revenue', position: 3 },
  // Dev spokes
  { id: 'monaco-editor', icon: Code2, title: 'Code Editor', desc: 'Multi-file IDE', category: 'dev', position: 1 },
  { id: 'idea-lab', icon: Lightbulb, title: 'Idea Lab', desc: 'Concepts', category: 'ideas', position: 1 },
  { id: 'vibe-de', icon: Sparkles, title: 'Vibe.d.e', desc: 'Natural Code', category: 'vibe', position: 1 },
  // AI spokes
  { id: 'mind-map', icon: Network, title: 'Mind Map', desc: 'Visual', category: 'ai', position: 1 },
  { id: 'audio-transcriber', icon: Mic, title: 'Audio', desc: 'Transcribe', category: 'ai', position: 2 },
  { id: 'image-analysis', icon: Image, title: 'Image', desc: 'Analysis', category: 'ai', position: 3 },
  // System spokes
  { id: 'settings', icon: Settings, title: 'Settings', desc: 'Config', category: 'system', position: 1 },
  { id: 'feature-flags', icon: Flag, title: 'Feature Flags', desc: 'Toggle', category: 'system', position: 2 },
  { id: 'layout-playground', icon: LayoutDashboard, title: 'Layout', desc: 'Playground', category: 'system', position: 3 },
];

// Topical header configuration based on current view
const getTopicalHeader = (view: string, activeTab?: string) => {
  const headers: Record<string, {
    title: string;
    subtitle: string;
    icon: React.ComponentType<any>;
    iconColor: string;
    stats: { label: string; value: string; color: string }[];
  }> = {
    // Tab-specific headers (when tab is active but no specific view selected)
    'home-tab': {
      title: 'Command Center',
      subtitle: 'Core workspace & overview',
      icon: Home,
      iconColor: 'text-cyan-400',
      stats: [
        { label: 'Core', value: '3', color: 'text-cyan-400' },
        { label: 'Status', value: 'Active', color: 'text-emerald-400' },
      ],
    },
    'labs-tab': {
      title: 'AI Labs',
      subtitle: '11 Specialized Labs',
      icon: FlaskConical,
      iconColor: 'text-purple-400',
      stats: [
        { label: 'Active', value: '6', color: 'text-purple-400' },
        { label: 'Preview', value: '5', color: 'text-cyan-400' },
      ],
    },
    'revenue-tab': {
      title: 'Revenue Hub',
      subtitle: 'Passive Income Streams',
      icon: DollarSign,
      iconColor: 'text-green-400',
      stats: [
        { label: 'Streams', value: '3', color: 'text-green-400' },
        { label: 'Monthly', value: '$2.4K', color: 'text-emerald-400' },
      ],
    },
    'dev-tab': {
      title: 'Dev Tools',
      subtitle: 'Development workspace',
      icon: Code2,
      iconColor: 'text-orange-400',
      stats: [
        { label: 'Tools', value: '3', color: 'text-orange-400' },
        { label: 'Status', value: 'Ready', color: 'text-emerald-400' },
      ],
    },
    'ai-tab': {
      title: 'AI Tools',
      subtitle: 'Multi-Modal AI',
      icon: Brain,
      iconColor: 'text-pink-400',
      stats: [
        { label: 'Modes', value: '3', color: 'text-pink-400' },
        { label: 'Status', value: 'Active', color: 'text-emerald-400' },
      ],
    },
    'system-tab': {
      title: 'System',
      subtitle: 'Settings & configuration',
      icon: Settings,
      iconColor: 'text-blue-400',
      stats: [
        { label: 'Uptime', value: '99.9%', color: 'text-blue-400' },
        { label: 'Status', value: 'Active', color: 'text-emerald-400' },
      ],
    },
    'ideas-tab': {
      title: 'Idea Lab',
      subtitle: 'Concept Development & Management',
      icon: Lightbulb,
      iconColor: 'text-yellow-400',
      stats: [
        { label: 'Status', value: 'Active', color: 'text-yellow-400' },
        { label: 'Mode', value: 'Creative', color: 'text-cyan-400' },
      ],
    },
    'vibe-tab': {
      title: 'DLX Vibe Development Environment',
      subtitle: 'Natural Language Coding Without Code',
      icon: Sparkles,
      iconColor: 'text-pink-400',
      stats: [
        { label: 'Powered', value: 'AI', color: 'text-pink-400' },
        { label: 'Preview', value: 'Live', color: 'text-cyan-400' },
      ],
    },
    dashboard: {
      title: 'AI Neural Core',
      subtitle: 'Real-time processing visualization',
      icon: Brain,
      iconColor: 'text-cyan-400',
      stats: [
        { label: 'Status', value: 'Active', color: 'text-emerald-400' },
        { label: 'Nodes', value: '1,247', color: 'text-cyan-400' },
      ],
    },
    'business-generator': {
      title: 'Business Generator',
      subtitle: 'ROI models & revenue strategies',
      icon: DollarSign,
      iconColor: 'text-green-400',
      stats: [
        { label: 'Models', value: '12', color: 'text-green-400' },
        { label: 'Revenue', value: '$1,247', color: 'text-emerald-400' },
      ],
    },
    'affiliate-factory': {
      title: 'Affiliate Factory',
      subtitle: 'Automated content generation',
      icon: ShoppingCart,
      iconColor: 'text-orange-400',
      stats: [
        { label: 'Active', value: '24', color: 'text-orange-400' },
        { label: 'Revenue', value: '$892', color: 'text-emerald-400' },
      ],
    },
    'monaco-editor': {
      title: 'Code Editor',
      subtitle: 'AI-powered development',
      icon: Code,
      iconColor: 'text-blue-400',
      stats: [
        { label: 'Files', value: '8', color: 'text-blue-400' },
        { label: 'Lines', value: '2.4k', color: 'text-cyan-400' },
      ],
    },
    'project-flow': {
      title: 'Project Flow',
      subtitle: 'Unified Ideas & Tasks',
      icon: Network,
      iconColor: 'text-cyan-400',
      stats: [
        { label: 'Items', value: '24', color: 'text-cyan-400' },
        { label: 'Active', value: '12', color: 'text-emerald-400' },
      ],
    },
    tasks: {
      title: 'Project Flow',
      subtitle: 'Unified Ideas & Tasks',
      icon: Network,
      iconColor: 'text-cyan-400',
      stats: [
        { label: 'Items', value: '24', color: 'text-cyan-400' },
        { label: 'Active', value: '12', color: 'text-emerald-400' },
      ],
    },
    crypto: {
      title: 'Crypto Lab',
      subtitle: 'Market analysis & trading',
      icon: Coins,
      iconColor: 'text-amber-400',
      stats: [
        { label: 'Portfolio', value: '$24k', color: 'text-amber-400' },
        { label: 'Trend', value: '+12%', color: 'text-emerald-400' },
      ],
    },
    labs: {
      title: 'Labs',
      subtitle: 'AI-powered experiments',
      icon: FlaskConical,
      iconColor: 'text-purple-400',
      stats: [
        { label: 'Active', value: '8', color: 'text-purple-400' },
        { label: 'Results', value: '1.2k', color: 'text-cyan-400' },
      ],
    },
    'mind-map': {
      title: 'Mind Map',
      subtitle: 'Visual idea organization',
      icon: Network,
      iconColor: 'text-pink-400',
      stats: [
        { label: 'Nodes', value: '47', color: 'text-pink-400' },
        { label: 'Connections', value: '89', color: 'text-purple-400' },
      ],
    },
    settings: {
      title: 'Settings',
      subtitle: 'System configuration',
      icon: Settings,
      iconColor: 'text-gray-400',
      stats: [
        { label: 'Modules', value: '12', color: 'text-gray-400' },
        { label: 'Active', value: '8', color: 'text-emerald-400' },
      ],
    },
    projects: {
      title: 'Projects',
      subtitle: 'Project management & templates',
      icon: FolderKanban,
      iconColor: 'text-blue-400',
      stats: [
        { label: 'Active', value: '7', color: 'text-blue-400' },
        { label: 'Total', value: '24', color: 'text-cyan-400' },
      ],
    },
    connections: {
      title: 'Connections',
      subtitle: 'System & service connections',
      icon: Activity,
      iconColor: 'text-green-400',
      stats: [
        { label: 'Connected', value: '5', color: 'text-green-400' },
        { label: 'Status', value: 'Online', color: 'text-emerald-400' },
      ],
    },
    'feature-flags': {
      title: 'Feature Flags',
      subtitle: 'Toggle features & experiments',
      icon: Flag,
      iconColor: 'text-purple-400',
      stats: [
        { label: 'Active', value: '18', color: 'text-purple-400' },
        { label: 'Preview', value: '6', color: 'text-cyan-400' },
      ],
    },
    'idea-lab': {
      title: 'Idea Lab',
      subtitle: 'Ideas & concept management',
      icon: Lightbulb,
      iconColor: 'text-yellow-400',
      stats: [
        { label: 'Ideas', value: '42', color: 'text-yellow-400' },
        { label: 'Active', value: '12', color: 'text-emerald-400' },
      ],
    },
    'vibe-de': {
      title: 'DLX Vibe.d.e',
      subtitle: 'Natural Language Coding Without Code',
      icon: Sparkles,
      iconColor: 'text-pink-400',
      stats: [
        { label: 'Models', value: '5', color: 'text-pink-400' },
        { label: 'Status', value: 'Ready', color: 'text-cyan-400' },
      ],
    },
    'audio-transcriber': {
      title: 'Audio Transcriber',
      subtitle: 'Speech to text transcription',
      icon: Mic,
      iconColor: 'text-pink-400',
      stats: [
        { label: 'Sessions', value: '8', color: 'text-pink-400' },
        { label: 'Accuracy', value: '98%', color: 'text-emerald-400' },
      ],
    },
    'image-analysis': {
      title: 'Image Analysis',
      subtitle: 'AI-powered image recognition',
      icon: Image,
      iconColor: 'text-indigo-400',
      stats: [
        { label: 'Analyzed', value: '156', color: 'text-indigo-400' },
        { label: 'Today', value: '12', color: 'text-cyan-400' },
      ],
    },
    'layout-playground': {
      title: 'Layout Playground',
      subtitle: 'Test & experiment with layouts',
      icon: LayoutDashboard,
      iconColor: 'text-cyan-400',
      stats: [
        { label: 'Layouts', value: '4', color: 'text-cyan-400' },
        { label: 'Active', value: '1', color: 'text-emerald-400' },
      ],
    },
    // Individual Lab Headers
    'aura': {
      title: 'AURA Interface',
      subtitle: 'Cognitive AI assistant',
      icon: Brain,
      iconColor: 'text-cyan-400',
      stats: [
        { label: 'Status', value: 'Active', color: 'text-emerald-400' },
        { label: 'Sessions', value: '42', color: 'text-cyan-400' },
      ],
    },
    'forge': {
      title: 'Agent Forge',
      subtitle: 'Create & manage AI agents',
      icon: Sparkles,
      iconColor: 'text-purple-400',
      stats: [
        { label: 'Agents', value: '12', color: 'text-purple-400' },
        { label: 'Active', value: '8', color: 'text-emerald-400' },
      ],
    },
    'review': {
      title: 'Code Review Lab',
      subtitle: 'AI-powered code analysis',
      icon: Code2,
      iconColor: 'text-blue-400',
      stats: [
        { label: 'Reviews', value: '24', color: 'text-blue-400' },
        { label: 'Issues', value: '8', color: 'text-yellow-400' },
      ],
    },
    'data-weave': {
      title: 'Data Weave Lab',
      subtitle: 'Multi-agent data processing',
      icon: Network,
      iconColor: 'text-green-400',
      stats: [
        { label: 'Agents', value: '5', color: 'text-green-400' },
        { label: 'Processed', value: '1.2k', color: 'text-cyan-400' },
      ],
    },
    'system-matrix': {
      title: 'System Matrix Lab',
      subtitle: 'Architecture & design tools',
      icon: Cpu,
      iconColor: 'text-orange-400',
      stats: [
        { label: 'Systems', value: '18', color: 'text-orange-400' },
        { label: 'Active', value: '12', color: 'text-emerald-400' },
      ],
    },
    'signal': {
      title: 'Signal Lab',
      subtitle: 'Signal processing & analysis',
      icon: Activity,
      iconColor: 'text-pink-400',
      stats: [
        { label: 'Signals', value: '156', color: 'text-pink-400' },
        { label: 'Processed', value: '89', color: 'text-cyan-400' },
      ],
    },
    'creator': {
      title: 'Creator Studio',
      subtitle: 'Content creation & generation',
      icon: Wand2,
      iconColor: 'text-purple-400',
      stats: [
        { label: 'Created', value: '42', color: 'text-purple-400' },
        { label: 'Today', value: '8', color: 'text-emerald-400' },
      ],
    },
    'comms': {
      title: 'Comms Channel',
      subtitle: 'Communication & messaging',
      icon: MessageSquare,
      iconColor: 'text-blue-400',
      stats: [
        { label: 'Messages', value: '247', color: 'text-blue-400' },
        { label: 'Active', value: '12', color: 'text-emerald-400' },
      ],
    },
    'dataverse': {
      title: 'Dataverse Lab',
      subtitle: 'RAG knowledge system',
      icon: Network,
      iconColor: 'text-indigo-400',
      stats: [
        { label: 'Documents', value: '1.2k', color: 'text-indigo-400' },
        { label: 'Queries', value: '89', color: 'text-cyan-400' },
      ],
    },
  };

  // Check if we're showing the hub (tab is active but current view is not in that tab's views)
  if (activeTab) {
    const tab = tabConfig.find((t) => t.id === activeTab);
    // If current view is not in the active tab's views, show the tab header
    if (tab && !tab.views.includes(view)) {
      const tabHeaderKey = `${activeTab}-tab`;
      if (headers[tabHeaderKey]) {
        return headers[tabHeaderKey];
      }
    }
  }
  
  return headers[view] || headers.dashboard;
};

// Default quick access items (not in left pane tabs)
const defaultQuickAccess: QuickAccessItem[] = [
  { id: 'dashboard', icon: BarChart3, title: 'Dashboard', viewId: 'dashboard', color: 'text-cyan-400' },
  { id: 'project-flow', icon: Network, title: 'Project Flow', viewId: 'project-flow', color: 'text-cyan-400' },
  { id: 'audio', icon: Mic, title: 'Audio', viewId: 'audio-transcriber', color: 'text-pink-400' },
  { id: 'image', icon: Image, title: 'Image', viewId: 'image-analysis', color: 'text-indigo-400' },
  { id: 'mind-map', icon: Network, title: 'Mind Map', viewId: 'mind-map', color: 'text-purple-400' },
  { id: 'playground', icon: LayoutDashboard, title: 'Playground', viewId: 'layout-playground', color: 'text-cyan-400' },
];

// Constants for optimization
const LAB_IDS = ['aura', 'forge', 'review', 'data-weave', 'signal', 'creator', 'comms', 'dataverse', 'system-matrix'] as const;

// View mapping for spoke IDs
const VIEW_MAP: Record<string, string> = {
  // Home
  dashboard: 'dashboard',
  'project-flow': 'project-flow',
  connections: 'connections',
  // Labs
  labs: 'labs',
  // Revenue
  'business-generator': 'business-generator',
  'affiliate-factory': 'affiliate-factory',
  crypto: 'crypto',
  'crypto-revenue': 'crypto',
      // Dev
      'monaco-editor': 'monaco-editor',
      tasks: 'project-flow',
      // Ideas
      'idea-lab': 'idea-lab',
      // Vibe.d.e
      'vibe-de': 'vibe-de',
  // AI
  'mind-map': 'mind-map',
  'audio-transcriber': 'audio-transcriber',
  'image-analysis': 'image-analysis',
  // System
  settings: 'settings',
  'feature-flags': 'feature-flags',
  'layout-playground': 'layout-playground',
  'punch-list': 'project-flow',
};

// Helper function for status badge styling
const getStatusBadgeClasses = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400';
    case 'preview':
      return 'bg-blue-500/20 text-blue-400';
    default:
      return 'bg-yellow-500/20 text-yellow-400';
  }
};

// Helper function for status indicator styling
const getStatusIndicatorClasses = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-400';
    case 'preview':
      return 'bg-blue-400 animate-pulse';
    default:
      return 'bg-yellow-400';
  }
};

const HybridLayout = ({ children, currentView, onViewChange, onLabChange }: HybridLayoutProps) => {
  const [activeTab, setActiveTab] = useState('home');
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [rightPanelWidth, setRightPanelWidth] = useState(80); // Narrow for icon-only menu
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const [leftPanelMinimized, setLeftPanelMinimized] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [centerContent, setCenterContent] = useState<{ viewId: string; labId?: string | null } | null>(null);
  
  // Memoize quickAccessItems initialization
  const quickAccessItems = useMemo<QuickAccessItem[]>(() => {
    const storedIds = LocalStorageManager.get<string[]>('dlx_quick_access_items', []);
    if (storedIds.length > 0) {
      return storedIds.map((id: string) => defaultQuickAccess.find(item => item.id === id)).filter(Boolean) as QuickAccessItem[];
    }
    return defaultQuickAccess;
  }, []);

  const topicalHeader = useMemo(() => getTopicalHeader(currentView, activeTab), [currentView, activeTab]);

  // Determine active tab based on current view (only when currentView changes externally)
  useEffect(() => {
    const tab = tabConfig.find((t) => t.views.includes(currentView));
    if (tab) {
      // Only update activeTab if it's different to avoid conflicts with manual clicks
      setActiveTab(prev => prev !== tab.id ? tab.id : prev);
      // Auto-open view for tabs with autoOpenView flag if not already opened
      // Check centerContent via a ref or state check to avoid dependency issues
      setCenterContent(prev => {
        if (tab.autoOpenView && tab.views.length > 0 && !prev) {
          const viewId = VIEW_MAP[tab.views[0]] || tab.views[0];
          if (currentView === viewId) {
            return { viewId, labId: null };
          }
        }
        return prev;
      });
    } else {
      setActiveTab('home');
    }
  }, [currentView]); // Removed centerContent from dependencies to prevent conflicts

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTab(tabId);
    const tab = tabConfig.find(t => t.id === tabId);
    
    // Auto-open view for tabs marked with autoOpenView flag
    if (tab?.autoOpenView && tab.views.length > 0) {
      const firstView = tab.views[0];
      const viewId = VIEW_MAP[firstView] || firstView;
      // Set centerContent first, then change view
      setCenterContent({ viewId, labId: null });
      // Call onViewChange to update currentView in parent
      onViewChange(viewId);
    } else {
      // Clear center content when switching tabs to show tiles grid
      setCenterContent(null);
    }
  }, [onViewChange]);

  const handleSpokeClick = useCallback((spokeId: string) => {
    // Lab IDs that should open LabsRouter with specific lab
    if (LAB_IDS.includes(spokeId as any)) {
      // Set lab ID and show in center
      if (onLabChange) {
        onLabChange(spokeId as any);
      }
      setCenterContent({ viewId: 'labs', labId: spokeId });
      onViewChange('labs');
      return;
    }

    // Map spoke IDs to view IDs
    const viewId = VIEW_MAP[spokeId] || spokeId;
    
    // Prevent nested navigation - if already on this view, don't change it
    if (currentView === viewId && centerContent?.viewId === viewId) {
      return; // Already showing this view, don't nest
    }
    
    // Show content in center pane instead of right pane
    setCenterContent({ viewId, labId: null });
    onViewChange(viewId);
  }, [currentView, centerContent, onViewChange, onLabChange]);

  const handleQuickAccessClick = useCallback((item: QuickAccessItem) => {
    setCenterContent({ viewId: item.viewId, labId: null });
    onViewChange(item.viewId);
  }, [onViewChange]);

  const handleBackToTiles = useCallback(() => {
    setCenterContent(null);
  }, []);

  // Filter spokes by active tab - memoized for performance
  const activeSpokes = useMemo(() => 
    spokes.filter((s) => s.category === activeTab),
    [activeTab]
  );

  // Resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) {
        const newWidth = Math.max(80, Math.min(600, e.clientX));
        setLeftPanelWidth(newWidth);
        if (newWidth < 120) {
          setLeftPanelMinimized(true);
        } else {
          setLeftPanelMinimized(false);
        }
      }
      if (isResizingRight) {
        // Narrow menu, allow resizing from 80px to 200px
        const newWidth = Math.max(80, Math.min(200, window.innerWidth - e.clientX));
        setRightPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
    };

    if (isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizingLeft, isResizingRight, leftPanelWidth]);

  // Save quick access items to localStorage when they change (for future customization feature)
  useEffect(() => {
    try {
      LocalStorageManager.set('dlx_quick_access_items', quickAccessItems.map(item => item.id));
    } catch (e) {
      // Failed to save quick access items - non-critical, continue silently
    }
  }, [quickAccessItems]);

  // Auto-size left panel based on longest tab text
  useEffect(() => {
    const calculateOptimalWidth = () => {
      if (leftPanelMinimized || !leftPanelRef.current) return;

      // Create a temporary canvas to measure text accurately
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      // Set font styles matching the actual CSS (text-xl font-bold and text-base)
      context.font = 'bold 20px system-ui, -apple-system, sans-serif'; // text-xl font-bold
      let maxTitleWidth = 0;
      context.font = '16px system-ui, -apple-system, sans-serif'; // text-base
      let maxCountWidth = 0;
      
      tabConfig.forEach(tab => {
        context.font = 'bold 20px system-ui, -apple-system, sans-serif';
        const titleWidth = context.measureText(tab.title).width;
        maxTitleWidth = Math.max(maxTitleWidth, titleWidth);
        
        context.font = '16px system-ui, -apple-system, sans-serif';
        const countWidth = context.measureText(tab.count).width;
        maxCountWidth = Math.max(maxCountWidth, countWidth);
      });
      
      // Calculate padding + icon + gap + text widths
      const padding = 24; // p-3 = 12px on each side
      const iconWidth = 28; // w-7 h-7 = 28px + padding in icon container
      const gap = 12; // gap-3 = 12px
      
      // Use the wider of title or count, add buffer
      const textWidth = Math.max(maxTitleWidth, maxCountWidth);
      const optimalWidth = padding + iconWidth + gap + textWidth + 24; // 24px buffer for safety
      
      // Clamp between min and max
      const clampedWidth = Math.max(280, Math.min(500, optimalWidth));
      
      if (!leftPanelMinimized) {
        setLeftPanelWidth(clampedWidth);
      }
    };

    // Calculate after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(calculateOptimalWidth, 100);
    return () => clearTimeout(timeoutId);
  }, [tabConfig, leftPanelMinimized]);


  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Enhanced Neural Network Background */}
      <div className="dlx-neural-bg"></div>
      <div className="dlx-grid-overlay"></div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 py-2 border-b border-cyan-500/20 bg-slate-900/95 backdrop-blur-md flex justify-between items-center">
        <DLXLogo variant="compact" />
        <div className="text-xs sm:text-sm text-gray-400 hidden sm:block">Advanced Panel System</div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col sm:flex-row pt-10 h-screen">
        {/* Left Panel - Tabs */}
        <div 
          ref={leftPanelRef}
          className="hidden sm:flex border-r border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl overflow-hidden flex-col transition-all duration-300"
          style={{ width: leftPanelMinimized ? '80px' : `${leftPanelWidth}px` }}
        >
          <div className="flex-1 overflow-y-auto">
            <div className={`p-3 space-y-2 ${leftPanelMinimized ? 'px-2' : ''}`}>
              {tabConfig.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                // Keyboard shortcut hint (1-9 for first 9 tabs)
                const shortcut = index < 9 ? `${index + 1}` : null;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full ${leftPanelMinimized ? 'p-2 justify-center' : 'p-3'} rounded-xl transition-all duration-500 flex items-center ${leftPanelMinimized ? 'flex-col' : 'gap-3'} relative group ${
                      isActive
                        ? tab.isTopTab 
                          ? 'bg-gradient-to-r from-cyan-500/40 via-purple-500/30 to-cyan-500/40 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/40 scale-105'
                          : 'bg-gradient-to-r from-cyan-500/30 via-purple-500/20 to-cyan-500/30 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/30 scale-105'
                        : tab.isTopTab
                          ? 'bg-slate-800/70 border-2 border-slate-600/60 hover:border-cyan-500/80 hover:bg-slate-800/90 hover:scale-[1.02] dlx-top-tab-pulse'
                          : 'bg-slate-800/60 border-2 border-slate-700/50 hover:border-cyan-500/70 hover:bg-slate-800/80 hover:scale-[1.02]'
                    }`}
                    title={leftPanelMinimized ? `${tab.title}${shortcut ? ` (${shortcut})` : ''}` : shortcut ? `Keyboard shortcut: ${shortcut}` : undefined}
                  >
                    {isActive && !leftPanelMinimized && (
                      <>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4/5 bg-gradient-to-b from-cyan-400 via-emerald-400 via-purple-400 to-cyan-400 rounded-r-full shadow-lg shadow-cyan-400/50"></div>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-transparent"></div>
                      </>
                    )}
                    <div className={`relative z-10 ${leftPanelMinimized ? 'p-2' : 'p-2'} rounded-xl ${
                      isActive ? `${tab.iconColor.replace('text-', 'bg-')}/20` : 'bg-slate-700/30 group-hover:bg-slate-700/50'
                    } transition-colors`}>
                      <Icon className={`${tab.isTopTab ? 'w-8 h-8' : 'w-7 h-7'} transition-all ${
                        isActive 
                          ? tab.isTopTab
                            ? `${tab.iconColor} scale-[1.15] drop-shadow-[0_0_10px_currentColor] brightness-130 animate-pulse-slow` 
                            : `${tab.iconColor} scale-110 drop-shadow-[0_0_8px_currentColor] brightness-125`
                          : tab.isTopTab
                            ? `${tab.iconColor} opacity-80 group-hover:opacity-100 group-hover:drop-shadow-[0_0_8px_currentColor]`
                            : `${tab.iconColor} opacity-70 group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_currentColor]`
                      }`} />
                    </div>
                    {!leftPanelMinimized && (
                      <div className="flex-1 text-left relative z-10 min-w-0">
                        <div className={`font-bold text-xl transition-colors ${
                          isActive ? 'text-cyan-300' : 'text-gray-300 group-hover:text-white'
                        }`}>
                          {tab.title}
                        </div>
                        <div className={`text-base mt-0.5 transition-colors flex items-center gap-2 ${
                          isActive ? 'text-cyan-400/70' : 'text-gray-500 group-hover:text-gray-400'
                        }`}>
                          <span>{tab.count}</span>
                          {shortcut && (
                            <span className="text-xs bg-slate-700/50 px-1.5 py-0.5 rounded border border-slate-600/50 text-slate-400">
                              {shortcut}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Resize Handle */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-cyan-500/50 transition-colors z-20"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizingLeft(true);
            }}
          />
        </div>

        {/* Center Area - Advanced Panel System */}
        <div className="flex-1 overflow-y-auto p-3 relative bg-transparent">
          {/* DLX Command Center HUD Background */}
          <div className="dlx-command-center-bg absolute inset-0 pointer-events-none z-0"></div>
          
          {/* Topical Header Section - Double Height */}
          <div className="mb-3 relative z-10">
            <div className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-8 relative overflow-hidden min-h-[160px] flex items-center">
              {/* Animated glow effects - Optimized */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse will-change-opacity" style={{ transform: 'translateZ(0)' }}></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/15 via-transparent to-cyan-500/15 rounded-full blur-2xl animate-pulse will-change-opacity" style={{ animationDelay: '1s', transform: 'translateZ(0)' }}></div>
              
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 w-full">
                {/* Icon */}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border-2 border-cyan-500/30 flex-shrink-0 dlx-holographic-glow`}>
                  {(() => {
                    const Icon = topicalHeader.icon;
                    return <Icon className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${topicalHeader.iconColor} drop-shadow-[0_0_20px_currentColor]`} />;
                  })()}
                </div>
                
                {/* Title & Subtitle */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                    {topicalHeader.title}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-300">{topicalHeader.subtitle}</p>
                </div>
                
                {/* Stats */}
                <div className="text-center sm:text-right flex-shrink-0 flex gap-3 sm:gap-6">
                  {topicalHeader.stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">{stat.label}</div>
                      <div className={`text-xl font-bold ${stat.color} flex items-center justify-center gap-2`}>
                        {stat.label === 'Status' && <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>}
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content Area - Shows tiles OR content based on selection */}
          {(() => {
            const currentTab = tabConfig.find(t => t.id === activeTab);
            const isSplitScreen = currentTab?.isSplitScreen && activeTab === 'home' && !centerContent;
            
            // Split-screen layout for home tab
            if (isSplitScreen) {
              return (
                <div className="relative z-10 h-full flex gap-3">
                  {/* Left: Dashboard */}
                  <div className="flex-1 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-cyan-500/20 rounded-lg overflow-hidden">
                    {currentView === 'dashboard' ? children : null}
                  </div>
                  
                  {/* Divider */}
                  <div className="w-px bg-cyan-500/20"></div>
                  
                  {/* Right: Project Flow Compact */}
                  <div className="flex-1 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-purple-500/20 rounded-lg overflow-hidden">
                    <ProjectFlowCompact 
                      onFullView={() => {
                        setCenterContent({ viewId: 'project-flow', labId: null });
                        onViewChange('project-flow');
                      }}
                    />
                  </div>
                </div>
              );
            }
            
            // Regular content view
            if (centerContent) {
              // Use purple gradient for all views except dashboard (home)
              const isHome = centerContent.viewId === 'dashboard';
              const bgClass = isHome 
                ? 'bg-gradient-to-br from-slate-900/95 to-slate-800/95'
                : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900';
              
              return (
                <div className={`relative z-10 ${bgClass} backdrop-blur-xl border border-cyan-500/20 rounded-lg p-4 min-h-[400px]`}>
                  {/* Back Button */}
                  <button
                    onClick={handleBackToTiles}
                    className="mb-4 flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-cyan-500/30 rounded-lg transition-all text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Tiles
                  </button>
                  
                  {/* Content */}
                  <div className="min-h-[400px]">
                    {/* Show content when viewId matches currentView 
                        Note: onViewChange updates currentView, which may take one render cycle */}
                    {centerContent.viewId === currentView ? children : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-gray-400">Loading...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            
            // Labs Grid
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 relative z-10">
                {activeSpokes.map((spoke) => {
                  const Icon = spoke.icon;
                  const labInfo = getLabById(spoke.id);
                  const status = labInfo?.status || 'preview';
                  const isAvailable = status === 'active' || status === 'preview';
                  
                  return (
                    <button
                      key={spoke.id}
                      onClick={() => handleSpokeClick(spoke.id)}
                      disabled={!isAvailable && labInfo !== undefined}
                      className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border rounded-lg p-3 transition-all cursor-pointer group relative z-10 ${
                        isAvailable || !labInfo
                          ? 'border-cyan-500/20 hover:border-cyan-500/40 hover:scale-105'
                          : 'border-slate-700/50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                          !isAvailable && labInfo ? 'opacity-50' : ''
                        }`}>
                          <Icon className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-bold text-white group-hover:text-cyan-300 truncate">{spoke.title}</div>
                          <div className="text-sm text-gray-400">{spoke.desc}</div>
                        </div>
                        {labInfo && (
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeClasses(status)}`}>
                            {status === 'active' ? 'Active' : status === 'preview' ? 'Preview' : 'Soon'}
                          </div>
                        )}
                      </div>
                      <div className="h-24 bg-gradient-to-br from-slate-900/60 to-black/40 rounded border border-cyan-500/10 flex flex-col items-center justify-center group-hover:border-cyan-500/30 transition-all relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 text-center px-2">
                          {labInfo ? (
                            <>
                              <div className="text-sm text-gray-300 mb-2 line-clamp-2 leading-snug">{labInfo.description}</div>
                              <div className="flex items-center justify-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${getStatusIndicatorClasses(status)}`}></div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{status}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-sm font-semibold text-cyan-400/80 mb-1 uppercase tracking-wider">Ready</div>
                              <div className="w-2.5 h-2.5 bg-green-400 rounded-full mx-auto animate-pulse"></div>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Right Panel - Quick Access Icon Menu */}
        <div 
          className="hidden lg:flex border-l border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl overflow-hidden flex-col relative transition-all duration-300"
          style={{ width: `${rightPanelWidth}px`, minWidth: '80px' }}
        >
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              const isActive = centerContent?.viewId === item.viewId;
              return (
                <button
                  key={item.id}
                  onClick={() => handleQuickAccessClick(item)}
                  className={`w-full p-3 rounded-lg transition-all duration-300 group relative ${
                    isActive
                      ? 'bg-gradient-to-br from-cyan-500/30 via-purple-500/20 to-cyan-500/30 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-800/60 border-2 border-slate-700/50 hover:border-cyan-500/70 hover:bg-slate-800/80'
                  }`}
                  title={item.title}
                >
                  {isActive && (
                    <>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-gradient-to-b from-cyan-400 via-emerald-400 to-cyan-400 rounded-r-full"></div>
                    </>
                  )}
                  <div className={`relative z-10 ${isActive ? 'bg-cyan-500/20' : 'bg-slate-700/30 group-hover:bg-slate-700/50'} rounded-lg p-2 transition-colors flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 transition-all ${
                      isActive 
                        ? `${item.color} scale-110 drop-shadow-[0_0_8px_currentColor]` 
                        : `${item.color} opacity-70 group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_currentColor]`
                    }`} />
                  </div>
                  {rightPanelWidth > 80 && (
                    <div className={`text-xs mt-1 text-center transition-colors ${
                      isActive ? 'text-cyan-300' : 'text-gray-400 group-hover:text-gray-300'
                    }`}>
                      {item.title}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Resize Handle */}
          <div
            className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-cyan-500/50 transition-colors z-20"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizingRight(true);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HybridLayout;

