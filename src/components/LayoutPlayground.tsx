import React, { useState, lazy, Suspense, useMemo } from 'react';
import { Brain, Code2, FlaskConical, DollarSign, Settings, LayoutDashboard, Zap, Network, Layers, Grid3x3, Split, CheckSquare, Lock, Unlock, Shuffle, RotateCcw } from 'lucide-react';

const TaskPunchList = lazy(() => import('./TaskPunchList'));

// Concept types for each layout
type ConceptType = 'nav' | 'lab' | 'action' | 'activity' | 'stat' | 'structural';

interface LayoutConcept {
  id: string;
  type: ConceptType;
  label: string;
  data?: any; // Concept-specific data
}

interface ShuffledLayoutData {
  navigation: string[];
  labs: string[];
  quickLabs: string[];
  actions: string[];
  activities: string[];
  stats: Array<{ label: string; value: string }>;
  matrixItems: string[];
}

const LayoutPlayground: React.FC = () => {
  const [activeLayout, setActiveLayout] = useState<string>('advanced-panel');
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [lockedConcepts, setLockedConcepts] = useState<Set<string>>(new Set());
  const [shuffledData, setShuffledData] = useState<ShuffledLayoutData | null>(null);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);

  const handleLayoutChange = (layoutId: string) => {
    setActiveLayout(layoutId);
    setControlsCollapsed(true);
  };

  const layouts = [
    { id: 'advanced-panel', name: 'Advanced Panel System', icon: Layers, color: 'cyan', bgClass: 'bg-cyan-600', hoverClass: 'bg-cyan-500' },
    { id: 'multi-zone', name: 'Multi-Zone Dashboard', icon: Grid3x3, color: 'purple', bgClass: 'bg-purple-600', hoverClass: 'bg-purple-500' },
    { id: 'neural-center', name: 'Neural Core Central', icon: Brain, color: 'pink', bgClass: 'bg-pink-600', hoverClass: 'bg-pink-500' },
    { id: 'split-matrix', name: 'Split Matrix', icon: Split, color: 'green', bgClass: 'bg-green-600', hoverClass: 'bg-green-500' },
    { id: 'punch-list', name: 'Task Punch List', icon: CheckSquare, color: 'blue', bgClass: 'bg-blue-600', hoverClass: 'bg-blue-500' },
  ];

  // Available concepts for shuffling
  const availableConcepts = {
    navigation: ['Home', 'Labs', 'Revenue', 'Dev', 'AI', 'System', 'Settings', 'Projects', 'Workspace'],
    labs: ['Code Review Lab', 'Crypto Lab', 'Data Weave', 'System Matrix', 'Business Gen', 'Affiliate Factory', 'Monaco Editor', 'Workspace', 'Mind Map', 'Audio Transcriber'],
    quickLabs: ['Code Review', 'Crypto', 'Data Weave', 'System Matrix', 'Agent Forge', 'Signal Lab'],
    actions: ['New Project', 'Run Lab', 'Generate', 'Deploy', 'Analyze', 'Export', 'Import', 'Settings'],
    activities: ['Code review completed', 'Crypto analysis updated', 'New lab started', 'Project deployed', 'Analysis finished', 'Export completed', 'Settings changed'],
    stats: [
      { label: 'Active Labs', value: '8' },
      { label: 'Revenue Today', value: '$1,247' },
      { label: 'Projects', value: '12' },
      { label: 'AI Calls', value: '1,234' },
      { label: 'Users', value: '89' },
      { label: 'Tasks', value: '45' },
    ],
    matrixItems: ['Code Review Lab', 'Crypto Lab', 'Data Weave', 'System Matrix', 'Business Generator', 'Affiliate Factory', 'Monaco Editor', 'Workspace', 'Mind Map', 'Audio Transcriber', 'Tasks', 'Settings'],
  };

  // Get concepts for current layout
  const getLayoutConcepts = (layoutId: string): LayoutConcept[] => {
    const concepts: LayoutConcept[] = [];
    
    switch (layoutId) {
      case 'advanced-panel':
        concepts.push(
          { id: 'neural-core', type: 'structural', label: 'Neural Core' },
          { id: 'nav-section', type: 'nav', label: 'Navigation Section' },
          { id: 'quick-labs', type: 'lab', label: 'Quick Labs' },
          { id: 'labs-grid', type: 'lab', label: 'Labs Grid' },
          { id: 'activity-feed', type: 'activity', label: 'Activity Feed' },
          { id: 'stats-panel', type: 'stat', label: 'Stats Panel' }
        );
        break;
      case 'multi-zone':
        concepts.push(
          { id: 'neural-core', type: 'structural', label: 'Neural Core' },
          { id: 'labs-zone', type: 'lab', label: 'Labs Zone' },
          { id: 'revenue-zone', type: 'stat', label: 'Revenue Zone' },
          { id: 'quick-actions', type: 'action', label: 'Quick Actions' },
          { id: 'activity-feed', type: 'activity', label: 'Activity Feed' }
        );
        break;
      case 'neural-center':
        concepts.push(
          { id: 'neural-core', type: 'structural', label: 'Neural Core' },
          { id: 'labs-grid', type: 'lab', label: 'Labs Grid' }
        );
        break;
      case 'split-matrix':
        concepts.push(
          { id: 'neural-core', type: 'structural', label: 'Neural Core' },
          { id: 'matrix-grid', type: 'lab', label: 'Matrix Grid' }
        );
        break;
    }
    
    return concepts;
  };

  // Shuffle array helper
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle unlocked concepts
  const handleShuffle = () => {
    setIsShuffling(true);
    
    setTimeout(() => {
      // Only shuffle data for concepts that aren't locked
      const newData: ShuffledLayoutData = {
        navigation: !lockedConcepts.has('nav-section') 
          ? shuffleArray(availableConcepts.navigation).slice(0, Math.floor(Math.random() * 4) + 3)
          : shuffledData?.navigation || ['Home', 'Labs', 'Revenue', 'Dev', 'AI', 'System'],
        labs: !lockedConcepts.has('labs-grid') && !lockedConcepts.has('matrix-grid')
          ? shuffleArray(availableConcepts.labs).slice(0, Math.floor(Math.random() * 4) + 4)
          : shuffledData?.labs || ['Code Review Lab', 'Crypto Lab', 'Data Weave', 'System Matrix', 'Business Gen', 'Affiliate Factory'],
        quickLabs: !lockedConcepts.has('quick-labs')
          ? shuffleArray(availableConcepts.quickLabs).slice(0, Math.floor(Math.random() * 3) + 2)
          : shuffledData?.quickLabs || ['Code Review', 'Crypto', 'Data Weave'],
        actions: !lockedConcepts.has('quick-actions')
          ? shuffleArray(availableConcepts.actions).slice(0, Math.floor(Math.random() * 3) + 2)
          : shuffledData?.actions || ['New Project', 'Run Lab', 'Generate'],
        activities: !lockedConcepts.has('activity-feed')
          ? shuffleArray(availableConcepts.activities).slice(0, Math.floor(Math.random() * 3) + 2)
          : shuffledData?.activities || ['Code review completed', 'Crypto analysis updated', 'New lab started'],
        stats: !lockedConcepts.has('stats-panel') && !lockedConcepts.has('revenue-zone')
          ? shuffleArray(availableConcepts.stats).slice(0, Math.floor(Math.random() * 2) + 2)
          : shuffledData?.stats || [
              { label: 'Active Labs', value: '8' },
              { label: 'Revenue Today', value: '$1,247' },
            ],
        matrixItems: !lockedConcepts.has('matrix-grid')
          ? shuffleArray(availableConcepts.matrixItems).slice(0, Math.floor(Math.random() * 4) + 8)
          : shuffledData?.matrixItems || ['Code Review Lab', 'Crypto Lab', 'Data Weave', 'System Matrix', 'Business Generator', 'Affiliate Factory', 'Monaco Editor', 'Workspace', 'Mind Map', 'Audio Transcriber', 'Tasks', 'Settings'],
      };
      
      setShuffledData(newData);
      setShuffleCount(prev => prev + 1);
      setIsShuffling(false);
    }, 300);
  };

  // Reset to default
  const handleReset = () => {
    setShuffledData(null);
    setLockedConcepts(new Set());
    setShuffleCount(0);
  };

  // Toggle lock on concept
  const toggleLock = (conceptId: string) => {
    setLockedConcepts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conceptId)) {
        newSet.delete(conceptId);
      } else {
        newSet.add(conceptId);
      }
      return newSet;
    });
  };

  // Get current concepts for UI
  const currentConcepts = useMemo(() => getLayoutConcepts(activeLayout), [activeLayout]);

  const renderLayout = () => {
    // Get data to use (shuffled or default)
    const navItems = shuffledData?.navigation || ['Home', 'Labs', 'Revenue', 'Dev', 'AI', 'System'];
    const quickLabsItems = shuffledData?.quickLabs || ['Code Review', 'Crypto', 'Data Weave'];
    const labsGridItems = shuffledData?.labs || ['Code Review Lab', 'Crypto Lab', 'Data Weave', 'System Matrix', 'Business Gen', 'Affiliate Factory'];
    const actionItems = shuffledData?.actions || ['New Project', 'Run Lab', 'Generate'];
    const activityItems = shuffledData?.activities || ['Code review completed', 'Crypto analysis updated', 'New lab started'];
    const statsItems = shuffledData?.stats || [
      { label: 'Active Labs', value: '8' },
      { label: 'Revenue Today', value: '$1,247' },
    ];
    const matrixItems = shuffledData?.matrixItems || ['Code Review Lab', 'Crypto Lab', 'Data Weave', 'System Matrix', 'Business Generator', 'Affiliate Factory', 'Monaco Editor', 'Workspace', 'Mind Map', 'Audio Transcriber', 'Tasks', 'Settings'];

    switch (activeLayout) {
      case 'advanced-panel':
        return (
          <div className={`flex h-full transition-opacity duration-300 ${isShuffling ? 'opacity-50' : 'opacity-100'}`}>
            {/* Left: Compact Nav with Mini Previews */}
            {!lockedConcepts.has('nav-section') && (
              <div className="w-56 bg-slate-900/95 backdrop-blur-xl border-r border-cyan-500/20 p-2 overflow-y-auto">
                <div className="mb-3 px-2">
                  <h2 className="text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">Navigation</h2>
                  <div className="space-y-1">
                    {navItems.map((cat) => (
                      <div key={cat} className="bg-slate-800/60 hover:bg-slate-800/80 rounded-lg p-2 cursor-pointer border border-transparent hover:border-cyan-500/30 transition-all">
                        <div className="text-xs font-semibold text-white">{cat}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{Math.floor(Math.random() * 5 + 2)} items</div>
                      </div>
                    ))}
                  </div>
                </div>
                {!lockedConcepts.has('quick-labs') && (
                  <div className="px-2">
                    <h2 className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">Quick Labs</h2>
                    <div className="space-y-1">
                      {quickLabsItems.map((lab) => (
                        <div key={lab} className="bg-purple-500/10 hover:bg-purple-500/20 rounded-lg p-2 cursor-pointer border border-purple-500/20 hover:border-purple-500/40 transition-all">
                          <div className="text-xs font-medium text-purple-300">{lab}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Center: Neural Core + Labs Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Neural Core Section */}
              {!lockedConcepts.has('neural-core') && (
                <div className="mb-4 relative">
                  <div className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                        <Brain className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-white mb-1">AI Neural Core</h2>
                        <p className="text-xs text-gray-400">Real-time processing visualization</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 mb-1">Status</div>
                        <div className="text-sm font-bold text-emerald-400">● Active</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Labs Grid */}
              {!lockedConcepts.has('labs-grid') && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {labsGridItems.map((lab, i) => (
                    <div key={i} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-lg p-3 hover:border-cyan-500/40 hover:scale-105 transition-all cursor-pointer group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                          <FlaskConical className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300">{lab}</div>
                          <div className="text-[10px] text-gray-400">AI-powered</div>
                        </div>
                      </div>
                      <div className="h-16 bg-black/20 rounded border border-cyan-500/10 flex items-center justify-center">
                        <div className="text-xs text-gray-500">Preview</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Activity & Stats */}
            {!lockedConcepts.has('activity-feed') && !lockedConcepts.has('stats-panel') && (
              <div className="w-64 bg-slate-900/95 backdrop-blur-xl border-l border-cyan-500/20 p-3 overflow-y-auto">
                {!lockedConcepts.has('activity-feed') && (
                  <>
                    <h3 className="text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">Activity</h3>
                    <div className="space-y-2 mb-4">
                      {activityItems.map((act, i) => (
                        <div key={i} className="bg-slate-800/60 rounded p-2 border border-slate-700/50">
                          <div className="text-xs text-white">{act}</div>
                          <div className="text-[10px] text-gray-500 mt-1">2m ago</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {!lockedConcepts.has('stats-panel') && (
                  <>
                    <h3 className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">Stats</h3>
                    <div className="space-y-2">
                      {statsItems.map((stat, i) => (
                        <div key={i} className={`${i % 2 === 0 ? 'bg-purple-500/10 border-purple-500/20' : 'bg-green-500/10 border-green-500/20'} rounded p-2 border`}>
                          <div className="text-xs text-gray-400">{stat.label}</div>
                          <div className={`text-lg font-bold ${i % 2 === 0 ? 'text-purple-300' : 'text-green-300'}`}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      case 'multi-zone':
        return (
          <div className={`h-full overflow-y-auto p-3 transition-opacity duration-300 ${isShuffling ? 'opacity-50' : 'opacity-100'}`}>
            <div className="grid grid-cols-12 grid-rows-6 gap-2 h-full">
              {/* Neural Core - Large Center */}
              {!lockedConcepts.has('neural-core') && (
                <div className="col-span-5 row-span-3 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="relative z-10 text-center">
                    <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-3 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
                    <h2 className="text-xl font-bold text-white mb-1">Neural Core</h2>
                    <p className="text-xs text-gray-400">AI Processing Hub</p>
                  </div>
                </div>
              )}

              {/* Labs Zone */}
              {!lockedConcepts.has('labs-zone') && (
                <div className="col-span-7 row-span-3 bg-slate-800/60 backdrop-blur-xl border border-purple-500/30 rounded-lg p-3 overflow-y-auto">
                  <h3 className="text-xs font-bold text-purple-400 mb-2 uppercase">Featured Labs</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {labsGridItems.slice(0, 4).map((lab) => (
                      <div key={lab} className="bg-slate-900/60 rounded p-2 border border-purple-500/20 hover:border-purple-500/40 cursor-pointer">
                        <div className="text-xs font-semibold text-white">{lab}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revenue Zone */}
              {!lockedConcepts.has('revenue-zone') && (
                <div className="col-span-4 row-span-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-lg p-3">
                  <h3 className="text-xs font-bold text-green-400 mb-2 uppercase">Revenue</h3>
                  <div className="space-y-2">
                    {statsItems.find(s => s.label.includes('Revenue')) ? (
                      <>
                        <div className="text-lg font-bold text-green-300">{statsItems.find(s => s.label.includes('Revenue'))?.value || '$1,247'}</div>
                        <div className="text-xs text-gray-400">Today</div>
                      </>
                    ) : (
                      <>
                        <div className="text-lg font-bold text-green-300">$1,247</div>
                        <div className="text-xs text-gray-400">Today</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {!lockedConcepts.has('quick-actions') && (
                <div className="col-span-4 row-span-2 bg-slate-800/60 backdrop-blur-xl border border-orange-500/30 rounded-lg p-3">
                  <h3 className="text-xs font-bold text-orange-400 mb-2 uppercase">Quick Actions</h3>
                  <div className="space-y-1">
                    {actionItems.map((act) => (
                      <div key={act} className="bg-slate-900/60 rounded p-1.5 text-xs text-white hover:bg-slate-900/80 cursor-pointer">{act}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Feed */}
              {!lockedConcepts.has('activity-feed') && (
                <div className="col-span-4 row-span-2 bg-slate-800/60 backdrop-blur-xl border border-blue-500/30 rounded-lg p-3 overflow-y-auto">
                  <h3 className="text-xs font-bold text-blue-400 mb-2 uppercase">Activity</h3>
                  <div className="space-y-1.5">
                    {activityItems.slice(0, 4).map((act, i) => (
                      <div key={i} className="text-xs text-gray-300 border-b border-slate-700/50 pb-1.5">
                        {act} • 2m ago
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'neural-center':
        return (
          <div className={`h-full flex flex-col transition-opacity duration-300 ${isShuffling ? 'opacity-50' : 'opacity-100'}`}>
            {/* Top: Neural Core Hero */}
            {!lockedConcepts.has('neural-core') && (
              <div className="flex-shrink-0 h-48 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-b border-cyan-500/30 p-4 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border-4 border-cyan-500/30">
                    <Brain className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">AI Neural Core</h1>
                    <p className="text-sm text-gray-400">Central AI processing visualization</p>
                    <div className="flex gap-4 mt-2">
                      <div>
                        <div className="text-xs text-gray-400">Processing</div>
                        <div className="text-lg font-bold text-emerald-400">Active</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Nodes</div>
                        <div className="text-lg font-bold text-cyan-400">1,247</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom: Labs Grid */}
            {!lockedConcepts.has('labs-grid') && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {labsGridItems.map((item, i) => (
                    <div key={i} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-lg p-3 hover:border-cyan-500/40 hover:scale-105 transition-all cursor-pointer group">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-2 mx-auto group-hover:scale-110 transition-transform">
                        <FlaskConical className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="text-xs font-bold text-white text-center group-hover:text-cyan-300">{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'split-matrix':
        return (
          <div className={`flex h-full transition-opacity duration-300 ${isShuffling ? 'opacity-50' : 'opacity-100'}`}>
            {/* Left: Neural Core Full Height */}
            {!lockedConcepts.has('neural-core') && (
              <div className="w-80 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-r border-cyan-500/30 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative z-10 text-center">
                  <div className="w-40 h-40 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-6 border-4 border-cyan-500/30 mx-auto">
                    <Brain className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.8)]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Neural Core</h2>
                  <p className="text-sm text-gray-400 mb-4">Real-time AI processing</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/20 rounded p-2 border border-cyan-500/20">
                      <div className="text-xs text-gray-400">Status</div>
                      <div className="text-sm font-bold text-emerald-400">Active</div>
                    </div>
                    <div className="bg-black/20 rounded p-2 border border-cyan-500/20">
                      <div className="text-xs text-gray-400">Nodes</div>
                      <div className="text-sm font-bold text-cyan-400">1,247</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Right: Matrix Grid */}
            {!lockedConcepts.has('matrix-grid') && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Labs & Features Matrix</h2>
                  <div className="text-xs text-gray-400">{matrixItems.length} active</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {matrixItems.map((item, i) => (
                    <div key={i} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-lg p-3 hover:border-cyan-500/40 hover:scale-105 transition-all cursor-pointer group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Zap className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300">{item}</div>
                          <div className="text-[10px] text-gray-500">Ready</div>
                        </div>
                      </div>
                      <div className="h-12 bg-black/20 rounded border border-cyan-500/10"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'punch-list':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading Punch List...</div>}>
            <TaskPunchList />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      <div className={`fixed top-4 left-4 z-50 bg-slate-800/90 backdrop-blur-xl border border-cyan-500/30 rounded-lg transition-all duration-300 ${
        controlsCollapsed ? 'w-12 h-12 p-2 overflow-hidden' : 'p-4'
      }`}>
        {controlsCollapsed ? (
          <button
            onClick={() => setControlsCollapsed(false)}
            className="w-full h-full flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-colors"
            title="Show controls"
          >
            <LayoutDashboard className="w-6 h-6" />
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-cyan-400">Layout Playground</h1>
              <button
                onClick={() => setControlsCollapsed(true)}
                className="text-gray-400 hover:text-cyan-400 transition-colors text-xl leading-none"
                title="Collapse"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">Advanced layout concepts</p>
            <div className="space-y-2 mb-4">
              {layouts.map((layout) => {
                const Icon = layout.icon;
                return (
                  <button
                    key={layout.id}
                    onClick={() => handleLayoutChange(layout.id)}
                    className={`w-full px-3 py-2 rounded text-sm transition-colors text-left flex items-center gap-2 ${
                      activeLayout === layout.id
                        ? layout.bgClass + ' text-white'
                        : layout.bgClass + '/50 text-white hover:opacity-80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{layout.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Lock Concepts Section */}
            {activeLayout !== 'punch-list' && currentConcepts.length > 0 && (
              <div className="border-t border-slate-700/50 pt-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Lock Concepts</h3>
                  {lockedConcepts.size > 0 && (
                    <button
                      onClick={() => setLockedConcepts(new Set())}
                      className="text-xs text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
                      title="Clear all locks"
                    >
                      <Unlock className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {currentConcepts.map((concept) => {
                    const isLocked = lockedConcepts.has(concept.id);
                    return (
                      <label
                        key={concept.id}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                          isLocked
                            ? 'bg-cyan-500/20 border border-cyan-500/30'
                            : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isLocked}
                          onChange={() => toggleLock(concept.id)}
                          className="w-3 h-3 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-1"
                        />
                        {isLocked ? (
                          <Lock className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <Unlock className="w-3 h-3 text-gray-500" />
                        )}
                        <span className={isLocked ? 'text-cyan-300' : 'text-gray-300'}>{concept.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shuffle Controls */}
            {activeLayout !== 'punch-list' && (
              <div className="border-t border-slate-700/50 pt-3 mt-3 space-y-2">
                <button
                  onClick={handleShuffle}
                  disabled={isShuffling}
                  className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
                  <span>{isShuffling ? 'Shuffling...' : 'Shuffle Unlocked'}</span>
                </button>
                {(shuffledData || shuffleCount > 0) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset</span>
                    </button>
                    {shuffleCount > 0 && (
                      <div className="px-2 py-1 bg-slate-700/50 rounded text-xs text-gray-400">
                        {shuffleCount}x
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex-1 overflow-hidden">{renderLayout()}</div>
    </div>
  );
};

export default LayoutPlayground;