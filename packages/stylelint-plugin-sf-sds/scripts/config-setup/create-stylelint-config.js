#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the .stylelintrc.yml file inside the npm package
const sourcePath = path.resolve(__dirname, './build/.stylelintrc.yml');

// Path to the user's project root where the file should be copied
const destinationPath = path.resolve(process.cwd(), '.stylelintrc.yml');

// Check if the .stylelintrc.yml already exists in the user's project
if (!fs.existsSync(destinationPath)) {
  try {
    // Copy the .stylelintrc.yml to the user's project root
    fs.copyFileSync(sourcePath, destinationPath);
    console.log('.stylelintrc.yml has been successfully created in the root of your project.');
  } catch (error) {
    console.error('Error copying .stylelintrc.yml:', error);
  }
} else {
  console.log('.stylelintrc.yml already exists in the root of your project. You need to merge these configurations manually.');
}