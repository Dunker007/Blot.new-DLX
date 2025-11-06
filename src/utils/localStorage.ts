/**
 * Shared LocalStorage Utility
 * Reduces code duplication across components
 */

export class LocalStorageManager {
  /**
   * Safely get item from localStorage (parses JSON)
   */
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  /**
   * Get raw string from localStorage (no JSON parsing)
   * Useful for API keys and other plain string values
   */
  static getRaw(key: string, defaultValue: string | null = null): string | null {
    try {
      const item = localStorage.getItem(key);
      return item === null ? defaultValue : item;
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  /**
   * Safely set item to localStorage
   */
  static set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
    }
  }

  /**
   * Clear all localStorage (use with caution!)
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}

