/*
    This file is to get all the validation issue with stylelint rules
*/
import { promises as fs } from 'fs';
import readline from 'readline';
import cliProgress from 'cli-progress';
import { execFile } from 'child_process';
import path, { join, extname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import spawn from 'cross-spawn';
import {processFilesInBatches as runBatches} from './run-batches'
import { consolidateReportsJQ, writeToFile } from './utils/consolidateJsonFiles';
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
const FOLDER_NAME = 'reports';
const OUTPUT_DIR = path.join(__dirname, FOLDER_NAME);

// Batch settings
const BATCH_SIZE = 2;

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

async function processFilesInBatches(cssFiles: string[]): Promise<void> {
  const stylelintPath = path.resolve(__dirname, 'node_modules/.bin/stylelint');
  const stylelintConfigFile = configFile;
  await runBatches(cssFiles, stylelintPath, stylelintConfigFile, 10);
}

async function consolidateReports(): Promise<void> {
  const consolidatedReportPath = join(OUTPUT_DIR, 'batch_stylelint_report.json');
  let jsonFiles: string[] = [];

  try {
    // Find JSON files matching the pattern
    const files = await fs.readdir(OUTPUT_DIR, { withFileTypes: true });
    jsonFiles = files
      .filter(
        (file) =>
          file.isFile() &&
          file.name.startsWith('sl_batch') &&
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
  await writeToFile(combinedData, consolidatedReportPath);
}

export async function getStylelintValidationReport(cssFiles) {
  await processFilesInBatches(cssFiles);
  await consolidateReports();
}
