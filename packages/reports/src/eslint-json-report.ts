/*
    This file is to get all the validation issue with eslint rules
*/

import { promises as fs } from 'fs';
import path, { join, extname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import spawn from 'cross-spawn';
import {processFilesInBatches as runBatches} from './run-batches'
import { consolidateReportsJQ, writeToFile } from './utils/consolidateJsonFiles';
const execPromise = promisify(exec);
const __dirname = process.cwd();

let eslintConfigFilePath = 'node_modules/@salesforce-ux/eslint-plugin-slds/build/.eslintrc.yml';
let OUTPUT_DIR = '';

// Batch settings
const BATCH_SIZE = 100;
const MAX_BATCHES = 1000;
const TIME_PER_BATCH = 5;

async function validateConfigFile(configPath: string) {
  try {
    await fs.access(path.resolve(configPath)); // Check if the file is accessible
  } catch {
    console.error(`Error: Config file "${configPath}" does not exist.`);
    console.error(
      `Command usage: npm run report -- -c .eslintrc.yml -d example-component-folder`
    );
    process.exit(1);
  }
}

// const extensions = ['.css', '.less', '.scss'];
// async function findCSSFiles(dir: string): Promise<string[]> {
//   const entries = await fs.readdir(dir, { withFileTypes: true });
//   const files = await Promise.all(
//     entries.map((entry) => {
//       const fullPath = join(dir, entry.name);
//       if (entry.isDirectory()) {
//         return findCSSFiles(fullPath); // Recursively process subdirectories
//       } else if (extensions.includes(extname(entry.name))) {
//         return [fullPath]; // Include files with the desired extensions
//       }
//       return []; // Exclude other files
//     })
//   );
//   return files.flat(); // Flatten the array of arrays
// }

function calculateBatchInfo(totalFiles: number) {
  const totalBatches = Math.min(
    Math.ceil(totalFiles / BATCH_SIZE),
    MAX_BATCHES
  );
  const estimatedTime = totalBatches * TIME_PER_BATCH;
  return { totalBatches, estimatedTime };
}

async function processFilesInBatches(componentFiles: string[]): Promise<void> {
    //const eslintPath = path.resolve(__dirname, 'node_modules/.bin/eslint');
    const eslintConfigFile = eslintConfigFilePath;
    await runBatches(componentFiles, 'eslint', eslintConfigFile, 10);
}

async function consolidateComponentReports(): Promise<void> {
  const consolidatedReportPath = join(OUTPUT_DIR, 'batch_eslint_report.json');
  let jsonFiles: string[] = [];

  try {
    // Find JSON files matching the pattern
    const files = await fs.readdir(OUTPUT_DIR, { withFileTypes: true });
    jsonFiles = files
      .filter(
        (file) =>
          file.isFile() &&
          file.name.startsWith('es_batch') &&
          extname(file.name) === '.json'
      )
      .map((file) => join(OUTPUT_DIR, file.name));

    if (jsonFiles.length === 0) {
      //console.warn(`No JSON files found in directory: ${OUTPUT_DIR}`);
      return;
    }
  } catch (error: any) {
    console.error(`Error reading directory: ${error.message}`);
    throw error;
  }

  const combinedData = await consolidateReportsJQ(jsonFiles);
  await writeToFile(convertToStylelintSchema(combinedData), consolidatedReportPath);
}

function convertToStylelintSchema(eslintReport) {
  return eslintReport.map((file) => ({
    source: file.filePath,
    warnings: file.messages.map((message) => ({
      line: message.line,
      column: message.column,
      rule: message.ruleId?.replace('@salesforce-ux/', '') || 'unknown',
      severity: message.severity === 2 ? 'error' : 'warning',
      text: message.message,
    })),
  }));
}

export async function getEslintValidationReport(eslintValidationFiles, configFilePath, outDir) {
  eslintConfigFilePath = configFilePath;
  OUTPUT_DIR = outDir;
  await validateConfigFile(eslintConfigFilePath);
  await processFilesInBatches(eslintValidationFiles);
  await consolidateComponentReports();
}
