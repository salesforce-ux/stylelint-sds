import { fileURLToPath } from 'url';
import { resolve } from 'path';

export function metadataFileUrl(filePath: string) {
  const isTestEnv = process.env.NODE_ENV === 'test';

  const newFilePath = resolve(
    isTestEnv
      ? fileURLToPath(new URL(`../../` + filePath, import.meta.url))
      : new URL(filePath, import.meta.url).pathname
  );
  return newFilePath;
}
