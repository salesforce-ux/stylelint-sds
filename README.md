# SLDS Linter

## Overview

SLDS Linter provides custom linting rules specifically built for Salesforce Lightning Design System 2 (SLDS 2 beta). SLDS Linter is designed to uplift your Cascading Style Sheet (CSS), Lightning Web Component (LWC), and Aura component files to SLDS 2 and to conform to SLDS best practices. SLDS Linter rules allow you to maintain consistent styling and identify common issues when working with Lightning components. 


Follow these instructions to integrate SLDS Linter into your project.

---

## **Get Started with SLDS Linter**

First, clone the repository, then run some commands to run SLDS Linter rules on test-repository CSS files.

1. Clone this repository.
2. Using your favorite code editor, in your project root folder, run these commands.

  ```
    npm run install-all
    npm run build
  ```

### Set Up SLDS Linter in Your Component Repository

Now you’re ready to set up and run SLDS Linter in your project.

If you’re uplifting your SLDS 1 code to SLDS 2 and you’re working in a sandbox or scratch org, run an npm init first. If you’re working in production org code, you can skip this step.

  ```
    npm init
    npm install @salesforce-ux/slds-linter --save-dev
  ```
To include linting capabilities in your project, add these scripts in your package.json, or modify them.

  ```
  "scripts": {

   "lint:styles": "stylelint ./**/*.css --config=.stylelintrc.yml",
   "lint:components": "eslint **/*.{html,cmp} --ext .html,.cmp --config=.eslintrc.yml",
   "lint": "npm run lint:components; npm run lint:styles",
   "fix": "stylelint **/*.css -c .stylelintrc.yml --fix ",
   "report": "node node_modules/@salesforce-ux/stylelint-plugin-slds/build/report.js force-app/ -c .stylelintrc.yml",
   "setup-lint": "node ./node_modules/@salesforce-ux/slds-linter/build/setup.js"
  }
  ```

-	lint: Runs the Stylelint rules on your CSS files and outputs issues.
-	fix: Attempts to automatically fix violations.
-	report: Generates a SARIF report for static analysis.
-	setup-lint: This would configure .eslintrc.yml and .stylelintrc.yml


To match the directories that you validate in your project, update the file paths in the src//*.css directory.

4. Run `npm run setup-lint` to set up all the configuration files.
5. To run SLDS Linter, in Terminal, run `npm run report` to generate a Sarif report in the `reports` folder of your project root directory.
5. Open the generated Sarif file.
6. Make a note of how many components SLDS Linter has identified that you must update.
7. Run `npm run fix` to automatically fix validation errors in bulk.
