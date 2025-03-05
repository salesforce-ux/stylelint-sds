import semver from 'semver';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Logger } from './logger'; // Ensure this path is correct

export const REQUIRED_NODE_VERSION = '18.20.0';

/**
 * Checks if the current Node.js version meets the required version.
 * @param {string} requiredVersion - The required Node.js version.
 * @returns {boolean} - Returns true if the current version is valid.
 */
export function checkNodeVersion(requiredVersion) {
  return semver.gte(process.version, requiredVersion);
}

/**
 * Validates the Node.js version and exits if it does not meet the requirement.
 */
export function validateNodeVersion() {
  if (!checkNodeVersion(REQUIRED_NODE_VERSION)) {
    Logger.error(
      `Node.js version ${process.version} is not supported. Please upgrade to ${REQUIRED_NODE_VERSION} or later.`
    );
    process.exit(1);
  }
}

/**
 * Util to resolve dirName from import meta compatible with node v18
 * Letst version of node have import.meta.dirname
 * @param importMeta 
 * @returns 
 */
export function resolveDirName(importMeta:ImportMeta){
  if("dirname" in importMeta){
    return importMeta.dirname;
  }
  return dirname(fileURLToPath((importMeta as ImportMeta).url));
}

export function resolvePath(specifier:string, parentURL = import.meta.url) {
  return new URL(specifier, parentURL).href;
};