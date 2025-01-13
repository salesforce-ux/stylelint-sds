import jq from 'node-jq'
import { writeFile } from 'fs/promises';
import fspromises from 'fs/promises';

export async function consolidateReportsJQ(jsonFiles:  string[], consolidatedReportPath: string) {
  try {
    // Use the 'add' filter to combine JSON files
    const filter = 'add';

    // Read and combine the JSON files
    const allData = [];
    for (const file of jsonFiles) {
      const content = await fspromises.readFile(file, 'utf8');
      allData.push(JSON.parse(content));
    }
    const combinedData = await jq.run('add', JSON.stringify(allData), { input: 'string', output: 'json' });

    //const combinedData = await jq.run(filter, jsonFiles, { input: 'file', output: 'json' });

    // Write the consolidated data to the output path
    await writeFile(consolidatedReportPath, JSON.stringify(combinedData, null, 2));
    //console.log(`Consolidated report created at ${consolidatedReportPath}`);
  } catch (error) {
    console.error('Error consolidating reports:', error);
    throw error;
  }
}