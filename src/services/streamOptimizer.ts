import { StreamChunk } from './llm';

interface BufferConfig {
  maxSize: number;
  maxDelay: number;
  minChunkSize: number;
}

interface OptimizationMetrics {
  chunksReceived: number;
  chunksSent: number;
  bytesReceived: number;
  bytesSent: number;
  averageLatency: number;
  bufferUtilization: number;
}

export class StreamOptimizer {
  private buffer: string = '';
  private bufferConfig: BufferConfig;
  private lastFlushTime: number = 0;
  private flushTimer?: number;
  private metrics: OptimizationMetrics = {
    chunksReceived: 0,
    chunksSent: 0,
    bytesReceived: 0,
    bytesSent: 0,
    averageLatency: 0,
    bufferUtilization: 0,
  };

  constructor(config?: Partial<BufferConfig>) {
    this.bufferConfig = {
      maxSize: config?.maxSize || 50,
      maxDelay: config?.maxDelay || 16,
      minChunkSize: config?.minChunkSize || 10,
    };
  }

  optimize(
    chunk: string,
    onOptimized: (optimized: string) => void,
    force: boolean = false
  ): void {
    this.metrics.chunksReceived++;
    this.metrics.bytesReceived += chunk.length;

    this.buffer += chunk;

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    const shouldFlush =
      force ||
      this.buffer.length >= this.bufferConfig.maxSize ||
      this.shouldFlushOnBoundary();

    if (shouldFlush) {
      this.flush(onOptimized);
    } else {
      this.flushTimer = window.setTimeout(() => {
        this.flush(onOptimized);
      }, this.bufferConfig.maxDelay);
    }
  }

  flush(onOptimized: (optimized: string) => void): void {
    if (this.buffer.length === 0) return;

    const now = Date.now();
    const latency = this.lastFlushTime > 0 ? now - this.lastFlushTime : 0;
    this.lastFlushTime = now;

    this.metrics.chunksSent++;
    this.metrics.bytesSent += this.buffer.length;
    this.metrics.averageLatency =
      (this.metrics.averageLatency * (this.metrics.chunksSent - 1) + latency) /
      this.metrics.chunksSent;
    this.metrics.bufferUtilization =
      this.buffer.length / this.bufferConfig.maxSize;

    onOptimized(this.buffer);
    this.buffer = '';

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  reset(): void {
    this.buffer = '';
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }
    this.lastFlushTime = 0;
  }

  getMetrics(): OptimizationMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      chunksReceived: 0,
      chunksSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      averageLatency: 0,
      bufferUtilization: 0,
    };
  }

  private shouldFlushOnBoundary(): boolean {
    if (this.buffer.length < this.bufferConfig.minChunkSize) {
      return false;
    }

    const lastChar = this.buffer[this.buffer.length - 1];
    const boundaries = ['.', '!', '?', '\n', ',', ';', ':', ')'];

    return boundaries.includes(lastChar);
  }

  updateConfig(config: Partial<BufferConfig>): void {
    this.bufferConfig = { ...this.bufferConfig, ...config };
  }

  getBufferSize(): number {
    return this.buffer.length;
  }

  getCompressionRatio(): number {
    if (this.metrics.chunksReceived === 0) return 1;
    return this.metrics.chunksSent / this.metrics.chunksReceived;
  }
}

export class StreamBatcher {
  private batches: Map<string, string[]> = new Map();
  private batchTimers: Map<string, number> = new Map();
  private batchSize: number = 5;
  private batchDelay: number = 50;

  addToBatch(
    batchId: string,
    chunk: string,
    onBatchReady: (chunks: string[]) => void
  ): void {
    if (!this.batches.has(batchId)) {
      this.batches.set(batchId, []);
    }

    const batch = this.batches.get(batchId)!;
    batch.push(chunk);

    const timer = this.batchTimers.get(batchId);
    if (timer) {
      clearTimeout(timer);
    }

    if (batch.length >= this.batchSize) {
      this.flushBatch(batchId, onBatchReady);
    } else {
      const newTimer = window.setTimeout(() => {
        this.flushBatch(batchId, onBatchReady);
      }, this.batchDelay);

      this.batchTimers.set(batchId, newTimer);
    }
  }

  flushBatch(batchId: string, onBatchReady: (chunks: string[]) => void): void {
    const batch = this.batches.get(batchId);
    if (!batch || batch.length === 0) return;

    onBatchReady([...batch]);

    this.batches.delete(batchId);

    const timer = this.batchTimers.get(batchId);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchId);
    }
  }

  flushAll(onBatchReady: (batchId: string, chunks: string[]) => void): void {
    for (const [batchId] of this.batches) {
      const batch = this.batches.get(batchId);
      if (batch && batch.length > 0) {
        onBatchReady(batchId, [...batch]);
      }
    }

    this.batches.clear();

    for (const [, timer] of this.batchTimers) {
      clearTimeout(timer);
    }
    this.batchTimers.clear();
  }

  clearBatch(batchId: string): void {
    this.batches.delete(batchId);

    const timer = this.batchTimers.get(batchId);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchId);
    }
  }

  updateConfig(batchSize?: number, batchDelay?: number): void {
    if (batchSize !== undefined) this.batchSize = batchSize;
    if (batchDelay !== undefined) this.batchDelay = batchDelay;
  }
}

export function createOptimizedStreamHandler(
  onChunk: (chunk: string) => void,
  config?: Partial<BufferConfig>
): (chunk: StreamChunk) => void {
  const optimizer = new StreamOptimizer(config);

  return (streamChunk: StreamChunk) => {
    if (streamChunk.done) {
      optimizer.flush(onChunk);
      return;
    }

    optimizer.optimize(streamChunk.content, onChunk);
  };
}

export function createBatchedStreamHandler(
  batchId: string,
  onBatch: (chunks: string[]) => void,
  batchSize: number = 5,
  batchDelay: number = 50
): (chunk: StreamChunk) => void {
  const batcher = new StreamBatcher();
  batcher.updateConfig(batchSize, batchDelay);

  return (streamChunk: StreamChunk) => {
    if (streamChunk.done) {
      batcher.flushBatch(batchId, onBatch);
      return;
    }

    batcher.addToBatch(batchId, streamChunk.content, onBatch);
  };
}

export const streamOptimizer = new StreamOptimizer();
export const streamBatcher = new StreamBatcher();
