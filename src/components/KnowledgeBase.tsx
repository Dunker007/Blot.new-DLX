import { useState, useEffect } from 'react';
import {
  Book,
  Brain,
  Code,
  Lightbulb,
  FileText,
  Users,
  Plus,
  Search,
  Tag,
  Pin,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { KnowledgeBase as KB, AgentPersona, AgentHandoff } from '../types';

export default function KnowledgeBase() {
  const [knowledge, setKnowledge] = useState<KB[]>([]);
  const [personas, setPersonas] = useState<AgentPersona[]>([]);
  const [handoffs, setHandoffs] = useState<AgentHandoff[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    category: 'note' as const,
    title: '',
    content: '',
    tags: [] as string[],
    is_pinned: false,
  });

  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  const loadKnowledgeBase = async () => {
    try {
      setLoading(true);

      const [kbData, personasData, handoffsData] = await Promise.all([
        supabase.from('knowledge_base').select('*').eq('is_archived', false).order('is_pinned', { ascending: false }).order('updated_at', { ascending: false }),
        supabase.from('agent_personas').select('*').order('is_active', { ascending: false }),
        supabase.from('agent_handoffs').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      if (kbData.data) setKnowledge(kbData.data);
      if (personasData.data) setPersonas(personasData.data);
      if (handoffsData.data) setHandoffs(handoffsData.data);
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (!newEntry.title.trim()) return;

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert([newEntry])
      .select()
      .single();

    if (error) {
      console.error('Failed to add entry:', error);
      return;
    }

    if (data) {
      setKnowledge([data, ...knowledge]);
      setShowAddModal(false);
      setNewEntry({
        category: 'note',
        title: '',
        content: '',
        tags: [],
        is_pinned: false,
      });
    }
  };

  const togglePin = async (id: string, currentPinned: boolean) => {
    await supabase
      .from('knowledge_base')
      .update({ is_pinned: !currentPinned })
      .eq('id', id);

    setKnowledge(knowledge.map(k =>
      k.id === id ? { ...k, is_pinned: !currentPinned } : k
    ));
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this entry?')) return;

    await supabase.from('knowledge_base').delete().eq('id', id);
    setKnowledge(knowledge.filter(k => k.id !== id));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'persona': return Users;
      case 'handoff': return Sparkles;
      case 'snippet': return Code;
      case 'tip': return Lightbulb;
      case 'template': return FileText;
      default: return Book;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'persona': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'handoff': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'snippet': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'tip': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'template': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const filteredKnowledge = knowledge.filter(k => {
    const matchesSearch = k.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         k.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         k.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || k.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30">
            <Brain size={32} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Knowledge Base</h1>
            <p className="text-slate-400 text-lg">Your AI memory and context store</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/25"
        >
          <Plus size={20} />
          Add Entry
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge base..."
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
        >
          <option value="all">All Categories</option>
          <option value="persona">Personas</option>
          <option value="handoff">Handoffs</option>
          <option value="snippet">Snippets</option>
          <option value="tip">Tips</option>
          <option value="template">Templates</option>
          <option value="note">Notes</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all">
          <Users size={24} className="text-blue-400 mb-2" />
          <div className="text-2xl font-bold mb-1">{personas.length}</div>
          <div className="text-sm text-slate-400">AI Personas</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-all">
          <Sparkles size={24} className="text-cyan-400 mb-2" />
          <div className="text-2xl font-bold mb-1">{handoffs.length}</div>
          <div className="text-sm text-slate-400">Agent Handoffs</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-all">
          <Code size={24} className="text-green-400 mb-2" />
          <div className="text-2xl font-bold mb-1">{knowledge.filter(k => k.category === 'snippet').length}</div>
          <div className="text-sm text-slate-400">Code Snippets</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-6 hover:border-yellow-500/40 transition-all">
          <Lightbulb size={24} className="text-yellow-400 mb-2" />
          <div className="text-2xl font-bold mb-1">{knowledge.filter(k => k.category === 'tip').length}</div>
          <div className="text-sm text-slate-400">Tips & Tricks</div>
        </div>
      </div>

      {knowledge.filter(k => k.is_pinned).length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Pin size={20} className="text-cyan-400" />
            Pinned Items
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {knowledge.filter(k => k.is_pinned).map((entry) => {
              const Icon = getCategoryIcon(entry.category);
              const colorClass = getCategoryColor(entry.category);

              return (
                <div
                  key={entry.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/40 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${colorClass}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{entry.title}</h3>
                        <div className="text-xs text-slate-500 capitalize">{entry.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => togglePin(entry.id, entry.is_pinned)}
                        className="p-1.5 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Pin size={16} className="text-cyan-400 fill-cyan-400" />
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{entry.content}</p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-full flex items-center gap-1"
                        >
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">
          All Knowledge ({filteredKnowledge.length})
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredKnowledge.map((entry) => {
            const Icon = getCategoryIcon(entry.category);
            const colorClass = getCategoryColor(entry.category);

            return (
              <div
                key={entry.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${colorClass}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{entry.title}</h3>
                      <div className="text-xs text-slate-500 capitalize">{entry.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => togglePin(entry.id, entry.is_pinned)}
                      className="p-1 hover:bg-slate-800 rounded transition-colors"
                    >
                      <Pin size={14} className={entry.is_pinned ? 'text-cyan-400 fill-cyan-400' : 'text-slate-400'} />
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-400 text-xs mb-2 line-clamp-3">{entry.content}</p>
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {entry.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-slate-500 text-xs">
                        +{entry.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Add Knowledge Entry</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Category</label>
                <select
                  value={newEntry.category}
                  onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500"
                >
                  <option value="note">Note</option>
                  <option value="tip">Tip</option>
                  <option value="snippet">Code Snippet</option>
                  <option value="template">Template</option>
                  <option value="persona">Persona</option>
                  <option value="handoff">Handoff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Title</label>
                <input
                  type="text"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  placeholder="Give it a descriptive title..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Content</label>
                <textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  placeholder="Write your knowledge entry here..."
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newEntry.tags.join(', ')}
                  onChange={(e) => setNewEntry({
                    ...newEntry,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  placeholder="react, typescript, api"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin"
                  checked={newEntry.is_pinned}
                  onChange={(e) => setNewEntry({ ...newEntry, is_pinned: e.target.checked })}
                  className="w-4 h-4 bg-slate-800 border-slate-700 rounded"
                />
                <label htmlFor="pin" className="text-sm text-slate-400">Pin this entry</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={addEntry}
                  disabled={!newEntry.title.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
                >
                  Add Entry
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
