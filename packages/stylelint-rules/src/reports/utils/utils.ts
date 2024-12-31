import { spawn } from 'child_process';

export async function findCSSFiles(directory: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const findProcess = spawn('find', [
      directory,
      '-name', '*.css',
      '-o', '-name', '*.less',
      '-o', '-name', '*.scss'
    ]);
    let files = '';

    findProcess.stdout.on('data', (data) => {
      files += data.toString();
    });

    findProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
    });

    findProcess.on('close', (code) => {
      if (code === 0) {
        resolve(files.trim().split('\n').filter(file => file));
      } else {
        reject(new Error(`find command exited with code ${code}`));
      }
    });
  });
}

export async function findComponentFiles(directory: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const findProcess = spawn('find', [
        directory,
        '-name', '*.html',
        '-o', '-name', '*.cmp'
      ]);
  
      let files = '';
  
      findProcess.stdout.on('data', (data) => {
        files += data.toString();
      });
  
      findProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
      });
  
      findProcess.on('close', (code) => {
        if (code === 0) {
          resolve(files.trim().split('\n').filter(file => file));
        } else {
          reject(new Error(`find command exited with code ${code}`));
        }
      });
    });
  }