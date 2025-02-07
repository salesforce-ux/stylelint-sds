import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';
import JSONStream from 'JSONStream';
import path from 'path';
import { normalizePath } from './utils/utils';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';

const __dirname = process.cwd();

// Input and output file paths
const JSON_REPORT = path.join(__dirname, 'reports/consolidated_report.json');
const SARIF_REPORT = path.join(__dirname, 'reports/consolidated_report.sarif');

// Define SARIF structure types
interface SarifRule {
  id: string;
  shortDescription: { text: string };
  fullDescription: { text: string };
  defaultConfiguration: { level: string };
}

interface SarifResult {
  ruleId: string;
  level: string;
  message: { text: string };
  locations: [
    {
      physicalLocation: {
        artifactLocation: { uri: string };
        region: {
          startLine: number;
          endLine: number;
          startColumn: number;
          endColumn: number;
        };
      };
    },
  ];
}

interface SarifOutput {
  $schema: string;
  version: string;
  runs: [
    {
      tool: {
        driver: {
          name: string;
          version: string;
          informationUri: string;
          rules: SarifRule[];
        };
      };
      results: SarifResult[];
    },
  ];
}

// Initialize the SARIF output structure
const sarifOutput: SarifOutput = {
  $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
  version: '2.1.0',
  runs: [
    {
      tool: {
        driver: {
          name: 'Stylelint',
          version: '1.0',
          informationUri: 'https://stylelint.io/',
          rules: [],
        },
      },
      results: [],
    },
  ],
};

interface Warning {
  rule?: string;
  severity?: string;
  text?: string;
  line?: number;
  endLine?: number;
  column?: number;
  endColumn?: number;
}

interface Entry {
  source?: string;
  warnings: Warning[];
}

// async function convertJsonToSarif(): Promise<void> {
//   try {
//     // Read and parse the JSON report
//     const data = await fs.readFile(JSON_REPORT, 'utf8');
//     const jsonData: Entry[] = JSON.parse(data);

//     // Process each entry in the JSON data
//     jsonData.forEach((entry) => {
//       if (!entry.warnings || entry.warnings.length === 0) return;

//       // Process all warnings in the array
//       entry.warnings.forEach((warning) => {
//         // Extract relevant fields
//         const id = warning.rule || 'unknown_rule';
//         const severity = warning.severity || 'warning';
//         const message = warning.text || 'No message provided';
//         const filePath = normalizePath(entry.source) || 'unknown_file';
//         const startLine = warning.line || 1;
//         const endLine = warning.endLine || startLine;
//         const startColumn = warning.column || 1;
//         const endColumn = warning.endColumn || startColumn;

//         // Check if the rule already exists in the `rules` array
//         const ruleExists = sarifOutput.runs[0].tool.driver.rules.some(
//           (rule) => rule.id === id
//         );

//         if (!ruleExists) {
//           sarifOutput.runs[0].tool.driver.rules.push({
//             id,
//             shortDescription: { text: message },
//             fullDescription: { text: message },
//             defaultConfiguration: { level: severity },
//           });
//         }

//         // Add result to SARIF `results` array
//         sarifOutput.runs[0].results.push({
//           ruleId: id,
//           level: severity,
//           message: { text: message },
//           locations: [
//             {
//               physicalLocation: {
//                 artifactLocation: { uri: filePath },
//                 region: {
//                   startLine,
//                   endLine,
//                   startColumn,
//                   endColumn,
//                 },
//               },
//             },
//           ],
//         });
//       });
//     });

//     // Write SARIF output to file
//     //await fs.writeFile(SARIF_REPORT, JSON.stringify(sarifOutput, null, 2));
//     await writeLargeJSON(SARIF_REPORT, sarifOutput)
//     console.log(`Conversion complete: ${SARIF_REPORT}`);
//   } catch (err) {
//     console.error('Error during conversion:', err);
//   }
// }

/**
 * Converts a large JSON report to SARIF format without exceeding memory limits.
 */
async function convertJsonToSarif(): Promise<void> {
  try {
    // Create a read stream and parse JSON entries
    const stream = createReadStream(JSON_REPORT, { encoding: 'utf8' });
    const parser = JSONStream.parse('*'); // Adjust filter based on JSON structure

    await pipeline(
      stream,
      parser,
      async function* (source) {
        for await (const entry of source) {
          if (!entry.warnings || entry.warnings.length === 0) continue;

          for (const warning of entry.warnings) {
            const id = warning.rule || 'unknown_rule';
            const severity = warning.severity || 'warning';
            const message = warning.text || 'No message provided';
            const filePath = normalizePath(entry.source) || 'unknown_file';
            const startLine = warning.line || 1;
            const endLine = warning.endLine || startLine;
            const startColumn = warning.column || 1;
            const endColumn = warning.endColumn || startColumn;

            // Add rule only if it doesn't exist
            if (!sarifOutput.runs[0].tool.driver.rules.some(rule => rule.id === id)) {
              sarifOutput.runs[0].tool.driver.rules.push({
                id,
                shortDescription: { text: message },
                fullDescription: { text: message },
                defaultConfiguration: { level: severity },
              });
            }

            // Push results in chunks to prevent memory overflow
            sarifOutput.runs[0].results.push({
              ruleId: id,
              level: severity,
              message: { text: message },
              locations: [
                {
                  physicalLocation: {
                    artifactLocation: { uri: filePath },
                    region: {
                      startLine,
                      endLine,
                      startColumn,
                      endColumn,
                    },
                  },
                },
              ],
            });

            // Periodically flush results to avoid memory overload
            if (sarifOutput.runs[0].results.length > 10000) {
              await writeLargeJSON(SARIF_REPORT, sarifOutput);
              sarifOutput.runs[0].results = []; // Clear processed results
            }
          }
        }
      }
    );

    // Write any remaining results
    await writeLargeJSON(SARIF_REPORT, sarifOutput);
    console.log(`Conversion complete: ${SARIF_REPORT}`);
  } catch (err) {
    console.error('Error during conversion:', err);
  }
}

/**
 * Efficiently writes a large JSON object to a file using streaming.
 * @param filePath - The file path to write the JSON output.
 * @param sarifOutput - The large JSON object to write.
 */
export async function writeLargeJSON(filePath: string, sarifOutput: object): Promise<void> {
  return new Promise((resolve, reject) => {
      const stream = createWriteStream(filePath, { encoding: 'utf-8' });
      const jsonStream = JSONStream.stringifyObject(); // Create a JSON streaming object

      jsonStream.pipe(stream);

      for (const key of Object.keys(sarifOutput)) {
          jsonStream.write([key, sarifOutput[key]]); // Stream each key-value pair
      }

      jsonStream.end(); // Finish the JSON writing process

      stream.on('finish', resolve);
      stream.on('error', reject);
  });
}

export default convertJsonToSarif;
