/**
 * Feature Flag Service
 * Ported from DLX-3.0 - Controls feature visibility and rollout
 */

export type FeatureFlagState = 'active' | 'preview' | 'labs' | 'comingSoon' | 'inactive' | 'disabled';

export type FeatureFlags = {
  [key: string]: FeatureFlagState;
};

const STORAGE_KEY = 'dlx-feature-flags';

// Default feature flags for DLX Studios Ultimate
const defaultFlags: FeatureFlags = {
  // Core features (always active)
  aiCommandCenter: 'active',
  workspace: 'active',
  projects: 'active',
  connections: 'active',
  settings: 'active',
  
  // Development tools
  monacoEditor: 'active',
  codeWorkspace: 'active',
  
  // Multimodal AI
  audioTranscriber: 'active',
  imageAnalysis: 'active',
  imageGenerator: 'comingSoon',
  videoAnalysis: 'comingSoon',
  
  // AI Tools
  mindMap: 'active',
  agentDesigner: 'preview',
  storyWriter: 'comingSoon',
  
  // Command Center features
  ideaBoard: 'preview',
  taskManagement: 'preview',
  knowledgeBase: 'comingSoon',
  
  // Lab System (from DLX-Ultra-2)
  labs: 'active', // Upgraded from preview
  auraInterface: 'active', // Upgraded from preview - fully functional
  agentForge: 'active', // Upgraded from preview - fully functional
  dataWeave: 'preview', // Keep as preview - needs multiple agents
  codeReview: 'preview', // Keep as preview - needs testing
  cryptoLab: 'active', // Fully implemented with portfolio tracking, markets, bots, and research tools
  systemMatrix: 'preview', // Keep as preview - needs configuration
  signalLab: 'preview', // Keep as preview - needs Google Search API
  creatorStudio: 'preview', // Keep as preview - needs image gen API
  commsChannel: 'preview', // Keep as preview - needs audio transcription API
  dataverse: 'preview', // Keep as preview - needs RAG setup
  
  // Advanced features
  featureFlags: 'active', // Meta!
  telemetry: 'active',
  realtimeCollaboration: 'active',
  voiceControl: 'comingSoon',
  webglBackground: 'preview',
};

class FeatureFlagService {
  private flags: FeatureFlags;

  constructor() {
    this.flags = this.loadFlags();
  }

  private loadFlags(): FeatureFlags {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultFlags, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load feature flags', e);
    }
    this.saveFlags(defaultFlags);
    return defaultFlags;
  }

  private saveFlags(flagsToSave: FeatureFlags) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flagsToSave));
    } catch (e) {
      console.error('Failed to save feature flags', e);
    }
  }

  public getFlags(): FeatureFlags {
    return { ...this.flags };
  }

  public getFlag(key: string): FeatureFlagState {
    return this.flags[key] || 'inactive';
  }

  public isActive(key: string): boolean {
    return this.getFlag(key) === 'active';
  }

  public isPreview(key: string): boolean {
    const state = this.getFlag(key);
    return state === 'preview' || state === 'labs';
  }

  public isAvailable(key: string): boolean {
    const state = this.getFlag(key);
    return state === 'active' || state === 'preview' || state === 'labs';
  }

  public setFlag(key: string, state: FeatureFlagState) {
    const oldState = this.flags[key];
    if (oldState !== state) {
      this.flags[key] = state;
      this.saveFlags(this.flags);
      
      // Log telemetry if available
      if (this.isAvailable('telemetry')) {
        console.log('FEATURE_FLAG_CHANGE:', {
          flag: key,
          from: oldState || 'undefined',
          to: state,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  public resetToDefaults() {
    this.flags = { ...defaultFlags };
    this.saveFlags(this.flags);
  }
}

export const featureFlagService = new FeatureFlagService();

