import { ReactNode, useState } from 'react';

import {
  Activity,
  Brain,
  FolderKanban,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  X,
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
  { id: 'dashboard', label: 'Debug Mode', icon: Brain },
  { id: 'workspace', label: 'Workspace', icon: MessageSquare },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'connections', label: 'Connections', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const SimpleLayout = ({ children, currentView, onViewChange }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Simple Header */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur border-b border-white/10 z-50 flex items-center justify-between px-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            DLX Studios
          </span>
          <span className="text-sm text-slate-400 hidden sm:block">Debug Mode</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-green-400">ACTIVE</span>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>
      </nav>

      {/* Simple Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-slate-900/80 backdrop-blur border-r border-white/10 transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map(item => {
            const IconComponent = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-purple-600/20 text-white border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">{children}</main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SimpleLayout;
