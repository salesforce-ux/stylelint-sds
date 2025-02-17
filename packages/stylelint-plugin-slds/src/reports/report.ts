import { promises as fs } from 'fs';
import path, {join} from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import convertJsonToSarif from './json-to-sarif';
import { getStylelintValidationReport } from './stylelint-json-report';
import { getEslintValidationReport } from './eslint-json-report';
import { findCSSFiles, findComponentFiles } from './utils/utils';
import { calculateBatchInfo } from './utils/batching';
import { glob } from 'glob';

import { consolidateReportsJQ, writeToFile } from './utils/consolidateJsonFiles';
const execPromise = promisify(exec);
const __dirname = process.cwd();

const args = process.argv.slice(2); // Skip the first two entries (node and script path)

let targetDirectory = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '-d' || args[i] === '--directory') {
    targetDirectory = args[i + 1]; // Get the value after `-d`
  }
}


if (targetDirectory === '') targetDirectory = '.';

const TARGET_DIR = targetDirectory; //process.argv[2];
const FOLDER_NAME = '.sldslinter';
const OUTPUT_DIR = path.join(__dirname, FOLDER_NAME);

// Batch settings
const BATCH_SIZE = 100;
const MAX_BATCHES = 100;
const TIME_PER_BATCH = 5;

const removeFiles = async (pattern: string): Promise<void> => {
  //console.log(`Removing files matching: ${pattern}`);

  try {
    // Wrap glob in a Promise to handle async code properly
    const files = await glob(pattern);

    // Proceed to remove files if they match
    files.forEach(file => {
      const filePath = path.resolve(file); // Ensure full path to file
      fs.unlink(filePath);
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

async function main(): Promise<void> {
  if (!TARGET_DIR) {
    console.error(
      ' >> Please provide the target directory containing CSS files.'
    );
    process.exit(1); // Exit if TARGET_DIR is not provided
  }

  try {
    // Clear the report directory
    await initializeOutputDirectory();

    // Set expectation on how much time it may take.

    const stylelintValidationFiles = await findCSSFiles(TARGET_DIR);
    const eslintValidationFiles = await findComponentFiles(TARGET_DIR);

    const {
      totalBatches: totalStyleLintBatches,
      estimatedTime: estimatedStyleLintTime,
    } = calculateBatchInfo(stylelintValidationFiles);

    const {
      totalBatches: totalESLintBatches,
      estimatedTime: estimatedESLintTime,
    } = calculateBatchInfo(eslintValidationFiles);

    console.log(`
      ====================================================
                     Total files for validation: ${(stylelintValidationFiles.length + eslintValidationFiles.length)}
                     Approximate time:  ${estimatedStyleLintTime + estimatedESLintTime} (sec)       
      ====================================================
    `);
    
    try{
      await getStylelintValidationReport(stylelintValidationFiles);
    }
    catch(error){
      console.error('Failed to get Stylelint report');
    }

    try{
      await getEslintValidationReport(eslintValidationFiles);
    }
    catch(error){
      console.error('Failed to get ESLint report');
    }
    
    await combineJsonReports();
    // Add your SARIF conversion logic here if needed
    await convertJsonToSarif();
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1); // Exit with failure status if an error occurs
  } finally {
    await removeFiles(`${OUTPUT_DIR}/*batch*.json`);
  }
}

async function initializeOutputDirectory(): Promise<void> {
  await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function combineJsonReports() {
  const finalJson = path.join(OUTPUT_DIR, 'consolidated_report.json');
  let jsonFiles: string[] = await findJsonFiles(OUTPUT_DIR);
  const combinedData = await consolidateReportsJQ(jsonFiles);
  await writeToFile(combinedData, finalJson);
}

async function findJsonFiles(outputDir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(outputDir, { withFileTypes: true });

    let jsonFiles = files
      .filter(
        (file) =>
          file.isFile() &&
          (file.name === 'batch_eslint_report.json' || file.name === 'batch_stylelint_report.json')
      )
      .map((file) => join(outputDir, file.name));

    if (jsonFiles.length === 0) {
      //console.warn(`No JSON files found in directory: ${outputDir}`);
    }
    return jsonFiles;
  } catch (error: any) {
    console.error(`Error reading directory: ${error.message}`);
    throw error;
  }
}


// Use an async IIFE to ensure proper exit handling
(async () => {
  try {
    await main();
    process.exit(0); // Exit with success status
  } catch (error) {
    console.error('Unhandled error:', error);
    process.exit(1); // Exit with failure status
  }
})();
