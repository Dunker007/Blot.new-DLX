import { supabase } from '../lib/supabase';
import { DeploymentEnvironment } from '../types';

export type EnvironmentMode = 'local' | 'cloud' | 'hybrid';

export interface EnvironmentInfo {
  mode: EnvironmentMode;
  isLocalDevelopment: boolean;
  isDlxStudiosAi: boolean;
  syncEnabled: boolean;
  features: {
    offlineMode: boolean;
    cloudSync: boolean;
    collaboration: boolean;
    cloudModels: boolean;
    billing: boolean;
  };
}

export class EnvironmentDetectorService {
  private currentEnvironment: EnvironmentInfo | null = null;
  private providerCache: { data: any[]; timestamp: number } | null = null;
  private readonly CACHE_TTL = 60000; // 60 seconds

  detectEnvironment(): EnvironmentInfo {
    // Cache environment detection result
    if (this.currentEnvironment) {
      return this.currentEnvironment;
    }

    const hostname = window.location.hostname;
    const isDlxStudiosAi = hostname === 'dlxstudios.ai' || hostname.endsWith('.dlxstudios.ai');
    const isLocalhost =
      hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');

    let mode: EnvironmentMode = 'local';

    if (isDlxStudiosAi) {
      mode = 'cloud';
    } else if (isLocalhost) {
      mode = 'local';
    }

    this.currentEnvironment = {
      mode,
      isLocalDevelopment: isLocalhost,
      isDlxStudiosAi,
      syncEnabled: false,
      features: this.getFeaturesByMode(mode),
    };

    return this.currentEnvironment;
  }

  private getFeaturesByMode(mode: EnvironmentMode) {
    switch (mode) {
      case 'cloud':
        return {
          offlineMode: false,
          cloudSync: true,
          collaboration: true,
          cloudModels: true,
          billing: true,
        };

      case 'local':
        return {
          offlineMode: true,
          cloudSync: false,
          collaboration: false,
          cloudModels: false,
          billing: false,
        };

      case 'hybrid':
        return {
          offlineMode: true,
          cloudSync: true,
          collaboration: true,
          cloudModels: true,
          billing: false,
        };

      default:
        return {
          offlineMode: false,
          cloudSync: false,
          collaboration: false,
          cloudModels: false,
          billing: false,
        };
    }
  }

  async getCurrentEnvironment(): Promise<DeploymentEnvironment | null> {
    const { data } = await supabase
      .from('deployment_environments')
      .select('*')
      .eq('is_primary', true)
      .maybeSingle();

    return data;
  }

  async setEnvironmentMode(mode: EnvironmentMode): Promise<void> {
    const current = await this.getCurrentEnvironment();

    if (current) {
      await supabase
        .from('deployment_environments')
        .update({
          environment_name: mode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', current.id);
    } else {
      await supabase.from('deployment_environments').insert([
        {
          environment_name: mode,
          is_primary: true,
          sync_enabled: mode === 'hybrid' || mode === 'cloud',
          settings: {},
        },
      ]);
    }

    this.currentEnvironment = null;
  }

  async enableSync(enabled: boolean): Promise<void> {
    const current = await this.getCurrentEnvironment();

    if (current) {
      await supabase
        .from('deployment_environments')
        .update({
          sync_enabled: enabled,
          last_sync_at: enabled ? new Date().toISOString() : current.last_sync_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', current.id);
    }

    if (this.currentEnvironment) {
      this.currentEnvironment.syncEnabled = enabled;
    }
  }

  isFeatureAvailable(feature: keyof EnvironmentInfo['features']): boolean {
    const env = this.detectEnvironment();
    return env.features[feature];
  }

  getApiEndpoint(): string {
    const env = this.detectEnvironment();

    if (env.isDlxStudiosAi) {
      return 'https://api.dlxstudios.ai';
    }

    return 'http://localhost:3000';
  }

  shouldUseLocalModels(): boolean {
    const env = this.detectEnvironment();
    return env.mode === 'local' || !env.features.cloudModels;
  }

  canAccessCloudFeatures(): boolean {
    const env = this.detectEnvironment();
    return env.mode === 'cloud' || env.mode === 'hybrid';
  }

  async getModeRecommendation(): Promise<{
    recommended: EnvironmentMode;
    reason: string;
  }> {
    const env = this.detectEnvironment();

    if (env.isDlxStudiosAi) {
      return {
        recommended: 'cloud',
        reason: 'Running on dlxstudios.ai - cloud mode is optimal',
      };
    }

    // Use cache for provider data
    let providers = this.providerCache?.data;
    const now = Date.now();

    if (!providers || !this.providerCache || now - this.providerCache.timestamp > this.CACHE_TTL) {
      const { data } = await supabase.from('llm_providers').select('*').eq('is_active', true);

      providers = data || [];
      this.providerCache = { data: providers, timestamp: now };
    }

    const hasLocalProviders = providers?.some(
      p => p.endpoint_url.includes('localhost') || p.endpoint_url.includes('127.0.0.1')
    );

    const hasCloudProviders = providers?.some(
      p => !p.endpoint_url.includes('localhost') && !p.endpoint_url.includes('127.0.0.1')
    );

    if (hasLocalProviders && hasCloudProviders) {
      return {
        recommended: 'hybrid',
        reason: 'Both local and cloud providers detected - hybrid mode recommended',
      };
    }

    if (hasLocalProviders) {
      return {
        recommended: 'local',
        reason: 'Only local providers detected - local mode recommended',
      };
    }

    if (hasCloudProviders) {
      return {
        recommended: 'cloud',
        reason: 'Only cloud providers detected - cloud mode recommended',
      };
    }

    return {
      recommended: 'local',
      reason: 'No providers detected - local mode recommended for initial setup',
    };
  }

  getEnvironmentBadge(): { text: string; color: string } {
    const env = this.detectEnvironment();

    switch (env.mode) {
      case 'cloud':
        return { text: 'Cloud', color: 'bg-cyan-500' };
      case 'local':
        return { text: 'Local', color: 'bg-green-500' };
      case 'hybrid':
        return { text: 'Hybrid', color: 'bg-blue-500' };
      default:
        return { text: 'Unknown', color: 'bg-slate-500' };
    }
  }
}

export const environmentDetector = new EnvironmentDetectorService();
