import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function normalizeData(sldsVersion) {
  try {
    // Read the input JSON file
    const data = await readFile(`${__dirname}/metadata/globalSharedHooks.metadata.json`, 'utf8'); // Adjust the file path if needed
    const inputData = JSON.parse(data);
    
    const result = {};

    // Normalize the data
    for (const [scope, hooks] of Object.entries(inputData)) {
      for (const [hookName, hookDetails] of Object.entries(hooks)) {
        let hexValue = hookDetails.values.slds;

        if(sldsVersion === 'slds2')
        {
            hexValue = hookDetails.values.sldsplus;
        }

        if(hexValue){
            if (!result[hexValue]) {
                result[hexValue] = { hooks: [] };
              }
              else {
                  result[hexValue].hooks.push({
                      name: hookName,
                      properties: hookDetails.properties,
                  });
              }
        }
      }
    }

    // Write the normalized data to a new JSON file
    if(sldsVersion === 'slds2')
    {
        await writeFile(`${__dirname}/slds2-stylinghooks.json`, JSON.stringify(result, null, 2), 'utf8');
        console.log('Normalized data written to slds2-stylinghooks.json');
    }
    else
    {
        await writeFile(`${__dirname}/slds1-stylinghooks.json`, JSON.stringify(result, null, 2), 'utf8');
        console.log('Normalized data written to slds1-stylinghooks.json');
    }
    

    

  } catch (error) {
    console.error('Error reading or parsing the file:', error);
  }
}

// Usage
normalizeData('slds');
normalizeData('slds2');
