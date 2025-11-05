import React, { useState, useRef, useCallback } from 'react';
import { MindMapNode, NodeType, NodeColor, Point } from '../../types/mindmap';
import { featureFlagService } from '../../services/featureFlagService';
import WebGLBackground from '../../components/mind-map/WebGLBackground';
import VoiceControl from '../../components/mind-map/VoiceControl';
import { Plus, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'dlx-mindmap-nodes';

const COLOR_CONFIG: Record<NodeColor, { bg: string; border: string; text: string }> = {
  cyan: { bg: 'bg-cyan-900/40', border: 'border-cyan-500', text: 'text-cyan-200' },
  violet: { bg: 'bg-violet-900/40', border: 'border-violet-500', text: 'text-violet-200' },
  green: { bg: 'bg-green-900/40', border: 'border-green-500', text: 'text-green-200' },
  orange: { bg: 'bg-orange-900/40', border: 'border-orange-500', text: 'text-orange-200' },
  pink: { bg: 'bg-pink-900/40', border: 'border-pink-500', text: 'text-pink-200' },
  default: { bg: 'bg-slate-800/40', border: 'border-slate-500', text: 'text-slate-200' },
};

const NODE_SIZES = {
  [NodeType.ROOT]: 120,
  [NodeType.MAIN]: 100,
  [NodeType.LEAF]: 80,
  [NodeType.AGENT]: 80,
  [NodeType.AGENT_DESIGNER]: 100,
};

const MindMapPage: React.FC = () => {
  const [nodes, setNodes] = useState<MindMapNode[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load mind map', e);
    }
    // Default nodes
    return [
      {
        id: 'root',
        label: 'DLX Studios Ultimate',
        type: NodeType.ROOT,
        position: { x: 400, y: 300 },
        connections: ['main-1', 'main-2'],
        color: 'cyan',
        description: 'The ultimate AI development platform',
      },
      {
        id: 'main-1',
        label: 'Development Tools',
        type: NodeType.MAIN,
        position: { x: 200, y: 200 },
        connections: [],
        color: 'violet',
      },
      {
        id: 'main-2',
        label: 'AI Features',
        type: NodeType.MAIN,
        position: { x: 600, y: 200 },
        connections: [],
        color: 'green',
      },
    ];
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [clickEffect, setClickEffect] = useState<{ pos: Point; time: number } | null>(null);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef<Point>({ x: 0, y: 0 });
  const selectedNodePosition = useRef<Point | null>(null);

  // Persist nodes
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
    } catch (e) {
      console.error('Failed to save mind map', e);
    }
  }, [nodes]);

  // Update selected node position for WebGL glow
  React.useEffect(() => {
    if (selectedNodeId && containerRef.current) {
      const node = nodes.find((n) => n.id === selectedNodeId);
      if (node) {
        const rect = containerRef.current.getBoundingClientRect();
        selectedNodePosition.current = {
          x: node.position.x * zoom + pan.x + rect.left,
          y: node.position.y * zoom + pan.y + rect.top,
        };
      }
    } else {
      selectedNodePosition.current = null;
    }
  }, [selectedNodeId, nodes, zoom, pan]);

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId === selectedNodeId ? null : nodeId);
    setClickEffect({ pos: { x: e.clientX, y: e.clientY }, time: Date.now() });
  };

  const handleCanvasClick = () => {
    setSelectedNodeId(null);
  };

  const handleNodeDrag = useCallback((nodeId: string, newPosition: Point) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, position: newPosition } : node))
    );
  }, []);

  const addNode = () => {
    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      label: 'New Node',
      type: NodeType.LEAF,
      position: { x: Math.random() * 400 + 200, y: Math.random() * 300 + 150 },
      connections: [],
      color: 'default',
    };
    setNodes([...nodes, newNode]);
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes('add') || lowerCommand.includes('create')) {
      addNode();
    } else if (lowerCommand.includes('reset') || lowerCommand.includes('clear')) {
      if (confirm('Reset mind map to default?')) {
        setNodes([
          {
            id: 'root',
            label: 'DLX Studios Ultimate',
            type: NodeType.ROOT,
            position: { x: 400, y: 300 },
            connections: [],
            color: 'cyan',
          },
        ]);
        setPan({ x: 0, y: 0 });
        setZoom(1);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(2, zoom * delta));
    setZoom(newZoom);
  };

  const useWebGL = featureFlagService.isAvailable('webglBackground');

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900">
      {useWebGL && (
        <WebGLBackground
          selectedNodePosition={selectedNodePosition.current}
          click={clickEffect}
        />
      )}

      {/* Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <div className="bg-slate-800/90 backdrop-blur border border-cyan-500/30 rounded-lg p-4 shadow-lg">
          <h1 className="text-2xl font-bold text-cyan-400 mb-2">Mind Map</h1>
          <div className="flex gap-2">
            <button
              onClick={addNode}
              className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Node
            </button>
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setPan({ x: 0, y: 0 });
                setZoom(1);
              }}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
      >
        <svg className="w-full h-full" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          {/* Connections */}
          {nodes.map((node) =>
            node.connections.map((targetId) => {
              const target = nodes.find((n) => n.id === targetId);
              if (!target) return null;
              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={node.position.x}
                  y1={node.position.y}
                  x2={target.position.x}
                  y2={target.position.y}
                  stroke="rgba(34, 211, 238, 0.3)"
                  strokeWidth="2"
                />
              );
            })
          )}

          {/* Nodes */}
          {nodes.map((node) => {
            const colors = COLOR_CONFIG[node.color || 'default'];
            const size = NODE_SIZES[node.type];
            const isSelected = selectedNodeId === node.id;

            return (
              <g key={node.id}>
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={size / 2}
                  fill={isSelected ? 'rgba(34, 211, 238, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                  stroke={isSelected ? '#22d3ee' : colors.border.replace('border-', '#')}
                  strokeWidth={isSelected ? 3 : 2}
                  className="cursor-pointer transition-all"
                  onClick={(e) => handleNodeClick(node.id, e)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startPos = { ...node.position };
                    const startMouse = { x: e.clientX, y: e.clientY };

                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const deltaX = (moveEvent.clientX - startMouse.x) / zoom;
                      const deltaY = (moveEvent.clientY - startMouse.y) / zoom;
                      handleNodeDrag(node.id, {
                        x: startPos.x + deltaX,
                        y: startPos.y + deltaY,
                      });
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                <text
                  x={node.position.x}
                  y={node.position.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={node.type === NodeType.ROOT ? 16 : 14}
                  fontWeight={node.type === NodeType.ROOT ? 'bold' : 'normal'}
                  className="pointer-events-none select-none"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Voice Control */}
      {featureFlagService.isAvailable('voiceControl') && (
        <VoiceControl
          onCommand={handleVoiceCommand}
          onStatusUpdate={(msg, type) => {
            if (type === 'error') console.error(msg);
            else if (type === 'success') console.log(msg);
          }}
        />
      )}

      {/* Node Info Panel */}
      {selectedNodeId && (
        <div className="absolute top-4 right-4 z-10 bg-slate-800/90 backdrop-blur border border-cyan-500/30 rounded-lg p-4 shadow-lg max-w-sm">
          {(() => {
            const node = nodes.find((n) => n.id === selectedNodeId);
            if (!node) return null;
            return (
              <>
                <h3 className="text-lg font-bold text-cyan-400 mb-2">{node.label}</h3>
                {node.description && <p className="text-sm text-gray-300 mb-2">{node.description}</p>}
                <div className="text-xs text-gray-400">
                  <div>Type: {node.type}</div>
                  {node.status && <div>Status: {node.status}</div>}
                  {node.tasks && <div>Tasks: {node.tasks.length}</div>}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default MindMapPage;
