import semver from 'semver';
import { Logger } from './logger'; // Ensure this path is correct

export const REQUIRED_NODE_VERSION = '20.18.3';

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
