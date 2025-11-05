import React, { useState } from 'react';
import { Idea, IdeaStatus } from '../../types/idea';
import { MoreVertical, Trash2 } from 'lucide-react';

interface IdeaCardProps {
  idea: Idea;
  onUpdateStatus: (id: number, newStatus: IdeaStatus) => void;
  onDelete: (id: number) => void;
}

const statusOptions = Object.values(IdeaStatus);

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onUpdateStatus, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div className="bg-cyan-900/40 border border-cyan-500/30 p-4 rounded-lg shadow-lg shadow-cyan-500/10 relative transition-all duration-300 ease-in-out hover:shadow-cyan-400/20 hover:border-cyan-400/50">
      <h4 className="font-bold text-cyan-200 mb-2">{idea.title}</h4>
      <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">{idea.description}</p>
      <div className="text-xs text-gray-500">{new Date(idea.timestamp).toLocaleString()}</div>

      <div className="absolute top-2 right-2">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          onBlur={() => setTimeout(() => setIsMenuOpen(false), 150)}
          className="text-cyan-400 hover:text-white transition-colors p-1 rounded-full hover:bg-cyan-500/20"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-cyan-700 rounded-md shadow-xl z-10">
            <div className="py-1">
              <span className="block px-4 py-2 text-xs text-gray-400">Move to</span>
              {statusOptions
                .filter((s) => s !== idea.status)
                .map((status) => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.preventDefault();
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

