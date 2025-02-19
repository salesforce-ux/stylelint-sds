// Batch settings
const BATCH_SIZE = 10;
const MAX_BATCHES = 10;
const TIME_PER_BATCH = 5;

export function calculateBatchInfo(files: string[]) {
  const totalFiles = files.length;
  const totalBatches = Math.min(
    Math.ceil(totalFiles / BATCH_SIZE),
    MAX_BATCHES
  );
  const estimatedTime = totalBatches * TIME_PER_BATCH;
  return { totalBatches, estimatedTime };
}
