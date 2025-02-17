import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const metadataDir = `${__dirname}/../resources`;


// This script is used to normalize the data from the globalSharedHooks.metadata.json file.
// It reads the input JSON file, normalizes the data, and writes the normalized data to a new JSON file.
// The script is used to create two different JSON files, one for slds and one for slds2.
// The generated file will be used to suggest possible hooks for a hardcoded value in css
async function normalizeData(sldsVersion) {
  try {
    // Read the input JSON file
    const data = await readFile(
      `${metadataDir}/globalSharedHooks.metadata.json`,
      'utf8'
    ); // Adjust the file path if needed
    const inputData = JSON.parse(data);

    const result = {};

    // Normalize the data
    for (const [scope, hooks] of Object.entries(inputData)) {
      for (const [hookName, hookDetails] of Object.entries(hooks)) {
        let values = hookDetails.values.slds;
        let aliases = hookDetails.aliases.slds;

        if (sldsVersion === 'slds2') {
          values = hookDetails.values.sldsplus;
          aliases = hookDetails.aliases.sldsplus;
        }

        [values, aliases].forEach((entry) => {
          if (!entry) return;
          if (!result[entry]) {
            result[entry] = { hooks: [] };
          }
          result[entry].hooks.push({
            name: hookName,
            properties: hookDetails.properties,
          });
        });
      }
    }

    // Write the normalized data to a new JSON file
    if (sldsVersion === 'slds2') {
      await writeFile(
        `${metadataDir}/valueToStylinghook.sldsplus.json`,
        JSON.stringify(result, null, 2),
        'utf8'
      );
    } else {
      await writeFile(
        `${metadataDir}/valueToStylinghook.slds.json`,
        JSON.stringify(result, null, 2),
        'utf8'
      );
    }
  } catch (error) {
    console.error('Error reading or parsing the file:', error);
  }
}

// Usage
normalizeData('slds');
normalizeData('slds2');
