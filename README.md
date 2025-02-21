# SLDS Linter

## Overview

SLDS Linter provides custom linting rules specifically built for Salesforce Lightning Design System 2 (SLDS 2 beta). SLDS Linter is designed to uplift your Cascading Style Sheet (CSS), Lightning Web Component (LWC), and Aura component files to SLDS 2 and to conform to SLDS best practices. SLDS Linter rules allow you to maintain consistent styling and identify common issues when working with Lightning components. 

## Features

* Component Linting:
  The utility supports linting for two types of Salesforce Lightning components:

  * LWC and Aura components.
    LWC Components (.html): Linting is applied to Lightning Web Components.
  * Aura Components (.cmp): Linting is applied to Aura Components.

- Stylelint for CSS Files:
  Stylelint rules are applied to .css files associated with the components. This ensures consistent styling practices are followed throughout the project.

Follow the below instructions to integrate SLDS Linter into your project.

---

### Set Up SLDS Linter in Your Component Repository

To install the SLDS Linter Utility in your project, you can use npm:

  ```
    npm install @salesforce-ux/slds-linter --save-dev
  ```

Copy the below scripts in to your `package.json`

  ```
    "lint:styles": "stylelint ./**/*.css --config=.stylelintrc.yml",
    "lint:components": "eslint **/*.{html,cmp} --ext .html,.cmp --config=.eslintrc.yml",
    "lint": "npm run lint:components & npm run lint:styles",
    "fix": "stylelint **/*.css -c .stylelintrc.yml --fix ",
    "report": "node node_modules/@salesforce-ux/stylelint-plugin-slds/build/report.js force-app/ -c .stylelintrc.yml",
    "setup-lint": "node ./node_modules/@salesforce-ux/slds-linter/build/setup.js"
  ```

Run the below command to setup your lint configurations

  ```
    npm run setup-lint
  ```

### Command-Line Interface (CLI)

To see what all options does slds-linter provide please run `npx @salesforce-ux/slds-linter --help` which gives the below output.

  ```
Usage:  npm run [command]

Commands:
  lint             Run both ESLint and Stylelint
  lint:styles      Run only Stylelint
  lint:components  Run only ESLint
  fix              Fix auto-fixable issues
  report           Generate a linting report                                             [boolean]
  ```

-	`npm run lint` -  Runs the ESlint and Stylelint rules on your HTML/CSS/CMP files and outputs issues.
-	`npm run lint:styles` - Runs the Stylelint rules on your CSS files and outputs issues.
-	`npm run lint:components` -  Runs the ESlint rules on your HTML/CMP files and outputs issues.
-	`npm run fix`: Attempts to automatically fix violations.
-	`npm run report`: Generates a SARIF report for static analysis.

For any questions or issues, feel free to reach out to the maintainers or open an issue in the repository.
