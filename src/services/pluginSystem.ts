import { supabase } from '../lib/supabase';
import { advancedCache } from './advancedCache';

export interface PluginManifest {
  name: string;
  version: string;
  author: string;
  description: string;
  type:
    | 'provider'
    | 'tool'
    | 'integration'
    | 'ui_component'
    | 'workflow'
    | 'analytics'
    | 'security'
    | 'optimization';
  permissions: string[];
  dependencies?: string[];
  configSchema: Record<string, any>;
  entryPoint: string;
  icon?: string;
  category?: string;
  tags?: string[];
}

export interface PluginContext {
  api: PluginAPI;
  config: Record<string, any>;
  storage: PluginStorage;
  events: PluginEventEmitter;
  ui: PluginUIManager;
}

export interface PluginAPI {
  // LLM Provider API
  registerProvider(provider: LLMProviderPlugin): void;

  // Tool API
  registerTool(tool: ToolPlugin): void;

  // UI Extensions
  registerComponent(component: UIComponentPlugin): void;

  // Menu/Command Extensions
  registerCommand(command: CommandPlugin): void;

  // Workflow Extensions
  registerWorkflow(workflow: WorkflowPlugin): void;

  // Hook into existing functionality
  onMessage(handler: (message: any) => void): void;
  onTokenUsage(handler: (usage: any) => void): void;
  onError(handler: (error: any) => void): void;
}

export abstract class BasePlugin {
  protected manifest: PluginManifest;
  protected context!: PluginContext;
  protected isActive = false;

  constructor(manifest: PluginManifest) {
    this.manifest = manifest;
  }

  abstract initialize(context: PluginContext): Promise<void>;
  abstract destroy(): Promise<void>;

  getManifest(): PluginManifest {
    return this.manifest;
  }

  isEnabled(): boolean {
    return this.isActive;
  }

  async enable(): Promise<void> {
    this.isActive = true;
  }

  async disable(): Promise<void> {
    this.isActive = false;
  }
}

export interface LLMProviderPlugin extends BasePlugin {
  createProvider(config: any): Promise<{
    name: string;
    endpoint: string;
    authenticate(credentials: any): Promise<boolean>;
    sendRequest(messages: any[], options?: any): Promise<any>;
    getModels(): Promise<any[]>;
    testConnection(): Promise<boolean>;
  }>;
}

export interface ToolPlugin extends BasePlugin {
  getToolDefinition(): {
    name: string;
    description: string;
    parameters: any;
    execute(params: any, context: any): Promise<any>;
  };
}

export interface UIComponentPlugin extends BasePlugin {
  getComponent(): {
    name: string;
    component: any; // React component
    mountPoint: 'sidebar' | 'header' | 'footer' | 'modal' | 'panel';
    props?: any;
  };
}

export interface CommandPlugin extends BasePlugin {
  getCommands(): Array<{
    id: string;
    label: string;
    description: string;
    shortcut?: string;
    execute(context: any): Promise<void>;
  }>;
}

export interface WorkflowPlugin extends BasePlugin {
  getWorkflows(): Array<{
    id: string;
    name: string;
    description: string;
    steps: Array<{
      id: string;
      type: 'ai_request' | 'transform' | 'validate' | 'custom';
      config: any;
    }>;
    execute(input: any, context: any): Promise<any>;
  }>;
}

class PluginStorage {
  private prefix: string;

  constructor(pluginName: string) {
    this.prefix = `plugin_${pluginName}_`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const { data } = await supabase
        .from('plugin_storage')
        .select('value')
        .eq('key', `${this.prefix}${key}`)
        .single();

      return data ? JSON.parse(data.value) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    await supabase.from('plugin_storage').upsert({
      key: `${this.prefix}${key}`,
      value: JSON.stringify(value),
    });
  }

  async delete(key: string): Promise<void> {
    await supabase.from('plugin_storage').delete().eq('key', `${this.prefix}${key}`);
  }

  async clear(): Promise<void> {
    await supabase.from('plugin_storage').delete().like('key', `${this.prefix}%`);
  }
}

type EventHandler = (...args: any[]) => void;

class PluginEventEmitter {
  private listeners = new Map<string, EventHandler[]>();

  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }
}

class PluginUIManager {
  private components = new Map<string, any>();
  private mountPoints = new Map<string, any[]>();

  registerComponent(name: string, component: any, mountPoint: string): void {
    this.components.set(name, component);

    if (!this.mountPoints.has(mountPoint)) {
      this.mountPoints.set(mountPoint, []);
    }
    this.mountPoints.get(mountPoint)!.push({ name, component });
  }

  unregisterComponent(name: string, mountPoint: string): void {
    this.components.delete(name);

    const components = this.mountPoints.get(mountPoint);
    if (components) {
      const index = components.findIndex(c => c.name === name);
      if (index > -1) {
        components.splice(index, 1);
      }
    }
  }

  getComponents(mountPoint: string): any[] {
    return this.mountPoints.get(mountPoint) || [];
  }
}

export class PluginManager {
  private plugins = new Map<string, BasePlugin>();
  private registry = new Map<string, PluginManifest>();
  private eventEmitter = new PluginEventEmitter();
  private uiManager = new PluginUIManager();

  async initialize(): Promise<void> {
    await this.loadInstalledPlugins();
    await this.initializeActivePlugins();
  }

  async loadPlugin(manifest: PluginManifest, source: string): Promise<BasePlugin> {
    try {
      // Validate manifest
      this.validateManifest(manifest);

      // Check permissions and dependencies
      await this.checkPermissions(manifest.permissions);
      await this.checkDependencies(manifest.dependencies || []);

      // Create plugin sandbox
      const PluginClass = await this.loadPluginSource(source, manifest.entryPoint);
      const plugin = new PluginClass(manifest);

      // Create plugin context
      const context: PluginContext = {
        api: this.createPluginAPI(manifest.name),
        config: await this.getPluginConfig(manifest.name),
        storage: new PluginStorage(manifest.name),
        events: new PluginEventEmitter(),
        ui: this.uiManager,
      };

      // Initialize plugin
      await plugin.initialize(context);

      // Register plugin
      this.plugins.set(manifest.name, plugin);
      this.registry.set(manifest.name, manifest);

      // Store in database
      await this.storePlugin(manifest);

      return plugin;
    } catch (error) {
      console.error(`Failed to load plugin ${manifest.name}:`, error);
      throw error;
    }
  }

  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (plugin) {
      await plugin.destroy();
      this.plugins.delete(name);
      this.registry.delete(name);

      // Clean up UI components
      // TODO: Implement UI cleanup
      // NOTE: When a plugin is unloaded, we need to:
      // - Remove plugin UI components from DOM
      // - Unregister event listeners
      // - Clean up plugin-specific styles
      // - Remove plugin routes if any
      // Priority: Low - Current implementation works but could leak memory with many plugins

      // Remove from database
      await supabase.from('plugin_registry').update({ is_active: false }).eq('name', name);
    }
  }

  async enablePlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (plugin) {
      await plugin.enable();

      await supabase.from('plugin_registry').update({ is_active: true }).eq('name', name);
    }
  }

  async disablePlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (plugin) {
      await plugin.disable();

      await supabase.from('plugin_registry').update({ is_active: false }).eq('name', name);
    }
  }

  getPlugin(name: string): BasePlugin | undefined {
    return this.plugins.get(name);
  }

  getInstalledPlugins(): PluginManifest[] {
    return Array.from(this.registry.values());
  }

  async getAvailablePlugins(): Promise<PluginManifest[]> {
    const { data } = await supabase
      .from('plugin_registry')
      .select('*')
      .order('download_count', { ascending: false });

    return (data || []).map(item => ({
      name: item.name,
      version: item.version,
      author: item.author,
      description: item.description,
      type: item.plugin_type,
      permissions: [],
      configSchema: item.config_schema,
      entryPoint: 'index.js',
    }));
  }

  async installPlugin(_name: string): Promise<void> {
    // In a real implementation, this would download from a registry
    throw new Error('Plugin installation not implemented - load plugins manually');
  }

  async updatePlugin(_name: string, _newVersion: string): Promise<void> {
    // Implement plugin updates
    throw new Error('Plugin updates not implemented');
  }

  getUIComponents(mountPoint: string): any[] {
    return this.uiManager.getComponents(mountPoint);
  }

  private validateManifest(manifest: PluginManifest): void {
    const required = ['name', 'version', 'author', 'description', 'type', 'entryPoint'];

    for (const field of required) {
      if (!(field in manifest)) {
        throw new Error(`Plugin manifest missing required field: ${field}`);
      }
    }

    if (!manifest.permissions || !Array.isArray(manifest.permissions)) {
      throw new Error('Plugin manifest must include permissions array');
    }
  }

  private async checkPermissions(permissions: string[]): Promise<void> {
    // Implement permission checking logic
    const allowedPermissions = [
      'llm_provider',
      'database_read',
      'database_write',
      'ui_extend',
      'network_access',
      'local_storage',
    ];

    for (const permission of permissions) {
      if (!allowedPermissions.includes(permission)) {
        throw new Error(`Permission not allowed: ${permission}`);
      }
    }
  }

  private async checkDependencies(dependencies: string[]): Promise<void> {
    for (const dep of dependencies) {
      if (!this.plugins.has(dep)) {
        throw new Error(`Missing dependency: ${dep}`);
      }
    }
  }

  private async loadPluginSource(_source: string, _entryPoint: string): Promise<any> {
    // In a browser environment, this would use dynamic imports
    // For now, we'll simulate plugin loading
    return class MockPlugin extends BasePlugin {
      async initialize(context: PluginContext): Promise<void> {
        this.context = context;
        console.log(`Initialized plugin: ${this.manifest.name}`);
      }

      async destroy(): Promise<void> {
        console.log(`Destroyed plugin: ${this.manifest.name}`);
      }
    };
  }

  private createPluginAPI(pluginName: string): PluginAPI {
    return {
      registerProvider: (_provider: LLMProviderPlugin) => {
        // Implementation for registering LLM providers
        console.log(`Registered provider from plugin: ${pluginName}`);
      },

      registerTool: (_tool: ToolPlugin) => {
        // Implementation for registering tools
        console.log(`Registered tool from plugin: ${pluginName}`);
      },

      registerComponent: (component: UIComponentPlugin) => {
        const comp = component.getComponent();
        this.uiManager.registerComponent(comp.name, comp.component, comp.mountPoint);
      },

      registerCommand: (_command: CommandPlugin) => {
        // Implementation for registering commands
        console.log(`Registered command from plugin: ${pluginName}`);
      },

      registerWorkflow: (_workflow: WorkflowPlugin) => {
        // Implementation for registering workflows
        console.log(`Registered workflow from plugin: ${pluginName}`);
      },

      onMessage: (handler: (message: any) => void) => {
        this.eventEmitter.on('message', handler);
      },

      onTokenUsage: (handler: (usage: any) => void) => {
        this.eventEmitter.on('token_usage', handler);
      },

      onError: (handler: (error: any) => void) => {
        this.eventEmitter.on('error', handler);
      },
    };
  }

  private async getPluginConfig(pluginName: string): Promise<Record<string, any>> {
    const cached = advancedCache.get<Record<string, any>>(`plugin_config_${pluginName}`);
    if (cached) return cached;

    try {
      const { data } = await supabase
        .from('plugin_storage')
        .select('value')
        .eq('key', `config_${pluginName}`)
        .single();

      const config = data ? JSON.parse(data.value) : {};

      advancedCache.set(`plugin_config_${pluginName}`, config, {
        ttl: 10 * 60 * 1000, // 10 minutes
        tags: ['plugin_config'],
      });

      return config;
    } catch {
      return {};
    }
  }

  private async loadInstalledPlugins(): Promise<void> {
    const { data } = await supabase.from('plugin_registry').select('*');

    if (data) {
      for (const item of data) {
        const manifest: PluginManifest = {
          name: item.name,
          version: item.version,
          author: item.author,
          description: item.description,
          type: item.plugin_type,
          permissions: [], // Load from config
          configSchema: item.config_schema,
          entryPoint: 'index.js',
        };

        this.registry.set(item.name, manifest);
      }
    }
  }

  private async initializeActivePlugins(): Promise<void> {
    const { data } = await supabase.from('plugin_registry').select('*').eq('is_active', true);

    if (data) {
      for (const item of data) {
        try {
          const manifest = this.registry.get(item.name);
          if (manifest) {
            await this.loadPlugin(manifest, ''); // Empty source for now
          }
        } catch (error) {
          console.error(`Failed to initialize plugin ${item.name}:`, error);
        }
      }
    }
  }

  private async storePlugin(manifest: PluginManifest): Promise<void> {
    await supabase.from('plugin_registry').upsert({
      name: manifest.name,
      version: manifest.version,
      author: manifest.author,
      description: manifest.description,
      plugin_type: manifest.type,
      config_schema: manifest.configSchema,
      is_active: true,
    });
  }

  // Plugin event broadcasting
  emitEvent(event: string, data: any): void {
    this.eventEmitter.emit(event, data);
  }
}

export const pluginManager = new PluginManager();

// Example plugin implementations
export class GitHubIntegrationPlugin extends BasePlugin {
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;

    // Register GitHub-specific tools
    const githubTool = {
      getToolDefinition: () => ({
        name: 'github_commit',
        description: 'Commit changes to GitHub repository',
        parameters: {
          message: { type: 'string', required: true },
          files: { type: 'array', required: true },
        },
        execute: async (params: any) => {
          // Implementation would use GitHub API
          console.log('Committing to GitHub:', params);
        },
      }),
    };
    context.api.registerTool(githubTool as unknown as ToolPlugin);
  }

  async destroy(): Promise<void> {
    // Clean up GitHub integration
  }
}

export class CostOptimizerPlugin extends BasePlugin {
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;

    // Monitor token usage and suggest optimizations
    context.api.onTokenUsage((usage: any) => {
      this.analyzeUsage(usage);
    });
  }

  async destroy(): Promise<void> {
    // Clean up cost optimizer
  }

  private analyzeUsage(usage: any): void {
    // Implement cost analysis and optimization suggestions
    console.log('Analyzing token usage for optimization:', usage);
  }
}
