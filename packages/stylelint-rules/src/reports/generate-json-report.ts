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



//'packages/example-repository/.stylelintrc.yml'
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
  });
}

async function processFilesInBatches(files: string[]): Promise<void> {
  const totalFiles = files.length;
  const { totalBatches, estimatedTime } = calculateBatchInfo(totalFiles);

  console.log(`Total files: ${totalFiles}`);
  console.log(`Processing in ${totalBatches} batch(es), estimated time: ${estimatedTime} sec.`);

  for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    if (batchNum > MAX_BATCHES) {
      console.log(`Reached maximum batch limit of ${MAX_BATCHES}. Stopping.`);
      break;
    }
    const batch = files.slice(i, i + BATCH_SIZE);
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

    jsonFiles = stdout.trim().split('\n').filter(file => file);
    if (jsonFiles.length === 0) {
      console.warn(`No JSON files found in directory: ${OUTPUT_DIR}`);
    }
  } catch (error: any) {
    console.error(`Error reading directory: ${error.message}`);
    throw error;
  }

  await execPromise(`jq -s 'add' ${jsonFiles.join(' ')} > "${consolidatedReportPath}"`);

  try {
    await execPromise(`node ./node_modules/stylelint-sarif-formatter/index.js "${consolidatedReportPath}" -o "${consolidatedSarifPath}"`);
    await fs.stat(consolidatedSarifPath).catch(() => false);
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
    await consolidateReports();

    // Add your SARIF conversion logic here if needed
    await convertJsonToSarif();

    
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1); // Exit with failure status if an error occurs
  }
  finally {
    await execPromise(`rm ${OUTPUT_DIR}/*_batch*.json`)
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