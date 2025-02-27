import fs from "fs";
import path from "path";
import { FileScanner } from "../services/file-scanner";
import { StyleFilePatterns, ComponentFilePatterns } from "../services/file-patterns";
import { Logger } from "../utils/logger";

/**
 * Detects if the given path is a file or directory and returns
 * the appropriate batch structure for linting.
 *
 * @param targetPath - The file or directory path
 * @returns An object containing batches for different file types
 */
export async function getFileOrDirectoryBatches(targetPath: string) {
  const isFile = fs.existsSync(targetPath) && fs.statSync(targetPath).isFile();

  let styleFileBatches: string[][] = [];
  let componentFileBatches: string[][] = [];

  if (isFile) {
    Logger.info(`Linting single file: ${targetPath}`);

    const fileExt = path.extname(targetPath).toLowerCase();

    if ([".css", ".scss", ".less"].includes(fileExt)) {
      styleFileBatches = [[targetPath]];
    } 
    else if ([".js", ".jsx", ".ts", ".tsx", ".cmp", ".app", ".html", ".design"].includes(fileExt)) {
      componentFileBatches = [[targetPath]];
    }
    else if ([".svg"].includes(fileExt)) {
      Logger.info(`Skipping SVG linting (currently unsupported): ${targetPath}`);
    }
    else if ([".md"].includes(fileExt)) {
      Logger.info(`Skipping Markdown file: ${targetPath}`);
    }
    else {
      Logger.warning(`⚠ Skipping unsupported file: ${targetPath}`);
    }
  } 
  else {
    Logger.info(`Scanning directory: ${targetPath}`);

    // Scan styles
    Logger.info("\nScanning style files...");
    styleFileBatches = await FileScanner.scanFiles(targetPath, {
      patterns: StyleFilePatterns,
      batchSize: 100,
    });

    // Scan components
    Logger.info("\nScanning component files...");
    componentFileBatches = await FileScanner.scanFiles(targetPath, {
      patterns: ComponentFilePatterns,
      batchSize: 100,
    });
  }

  return { styleFileBatches, componentFileBatches };
}
