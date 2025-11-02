import React from 'react';

import { Activity, Brain, Cpu } from 'lucide-react';

const HolographicBrain: React.FC = () => {
  return (
    <div className="relative w-full h-96 flex items-center justify-center overflow-hidden">
      {/* Holographic Container */}
      <div className="relative w-80 h-80 rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl">
        {/* Rotating Rings */}
        <div className="absolute inset-4 rounded-full border border-cyan-400/20 animate-spin-slow"></div>
        <div className="absolute inset-8 rounded-full border border-purple-400/20 animate-reverse-spin"></div>
        <div className="absolute inset-12 rounded-full border border-pink-400/20 animate-spin-slow"></div>

        {/* Central Brain with Enhanced Halo */}
        <div className="absolute inset-20 rounded-full flex items-center justify-center">
          <div className="relative">
            {/* Multiple Halo Layers */}
            <div
              className="absolute inset-0 w-32 h-32 bg-cyan-400/10 rounded-full animate-pulse blur-md"
              style={{ animationDuration: '3s' }}
            ></div>
            <div
              className="absolute inset-2 w-28 h-28 bg-purple-400/15 rounded-full animate-pulse blur-sm"
              style={{ animationDuration: '2.5s' }}
            ></div>
            <div
              className="absolute inset-4 w-24 h-24 bg-pink-400/10 rounded-full animate-pulse blur-sm"
              style={{ animationDuration: '2s' }}
            ></div>

            <Brain className="relative w-32 h-32 text-cyan-400 drop-shadow-[0_0_30px_rgba(6,182,212,1)] filter brightness-110" />

            {/* Enhanced Neural Connections with Halo */}
            <div className="absolute -inset-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-8 bg-gradient-to-t from-transparent via-cyan-400 to-transparent opacity-80 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                  style={{
                    transform: `rotate(${i * 45}deg)`,
                    transformOrigin: 'center bottom',
                    bottom: '50%',
                    left: '50%',
                    marginLeft: '-2px',
                  }}
                />
              ))}
            </div>

            {/* Pulsing Core Halo */}
            <div
              className="absolute inset-8 w-16 h-16 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-cyan-400/20 rounded-full animate-ping"
              style={{ animationDuration: '4s' }}
            ></div>
          </div>
        </div>

        {/* Data Streams */}
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="absolute w-0.5 h-16 bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse"
            style={{
              top: '20%',
              left: `${25 + index * 20}%`,
            }}
          />
        ))}

        {/* Orbital Elements with Halo Effect */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute">
              {/* Outer Halo */}
              <div
                className="absolute w-6 h-6 bg-cyan-400/10 rounded-full animate-pulse blur-sm"
                style={{
                  top: `${30 + Math.sin((i * 60 * Math.PI) / 180) * 25}%`,
                  left: `${50 + Math.cos((i * 60 * Math.PI) / 180) * 35}%`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.3}s`,
                }}
              />
              {/* Core Node */}
              <div
                className="absolute w-3 h-3 bg-cyan-400 rounded-full opacity-80 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                style={{
                  top: `${30 + Math.sin((i * 60 * Math.PI) / 180) * 25}%`,
                  left: `${50 + Math.cos((i * 60 * Math.PI) / 180) * 35}%`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Circuit Patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-40"></div>
          <div className="absolute top-3/4 left-1/4 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40"></div>
          <div className="absolute top-1/4 left-1/4 w-0.5 h-1/2 bg-gradient-to-b from-transparent via-pink-400 to-transparent opacity-40"></div>
          <div className="absolute top-1/4 right-1/4 w-0.5 h-1/2 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-40"></div>
        </div>
      </div>

      {/* Status Indicators with Subtle Halo */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="flex items-center space-x-2 px-3 py-1 bg-black/30 rounded-lg border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Activity className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
          <span className="text-cyan-400 text-sm font-mono drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]">
            NEURAL ACTIVE
          </span>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-black/30 rounded-lg border border-purple-400/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <Cpu className="w-4 h-4 text-purple-400 drop-shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
          <span className="text-purple-400 text-sm font-mono drop-shadow-[0_0_4px_rgba(139,92,246,0.6)]">
            AI CORE ONLINE
          </span>
        </div>
      </div>

      {/* Corner Data Readouts with Halo Glow */}
      <div className="absolute top-4 right-4 text-right space-y-1">
        <div className="text-cyan-400 font-mono text-xs drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
          PROC: 98.7%
        </div>
        <div className="text-purple-400 font-mono text-xs drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]">
          MEM: 64.2GB
        </div>
        <div className="text-pink-400 font-mono text-xs drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]">
          NET: 2.1GB/s
        </div>
      </div>
    </div>
  );
};

export default HolographicBrain;
