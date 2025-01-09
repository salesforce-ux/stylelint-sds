#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const configs = [
  {
    file: '.eslintrc.yml',
    content: `
root: true
env:
  es2021: true
  node: true
parserOptions:
  ecmaVersion: 2021
  sourceType: module
ignorePatterns:
  - "node_modules/"
overrides:
  - files:
      - "*.html"
      - "*.cmp"
    parser: "@html-eslint/parser"
    plugins:
      - "@salesforce-ux/sds-rules"
    rules:
      "@salesforce-ux/sds-rules/no-bem-class":
        - "error"
      "@salesforce-ux/sds-rules/no-deprecated-slds-classes":
        - "error"

  - files:
      - "*.js"
      - "*.json"
    excludedFiles: "*.js"
    rules:
      "@salesforce-ux/no-bem-class":
        - "error"
      "@salesforce-ux/sds-rules/no-deprecated-slds-classes":
        - "error"
    `,
  },
  {
    file: '.stylelintrc.yml',
    content: `
plugins:
  - "@salesforce-ux/stylelint-sds"

overrides:
  - files:
      - "**/*.css"
      - "**/*.scss"
    customSyntax: "postcss"
    rules:
      sf-sds/no-slds-class-overrides:
        - true
        - severity: warning
      sf-sds/no-important-tag:
        - true
        - severity: warning
      # sf-sds/no-hardcoded-values:
      #   - true
      #   - severity: error
      sf-sds/no-hardcoded-values-slds2:
        - true
        - severity: error
      sf-sds/enforce-utility-classes:
        - true
      sf-sds/no-aura-tokens:
        - true
      sf-sds/lwc-to-slds-token:
        - true
      sf-sds/enforce-bem-usage:
        - true
      sf-sds/no-deprecated-slds-classes:
        - true
      sf-sds/no-deprecated-slds-hooks:
        - true
      sf-sds/no-lwc-custom-properties:
        - true
      sf-sds/no-sds-custom-properties:
        - true
      sf-sds/no-slds-private-var:
        - true
      # sf-sds/do-not-use-calc-function:
      #   - true
      sf-sds/enforce-sds-to-slds-hooks:
        - true
        - severity: error
        
    sourceMap: 
      - false

  - files:
      - "**/*.html"
    customSyntax: "postcss-html"
    rules: {}
    `,
  },
];

configs.forEach(({ file, content }) => {
  const destinationPath = path.join(process.cwd(), file);

  if (!fs.existsSync(destinationPath)) {
    fs.writeFileSync(destinationPath, content.trim());
    console.log(`${file} has been created in your project.`);
  } else {
    console.log(`${file} already exists. Please merge the configurations manually if needed.`);
  }
});