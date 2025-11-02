import React, { useEffect, useState } from 'react';

import { Activity, Cpu, Database, Network, Settings, Zap } from 'lucide-react';

const TurboHubCore: React.FC = () => {
  const [activeRing, setActiveRing] = useState(0);
  const [pulseIntensity, setPulseIntensity] = useState(0.5);

  useEffect(() => {
    const ringInterval = setInterval(() => {
      setActiveRing(prev => (prev + 1) % 6);
    }, 1500);

    const pulseInterval = setInterval(() => {
      setPulseIntensity(prev => (prev === 0.5 ? 1 : 0.5));
    }, 2000);

    return () => {
      clearInterval(ringInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  const hexagonPoints = 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)';

  return (
    <div className="relative w-full h-96 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-8 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `fadeInOut ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Hexagonal Container */}
      <div className="relative w-80 h-80">
        {/* Outer Rotating Rings */}
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className={`absolute inset-0 border rounded-full transition-all duration-1000 ${
              activeRing === index ? 'border-cyan-400 scale-110' : 'border-cyan-400/20'
            }`}
            style={{
              transform: `rotate(${index * 15}deg) scale(${1 + index * 0.08})`,
              animation: `spin-slow ${20 + index * 2}s linear infinite`,
              opacity: activeRing === index ? 1 : 0.3,
            }}
          />
        ))}

        {/* Central Hexagon Core */}
        <div className="absolute inset-16">
          <div
            className="w-full h-full bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 border-2 border-cyan-400 backdrop-blur-sm"
            style={{
              clipPath: hexagonPoints,
              filter: `drop-shadow(0 0 ${20 * pulseIntensity}px rgba(6, 182, 212, 0.8))`,
            }}
          >
            {/* Inner Hexagon Layers */}
            <div
              className="absolute inset-2 bg-gradient-to-br from-purple-500/15 to-cyan-500/15 border border-purple-400/50"
              style={{ clipPath: hexagonPoints }}
            >
              <div
                className="absolute inset-2 bg-gradient-to-br from-slate-900/80 to-black/80 border border-pink-400/30"
                style={{ clipPath: hexagonPoints }}
              >
                {/* Core Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-12 h-12 text-cyan-400 animate-pulse drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orbital Data Nodes */}
        {[
          {
            icon: Activity,
            color: 'text-cyan-400',
            label: 'NEURAL',
            position: { top: '10%', left: '50%' },
          },
          {
            icon: Database,
            color: 'text-purple-400',
            label: 'DATA',
            position: { top: '35%', right: '5%' },
          },
          {
            icon: Network,
            color: 'text-pink-400',
            label: 'NET',
            position: { bottom: '35%', right: '5%' },
          },
          {
            icon: Settings,
            color: 'text-green-400',
            label: 'SYS',
            position: { bottom: '10%', left: '50%' },
          },
          {
            icon: Cpu,
            color: 'text-amber-400',
            label: 'PROC',
            position: { bottom: '35%', left: '5%' },
          },
          { icon: Zap, color: 'text-red-400', label: 'PWR', position: { top: '35%', left: '5%' } },
        ].map((node, index) => {
          const IconComponent = node.icon;
          return (
            <div
              key={index}
              className="absolute w-12 h-12 flex flex-col items-center justify-center"
              style={node.position}
            >
              <div className={`p-2 rounded-lg bg-black/50 border border-current/30 ${node.color}`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div className={`text-xs font-mono mt-1 ${node.color}`}>{node.label}</div>
            </div>
          );
        })}

        {/* Data Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.8)" />
              <stop offset="50%" stopColor="rgba(139, 92, 246, 0.6)" />
              <stop offset="100%" stopColor="rgba(236, 72, 153, 0.4)" />
            </linearGradient>
          </defs>

          {/* Connection lines from center to nodes */}
          {[0, 60, 120, 180, 240, 300].map((angle, index) => {
            const x1 = 160; // center
            const y1 = 160; // center
            const x2 = x1 + Math.cos(((angle - 90) * Math.PI) / 180) * 120;
            const y2 = y1 + Math.sin(((angle - 90) * Math.PI) / 180) * 120;

            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#connectionGradient)"
                strokeWidth="1"
                opacity={activeRing === index ? 1 : 0.3}
                className="transition-opacity duration-1000"
              />
            );
          })}
        </svg>
      </div>

      {/* Status HUD */}
      <div className="absolute top-6 left-6 space-y-2">
        <div className="flex items-center space-x-3 px-4 py-2 bg-black/40 rounded-lg border border-cyan-400/30 backdrop-blur-sm">
          <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <div className="text-cyan-400 font-mono text-sm font-bold">TURBO HUB</div>
            <div className="text-cyan-300 text-xs">LUX 2.0 • DV-FIRST</div>
          </div>
        </div>

        <div className="px-4 py-2 bg-black/40 rounded-lg border border-purple-400/30 backdrop-blur-sm">
          <div className="text-purple-400 font-mono text-xs mb-1">SYSTEM STATUS</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-emerald-400">NEURAL: ✓</div>
            <div className="text-emerald-400">CORE: ✓</div>
            <div className="text-emerald-400">NET: ✓</div>
            <div className="text-emerald-400">PWR: ✓</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="absolute bottom-6 right-6 space-y-1 text-right">
        <div className="text-cyan-400 font-mono text-xs">THROUGHPUT: 847.2 TPS</div>
        <div className="text-purple-400 font-mono text-xs">LATENCY: 0.23ms</div>
        <div className="text-pink-400 font-mono text-xs">EFFICIENCY: 99.7%</div>
        <div className="text-green-400 font-mono text-xs">UPTIME: 99.99%</div>
      </div>

      {/* Title Text */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400 mb-1">DLX COMMAND CENTER</div>
          <div className="text-lg text-purple-400">LUX 2.0 • TURBO HUB</div>
          <div className="text-sm text-pink-400 font-mono">
            DV-AI CREATOR ECOSYSTEM / DV-FIRST ARCHITECTURE
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurboHubCore;
