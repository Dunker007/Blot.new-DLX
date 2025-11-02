import { ReactNode, useState } from 'react';

import {
  Activity,
  Brain,
  Code,
  FolderKanban,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';

import { components, gradients, utils } from '../styles/designSystem';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Command Center', icon: Brain },
  { id: 'crypto', label: 'Crypto Hub', icon: TrendingUp },
  { id: 'business-generator', label: 'AI Business', icon: Sparkles },
  { id: 'content-factory', label: 'Content Engine', icon: Activity },
  { id: 'trading', label: 'Trading Bots', icon: TrendingUp },
  { id: 'dev-lab', label: 'Dev Studio', icon: Code },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'workspace', label: 'Workspace', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'pricing', label: 'Go Premium', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`${components.pageBackground} text-white`}>
      <nav
        className={`fixed top-0 left-0 right-0 h-16 ${components.sectionBackground} border-b border-white/10 z-50 ${utils.spaceBetween} px-6`}
      >
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={components.buttonGhost}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-3">
            <div className={`bg-gradient-to-r ${gradients.primary} p-2 rounded-lg`}>
              <Sparkles className="text-white" size={24} />
            </div>
            <span className={`text-2xl font-bold ${utils.textGradient}`}>DLX Studios</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
            <div className={components.statusOnline}></div>
            <span className="text-sm font-medium text-emerald-400">LuxRig Connected</span>
          </div>
        </div>
      </nav>

      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 ${components.sectionBackground} border-r border-white/10 transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${gradients.primary}/10 text-white border border-purple-500/30 shadow-lg`
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="text-xs text-white/50 space-y-1">
            <div className="font-medium">AI Development Studio</div>
            <div>Powered by LuxRig LLMs</div>
          </div>
        </div>
      </aside>

      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
