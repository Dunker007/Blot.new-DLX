import React, { useEffect, useState } from 'react';

interface DataNode {
  id: string;
  x: number;
  y: number;
  value: number;
  connections: string[];
}

const NeuralNetworkOverlay: React.FC = () => {
  const [nodes, setNodes] = useState<DataNode[]>([]);
  const [activeConnections, setActiveConnections] = useState<string[]>([]);

  useEffect(() => {
    // Generate neural network nodes
    const networkNodes: DataNode[] = [
      {
        id: 'core',
        x: 50,
        y: 50,
        value: 100,
        connections: ['input1', 'input2', 'output1', 'output2'],
      },
      { id: 'input1', x: 20, y: 30, value: 75, connections: ['core', 'hidden1'] },
      { id: 'input2', x: 20, y: 70, value: 85, connections: ['core', 'hidden2'] },
      { id: 'output1', x: 80, y: 30, value: 92, connections: ['core', 'hidden3'] },
      { id: 'output2', x: 80, y: 70, value: 88, connections: ['core', 'hidden4'] },
      { id: 'hidden1', x: 35, y: 15, value: 60, connections: ['input1', 'core'] },
      { id: 'hidden2', x: 35, y: 85, value: 65, connections: ['input2', 'core'] },
      { id: 'hidden3', x: 65, y: 15, value: 70, connections: ['output1', 'core'] },
      { id: 'hidden4', x: 65, y: 85, value: 72, connections: ['output2', 'core'] },
    ];

    setNodes(networkNodes);

    // Animate connections
    const interval = setInterval(() => {
      const randomNode = networkNodes[Math.floor(Math.random() * networkNodes.length)];
      setActiveConnections(randomNode.connections.map(conn => `${randomNode.id}-${conn}`));

      setTimeout(() => setActiveConnections([]), 1000);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getConnectionPath = (node1: DataNode, node2: DataNode) => {
    const x1 = (node1.x / 100) * 300;
    const y1 = (node1.y / 100) * 200;
    const x2 = (node2.x / 100) * 300;
    const y2 = (node2.y / 100) * 200;

    // Create curved path
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const offset = 20;

    return `M ${x1} ${y1} Q ${midX} ${midY + offset} ${x2} ${y2}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full opacity-30">
        <defs>
          <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0.8)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.6)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.4)" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Render connections */}
        {nodes.map(node =>
          node.connections.map(connId => {
            const targetNode = nodes.find(n => n.id === connId);
            if (!targetNode) return null;

            const connectionId = `${node.id}-${connId}`;
            const isActive =
              activeConnections.includes(connectionId) ||
              activeConnections.includes(`${connId}-${node.id}`);

            return (
              <path
                key={connectionId}
                d={getConnectionPath(node, targetNode)}
                stroke={isActive ? 'url(#neuralGrad)' : 'rgba(6, 182, 212, 0.2)'}
                strokeWidth={isActive ? '2' : '1'}
                fill="none"
                filter={isActive ? 'url(#glow)' : 'none'}
                className={isActive ? 'animate-pulse' : ''}
              />
            );
          })
        )}

        {/* Render nodes */}
        {nodes.map(node => {
          const cx = (node.x / 100) * 300;
          const cy = (node.y / 100) * 200;
          const isCore = node.id === 'core';

          return (
            <g key={node.id}>
              {/* Node glow */}
              <circle
                cx={cx}
                cy={cy}
                r={isCore ? 12 : 8}
                fill="rgba(6, 182, 212, 0.1)"
                className="animate-pulse"
              />

              {/* Main node */}
              <circle
                cx={cx}
                cy={cy}
                r={isCore ? 8 : 5}
                fill={isCore ? 'rgba(6, 182, 212, 1)' : 'rgba(139, 92, 246, 0.8)'}
                filter="url(#glow)"
              />

              {/* Value indicator */}
              <text
                x={cx}
                y={cy - 15}
                textAnchor="middle"
                className="text-xs font-mono fill-cyan-300"
              >
                {node.value}%
              </text>
            </g>
          );
        })}

        {/* Data flow particles */}
        {activeConnections.map((conn, index) => (
          <circle
            key={`particle-${conn}-${index}`}
            r="2"
            fill="rgba(6, 182, 212, 1)"
            className="animate-pulse"
          >
            <animateMotion
              dur="1s"
              repeatCount="1"
              path={(() => {
                const [nodeId1, nodeId2] = conn.split('-');
                const node1 = nodes.find(n => n.id === nodeId1);
                const node2 = nodes.find(n => n.id === nodeId2);
                return node1 && node2 ? getConnectionPath(node1, node2) : '';
              })()}
            />
          </circle>
        ))}
      </svg>
    </div>
  );
};

export default NeuralNetworkOverlay;
