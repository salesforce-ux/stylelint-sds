/*
    This file is to get all the validation issue with eslint rules
*/

import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { spawn } from 'child_process';
import convertJsonToSarif from './json-to-sarif';

const execPromise = promisify(exec);
const __dirname = process.cwd();

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

if (configFile === '') configFile = './stylelintrc.yml';

validateConfigFile(configFile);

if (targetDirectory === '') targetDirectory = '.';

const CONFIG_FILE = configFile;
const TARGET_DIR = targetDirectory; //process.argv[2];
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
    console.error(
      `Command usage: npm run report -- -c .stylelintrc.yml -d example-component-folder`
    );
    process.exit(1);
  }
}

async function findCSSFiles(directory: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const findProcess = spawn('find', [
      directory,
      '-name',
      '*.css',
      '-o',
      '-name',
      '*.less',
      '-o',
      '-name',
      '*.scss',
    ]);
    let files = '';

    findProcess.stdout.on('data', (data) => {
      files += data.toString();
    });

    findProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
    });

    findProcess.on('close', (code) => {
      if (code === 0) {
        resolve(
          files
            .trim()
            .split('\n')
            .filter((file) => file)
        );
      } else {
        reject(new Error(`find command exited with code ${code}`));
      }
    });
  });
}

function calculateBatchInfo(totalFiles: number) {
  const totalBatches = Math.min(
    Math.ceil(totalFiles / BATCH_SIZE),
    MAX_BATCHES
  );
  const estimatedTime = totalBatches * TIME_PER_BATCH;
  return { totalBatches, estimatedTime };
}

function lintComponentBatch(batch: string[], batchNum: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const outputFile = `${OUTPUT_DIR}/eslint_batch${batchNum}.json`;

    try {
      const process = spawn('npx', [
        'eslint',
        ...batch,
        '--config',
        '.eslintrc.yml',
        '--format',
        'json',
        '--output-file',
        outputFile,
        '--ignore-pattern',
        'node_modules/',
      ]);
      resolve();
    } catch (error) {
      console.log(`Error ${error}`);
    }
  });
}

async function processFilesInBatches(componentFiles: string[]): Promise<void> {
  const totalComponentFiles = componentFiles.length;
  const {
    totalBatches: totalComponentBatches,
    estimatedTime: estimatedComponentValidationTime,
  } = calculateBatchInfo(totalComponentFiles);

  const totalBatches = totalComponentBatches;
  const estimatedTime = estimatedComponentValidationTime;

  //console.log(`Total files: ${totalComponentFiles}`);
  //console.log(`Processing in ${totalBatches} batch(es), estimated time: ${estimatedTime} sec.`);

  // Lint components using eslint
  for (let i = 0; i < totalComponentFiles; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    if (batchNum > MAX_BATCHES) {
      console.log(`Reached maximum batch limit of ${MAX_BATCHES}. Stopping.`);
      break;
    }
    const batch = componentFiles.slice(i, i + BATCH_SIZE);
    await lintComponentBatch(batch, batchNum);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function consolidateComponentReports(): Promise<void> {
  await delay(5000);
  const consolidatedReportPath = path.join(
    OUTPUT_DIR,
    'batch_eslint_report.json'
  );

  let jsonFiles: string[] = [];
  try {
    const { stdout } = await execPromise(
      `find "${OUTPUT_DIR}" -name "eslint_batch*.json"`
    );
    jsonFiles = stdout
      .trim()
      .split('\n')
      .filter((file) => file);
    if (jsonFiles.length === 0) {
      console.warn(`No JSON files found in directory: ${OUTPUT_DIR}`);
      return;
    }
  } catch (error: any) {
    console.error(`Error reading directory: ${error.message}`);
    throw error;
  }
  await execPromise(
    `jq -s 'add' ${jsonFiles.join(' ')} > "${consolidatedReportPath}"`
  );
  try {
    const eslintReport = await JSON.parse(
      await fs.readFile(consolidatedReportPath, 'utf8')
    );
    await fs.writeFile(
      consolidatedReportPath,
      JSON.stringify(convertToStylelintSchema(eslintReport), null, 2)
    );
  } catch (error: any) {
    console.log(`Error ${error}`);
  }
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

export async function getEslintValidationReport(eslintValidationFiles) {
  //const componentFiles = await findComponentFiles(TARGET_DIR);
  await processFilesInBatches(eslintValidationFiles);
  await consolidateComponentReports();
}
