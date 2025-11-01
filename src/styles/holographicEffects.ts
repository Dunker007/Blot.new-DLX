/**
 * Holographic Visual Effects
 * Inspired by futuristic AI brain and neural network imagery
 */

// Advanced CSS animations for holographic effects
export const holographicStyles = `
  @keyframes hologram-flicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  @keyframes neural-pulse {
    0%, 100% { 
      transform: scale(1);
      opacity: 0.7;
    }
    50% { 
      transform: scale(1.05);
      opacity: 1;
    }
  }

  @keyframes data-stream {
    0% { 
      transform: translateX(-100%) translateY(0);
      opacity: 0;
    }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { 
      transform: translateX(100vw) translateY(-20px);
      opacity: 0;
    }
  }

  @keyframes hexagon-rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes brain-glow {
    0%, 100% { 
      filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.6))
             drop-shadow(0 0 40px rgba(139, 92, 246, 0.4)); 
    }
    50% { 
      filter: drop-shadow(0 0 30px rgba(6, 182, 212, 0.8))
             drop-shadow(0 0 60px rgba(139, 92, 246, 0.6)); 
    }
  }

  .hologram-effect {
    position: relative;
    background: linear-gradient(135deg, 
      rgba(6, 182, 212, 0.1) 0%,
      rgba(139, 92, 246, 0.1) 50%,
      rgba(236, 72, 153, 0.1) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(6, 182, 212, 0.3);
    animation: hologram-flicker 3s ease-in-out infinite;
  }

  .neural-network {
    background: radial-gradient(circle at center,
      rgba(6, 182, 212, 0.15) 0%,
      rgba(139, 92, 246, 0.1) 40%,
      transparent 70%);
    animation: neural-pulse 2s ease-in-out infinite;
  }

  .data-stream {
    position: absolute;
    width: 2px;
    height: 20px;
    background: linear-gradient(to bottom,
      transparent 0%,
      rgba(6, 182, 212, 1) 50%,
      transparent 100%);
    animation: data-stream 4s linear infinite;
  }

  .hexagon-grid {
    clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
    animation: hexagon-rotate 20s linear infinite;
  }

  .brain-core {
    animation: brain-glow 3s ease-in-out infinite;
  }

  .circuit-lines {
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(6, 182, 212, 0.5) 50%,
      transparent 100%);
    height: 1px;
    width: 100%;
    position: relative;
  }

  .circuit-lines::before,
  .circuit-lines::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(6, 182, 212, 1);
    border-radius: 50%;
    top: -1.5px;
  }

  .circuit-lines::before { left: 0; }
  .circuit-lines::after { right: 0; }
`;