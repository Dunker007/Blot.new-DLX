import React from 'react';
import { Idea, IdeaStatus } from '../../types/idea';
import { IdeaCard } from './IdeaCard';

interface IdeaBoardProps {
  ideas: Idea[];
  onUpdateStatus: (id: number, newStatus: IdeaStatus) => void;
  onDelete: (id: number) => void;
}

const statusColumns: IdeaStatus[] = [
  IdeaStatus.NEW,
  IdeaStatus.DISCUSSION,
  IdeaStatus.APPROVED,
  IdeaStatus.ARCHIVED,
];

const columnStyles: { [key in IdeaStatus]: string } = {
  [IdeaStatus.NEW]: 'border-blue-500',
  [IdeaStatus.DISCUSSION]: 'border-yellow-500',
  [IdeaStatus.APPROVED]: 'border-green-500',
  [IdeaStatus.ARCHIVED]: 'border-gray-600',
};

const IdeaColumn: React.FC<{ title: IdeaStatus; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="flex-1 min-w-[300px] bg-black/30 p-4 rounded-lg">
      <h3 className={`text-lg font-bold text-cyan-300 mb-4 pb-2 border-b-2 ${columnStyles[title]}`}>
        {title}
      </h3>
      <div className="space-y-4 h-[60vh] overflow-y-auto pr-2">{children}</div>
    </div>
  );
};

export const IdeaBoard: React.FC<IdeaBoardProps> = ({ ideas, onUpdateStatus, onDelete }) => {
  return (
    <div className="flex flex-row gap-6 overflow-x-auto pb-4">
      {statusColumns.map((status) => (
        <IdeaColumn key={status} title={status}>
          {ideas
            .filter((idea) => idea.status === status)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onUpdateStatus={onUpdateStatus} onDelete={onDelete} />
            ))}
        </IdeaColumn>
      ))}
    </div>
  );
};

