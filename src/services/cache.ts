/**
 * High-performance Cache Manager for Gazprom LNG 3D Digital Twin
 * Provides multi-tier caching: in-memory, localStorage, and procedural asset caching.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl?: number; // in milliseconds
}

class CacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private hitCount = 0;
  private missCount = 0;
  private prefix = 'gp_lng_cache_';

  constructor() {
    this.cleanupExpired();
  }

  public get<T>(key: string): T | null {
    // 1. Check memory cache first
    const mem = this.memoryCache.get(key);
    if (mem) {
      if (!mem.ttl || Date.now() - mem.timestamp < mem.ttl) {
        this.hitCount++;
        return mem.data as T;
      }
      this.memoryCache.delete(key);
    }

    // 2. Check localStorage
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (raw) {
        const parsed: CacheEntry<T> = JSON.parse(raw);
        if (!parsed.ttl || Date.now() - parsed.timestamp < parsed.ttl) {
          // Promote to memory cache
          this.memoryCache.set(key, parsed);
          this.hitCount++;
          return parsed.data;
        }
        localStorage.removeItem(this.prefix + key);
      }
    } catch {
      // LocalStorage might be restricted
    }

    this.missCount++;
    return null;
  }

  public set<T>(key: string, data: T, ttlMs?: number, persistToDisk = true): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    };

    this.memoryCache.set(key, entry);

    if (persistToDisk) {
      try {
        localStorage.setItem(this.prefix + key, JSON.stringify(entry));
      } catch (err) {
        console.warn('LocalStorage quota exceeded or unavailable:', err);
      }
    }
  }

  public remove(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(this.prefix + key);
    } catch {}
  }

  public clearAll(): void {
    this.memoryCache.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.prefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
  }

  public getStats() {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? Math.round((this.hitCount / total) * 100) : 100;
    return {
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: `${hitRate}%`,
      memoryEntries: this.memoryCache.size
    };
  }

  private cleanupExpired(): void {
    const now = Date.now();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.prefix)) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.ttl && now - parsed.timestamp >= parsed.ttl) {
              localStorage.removeItem(k);
            }
          }
        }
      }
    } catch {}
  }
}

export const appCache = new CacheService();
