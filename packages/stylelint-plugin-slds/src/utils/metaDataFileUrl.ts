import { resolve, dirname, join, normalize } from 'path';
import { fileURLToPath } from 'url';

export function metadataFileUrl(filePath: string) {
  const isTestEnv = process.env.NODE_ENV === 'test';

  const basePath = dirname(fileURLToPath(import.meta.url)); // Get the current file's directory
  const resolvedPath = isTestEnv
    ? resolve(basePath, '../../', filePath) // For test environment, resolve relatively
    : join(basePath, filePath); // For non-test environment, join paths

  return normalize(resolvedPath); // Normalize the path to ensure compatibility with the OS
}