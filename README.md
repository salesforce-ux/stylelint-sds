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

### Command-Line Interface (CLI)

To see what all options does slds-linter provide please run `slds-linter --help` which gives the below output.

  ```
  slds-linter [command]

Commands:
  slds-linter lint             Run both ESLint and Stylelint
  slds-linter lint:styles      Run only Stylelint
  slds-linter lint:components  Run only ESLint
  slds-linter fix              Fix auto-fixable issues
  slds-linter report           Generate a linting report

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
  ```

-	slds-linter lint -  Runs the ESlint and Stylelint rules on your HTML/CSS/CMP files and outputs issues.
-	slds-linter lint:styles - Runs the Stylelint rules on your CSS files and outputs issues.
-	slds-linter lint:components -  Runs the ESlint rules on your HTML/CMP files and outputs issues.
-	slds-linter fix: Attempts to automatically fix violations.
-	slds-linter report: Generates a SARIF report for static analysis.


1. Run `slds-linter lint` to see the lint output on terminal. For specific files, you can go ahead with either `slds-linter lint:styles` for lint errors within css files or `slds-linter lint:components` for lint errors within html/cmp files.
2. To run SLDS Linter, in Terminal, run `slds-linter report` to generate a Sarif report in the project root directory. It will be named as `slds-linter-report.sarif`
3. Open the generated Sarif file.
4. Make a note of how many components SLDS Linter has identified that you must update.
5. Run `slds-linter fix` to automatically fix validation errors in bulk.

For any questions or issues, feel free to reach out to the maintainers or open an issue in the repository.
