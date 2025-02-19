import { Transform } from "node:stream";
import { Buffer } from "node:buffer";
import { pipeline } from "node:stream/promises";
import { series, src, dest } from "gulp";
import { rimraf } from "rimraf";
import { task } from "gulp-execa";
import { basename, parse, format } from "node:path";
import { camelCase } from "change-case";
import { glob } from "glob";
import { writeFileSync } from "node:fs";
import * as esbuild from "esbuild";
import {normalizeData} from "./scripts/sldshooks.metadata.parser.js";

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
    const pathParts = parse(file.path);
    const exportName = camelCase(pathParts.name);
    pathParts.ext = "js";
    pathParts.name = exportName;
    delete pathParts.base;
    file.path = format(pathParts);
    file.contents = Buffer.from(
      `export const ${exportName} =${JSON.stringify(JSON.parse(file.contents), null, 4)}`
    );
    callback(null, file);
  };
  return exportToJson;
}

async function generateIndex() {
  const listOfFiles = await glob(`./resources/*.json`);
  const content = listOfFiles
    .map((filePath) => {
      return `export * from "./${camelCase(basename(filePath, ".json"))}.js";`;
    })
    .join("\n");
  writeFileSync("./build/index.js", content);

  writeFileSync(
    "./build/index.d.ts",
    `declare module '@salesforce-ux/matadata-slds';
    ${content}
  `
  );
}

/**
 * Clean all generated folder
 * @returns
 */
function cleanDirs() {
  return rimraf(["build"]);
}

/**
 * Compile typescript files
 * */
function generateFiles() {
  return pipeline(src(`./resources/*.json`), jsonToJsExport(), dest("build/"));
}

const genrateDefinitions = task(`tsc --project ./tsconfig.json`);

/**
 * This method uses resources/globalSharedHooks.metadata.json to generate value --> hooks mapping for bothe slds and slds-plus
 */
export async function value2HooksMappings() {
  await normalizeData("slds");
  await normalizeData("slds2");
}

export const build = series(
  cleanDirs,
  value2HooksMappings,
  generateFiles,
  genrateDefinitions,
  generateIndex
);

export default task("gulp --tasks");
