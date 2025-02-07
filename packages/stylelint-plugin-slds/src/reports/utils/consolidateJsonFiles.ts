import { writeFile } from 'fs/promises';
import fspromises from 'fs/promises';
import { createWriteStream, createReadStream } from 'fs';
import JSONStream from 'JSONStream';
import { pipeline } from 'stream/promises';


// export async function consolidateReportsJQ(jsonFiles:  string[]): Promise<string | object> {
//   try {
//     // Use the 'add' filter to combine JSON files
//     const filter = 'add';

//     // Read and combine the JSON files
//     const allData = [];
//     for (const file of jsonFiles) {
//       const content = await fspromises.readFile(file, 'utf8');
//       allData.push(JSON.parse(content));
//     }
//     return allData.flat();
//     // The below worked with node-jq
//     // const combinedData = await jq.run('add', JSON.stringify(allData), { input: 'string', output: 'json' });
//     // return combinedData;

    
//   } catch (error) {
//     console.error('Error consolidating reports:', error);
//     throw error;
//   }
// }

export async function consolidateReportsJQ(jsonFiles: string[]): Promise<any[]> {
  try {
      const allData: any[] = [];

      for (const file of jsonFiles) {
          await pipeline(
              createReadStream(file, { encoding: 'utf-8' }), // Stream file contents
              JSONStream.parse('*'), // Parse JSON objects individually
              async function* (source) {
                  for await (const obj of source) {
                      allData.push(obj); // Collect parsed JSON objects
                  }
              }
          );
      }

      return allData;
  } catch (error) {
      console.error('Error consolidating reports:', error);
      throw error;
  }
}


export async function writeToFile(data: any, filePath: string){
  try {
    //await writeFile(filePath, JSON.stringify(data, null, 2));
    await writeLargeJSON(filePath, data);
  } catch (error) {
    console.error(`Error while writing to the file ${error}`);
  }
}

/**
 * Efficiently writes a large JSON object to a file using streaming.
 * @param filePath - The file path to write the JSON output.
 * @param data - The large JSON object or array to write.
 */
export async function writeLargeJSON(filePath: string, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
      const stream = createWriteStream(filePath, { encoding: 'utf-8' });
      const jsonStream = Array.isArray(data)
          ? JSONStream.stringify('[\n', ',\n', '\n]') // For arrays
          : JSONStream.stringifyObject('{', ',\n', '}'); // For objects

      jsonStream.pipe(stream);

      if (Array.isArray(data)) {
          for (const item of data) {
              jsonStream.write(item);
          }
      } else {
          for (const [key, value] of Object.entries(data)) {
              jsonStream.write([key, value]);
          }
      }

      jsonStream.end(); // Finish the JSON writing process

      stream.on('finish', resolve);
      stream.on('error', reject);
  });
}

