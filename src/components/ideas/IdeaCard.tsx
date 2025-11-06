import { useState, useRef, useEffect } from 'react';
import { Idea, IdeaStatus } from '../../types/idea';
import { MoreVertical, Trash2, ChevronUp, ChevronDown, Tag, Calendar, Paperclip, Sparkles, AlertCircle } from 'lucide-react';

interface IdeaCardProps {
  idea: Idea;
  onUpdateStatus: (id: number, newStatus: IdeaStatus) => void;
  onDelete: (id: number) => void;
  onVote?: (id: number, delta: number) => void;
  voteCount?: number;
}

const statusOptions = Object.values(IdeaStatus);

const priorityColors = {
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onUpdateStatus, onDelete, onVote, voteCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  const handleStatusChange = (newStatus: IdeaStatus) => {
    onUpdateStatus(idea.id, newStatus);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the idea: "${idea.title}"?`)) {
      onDelete(idea.id);
    }
    setIsMenuOpen(false);
  };

  const isOverdue = idea.dueDate && new Date(idea.dueDate) < new Date();
  const priority = idea.priority || 'medium';
  const displayVotes = voteCount || idea.votes || 0;

  return (
    <div className={`bg-cyan-900/40 border border-cyan-500/30 p-4 rounded-lg shadow-lg shadow-cyan-500/10 relative transition-all duration-300 ease-in-out hover:shadow-cyan-400/20 hover:border-cyan-400/50 ${idea.aiGenerated ? 'ring-1 ring-pink-500/30' : ''}`}>
      {/* Header with Priority and AI Badge */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          {idea.priority && (
            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${priorityColors[priority as keyof typeof priorityColors]}`}>
              {priority.toUpperCase()}
            </span>
          )}
          {idea.aiGenerated && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Sparkles className="w-3 h-3" />
              AI
            </span>
          )}
        </div>
      </div>

      <h4 className="font-bold text-cyan-200 mb-2">{idea.title}</h4>
      <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">{idea.description}</p>

      {/* Tags */}
      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {idea.tags.map((tag, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Due Date */}
      {idea.dueDate && (
        <div className={`flex items-center gap-1 mb-2 text-xs ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
          <Calendar className="w-3 h-3" />
          <span>Due: {new Date(idea.dueDate).toLocaleDateString()}</span>
          {isOverdue && (
            <span className="flex items-center gap-1 text-red-400">
              <AlertCircle className="w-3 h-3" />
              Overdue
            </span>
          )}
        </div>
      )}

      {/* Attachments */}
      {idea.attachments && idea.attachments.length > 0 && (
        <div className="flex items-center gap-1 mb-2 text-xs text-gray-400">
          <Paperclip className="w-3 h-3" />
          <span>{idea.attachments.length} attachment{idea.attachments.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Voting and Timestamp Row */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-cyan-500/20">
        <div className="flex items-center gap-2">
          {onVote && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onVote(idea.id, 1);
                }}
                className="p-1 hover:bg-cyan-500/20 rounded transition-colors"
                title="Upvote"
              >
                <ChevronUp className="w-4 h-4 text-cyan-400" />
              </button>
              <span className="text-sm font-semibold text-cyan-300 min-w-[2ch] text-center">{displayVotes}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onVote(idea.id, -1);
                }}
                className="p-1 hover:bg-cyan-500/20 rounded transition-colors"
                title="Downvote"
              >
                <ChevronDown className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">{new Date(idea.timestamp).toLocaleString()}</div>
      </div>

      <div className="absolute top-2 right-2">
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="text-cyan-400 hover:text-white transition-colors p-1 rounded-full hover:bg-cyan-500/20"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 bg-gray-900 border border-cyan-700 rounded-md shadow-xl z-10"
            onMouseDown={(e) => e.preventDefault()} // Prevent blur on menu click
          >
            <div className="py-1">
              <span className="block px-4 py-2 text-xs text-gray-400">Move to</span>
              {statusOptions
                .filter((s) => s !== idea.status)
                .map((status) => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStatusChange(status);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-800/50"
                  >
                    {status}
                  </button>
                ))}
              <div className="border-t border-cyan-700/50 my-1"></div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete();
                }}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-800/50"
              >
                <Trash2 className="h-4 w-4" />
                Delete Idea
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

