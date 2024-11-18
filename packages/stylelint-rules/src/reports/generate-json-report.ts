import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { spawn } from 'child_process';
import convertJsonToSarif from './json-to-sarif'

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurations
const CONFIG_FILE = 'packages/example-repository/.stylelintrc.yml';
const TARGET_DIR = process.argv[2]; // Target directory passed as an argument
const FOLDER_NAME = 'reports';
const OUTPUT_DIR = path.join(__dirname, FOLDER_NAME);

// Batch settings
const BATCH_SIZE = 10;
const MAX_BATCHES = 10;
const TIME_PER_BATCH = 5;

async function initializeOutputDirectory(): Promise<void> {
  await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function findCSSFiles(directory: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const findProcess = spawn('find', [directory, '-name', '*.css']);
    let files = '';

    findProcess.stdout.on('data', (data) => {
      files += data.toString();
    });

    findProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
    });

    findProcess.on('close', (code) => {
      if (code === 0) {
        resolve(files.trim().split('\n').filter(file => file));
      } else {
        reject(new Error(`find command exited with code ${code}`));
      }
    });
  });
}

function calculateBatchInfo(totalFiles: number) {
  const totalBatches = Math.min(Math.ceil(totalFiles / BATCH_SIZE), MAX_BATCHES);
  const estimatedTime = totalBatches * TIME_PER_BATCH;
  return { totalBatches, estimatedTime };
}

function lintBatch(batch: string[], batchNum: number): Promise<void> {
  console.log(`Linting batch ${batchNum}`);

  return new Promise((resolve, reject) => {
    const outputFile = `${OUTPUT_DIR}/sarif_batch${batchNum}.json`;

    const process = spawn('npx', [
      'stylelint',
      ...batch,
      '--config',
      CONFIG_FILE,
      '--formatter',
      'json',
      '--output-file',
      outputFile
    ]);

    resolve();
    // process.stdout.on('data', (data) => {
    //   console.log(`Batch ${batchNum} Output: ${data}`);
    // });

    // process.stderr.on('data', (data) => {
    //   console.error(`Batch ${batchNum} Error: ${data}`);
    // });

    // process.on('close', (code) => {
    //   if (code === 0) {
    //     resolve();
    //   } else {
    //     reject(new Error(`Batch ${batchNum} failed with exit code ${code}`));
    //   }
    // });
  });
}

async function processFilesInBatches(files: string[]): Promise<void> {
  const totalFiles = files.length;
  const { totalBatches, estimatedTime } = calculateBatchInfo(totalFiles);

  console.log(`Total files: ${totalFiles}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`Processing up to ${totalBatches} batches, estimated time: ${estimatedTime} seconds`);

  for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    if (batchNum > MAX_BATCHES) {
      console.log(`Reached maximum batch limit of ${MAX_BATCHES}. Stopping.`);
      break;
    }
    const batch = files.slice(i, i + BATCH_SIZE);
    console.log(`Linting batch ${batchNum} of ${totalBatches}...`);
    await lintBatch(batch, batchNum);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function consolidateReports(): Promise<void> {
  await delay(5000);
  const consolidatedReportPath = path.join(OUTPUT_DIR, 'consolidated_report.json');
  const consolidatedSarifPath = path.join(OUTPUT_DIR, 'consolidated_report.sarif');

  let jsonFiles: string[] = [];
  try {
    const { stdout } = await execPromise(`find "${OUTPUT_DIR}" -name "*_batch*.json"`);

    console.log(`Find Command Output: ${stdout.trim()}`);

    jsonFiles = stdout.trim().split('\n').filter(file => file);

    if (jsonFiles.length === 0) {
      console.warn(`No JSON files found in directory: ${OUTPUT_DIR}`);
    }
  } catch (error: any) {
    console.error(`Error reading directory: ${error.message}`);
    throw error;
  }

  console.log('Merging JSON files...');
  await execPromise(`jq -s 'add' ${jsonFiles.join(' ')} > "${consolidatedReportPath}"`);
  console.log(`All valid JSON files have been merged into ${consolidatedReportPath}.`);

  try {
    await execPromise(`node ./node_modules/stylelint-sarif-formatter/index.js "${consolidatedReportPath}" -o "${consolidatedSarifPath}"`);
    const sarifExists = await fs.stat(consolidatedSarifPath).catch(() => false);
    if (sarifExists) {
      console.log(`SARIF report generated successfully: ${consolidatedSarifPath}`);
    } else {
      console.error(`Failed to generate SARIF report.`);
    }
  } catch (error: any) {
    console.error(`Error generating SARIF report:`, error);
  }
}

async function main(): Promise<void> {
  if (!TARGET_DIR) {
    console.error(" >> Please provide the target directory containing CSS files.");
    process.exit(1); // Exit if TARGET_DIR is not provided
  }

  try {
    await initializeOutputDirectory();

    const cssFiles = await findCSSFiles(TARGET_DIR);
    await processFilesInBatches(cssFiles);
    console.log("Processing of all batches completed!");
    await consolidateReports();

    // Add your SARIF conversion logic here if needed
    await convertJsonToSarif();
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1); // Exit with failure status if an error occurs
  }
}

// Use an async IIFE to ensure proper exit handling
(async () => {
  try {
    await main();
    process.exit(0); // Exit with success status
  } catch (error) {
    console.error("Unhandled error:", error);
    process.exit(1); // Exit with failure status
  }
})();