import { Transform } from "node:stream";
import { Buffer } from "node:buffer";
import { pipeline } from "node:stream/promises";
import { series, src, dest } from "gulp";
import { rimraf } from "rimraf";
import { task } from "gulp-execa";
import { basename } from "node:path";
import {camelCase} from "change-case";
import { glob } from "glob";
import { writeFileSync } from "node:fs";

/**
 * Gulp task to pipe file content into a js file with a named export
 * name of the export will be camelCase of file's base name
 * 
 * @returns 
 */
function jsonToJsExport() {
  const exportToJson = new Transform({ objectMode: true });
  exportToJson._transform = (originalFile, encoding, callback) => {
    var file = originalFile.clone({ contents: false });
    const exportName = camelCase(basename(file.path, '.json'));
    file.path = file.path.replace(/\.json$/i, '.js');
    file.contents = Buffer.from(`export const ${exportName} =${JSON.stringify(JSON.parse(file.contents), null, 4)}`)
    callback(null, file);
  };
  return exportToJson;
}

async function generateIndex(){
  const listOfFiles = await glob(`./resources/*.json`);
  const content = listOfFiles.map((filePath)=>{
    return `export * from "./${basename(filePath, '.json')}";`
  }).join('\n');
  writeFileSync('./build/index.js', content);

  writeFileSync('./build/index.d.ts', `declare module '@salesforce-ux/matadata-slds';
    ${content}
  `)
}

/**
 * Clean all generated folder
 * @returns
 */
function cleanDirs() {
  return rimraf(["build"]);
}

/**
 * Copy resources to publish dir
 * @returns
 */
function copy() {
  return src(["./package.json", "README.md"]).pipe(dest("build/"));
}

/**
 * Compile typescript files
 * */
function generateFiles() {
  return pipeline(src(`./resources/*.json`), jsonToJsExport(), dest('build/'));
}

const genrateDefinitions = task(`tsc --project ${process.cwd()}/tsconfig.json`);

export const build = series(cleanDirs, copy, generateFiles, genrateDefinitions, generateIndex);

export default task("gulp --tasks");
