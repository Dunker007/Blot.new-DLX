/**
 * Lightweight storage layer replacing Supabase
 * Uses LocalStorage for config + IndexedDB for larger data
 * Provides same interface as Supabase for easy migration
 */

interface StorageResponse<T> {
  data: T | null;
  error: Error | null;
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
      
      request.onsuccess = () => {
        clearTimeout(timeout);
        this.db = request.result;
        
        // Add error handler for database-level errors
        this.db.onerror = (event) => {
          console.error('Database error:', event);
        };
        
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
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
    return {
      select: (_columns?: string) => this.select(table),
      insert: (data: any) => ({
        ...this.insert(table, data),
        single: () => this.insert(table, data)
      }),
      update: (data: any) => ({
        ...this.update(table, data),
        eq: (_column: string, _value: any) => this.update(table, data)
      }),
      upsert: (data: any) => ({
        ...this.insert(table, data),
        eq: (_column: string, _value: any) => this.insert(table, data)
      }),
      delete: () => ({
        eq: (_column: string, value: any) => this.delete(table, value),
        like: (_column: string, _pattern: string) => this.delete(table, 'all')
      })
    };
  }

  // Channel simulation for real-time features (simplified)
  channel(name: string) {
    return {
      on: (_event: string, callback: (payload: any) => void) => {
        // Simulate real-time with periodic checks or WebSocket if needed
        return { unsubscribe: () => {} };
      },
      subscribe: () => Promise.resolve(),
      unsubscribe: () => Promise.resolve()
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