/**
 * Lightweight storage layer replacing Supabase
 * Uses LocalStorage for config + IndexedDB for larger data
 * Provides same interface as Supabase for easy migration
 */

interface StorageResponse<T> {
  data: T | null;
  error: Error | null;
}

interface QueryBuilder<T> {
  eq(column: string, value: any): QueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T>;
  in(column: string, values: any[]): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  gte(column: string, value: any): QueryBuilder<T>;
  lt(column: string, value: any): QueryBuilder<T>;
  maybeSingle(): Promise<StorageResponse<T extends any[] ? T[0] | null : T | null>>;
  select(columns?: string): Promise<StorageResponse<T>>;
  single(): Promise<StorageResponse<T extends any[] ? T[0] : T>>;
  then<TResult1 = StorageResponse<T>, TResult2 = never>(
    onfulfilled?: ((value: StorageResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>;
}

class LightweightStorage {
  private dbName = 'dlx-studios';
  private version = 1;
  private db: IDBDatabase | null = null;
  private readonly OPERATION_TIMEOUT = 5000; // 5 seconds

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      // Add timeout to DB initialization
      const timeout = setTimeout(() => {
        reject(new Error('Database initialization timeout'));
      }, this.OPERATION_TIMEOUT);
      
      request.onerror = () => {
        clearTimeout(timeout);
        reject(request.error);
      };
      

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        clearTimeout(timeout);
        this.db = request.result;
        
        // Add error handler for database-level errors
        this.db.onerror = (event) => {
          console.error('Database error:', event);
        };
        
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores for different data types
        if (!db.objectStoreNames.contains('providers')) {
          db.createObjectStore('providers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tokens')) {
          db.createObjectStore('tokens', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('plugins')) {
          db.createObjectStore('plugins', { keyPath: 'name' });
        }
      };
    });
  }

  async select(table: string): Promise<StorageResponse<any[]>> {
    try {
      await this.ensureDB();
      return this.withTimeout(
        new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([table], 'readonly');
          const store = transaction.objectStore(table);
          const request = store.getAll();
          
          request.onsuccess = () => {
            resolve({ data: request.result, error: null });
          };
          
          request.onerror = () => {
            reject(request.error || new Error('Select operation failed'));
          };
        })
      );
      return new Promise(resolve => {
        const transaction = this.db!.transaction([table], 'readonly');
        const store = transaction.objectStore(table);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve({ data: request.result, error: null });
        };

        request.onerror = () => {
          resolve({ data: null, error: request.error });
        };
      });
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async insert(table: string, data: any): Promise<StorageResponse<any>> {
    try {
      await this.ensureDB();
      return this.withTimeout(
        new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([table], 'readwrite');
          const store = transaction.objectStore(table);
          const request = store.add(data);
          
          request.onsuccess = () => {
            resolve({ data: data, error: null });
          };
          
          request.onerror = () => {
            reject(request.error || new Error('Insert operation failed'));
          };
        })
      );
      return new Promise(resolve => {
        const transaction = this.db!.transaction([table], 'readwrite');
        const store = transaction.objectStore(table);
        const request = store.add(data);

        request.onsuccess = () => {
          resolve({ data: data, error: null });
        };

        request.onerror = () => {
          resolve({ data: null, error: request.error });
        };
      });
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async update(table: string, data: any): Promise<StorageResponse<any>> {
    try {
      await this.ensureDB();
      return this.withTimeout(
        new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([table], 'readwrite');
          const store = transaction.objectStore(table);
          const request = store.put(data);
          
          request.onsuccess = () => {
            resolve({ data: data, error: null });
          };
          
          request.onerror = () => {
            reject(request.error || new Error('Update operation failed'));
          };
        })
      );
      return new Promise(resolve => {
        const transaction = this.db!.transaction([table], 'readwrite');
        const store = transaction.objectStore(table);
        const request = store.put(data);

        request.onsuccess = () => {
          resolve({ data: data, error: null });
        };

        request.onerror = () => {
          resolve({ data: null, error: request.error });
        };
      });
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async delete(table: string, id: string | number): Promise<StorageResponse<void>> {
    try {
      await this.ensureDB();
      return this.withTimeout(
        new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([table], 'readwrite');
          const store = transaction.objectStore(table);
          const request = store.delete(id);
          
          request.onsuccess = () => {
            resolve({ data: null, error: null });
          };
          
          request.onerror = () => {
            reject(request.error || new Error('Delete operation failed'));
          };
        })
      );
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Helper method to add timeout to any promise
  private async withTimeout<T>(promise: Promise<T>): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), this.OPERATION_TIMEOUT)
      )
    ]);
  }

  // Supabase-compatible query methods
  from(table: string) {
    const self = this;

    // Create a chainable query builder
    const createQueryBuilder = <T = any>(
      filters: Array<{ column: string; value: any; operator: string }> = [],
      orderBy?: { column: string; ascending: boolean },
      limitCount?: number
    ): QueryBuilder<T> => {
      const builder: QueryBuilder<T> = {
        eq(column: string, value: any) {
          return createQueryBuilder<T>([...filters, { column, value, operator: 'eq' }], orderBy, limitCount);
        },
        order(column: string, options?: { ascending?: boolean }) {
          return createQueryBuilder<T>(filters, {
            column,
            ascending: options?.ascending ?? true,
          }, limitCount);
        },
        in(column: string, values: any[]) {
          return createQueryBuilder<T>([...filters, { column, value: values, operator: 'in' }], orderBy, limitCount);
        },
        limit(count: number) {
          return createQueryBuilder<T>(filters, orderBy, count);
        },
        gte(column: string, value: any) {
          return createQueryBuilder<T>([...filters, { column, value, operator: 'gte' }], orderBy, limitCount);
        },
        lt(column: string, value: any) {
          return createQueryBuilder<T>([...filters, { column, value, operator: 'lt' }], orderBy, limitCount);
        },
        async select(_columns?: string) {
          const result = await self.select(table);
          if (!result.data) return result as StorageResponse<T>;

          let filtered = result.data;

          // Apply filters
          for (const filter of filters) {
            if (filter.operator === 'eq') {
              filtered = filtered.filter((item: any) => item[filter.column] === filter.value);
            } else if (filter.operator === 'in') {
              filtered = filtered.filter((item: any) =>
                (filter.value as any[]).includes(item[filter.column])
              );
            } else if (filter.operator === 'gte') {
              filtered = filtered.filter((item: any) => item[filter.column] >= filter.value);
            } else if (filter.operator === 'lt') {
              filtered = filtered.filter((item: any) => item[filter.column] < filter.value);
            }
          }

          // Apply ordering
          if (orderBy) {
            filtered = [...filtered].sort((a: any, b: any) => {
              const aVal = a[orderBy.column];
              const bVal = b[orderBy.column];
              if (aVal < bVal) return orderBy.ascending ? -1 : 1;
              if (aVal > bVal) return orderBy.ascending ? 1 : -1;
              return 0;
            });
          }

          // Apply limit
          if (limitCount !== undefined) {
            filtered = filtered.slice(0, limitCount);
          }

          return { data: filtered as T, error: null };
        },
        async single() {
          const result = await this.select();
          if (!result.data) return { data: null, error: result.error };
          const data = Array.isArray(result.data) ? result.data[0] : result.data;
          return { data: data ?? null, error: null } as StorageResponse<
            T extends any[] ? T[0] : T
          >;
        },
        async maybeSingle() {
          const result = await this.select();
          if (!result.data) return { data: null, error: result.error };
          const data = Array.isArray(result.data) ? result.data[0] : result.data;
          return { data: data ?? null, error: null } as StorageResponse<
            T extends any[] ? T[0] | null : T | null
          >;
        },
        then(onfulfilled, onrejected) {
          return this.select().then(onfulfilled as any, onrejected);
        },
      };
      return builder;
    };

    return {
      select: (_columns?: string) => createQueryBuilder([], undefined),
      insert: (data: any) => {
        const insertPromise = self.insert(table, Array.isArray(data) ? data[0] : data);
        const selectBuilder = {
          single: () => insertPromise,
          then: (onfulfilled: any, onrejected: any) =>
            insertPromise.then(onfulfilled, onrejected),
        };
        return {
          select: () => selectBuilder,
          single: () => insertPromise,
          then: (onfulfilled: any, onrejected: any) =>
            insertPromise.then(onfulfilled, onrejected),
        };
      },
      update: (data: any) => {
        const updateBuilder = {
          eq: (column: string, value: any) => self.update(table, { ...data, [column]: value }),
          then: (onfulfilled: any, onrejected: any) =>
            self.update(table, data).then(onfulfilled, onrejected),
        };
        return updateBuilder;
      },
      upsert: (data: any) => {
        const upsertPromise = self.insert(table, Array.isArray(data) ? data[0] : data);
        const selectBuilder = {
          single: () => upsertPromise,
          then: (onfulfilled: any, onrejected: any) =>
            upsertPromise.then(onfulfilled, onrejected),
        };
        return {
          eq: (column: string, value: any) =>
            self.insert(table, { ...data, [column]: value }),
          select: () => selectBuilder,
          single: () => upsertPromise,
          then: (onfulfilled: any, onrejected: any) =>
            upsertPromise.then(onfulfilled, onrejected),
        };
      },
      delete: () => ({
        eq: (_column: string, value: any) => self.delete(table, value),
        like: (_column: string, _pattern: string) => self.delete(table, 'all' as any),
      }),
    };
  }

  // Channel simulation for real-time features (simplified)
  channel(_name: string) {
    return {
      on: (_event: string, _callback: (payload: any) => void) => {
        // Simulate real-time with periodic checks or WebSocket if needed
        return { unsubscribe: () => {} };
      },
      subscribe: () => Promise.resolve(),
      unsubscribe: () => Promise.resolve(),
    };
  }

  private async ensureDB(): Promise<void> {
    if (!this.db) {
      await this.withTimeout(this.initDB());
    }
  }

  // Config storage (uses localStorage for smaller data)
  setConfig(key: string, value: any): void {
    localStorage.setItem(`dlx_${key}`, JSON.stringify(value));
  }

  getConfig(key: string): any {
    const item = localStorage.getItem(`dlx_${key}`);
    return item ? JSON.parse(item) : null;
  }
}

export const storage = new LightweightStorage();

// Mock Supabase client for compatibility
export const supabase = storage;
export const isDemoMode = false; // Always false now since we have our own storage
