import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eslintConfigPath = fileURLToPath(await import.meta.resolve('@salesforce-ux/eslint-plugin-slds/build/.eslintrc.yml'));
const stylelintConfigPath = fileURLToPath(await import.meta.resolve('@salesforce-ux/stylelint-plugin-slds/build/.stylelintrc.yml'));

// Define the destination path where you want to copy the file
const destinationPath = path.resolve(__dirname, 'config-copy.json');

const config = [
  {
    "sourcePath" : path.resolve(__dirname, eslintConfigPath),
    "destinationPath":".eslintrc.yml"
  },
  {
    "sourcePath" : path.resolve(__dirname, stylelintConfigPath),
    "destinationPath":".stylelintrc.yml"
  }
]

function setupStylelintConfig() {
  config.forEach(({ sourcePath, destinationPath }) => {
    const source = path.resolve(__dirname, sourcePath);
    const destination = path.resolve(process.cwd(), destinationPath);

    // Check if the destination file already exists
    if (!fs.existsSync(destination)) {
      try {
        // Copy the source file to the destination
        fs.copyFileSync(source, destination);
        console.log(`${destinationPath} has been successfully created.`);
      } catch (error) {
        console.error(`Error copying ${destinationPath}:`, error);
      }
    } else {
      console.log(`${destinationPath} already exists. Merge configurations manually if needed.`);
    }
  });
}

setupStylelintConfig();
