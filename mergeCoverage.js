// mergeCoverage.js

import { readdirSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const NYC = require('nyc');

// Define __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const rootDir = __dirname;
const packagesDir = join(rootDir, 'packages');
const nycOutputDir = join(rootDir, '.nyc_output');
const coverageDir = join(rootDir, 'coverage');

// Ensure .nyc_output directory exists
if (!existsSync(nycOutputDir)) {
    mkdirSync(nycOutputDir);
}

// Initialize NYC (Istanbul)
const nyc = new NYC({
    cwd: rootDir,
    reporter: ['html', 'text-summary'],
    reportsDirectory: coverageDir,
    all: true,
});

// Collect coverage files from all packages
const packageDirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

let coverageData = {};

packageDirs.forEach((pkg) => {
    const coverageFile = join(packagesDir, pkg, 'coverage', 'coverage-final.json');
    if (existsSync(coverageFile)) {
        const coverageJSON = JSON.parse(readFileSync(coverageFile, 'utf-8'));
        coverageData = { ...coverageData, ...coverageJSON };
    } else {
        console.warn(`Coverage file not found for package: ${pkg}`);
    }
});

// Write merged coverage data to .nyc_output
const mergedCoveragePath = join(nycOutputDir, 'coverage.json');
writeFileSync(mergedCoveragePath, JSON.stringify(coverageData), 'utf-8');

// Generate combined report
nyc.report().catch((err) => {
    console.error('Error generating coverage report:', err);
    process.exit(1);
});
