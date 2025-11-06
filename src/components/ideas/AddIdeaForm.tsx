import { useState } from 'react';
import { Plus, X, Tag, Calendar, Paperclip, FileText } from 'lucide-react';
import { Idea } from '../../types/idea';

interface AddIdeaFormProps {
  onSubmit: (ideaData: Partial<Idea>) => void;
}

const IDEA_TEMPLATES = {
  none: { title: '', description: '', tags: [], priority: 'medium' as const },
  'bug-fix': {
    title: '',
    description: 'Steps to reproduce:\n1. ...\n2. ...\n\nExpected behavior:\n...\n\nActual behavior:\n...',
    tags: ['bug', 'fix'],
    priority: 'high' as const,
  },
  'feature-request': {
    title: '',
    description: 'Feature Description:\n...\n\nUse Case:\n...\n\nBenefits:\n...',
    tags: ['feature', 'enhancement'],
    priority: 'medium' as const,
  },
  'enhancement': {
    title: '',
    description: 'Current State:\n...\n\nProposed Enhancement:\n...\n\nImpact:\n...',
    tags: ['enhancement', 'improvement'],
    priority: 'medium' as const,
  },
  'performance': {
    title: '',
    description: 'Performance Issue:\n...\n\nCurrent Performance:\n...\n\nTarget Performance:\n...',
    tags: ['performance', 'optimization'],
    priority: 'high' as const,
  },
  'ui-ux': {
    title: '',
    description: 'Current UI/UX:\n...\n\nProposed Changes:\n...\n\nUser Impact:\n...',
    tags: ['ui', 'ux', 'design'],
    priority: 'medium' as const,
  },
  'integration': {
    title: '',
    description: 'Integration Target:\n...\n\nUse Case:\n...\n\nTechnical Requirements:\n...',
    tags: ['integration', 'api'],
    priority: 'medium' as const,
  },
};

export const AddIdeaForm: React.FC<AddIdeaFormProps> = ({ onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof IDEA_TEMPLATES>('none');
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string; type: string }>>([]);

  const handleTemplateChange = (templateKey: keyof typeof IDEA_TEMPLATES) => {
    setSelectedTemplate(templateKey);
    const template = IDEA_TEMPLATES[templateKey];
    if (templateKey !== 'none') {
      setDescription(template.description);
      setTags(template.tags || []);
      setPriority(template.priority);
    } else {
      setDescription('');
      setTags([]);
      setPriority('medium');
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setAttachments(prev => [...prev, {
            name: file.name,
            url: base64,
            type: file.type,
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        tags,
        priority,
        dueDate: dueDate || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        template: selectedTemplate !== 'none' ? selectedTemplate : undefined,
      });
      // Reset form
      setTitle('');
      setDescription('');
      setTags([]);
      setTagInput('');
      setPriority('medium');
      setDueDate('');
      setAttachments([]);
      setSelectedTemplate('none');
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setPriority('medium');
    setDueDate('');
    setAttachments([]);
    setSelectedTemplate('none');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
      >
        <Plus className="w-5 h-5" />
        Add New Idea
      </button>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-cyan-400">New Idea</h3>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Template Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Template (Optional)</label>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value as keyof typeof IDEA_TEMPLATES)}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {Object.keys(IDEA_TEMPLATES).map(key => (
              <option key={key} value={key}>
                {key === 'none' ? 'No Template' : key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter idea title..."
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your idea..."
            rows={4}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            required
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag and press Enter..."
              className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Priority and Due Date Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            Attachments (Optional)
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            multiple
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-cyan-600 file:text-white file:cursor-pointer hover:file:bg-cyan-700"
          />
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachments.map((att, idx) => (
                <div key={idx} className="flex items-center justify-between px-2 py-1 bg-slate-800/50 rounded text-xs text-gray-300">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {att.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all duration-200"
          >
            Add Idea
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

