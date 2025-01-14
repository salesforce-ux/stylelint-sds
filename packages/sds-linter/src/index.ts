import fs from 'fs';
import path from 'path';

export function exampleFunction(filePath: string): string {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File does not exist: ${absolutePath}`);
  }
  return absolutePath;
}