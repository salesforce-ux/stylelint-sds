import { writeFile } from 'fs/promises';
import fspromises from 'fs/promises';

export async function consolidateReportsJQ(jsonFiles:  string[]): Promise<string | object> {
  try {
    // Use the 'add' filter to combine JSON files
    const filter = 'add';

    // Read and combine the JSON files
    const allData = [];
    for (const file of jsonFiles) {
      const content = await fspromises.readFile(file, 'utf8');
      allData.push(JSON.parse(content));
    }
    return allData.flat();
    // The below worked with node-jq
    // const combinedData = await jq.run('add', JSON.stringify(allData), { input: 'string', output: 'json' });
    // return combinedData;

    
  } catch (error) {
    console.error('Error consolidating reports:', error);
    throw error;
  }
}

export async function writeToFile(data: any, filePath: string){
  try {
    await writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error while writing to the file');
  }
}
