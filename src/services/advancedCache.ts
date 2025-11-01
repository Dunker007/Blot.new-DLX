interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
  tags: string[];
  priority: number;
  compressed?: boolean;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  compressionThreshold: number;
  persistToDisk: boolean;
  storagePrefix: string;
  analyticsEnabled: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  memoryUsage: number;
  hitRate: number;
}

export class AdvancedCacheService {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupInterval: number | null = null;
  private persistenceInterval: number | null = null;
  private cachedTotalSize: number = 0; // Track size incrementally

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100 * 1024 * 1024, // 100MB
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      compressionThreshold: 1024, // 1KB
      persistToDisk: true,
      storagePrefix: 'dlx_cache_',
      analyticsEnabled: true,
      ...config,
    };

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      memoryUsage: 0,
      hitRate: 0,
    };

    this.startCleanupInterval();
    this.loadFromDisk();
  }

  /**
   * Get item from cache with automatic TTL checking
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    entry.hits++;
    entry.lastAccessed = now;
    this.stats.hits++;
    this.updateHitRate();

    // Decompress if needed
    let data = entry.data;
    if (entry.compressed && typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error('Failed to decompress cache entry:', e);
        this.cache.delete(key);
        return null;
      }
    }

    return data as T;
  }

  /**
   * Set item in cache with advanced options
   */
  set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      tags?: string[];
      priority?: number;
      compress?: boolean;
    } = {}
  ): void {
    const {
      ttl = this.config.defaultTTL,
      tags = [],
      priority = 1,
      compress = false,
    } = options;

    let finalData = data;
    let compressed = false;

    // Auto-compression for large objects
    const dataSize = this.estimateSize(data);
    if (compress || (dataSize > this.config.compressionThreshold)) {
      try {
        finalData = JSON.stringify(data) as T;
        compressed = true;
      } catch (e) {
        console.warn('Failed to compress cache entry, storing uncompressed:', e);
      }
    }

    const entry: CacheEntry<T> = {
      data: finalData,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      lastAccessed: Date.now(),
      tags,
      priority,
      compressed,
    };

    const entrySize = this.estimateSize(entry);
    
    // Remove old entry size if updating existing key
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      this.cachedTotalSize -= this.estimateSize(oldEntry);
    }

    // Ensure we don't exceed memory limit
    this.ensureCapacity(entrySize);
    
    this.cache.set(key, entry);
    this.cachedTotalSize += entrySize;
    this.stats.sets++;
    this.stats.memoryUsage = this.cachedTotalSize;

    // Persist to disk if enabled
    if (this.config.persistToDisk) {
      this.persistToDisk(key, entry);
    }
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    const existed = this.cache.delete(key);
    
    if (existed && entry) {
      this.cachedTotalSize -= this.estimateSize(entry);
      this.stats.deletes++;
      this.stats.memoryUsage = this.cachedTotalSize;
      
      if (this.config.persistToDisk) {
        localStorage.removeItem(`${this.config.storagePrefix}${key}`);
      }
    }
    return existed;
  }

  /**
   * Clear cache by tags
   */
  clearByTag(tag: string): number {
    let cleared = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.delete(key);
        cleared++;
      }
    }
    return cleared;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.cachedTotalSize = 0;
    this.stats.deletes += this.cache.size;
    this.stats.memoryUsage = 0;

    if (this.config.persistToDisk) {
      // Clear all persisted entries
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.config.storagePrefix)
      );
      keys.forEach(key => localStorage.removeItem(key));
    }
  }

  /**
   * Get cache entry information without affecting stats
   */
  inspect(key: string): CacheEntry | null {
    return this.cache.get(key) || null;
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { size: number; entries: number } {
    return {
      ...this.stats,
      size: this.cache.size,
      entries: this.cache.size,
    };
  }

  /**
   * Memoize function with intelligent caching
   */
  memoize<Args extends any[], Return>(
    fn: (...args: Args) => Return | Promise<Return>,
    options: {
      keyGenerator?: (...args: Args) => string;
      ttl?: number;
      tags?: string[];
    } = {}
  ) {
    const {
      keyGenerator = (...args) => `memoized_${fn.name}_${JSON.stringify(args)}`,
      ttl = this.config.defaultTTL,
      tags = [],
    } = options;

    return async (...args: Args): Promise<Return> => {
      const key = keyGenerator(...args);
      
      // Check cache first
      const cached = this.get<Return>(key);
      if (cached !== null) {
        return cached;
      }

      // Execute function and cache result
      try {
        const result = await fn(...args);
        this.set(key, result, { ttl, tags });
        return result;
      } catch (error) {
        // Don't cache errors, but could implement error caching separately
        throw error;
      }
    };
  }

  /**
   * Smart cache warming based on usage patterns
   */
  async warmCache(keys: string[], loader: (key: string) => Promise<any>): Promise<void> {
    const promises = keys.map(async (key) => {
      if (!this.cache.has(key)) {
        try {
          const data = await loader(key);
          this.set(key, data, { priority: 2 }); // Higher priority for warmed data
        } catch (error) {
          console.warn(`Failed to warm cache for key ${key}:`, error);
        }
      }
    });

    await Promise.all(promises);
  }

  /**
   * Batch operations for efficiency
   */
  mset(entries: Array<{ key: string; value: any; options?: any }>): void {
    entries.forEach(({ key, value, options }) => {
      this.set(key, value, options);
    });
  }

  mget<T>(keys: string[]): Map<string, T> {
    const results = new Map<string, T>();
    keys.forEach(key => {
      const value = this.get<T>(key);
      if (value !== null) {
        results.set(key, value);
      }
    });
    return results;
  }

  /**
   * Advanced invalidation patterns
   */
  invalidatePattern(pattern: RegExp): number {
    let invalidated = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.delete(key);
        invalidated++;
      }
    }
    return invalidated;
  }

  /**
   * Cache dependency management
   */
  setWithDependencies<T>(
    key: string,
    data: T,
    dependencies: string[],
    options: any = {}
  ): void {
    const tags = [...(options.tags || []), ...dependencies.map(dep => `dep:${dep}`)];
    this.set(key, data, { ...options, tags });
  }

  invalidateDependents(dependencyKey: string): number {
    return this.clearByTag(`dep:${dependencyKey}`);
  }

  private estimateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback estimation
      return JSON.stringify(data).length * 2;
    }
  }

  private ensureCapacity(requiredSize: number): void {
    // Use cached total size instead of recalculating
    while (this.cachedTotalSize + requiredSize > this.config.maxSize && this.cache.size > 0) {
      // Evict least recently used item with lowest priority
      const keyToEvict = this.findLRUKey();
      if (keyToEvict) {
        const evictedEntry = this.cache.get(keyToEvict);
        this.cache.delete(keyToEvict);
        this.stats.evictions++;
        
        if (evictedEntry) {
          this.cachedTotalSize -= this.estimateSize(evictedEntry);
        }
      } else {
        break; // Safety break
      }
    }
  }

  private findLRUKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    let lowestPriority = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Prefer lower priority and older access time
      const score = entry.priority * 1000000 + entry.lastAccessed;
      if (score < (lowestPriority * 1000000 + oldestTime)) {
        oldestKey = key;
        oldestTime = entry.lastAccessed;
        lowestPriority = entry.priority;
      }
    }

    return oldestKey;
  }

  private calculateTotalSize(): number {
    // Deprecated - use cachedTotalSize instead
    // Kept for compatibility but recalculates and updates cache
    let total = 0;
    for (const entry of this.cache.values()) {
      total += this.estimateSize(entry);
    }
    this.cachedTotalSize = total;
    return total;
  }

  private updateMemoryUsage(): void {
    // Deprecated - memory is now tracked incrementally
    this.stats.memoryUsage = this.cachedTotalSize;
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private startCleanupInterval(): void {
    // Clean expired entries every minute
    this.cleanupInterval = window.setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  private async persistToDisk(key: string, entry: CacheEntry): Promise<void> {
    if (!this.config.persistToDisk) return;

    try {
      const serialized = JSON.stringify({
        ...entry,
        persistedAt: Date.now(),
      });
      localStorage.setItem(`${this.config.storagePrefix}${key}`, serialized);
    } catch (error) {
      console.warn('Failed to persist cache entry to disk:', error);
    }
  }

  private loadFromDisk(): void {
    if (!this.config.persistToDisk) return;

    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.config.storagePrefix)
    );

    let loadedSize = 0;
    keys.forEach(storageKey => {
      try {
        const data = localStorage.getItem(storageKey);
        if (data) {
          const entry = JSON.parse(data);
          const cacheKey = storageKey.replace(this.config.storagePrefix, '');
          
          // Check if still valid
          const now = Date.now();
          if (now <= entry.timestamp + entry.ttl) {
            this.cache.set(cacheKey, entry);
            loadedSize += this.estimateSize(entry);
          } else {
            localStorage.removeItem(storageKey);
          }
        }
      } catch (error) {
        console.warn('Failed to load cache entry from disk:', error);
        localStorage.removeItem(storageKey);
      }
    });
    
    // Update cached size after loading from disk
    this.cachedTotalSize = loadedSize;
    this.stats.memoryUsage = loadedSize;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.persistenceInterval) {
      clearInterval(this.persistenceInterval);
      this.persistenceInterval = null;
    }

    this.cache.clear();
  }
}

// Global cache instance
export const advancedCache = new AdvancedCacheService({
  maxSize: 50 * 1024 * 1024, // 50MB
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  persistToDisk: true,
  analyticsEnabled: true,
});

// Cache decorators for easy use
export function Cached(ttl?: number, tags?: string[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cacheKey = `${target.constructor.name}_${propertyKey}`;

    descriptor.value = advancedCache.memoize(originalMethod, {
      keyGenerator: (...args) => `${cacheKey}_${JSON.stringify(args)}`,
      ttl,
      tags,
    });

    return descriptor;
  };
}

// Cache middleware for request caching
export function createCacheMiddleware<T extends (...args: any[]) => any>(options: {
  keyExtractor: (...args: Parameters<T>) => string;
  ttl?: number;
  tags?: string[];
}) {
  return (handler: T): T => {
    return advancedCache.memoize(handler, {
      keyGenerator: options.keyExtractor,
      ttl: options.ttl,
      tags: options.tags,
    }) as T;
  };
}