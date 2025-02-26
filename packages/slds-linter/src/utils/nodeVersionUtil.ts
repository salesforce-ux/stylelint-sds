// utils/nodeVersionUtil.js

import { Logger } from './logger'; // Ensure this path is correct

export const REQUIRED_NODE_VERSION = '20.18.3';

/**
 * Checks if the current Node.js version meets the required version.
 * @param {string} requiredVersion - The required Node.js version.
 * @returns {boolean} - Returns true if the current version is valid.
 */
export function checkNodeVersion(requiredVersion) {
  const semver = requiredVersion.split('.').map(Number);
  const currentVersion = process.version.slice(1).split('.').map(Number);

  for (let i = 0; i < semver.length; i++) {
    if (currentVersion[i] > semver[i]) return true;
    if (currentVersion[i] < semver[i]) return false;
  }
  return true; // Exact match
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
