import { promises as fs } from 'fs';
import { join, extname } from 'path';

export async function findCSSFiles(directory: string): Promise<string[]> {
  async function recursiveSearch(dir: string): Promise<string[]> {
    let results: string[] = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recursively search subdirectories
          const subDirResults = await recursiveSearch(fullPath);
          results = results.concat(subDirResults);
        } else if (
          ['.css', '.less', '.scss'].includes(extname(entry.name).toLowerCase())
        ) {
          // Include files with the desired extensions
          results.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory: ${dir}`, error);
    }
    return results;
  }

  try {
    const cssFiles = await recursiveSearch(directory);
    return cssFiles;
  } catch (error) {
    console.error(`Error finding CSS files: ${error}`);
    throw error;
  }
}

export async function findComponentFiles(directory: string): Promise<string[]> {
  async function recursiveSearch(dir: string): Promise<string[]> {
    let results: string[] = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recursively search subdirectories
          const subDirResults = await recursiveSearch(fullPath);
          results = results.concat(subDirResults);
        } else if (
          ['.html', '.cmp'].includes(extname(entry.name).toLowerCase())
        ) {
          // Include files with the desired extensions
          results.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory: ${dir}`, error);
    }
    return results;
  }

  try {
    const componentFiles = await recursiveSearch(directory);
    return componentFiles;
  } catch (error) {
    console.error(`Error finding component files: ${error}`);
    throw error;
  }
}


