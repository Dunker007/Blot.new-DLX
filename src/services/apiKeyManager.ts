/**
 * Centralized API Key Management Service
 * Manages API keys by provider (not by service) so keys are shared site-wide
 * Example: Google API key works for Gemini, Notebook LM, and all Google services
 */

import { LocalStorageManager } from '../utils/localStorage';

interface APIKeyProvider {
  google?: string; // Shared for Gemini, Notebook LM, Google services
  openai?: string; // Shared for GPT models
  anthropic?: string; // Shared for Claude models
  spaceship?: { apiKey: string; apiSecret: string }; // Spaceship DNS API
  [key: string]: string | { apiKey: string; apiSecret: string } | undefined;
}

class APIKeyManager {
  private static instance: APIKeyManager;
  private storageKey = 'dlx_api_keys';

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): APIKeyManager {
    if (!APIKeyManager.instance) {
      APIKeyManager.instance = new APIKeyManager();
    }
    return APIKeyManager.instance;
  }

  /**
   * Get all API keys
   */
  private getAllKeys(): APIKeyProvider {
    try {
      const keys = LocalStorageManager.get<APIKeyProvider>(this.storageKey, {});
      return keys || {};
    } catch (error) {
      console.error('Failed to load API keys:', error);
      return {};
    }
  }

  /**
   * Save all API keys
   */
  private saveAllKeys(keys: APIKeyProvider): void {
    try {
      LocalStorageManager.set(this.storageKey, keys);
    } catch (error) {
      console.error('Failed to save API keys:', error);
    }
  }

  /**
   * Get Google API key (shared for Gemini, Notebook LM, etc.)
   */
  public getGoogleKey(): string | null {
    const keys = this.getAllKeys();
    return keys.google || null;
  }

  /**
   * Set Google API key (shared for Gemini, Notebook LM, etc.)
   */
  public setGoogleKey(key: string): void {
    const keys = this.getAllKeys();
    keys.google = key;
    this.saveAllKeys(keys);
  }

  /**
   * Get OpenAI API key
   */
  public getOpenAIKey(): string | null {
    const keys = this.getAllKeys();
    return keys.openai || null;
  }

  /**
   * Set OpenAI API key
   */
  public setOpenAIKey(key: string): void {
    const keys = this.getAllKeys();
    keys.openai = key;
    this.saveAllKeys(keys);
  }

  /**
   * Get Anthropic API key
   */
  public getAnthropicKey(): string | null {
    const keys = this.getAllKeys();
    return keys.anthropic || null;
  }

  /**
   * Set Anthropic API key
   */
  public setAnthropicKey(key: string): void {
    const keys = this.getAllKeys();
    keys.anthropic = key;
    this.saveAllKeys(keys);
  }

  /**
   * Get Spaceship API credentials
   */
  public getSpaceshipCredentials(): { apiKey: string; apiSecret: string } | null {
    const keys = this.getAllKeys();
    if (keys.spaceship && typeof keys.spaceship === 'object') {
      return keys.spaceship;
    }
    return null;
  }

  /**
   * Set Spaceship API credentials
   */
  public setSpaceshipCredentials(apiKey: string, apiSecret: string): void {
    const keys = this.getAllKeys();
    keys.spaceship = { apiKey, apiSecret };
    this.saveAllKeys(keys);
  }

  /**
   * Get API key for any provider
   */
  public getProviderKey(provider: string): string | { apiKey: string; apiSecret: string } | null {
    const keys = this.getAllKeys();
    return keys[provider] || null;
  }

  /**
   * Set API key for any provider
   */
  public setProviderKey(provider: string, key: string | { apiKey: string; apiSecret: string }): void {
    const keys = this.getAllKeys();
    keys[provider] = key as any;
    this.saveAllKeys(keys);
  }

  /**
   * Check if a provider has an API key configured
   */
  public hasProviderKey(provider: string): boolean {
    const keys = this.getAllKeys();
    return keys[provider] !== undefined && keys[provider] !== null;
  }

  /**
   * Remove API key for a provider
   */
  public removeProviderKey(provider: string): void {
    const keys = this.getAllKeys();
    delete keys[provider];
    this.saveAllKeys(keys);
  }

  /**
   * Clear all API keys (use with caution)
   */
  public clearAllKeys(): void {
    LocalStorageManager.remove(this.storageKey);
  }

  /**
   * Migrate old localStorage keys to new format (backward compatibility)
   */
  public migrateLegacyKeys(): void {
    const keys = this.getAllKeys();
    let migrated = false;

    // Migrate Gemini API key (old: 'gemini_api_key', new: google)
    if (!keys.google) {
      try {
        // API keys are stored as plain strings, not JSON
        const legacyGeminiKey = LocalStorageManager.getRaw('gemini_api_key', null);
        if (legacyGeminiKey) {
          keys.google = legacyGeminiKey;
          migrated = true;
          // Remove old key after migration
          LocalStorageManager.remove('gemini_api_key');
        }
      } catch (error) {
        // Ignore if legacy key doesn't exist
      }
    }

    // Migrate Spaceship credentials (old: 'spaceship_api_key' + 'spaceship_api_secret', new: spaceship object)
    if (!keys.spaceship) {
      try {
        // API keys are stored as plain strings, not JSON
        const legacyKey = LocalStorageManager.getRaw('spaceship_api_key', null);
        const legacySecret = LocalStorageManager.getRaw('spaceship_api_secret', null);
        if (legacyKey && legacySecret) {
          keys.spaceship = { apiKey: legacyKey, apiSecret: legacySecret };
          migrated = true;
          // Remove old keys after migration
          LocalStorageManager.remove('spaceship_api_key');
          LocalStorageManager.remove('spaceship_api_secret');
        }
      } catch (error) {
        // Ignore if legacy keys don't exist
      }
    }

    if (migrated) {
      this.saveAllKeys(keys);
      console.log('Migrated legacy API keys to centralized manager');
    }
  }
}

// Export singleton instance
export const apiKeyManager = APIKeyManager.getInstance();

// Run migration on import (backward compatibility)
if (typeof window !== 'undefined') {
  apiKeyManager.migrateLegacyKeys();
}

