# Stylelint for SLDS

## Overview

This repository provides custom **Stylelint rules** designed to ensure adherence to **Salesforce Lightning Design System (SLDS)** styling conventions. These rules help developers maintain consistent styling and identify common issues when working with SLDS components. Follow the instructions below to integrate these rules into your project.

---

## Setup Instructions for Your Components Repository

### 1. Install Dependencies
Install the custom Stylelint package for SLDS:
```bash
npm install @salesforce-ux/stylelint-sds
```

2. Configure Stylelint

Create a .stylelintrc.yml file in your project root to enable the Stylelint rules. Use the example configuration provided in this repository as a reference.

Example content for .stylelintrc.yml:

```
plugins:
  - @salesforce-ux/stylelint-sds

rules:
  slds-css/no-slds-class-overrides: [true, { severity: "warning" }]
  slds-css/no-important: [true, { severity: "warning" }]
  slds-css/no-hardcoded-values: [true, { severity: "error" }]
  slds-css/no-aura-tokens: true
  slds-css/lwc-to-slds-token: true
  slds-css/no-deprecated-slds-classes: true
  slds-css/enforce-bem-usage: true
```

This configuration will enforce SLDS rules and show errors or warnings for any violations.

3. Update Project Commands

Add or modify the following commands in your package.json to include linting capabilities:

```
  "scripts": {
    "lint": "stylelint 'src/**/*.css'",
    "fix": "stylelint 'src/**/*.css' --fix",
    "report": "stylelint 'src/**/*.css' --custom-formatter=node_modules/stylelint-sarif-formatter/index.js --output-file report.sarif"
  }
```

	•	lint: Runs the Stylelint rules on your CSS files and outputs issues.
	•	fix: Attempts to automatically fix violations.
	•	report: Generates a SARIF report for static analysis.

Update the file paths in these commands (src/**/*.css) to match the directories you want to validate in your project.

