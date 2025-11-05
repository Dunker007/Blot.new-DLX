/**
 * Compact Layout - Modern AI Tech Theme
 * Dark tone with DLX branding, optimized for multi-monitor
 */

import { ReactNode, useState } from 'react';
import {
  Brain,
  Code2,
  FlaskConical,
  Network,
  Lightbulb,
  CheckSquare,
  Settings,
  Maximize2,
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  Activity,
  Mic,
  Image,
  Flag,
  ChevronRight,
  X,
  DollarSign,
  TrendingUp,
  Coins,
} from 'lucide-react';
import { DLXLogo } from './DLXLogo';
import { popoutManager } from '../utils/popoutWindow';
import '../styles/dlx-theme.css';

// Popout button component
const PopoutButton = ({ itemId, itemLabel }: { itemId: string; itemLabel: string }) => {
  const handlePopout = (e: React.MouseEvent) => {
    e.stopPropagation();
    popoutManager.openPopout(itemId, `<div style="padding: 2rem; color: white;">
      <h1 style="color: #00ffff; margin-bottom: 1rem;">${itemLabel}</h1>
      <p>This window can be moved to another monitor for multi-monitor workflows.</p>
      <p style="margin-top: 1rem; color: #888;">Content will be rendered here.</p>
    </div>`, {
      width: 1200,
      height: 800,
      title: `${itemLabel} - DLX Studios`,
    });
  };

  return (
    <button
      onClick={handlePopout}
      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[rgba(0,255,255,0.1)] rounded transition-opacity"
      title="Pop out to new window"
    >
      <Maximize2 className="w-3 h-3 text-cyan-400" />
    </button>
  );
};

interface CompactLayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  popoutable?: boolean;
}

const navGroups: NavGroup[] = [
  {
    id: 'core',
    label: 'Core',
    items: [
      { id: 'dashboard', label: 'Command Center', icon: Brain },
      { id: 'workspace', label: 'Workspace', icon: MessageSquare },
      { id: 'projects', label: 'Projects', icon: FolderKanban },
    ],
  },
  {
    id: 'revenue',
    label: 'Revenue',
    items: [
      { id: 'business-generator', label: 'Business Generator', icon: DollarSign },
      { id: 'affiliate-factory', label: 'Affiliate Factory', icon: TrendingUp },
      { id: 'crypto', label: 'Crypto Hub', icon: Coins },
    ],
  },
  {
    id: 'labs',
    label: 'Labs',
    items: [
      { id: 'labs', label: 'Labs Hub', icon: FlaskConical },
      { id: 'monaco-editor', label: 'Code Editor', icon: Code2, popoutable: true },
      { id: 'mind-map', label: 'Mind Map', icon: Network, popoutable: true },
      { id: 'idea-lab', label: 'Idea Lab', icon: Lightbulb, popoutable: true },
      { id: 'tasks', label: 'Task Management', icon: CheckSquare, popoutable: true },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { id: 'audio-transcriber', label: 'Audio', icon: Mic, popoutable: true },
      { id: 'image-analysis', label: 'Image', icon: Image, popoutable: true },
      { id: 'connections', label: 'Connections', icon: Activity },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'feature-flags', label: 'Feature Flags', icon: Flag },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

const CompactLayout = ({ children, currentView, onViewChange }: CompactLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['core']);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Enhanced Neural Network Background */}
      <div className="dlx-neural-bg"></div>
      <div className="dlx-grid-overlay"></div>
      
      {/* Animated Connection Lines */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-5" style={{ zIndex: -1 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ffff" />
            <stop offset="50%" stopColor="#ff00ff" />
            <stop offset="100%" stopColor="#00ffff" />
          </linearGradient>
        </defs>
        {[...Array(20)].map((_, i) => {
          const x1 = (i * 5) % 100;
          const y1 = (i * 7) % 100;
          const x2 = ((i * 5) + 15) % 100;
          const y2 = ((i * 7) + 10) % 100;
          return (
            <line
              key={i}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="url(#lineGradient)"
              strokeWidth="0.5"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.2}s`, animationDuration: '3s' }}
            />
          );
        })}
      </svg>

      {/* Enhanced Compact Header */}
      <header className="fixed top-0 left-0 right-0 h-11 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-[rgba(0,255,255,0.3)] z-50 flex items-center justify-between px-3 shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-[#1a1a2e] rounded transition-all hover:border border-[rgba(0,255,255,0.3)]"
          >
            {sidebarOpen ? <X className="w-3.5 h-3.5 text-gray-300" /> : <LayoutDashboard className="w-3.5 h-3.5 text-gray-300" />}
          </button>
          <div className="flex items-center gap-2 border-l border-[rgba(0,255,255,0.2)] pl-2.5">
            <DLXLogo variant="compact" size="sm" />
            <span className="text-[10px] text-gray-500 hidden md:block font-mono">DLXStudios.ai</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#1a1a2e] border border-[rgba(0,255,255,0.2)] rounded text-[10px]">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_4px_rgba(34,197,94,0.8)]"></div>
            <span className="text-green-400 font-semibold">ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Enhanced Compact Sidebar */}
      <aside
        className={`fixed left-0 top-11 bottom-0 w-44 bg-[#0f0f1a]/98 backdrop-blur-sm border-r border-[rgba(0,255,255,0.3)] transition-transform duration-200 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto shadow-[2px_0_8px_rgba(0,0,0,0.5)]`}
      >
        <nav className="p-2 space-y-1">
          {navGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.id);
            return (
              <div key={group.id}>
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <span>{group.label.toUpperCase()}</span>
                  <ChevronRight
                    className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
                {isExpanded && (
                  <div className="ml-2 space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;

                      return (
                        <div key={item.id} className="flex items-center group">
                          <button
                            onClick={() => onViewChange(item.id)}
                            className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all relative group/item ${
                              isActive
                                ? 'bg-[rgba(0,255,255,0.15)] text-cyan-400 border-l-2 border-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.3)]'
                                : 'text-gray-400 hover:text-cyan-300 hover:bg-[rgba(0,255,255,0.05)]'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-gray-500 group-hover/item:text-cyan-400'}`} />
                            <span className="truncate font-medium">{item.label}</span>
                            {isActive && (
                              <div className="absolute right-1 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                            )}
                          </button>
                          {item.popoutable && (
                            <PopoutButton itemId={item.id} itemLabel={item.label} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Enhanced Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-[rgba(0,255,255,0.2)] bg-[#0a0a0f]/50 backdrop-blur-sm">
          <div className="text-[10px] text-gray-600 space-y-0.5 font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_4px_rgba(0,255,255,0.8)]"></div>
              <span className="text-cyan-400/70">LUX 2.0</span>
            </div>
            <div className="text-[9px] text-gray-600 ml-2.5">DV-FIRST ARCHITECTURE</div>
            <div className="text-[9px] text-gray-700 ml-2.5">TURBO HUD</div>
          </div>
        </div>
      </aside>

      {/* Enhanced Main Content - Ultra Compact */}
      <main
        className={`pt-11 transition-all duration-200 ${
          sidebarOpen ? 'ml-44' : 'ml-0'
        } min-h-[calc(100vh-2.75rem)]`}
      >
        <div className="p-2 max-w-full overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
};

export default CompactLayout;

