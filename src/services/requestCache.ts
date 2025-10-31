import { LLMMessage, LLMResponse } from './llm';

interface CacheEntry {
  response: LLMResponse;
  timestamp: number;
  hits: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  oldestEntry?: number;
  newestEntry?: number;
}

export class RequestCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 100;
  private ttl: number = 60 * 60 * 1000;
  private stats = {
    hits: 0,
    misses: 0,
  };

  constructor(maxSize: number = 100, ttlMinutes: number = 60) {
    this.maxSize = maxSize;
    this.ttl = ttlMinutes * 60 * 1000;
    this.startCleanupInterval();
  }

  get(messages: LLMMessage[], modelId: string): LLMResponse | null {
    const key = this.generateKey(messages, modelId);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hits++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return { ...entry.response };
  }

  set(messages: LLMMessage[], modelId: string, response: LLMResponse): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const key = this.generateKey(messages, modelId);
    this.cache.set(key, {
      response: { ...response },
      timestamp: Date.now(),
      hits: 0,
      lastAccessed: Date.now(),
    });
  }

  has(messages: LLMMessage[], modelId: string): boolean {
    const key = this.generateKey(messages, modelId);
    const entry = this.cache.get(key);

    if (!entry) return false;

    const age = Date.now() - entry.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  invalidate(messages: LLMMessage[], modelId: string): void {
    const key = this.generateKey(messages, modelId);
    this.cache.delete(key);
  }

  invalidateByModel(modelId: string): void {
    const keysToDelete: string[] = [];

    for (const [key] of this.cache) {
      if (key.includes(modelId)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(e => e.timestamp);

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : undefined,
    };
  }

  private generateKey(messages: LLMMessage[], modelId: string): string {
    const normalized = messages.map(m => ({
      role: m.role,
      content: m.content.trim().toLowerCase(),
    }));

    const messageHash = JSON.stringify(normalized);
    return `${modelId}:${this.hashString(messageHash)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      const age = now - entry.timestamp;
      if (age > this.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  setMaxSize(size: number): void {
    this.maxSize = size;

    while (this.cache.size > this.maxSize) {
      this.evictLRU();
    }
  }

  setTTL(minutes: number): void {
    this.ttl = minutes * 60 * 1000;
  }

  export(): Array<{ key: string; entry: CacheEntry }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      entry: { ...entry },
    }));
  }

  import(data: Array<{ key: string; entry: CacheEntry }>): void {
    const now = Date.now();

    for (const { key, entry } of data) {
      const age = now - entry.timestamp;
      if (age < this.ttl && this.cache.size < this.maxSize) {
        this.cache.set(key, entry);
      }
    }
  }

  getMostPopular(limit: number = 10): Array<{ messages: string; hits: number; age: number }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        messages: key,
        hits: entry.hits,
        age: Date.now() - entry.timestamp,
      }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);

    return entries;
  }

  getRecentlyUsed(limit: number = 10): Array<{ messages: string; lastAccessed: number }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        messages: key,
        lastAccessed: entry.lastAccessed,
      }))
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, limit);

    return entries;
  }

  warmup(commonQueries: Array<{ messages: LLMMessage[]; modelId: string; response: LLMResponse }>): void {
    for (const query of commonQueries) {
      this.set(query.messages, query.modelId, query.response);
    }
  }
}

export const requestCache = new RequestCacheService(100, 60);
