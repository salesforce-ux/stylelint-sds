import { spawn } from 'cross-spawn'; // Makes it work on Windows. Link: https://www.npmjs.com/package/cross-spawn
import path from 'path';
import cliProgress from 'cli-progress';
import {npmRunPathEnv} from 'npm-run-path';

const FOLDER_NAME = '.sldslinter';

function runLinterBatch(batch: string[], batchNum: number, linterPath: string, configFile: string): Promise<string> {
  const OUTPUT_DIR = path.join(process.cwd(), FOLDER_NAME);
  return new Promise((resolve, reject) => {

    let args = [];
    let linterType = getLinterType(linterPath);
    const label = linterType === 'es' ? 'ESLint' : 'Stylelint';

    let outputFile = `${OUTPUT_DIR}/${linterType}_batch${batchNum}.json`;

    if(linterType === 'sl')
    {
      args = [
        ...batch,
        '--config', configFile,
        '--formatter', 'json',
        '--output-file', outputFile,
      ];
    }
    else if(linterType === 'es')
      {
        args = [
          ...batch,
          '--config', configFile,
          '--format', 'json',
          '--output-file', outputFile,
        ];
      }

    //console.log(`Arguments ${configFile} ${outputFile}`)
    const child = spawn(linterPath, args, { stdio: 'inherit', env: npmRunPathEnv() });

    let stdoutData = '';
    let stderrData = '';

    // Capture stdout
    child.stdout.on('data', (data) => {
        stdoutData += data.toString();
    });

    // Capture stderr
    child.stderr.on('data', (data) => {
        stderrData += data.toString();
    });

    // Handle process exit
    child.on('close', (code) => {
        if (code === 2 || code === 1) {
            return resolve(`${label} Batch ${batchNum} completed with linting errors.`);
        } else if (code !== 0) {
            return reject(new Error(`${label} failed for batch ${batchNum} with exit code ${code}`));
        }

        resolve(`${label} Batch ${batchNum} completed successfully.`);
    });

    // Handle errors
    child.on('error', (error) => {
        reject(new Error(`${label} failed to start: ${error.message}`));
    });
  });
}

export async function processFilesInBatches(
  files: string[],
  linter: string,
  configFile: string,
  batchSize: number
): Promise<void> {
  const totalFiles = files.length;
  const batchResults: string[] = [];
  let processedFiles = 0; // Track the number of files validated

  const linterType = getLinterType(linter);

  // Initialize the progress bar
  const progressBar = new cliProgress.SingleBar({
    format:
      linterType === 'es'
        ? `Components Linting Progress [{bar}] {percentage}% | {value}/{total} files`
        : `Styles Linting Progress [{bar}] {percentage}% | {value}/{total} files`,
    barCompleteChar: '█',
    barIncompleteChar: '-',
    hideCursor: true
  });

  progressBar.start(totalFiles, 0); // Start the progress bar

  for (let i = 0; i < totalFiles; i += batchSize) {
    const batchNum = Math.floor(i / batchSize) + 1;
    const batch = files.slice(i, i + batchSize);

    try {
      const result = await runLinterBatch(batch, batchNum, linter, configFile);
      batchResults.push(result);
      processedFiles += batch.length; // Update the number of files processed
      progressBar.update(processedFiles); // Update the progress bar
    } catch (error) {
      progressBar.stop();
      console.error(`\n\nError processing batch ${batchNum}`, error);
      console.log(`\n\n\n`);
    }
  }

  progressBar.stop(); // Stop the progress bar after completion
}

  function getLinterType(linter: string){
    let linterType = 'sl' // stylelint
    if(linter.indexOf('eslint') > 0)
      linterType = 'es' //eslint

    return linterType;
  }