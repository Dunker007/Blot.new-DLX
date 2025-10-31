import { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Code,
  FolderKanban,
  TrendingUp,
  Settings,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

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
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'dev-lab', label: 'Dev Lab', icon: MessageSquare },
  { id: 'workspace', label: 'Workspace', icon: Code },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'trading', label: 'Trading Bots', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-50 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors mr-3"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="text-cyan-400" size={28} />
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            DLX Studios
          </span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              LuxRig Connected
            </span>
          </div>
        </div>
      </nav>

      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 space-y-1">
            <div>AI Web Development Studio</div>
            <div>Powered by Local LLMs</div>
          </div>
        </div>
      </aside>

      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
