import { CliOptions } from '../types';
import path from 'path';
import { accessSync } from 'fs';

export function validateAndNormalizePath(inputPath?: string): string {
  if (!inputPath) {
    return process.cwd();
  }
  
  const normalizedPath = path.resolve(inputPath);
  
  try {
    // Check if path exists and is accessible
    accessSync(normalizedPath);
    return normalizedPath;
  } catch (error) {
    throw new Error(`Invalid path: ${inputPath}`);
  }
}

export function normalizeCliOptions(options: CliOptions, defultOptions:Partial<CliOptions> = {}): Required<CliOptions> {
  return {
    fix: false,
    editor: 'vscode',
    config:'',
    configStyle:'',
    configEslint:'',
    ...defultOptions,
    ...options,
    directory: validateAndNormalizePath(options.directory),
    output: validateAndNormalizePath(options.output)
  };
} 