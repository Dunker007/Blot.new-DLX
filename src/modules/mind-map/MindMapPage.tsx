import React, { useState } from 'react';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

const MindMapPage: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', label: 'Central Idea', x: 400, y: 300 },
    { id: '2', label: 'Branch 1', x: 200, y: 200 },
    { id: '3', label: 'Branch 2', x: 600, y: 200 },
  ]);

  const addNode = () => {
    const newNode: Node = {
      id: Date.now().toString(),
      label: 'New Node',
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
    };
    setNodes([...nodes, newNode]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-2">Mind Map</h1>
        <button
          onClick={addNode}
          className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          Add Node
        </button>
      </div>

      <div className="flex-1 relative bg-gray-900">
        <svg className="w-full h-full">
          {nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={50}
                fill="#22d3ee"
                stroke="#06b6d4"
                strokeWidth={2}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={14}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default MindMapPage;

