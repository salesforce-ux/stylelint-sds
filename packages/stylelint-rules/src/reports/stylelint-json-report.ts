/*
    This file is to get all the validation issue with stylelint rules
*/

import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { spawn } from 'child_process';
import convertJsonToSarif from './json-to-sarif'

const execPromise = promisify(exec);
const __dirname = process.cwd()

/*
console.log(`
  Usage: npm run report [options] <input>

  Options:
    -c, --config       Stylelintrc configuration
    -d, --director     Target directory to lint files
  
  Examples:
    npm run report -- -c .stylelintrc.yml -d example-component-folder
    npm run report -- -d . (for current directory & with current directory stylelint config)
`);
*/
const args = process.argv.slice(2); // Skip the first two entries (node and script path)

let configFile = '';
let targetDirectory = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '-c' || args[i] === '--config') {
    configFile = args[i + 1]; // Get the value after `-c`
  }
  if (args[i] === '-d' || args[i] === '--directory') {
    targetDirectory = args[i + 1]; // Get the value after `-d`
  }
}

if(configFile === '')
  configFile = './stylelintrc.yml'

validateConfigFile(configFile);

if(targetDirectory === '')
  targetDirectory = '.'

const CONFIG_FILE = configFile;;
const TARGET_DIR = targetDirectory;//process.argv[2];
const FOLDER_NAME = 'reports';
const OUTPUT_DIR = path.join(__dirname, FOLDER_NAME);

// Batch settings
const BATCH_SIZE = 10;
const MAX_BATCHES = 10;
const TIME_PER_BATCH = 5;

async function validateConfigFile(configPath: string) {
  try {
    await fs.access(path.resolve(configPath)); // Check if the file is accessible
  } catch {
    console.error(`Error: Config file "${configPath}" does not exist.`);
    console.error(`Command usage: npm run report -- -c .stylelintrc.yml -d example-component-folder`)
    process.exit(1);
  }
}

function calculateBatchInfo(totalFiles: number) {
  const totalBatches = Math.min(Math.ceil(totalFiles / BATCH_SIZE), MAX_BATCHES);
  const estimatedTime = totalBatches * TIME_PER_BATCH;
  return { totalBatches, estimatedTime };
}

function lintBatch(batch: string[], batchNum: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const outputFile = `${OUTPUT_DIR}/sl_batch${batchNum}.json`;

    try {
      //console.log(`Running linter in stylelint`)
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
    } catch (error) {
      console.error(`Error ${error}`)
    }
  });
}

async function processFilesInBatches(cssFiles: string[]): Promise<void> {
  const totalCssFiles = cssFiles.length;
  const { totalBatches: totalCssBatches, estimatedTime: estimatedCssTime } = calculateBatchInfo(totalCssFiles);

  const totalBatches = totalCssBatches;
  const estimatedTime = estimatedCssTime;
  //console.log(`Stylelint rule processing ${totalBatches} of batch(es), estimated time: ${estimatedTime} sec.`);

  // Lint css files using stylelint
  for (let i = 0; i < totalCssFiles; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    if (batchNum > MAX_BATCHES) {
      console.log(`Reached maximum batch limit of ${MAX_BATCHES}. Stopping.`);
      break;
    }
    const batch = cssFiles.slice(i, i + BATCH_SIZE);
    await lintBatch(batch, batchNum);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function consolidateReports(): Promise<void> {
  await delay(5000);
  const consolidatedReportPath = path.join(OUTPUT_DIR, 'batch_stylelint_report.json');
  
  let jsonFiles: string[] = [];
  try {
    const { stdout } = await execPromise(`find "${OUTPUT_DIR}" -name "sl_batch*.json"`);
    jsonFiles = stdout.trim().split('\n').filter(file => file);
    if (jsonFiles.length === 0) {
      console.warn(`No JSON files found in directory: ${OUTPUT_DIR}`);
      return;
    }
  } catch (error: any) {
    console.error(`Error reading directory: ${error.message}`);
    throw error;
  }

  await execPromise(`jq -s 'add' ${jsonFiles.join(' ')} > "${consolidatedReportPath}"`);
}

export async function getStylelintValidationReport(cssFiles){
    //const cssFiles = await findCSSFiles(TARGET_DIR);
    await processFilesInBatches(cssFiles);
    await consolidateReports();
}