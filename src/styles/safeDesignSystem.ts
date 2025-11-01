/**
 * Safe Design System
 * 
 * Simplified version to prevent circular dependencies
 * Safe imports without complex nested references
 */

// Safe color constants
export const safeColors = {
  primary: '#8B5CF6', // Purple-500
  secondary: '#EC4899', // Pink-500
  accent: '#06B6D4', // Cyan-500
  
  bgPrimary: '#0F172A', // Slate-900
  bgSecondary: '#1E293B', // Slate-800
  
  textPrimary: '#F8FAFC', // Slate-50
  textSecondary: '#CBD5E1', // Slate-300
  textMuted: '#64748B', // Slate-500
};

// Safe gradient classes
export const safeGradients = {
  primary: 'from-purple-600 to-pink-600',
  secondary: 'from-cyan-500 to-purple-600', 
  background: 'from-slate-900 via-purple-900/20 to-slate-900',
};

// Safe component classes - hardcoded strings
export const safeComponents = {
  card: 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg hover:shadow-xl hover:border-white/20 transition-all duration-300',
  
  buttonPrimary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
  
  buttonSecondary: 'bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg border border-white/20 hover:border-white/40 transition-all duration-300',
  
  buttonGhost: 'text-white hover:bg-white/10 font-medium px-4 py-2 rounded-lg transition-all duration-300',
  
  input: 'bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300',
  
  pageBackground: 'min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
  
  sectionBackground: 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm',
  
  statusOnline: 'w-2 h-2 bg-emerald-400 rounded-full animate-pulse',
  
  navItem: 'text-white/70 hover:text-white font-medium transition-colors duration-300',
  
  navItemActive: 'text-white font-semibold bg-white/10 px-3 py-2 rounded-lg',
};

// Safe utility classes
export const safeUtils = {
  centerFlex: 'flex items-center justify-center',
  spaceBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  
  textGradient: 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
  
  hoverScale: 'hover:scale-105 transition-transform duration-300',
  hoverGlow: 'hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300',
};

// Safe export object
export const safeDesignSystem = {
  colors: safeColors,
  gradients: safeGradients,
  components: safeComponents,
  utils: safeUtils,
};

export default safeDesignSystem;