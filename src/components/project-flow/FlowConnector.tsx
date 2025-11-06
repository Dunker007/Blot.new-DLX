/**
 * Flow Connector Component
 * Visual flow lines connecting related items
 */

import React, { useMemo } from 'react';
import { ProjectFlowItem } from '../../types/projectFlow';

interface FlowConnectorProps {
  items: ProjectFlowItem[];
}

export const FlowConnector: React.FC<FlowConnectorProps> = ({ items }) => {
  const connections = useMemo(() => {
    const conns: Array<{ from: string; to: string; type: string }> = [];
    
    items.forEach(item => {
      if (item.linkedItems) {
        item.linkedItems.forEach(linkedId => {
          const linkedItem = items.find(i => i.id === linkedId);
          if (linkedItem) {
            // Only show connections between different columns
            if (item.column !== linkedItem.column) {
              conns.push({
                from: item.id,
                to: linkedId,
                type: item.type === 'idea' && linkedItem.type === 'task' ? 'idea-to-task' : 'task-to-task',
              });
            }
          }
        });
      }
    });
    
    return conns;
  }, [items]);

  // For now, return empty div - will implement SVG connections later
  // This is a placeholder for the visual flow graphics
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {/* SVG connections will be rendered here based on card positions */}
      {/* This will be implemented with React Refs to get card positions */}
    </div>
  );
};
