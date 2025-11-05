import { ReactNode, useState } from 'react';

import {
  Activity,
  Brain,
  CheckSquare,
  Code2,
  Flag,
  FlaskConical,
  FolderKanban,
  Image,
  LayoutDashboard,
  Lightbulb,
  Menu,
  MessageSquare,
  Mic,
  Network,
  Settings,
  X,
} from 'lucide-react';

import { safeComponents, safeGradients, safeUtils } from '../styles/safeDesignSystem';

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
  { id: 'workspace', label: 'Workspace', icon: MessageSquare },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'connections', label: 'Connections', icon: Activity },
  { id: 'monaco-editor', label: 'Code Editor', icon: Code2 },
  { id: 'audio-transcriber', label: 'Audio Transcriber', icon: Mic },
  { id: 'image-analysis', label: 'Image Analysis', icon: Image },
  { id: 'mind-map', label: 'Mind Map', icon: Network },
  { id: 'idea-lab', label: 'Idea Lab', icon: Lightbulb },
  { id: 'tasks', label: 'Task Management', icon: CheckSquare },
  { id: 'labs', label: 'Labs Hub', icon: FlaskConical },
  { id: 'feature-flags', label: 'Feature Flags', icon: Flag },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const SafeLayout = ({ children, currentView, onViewChange }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={safeComponents.pageBackground}>
      {/* Header */}
      <nav
        className={`fixed top-0 left-0 right-0 h-16 ${safeComponents.sectionBackground} border-b border-white/10 z-50 ${safeUtils.spaceBetween} px-6`}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`lg:hidden ${safeComponents.buttonGhost}`}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center space-x-4">
          <div className={`bg-gradient-to-r ${safeGradients.primary} p-2 rounded-lg`}>
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className={`text-2xl font-bold ${safeUtils.textGradient}`}>DLX Studios Ultimate</span>
          <span className="text-sm text-slate-400 hidden sm:block">All-in-One AI Platform</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-green-400">ACTIVE</span>
          <div className={safeComponents.statusOnline}></div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 ${safeComponents.sectionBackground} border-r border-white/10 transition-transform duration-300 z-40 ${
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
                    ? `bg-gradient-to-r ${safeGradients.primary}/10 text-white border border-purple-500/30 shadow-lg`
                    : `${safeComponents.navItem} hover:bg-white/5`
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

export default SafeLayout;
