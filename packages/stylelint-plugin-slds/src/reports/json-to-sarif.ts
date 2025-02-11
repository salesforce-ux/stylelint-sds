import { promises as fs } from 'fs';
import path from 'path';
import { normalizePath } from './utils/utils';
import ruleMetadata from '../utils/rulesMetadata';


const __dirname = process.cwd();

// Input and output file paths
const JSON_REPORT = path.join(__dirname, 'reports/consolidated_report.json');
const SARIF_REPORT = path.join(__dirname, 'reports/consolidated_report.sarif');

// Define SARIF structure types
interface SarifRule {
  id: string;
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

function pushRulesInSarifOutput(jsonData:Entry[]):void {
  jsonData.forEach((entry) => {
    if (!entry.warnings || entry.warnings.length === 0) return;
   
    const ruleSet = new Set();
    
    entry.warnings.forEach((warning) => {
      const ruleId = warning.rule;
      if(!ruleSet.has(ruleId)){
      ruleSet.add(ruleId);

      sarifOutput.runs[0].tool.driver.rules.push({
        id: ruleId,
        fullDescription: { text: ruleMetadata(ruleId).ruleDesc || 'No message provided' },
        defaultConfiguration: { level: ruleMetadata(ruleId).severityLevel || 'warning' },
      });
      }
    });
    
  });
}

async function convertJsonToSarif(): Promise<void> {
  try {
    // Read and parse the JSON report
    const data = await fs.readFile(JSON_REPORT, 'utf8');
    const jsonData: Entry[] = JSON.parse(data);

    pushRulesInSarifOutput(jsonData);
    // Process each entry in the JSON data
    jsonData.forEach((entry) => {
      if (!entry.warnings || entry.warnings.length === 0) return;
      
      // Process all warnings in the array
      entry.warnings.forEach((warning) => {
        // Extract relevant fields
        const id = warning.rule || 'unknown_rule';
        const severity = ruleMetadata(id).severityLevel || 'warning';
        const message = warning.text || 'No message provided';
        const filePath = normalizePath(entry.source) || 'unknown_file';
        const startLine = warning.line || 1;
        const endLine = warning.endLine || startLine;
        const startColumn = warning.column || 1;
        const endColumn = warning.endColumn || startColumn;

        // Add result to SARIF `results` array
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
      });
    });

    // Write SARIF output to file
    await fs.writeFile(SARIF_REPORT, JSON.stringify(sarifOutput, null, 2));
    console.log(`Conversion complete: ${SARIF_REPORT}`);
  } catch (err) {
    console.error(`Cannot create .sarif report, you can find .json report : ${JSON_REPORT}`);
  }
}

export default convertJsonToSarif;
