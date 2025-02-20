/*
    This file is to get all the validation issue with stylelint rules
*/
import { promises as fs } from 'fs';
import path, { extname, join } from 'path';
import { processFilesInBatches as runBatches } from './run-batches';
import { consolidateReportsJQ, writeToFile } from './utils/consolidateJsonFiles';


let stylelintConfigFilePath = 'node_modules/@salesforce-ux/stylelint-plugin-slds/build/.stylelintrc.yml';
let OUTPUT_DIR = '';


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
  //const stylelintPath = path.resolve(__dirname, 'node_modules/.bin/stylelint');
  const stylelintConfigFile = stylelintConfigFilePath;
  await runBatches(cssFiles, 'stylelint', stylelintConfigFile, 10);
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

export async function getStylelintValidationReport(cssFiles, configFilePath, outDir) {
  stylelintConfigFilePath = configFilePath;
  OUTPUT_DIR = outDir;
  await validateConfigFile(stylelintConfigFilePath);
  await processFilesInBatches(cssFiles);
  await consolidateReports();
}
