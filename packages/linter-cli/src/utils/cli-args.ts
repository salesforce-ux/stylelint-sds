import { CliOptions } from '../types';
import path from 'path';

export function validateAndNormalizePath(inputPath?: string): string {
  if (!inputPath) {
    return process.cwd();
  }
  
  const normalizedPath = path.resolve(inputPath);
  
  try {
    // Check if path exists and is accessible
    require('fs').accessSync(normalizedPath);
    return normalizedPath;
  } catch (error) {
    throw new Error(`Invalid path: ${inputPath}`);
  }
}

export function normalizeCliOptions(options: CliOptions): Required<CliOptions> {
  return {
    directory: validateAndNormalizePath(options.directory),
    output: validateAndNormalizePath(options.output),
    fix: options.fix || false,
    config: options.config || '',
    configStyle: options.configStyle || '',
    configEslint: options.configEslint || ''
  };
} 