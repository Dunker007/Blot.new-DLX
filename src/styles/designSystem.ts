/**
 * DLX Studios Design System
 *
 * Unified premium theme for AI-powered development platform
 * Consistent colors, gradients, shadows, and spacing
 */

// Core Brand Colors
export const colors = {
  // Primary Brand Gradient
  brand: {
    primary: '#8B5CF6', // Purple-500
    secondary: '#EC4899', // Pink-500
    accent: '#06B6D4', // Cyan-500
  },

  // Background Layers (Dark Theme)
  background: {
    primary: '#0F172A', // Slate-900
    secondary: '#1E293B', // Slate-800
    tertiary: '#334155', // Slate-700
    card: 'rgba(15, 23, 42, 0.95)', // Primary with opacity
    cardHover: 'rgba(30, 41, 59, 0.95)', // Secondary with opacity
  },

  // Text Hierarchy
  text: {
    primary: '#F8FAFC', // Slate-50
    secondary: '#CBD5E1', // Slate-300
    muted: '#64748B', // Slate-500
    accent: '#8B5CF6', // Purple-500
  },

  // Status Colors
  status: {
    success: '#10B981', // Emerald-500
    warning: '#F59E0B', // Amber-500
    error: '#EF4444', // Red-500
    info: '#3B82F6', // Blue-500
  },

  // Interactive States
  interactive: {
    hover: 'rgba(139, 92, 246, 0.1)',
    active: 'rgba(139, 92, 246, 0.2)',
    focus: 'rgba(139, 92, 246, 0.3)',
    disabled: 'rgba(100, 116, 139, 0.3)',
  },
};

// Gradient Combinations
export const gradients = {
  primary: 'from-purple-600 to-pink-600',
  secondary: 'from-cyan-500 to-purple-600',
  success: 'from-emerald-500 to-cyan-500',
  warning: 'from-amber-500 to-orange-500',
  background: 'from-slate-900 via-purple-900/20 to-slate-900',
  card: 'from-slate-800/50 to-slate-900/50',
  button: 'from-purple-600 via-purple-500 to-pink-600',
  buttonHover: 'from-purple-500 via-purple-400 to-pink-500',
};

// Shadow System
export const shadows = {
  sm: '0 1px 2px 0 rgba(139, 92, 246, 0.05)',
  md: '0 4px 6px -1px rgba(139, 92, 246, 0.1), 0 2px 4px -1px rgba(139, 92, 246, 0.06)',
  lg: '0 10px 15px -3px rgba(139, 92, 246, 0.1), 0 4px 6px -2px rgba(139, 92, 246, 0.05)',
  xl: '0 20px 25px -5px rgba(139, 92, 246, 0.1), 0 10px 10px -5px rgba(139, 92, 246, 0.04)',
  glow: '0 0 20px rgba(139, 92, 246, 0.3)',
  glowHover: '0 0 30px rgba(139, 92, 246, 0.5)',
};

// Typography Scale
export const typography = {
  h1: 'text-4xl lg:text-5xl font-bold',
  h2: 'text-3xl lg:text-4xl font-bold',
  h3: 'text-2xl lg:text-3xl font-bold',
  h4: 'text-xl lg:text-2xl font-semibold',
  h5: 'text-lg font-semibold',
  body: 'text-base',
  caption: 'text-sm',
  small: 'text-xs',
};

// Spacing System
export const spacing = {
  section: 'py-12 lg:py-16',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  card: 'p-6 lg:p-8',
  cardCompact: 'p-4',
  grid: 'grid gap-6 lg:gap-8',
};

// Component Base Classes
const cardBase =
  'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg hover:shadow-xl hover:border-white/20 transition-all duration-300';

export const components = {
  // Cards
  card: cardBase,
  cardInteractive: `${cardBase} hover:scale-[1.02] cursor-pointer`,

  // Buttons
  buttonPrimary:
    'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
  buttonSecondary:
    'bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg border border-white/20 hover:border-white/40 transition-all duration-300',
  buttonGhost:
    'text-white hover:bg-white/10 font-medium px-4 py-2 rounded-lg transition-all duration-300',

  // Inputs
  input:
    'bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300',

  // Status Indicators
  statusOnline: 'w-2 h-2 bg-emerald-400 rounded-full animate-pulse',
  statusOffline: 'w-2 h-2 bg-red-400 rounded-full',
  statusWarning: 'w-2 h-2 bg-amber-400 rounded-full',

  // Layout
  pageBackground: 'min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
  sectionBackground: 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm',

  // Navigation
  navItem: `text-white/70 hover:text-white font-medium transition-colors duration-300`,
  navItemActive: `text-white font-semibold bg-white/10 px-3 py-2 rounded-lg`,
};

// Animation Presets
export const animations = {
  fadeIn: 'animate-in fade-in duration-500',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-500',
  slideLeft: 'animate-in slide-in-from-right-4 duration-500',
  scaleIn: 'animate-in zoom-in-95 duration-300',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
};

// Utility Classes
export const utils = {
  // Flex utilities
  centerFlex: 'flex items-center justify-center',
  spaceBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',

  // Grid utilities
  gridAuto: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  gridResponsive: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6',

  // Text utilities
  textGradient: 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
  textShadow: 'drop-shadow-sm',

  // Interactive utilities
  hoverScale: 'hover:scale-105 transition-transform duration-300',
  hoverGlow: 'hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300',
  clickScale: 'active:scale-95 transition-transform duration-150',
};

export default {
  colors,
  gradients,
  shadows,
  typography,
  spacing,
  components,
  animations,
  utils,
};
