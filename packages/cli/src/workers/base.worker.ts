import { parentPort, workerData } from 'worker_threads';
import { BatchTask, BatchResult } from '../services/batch-processor';

export abstract class BaseWorker<T, R> {
  protected task: BatchTask<T>;

  constructor() {
    this.task = workerData as BatchTask<T>;
  }

  /**
   * Process a single file
   * @param filePath Path to the file to process
   * @returns Processing result
   */
  protected abstract processFile(filePath: string): Promise<R>;

  /**
   * Start processing the batch of files
   */
  async process(): Promise<void> {
    try {
      const results: R[] = [];

      for (const file of this.task.files) {
        try {
          const result = await this.processFile(file);
          results.push(result);
        } catch (error: any) {
          results.push({
            file,
            error: error.message
          } as R);
        }
      }

      const batchResult: BatchResult = {
        success: true,
        results
      };

      parentPort?.postMessage(batchResult);
    } catch (error: any) {
      const errorResult: BatchResult = {
        success: false,
        error: error.message,
        results: []
      };
      
      parentPort?.postMessage(errorResult);
    } finally {
      process.exit(0);
    }
  }
} 