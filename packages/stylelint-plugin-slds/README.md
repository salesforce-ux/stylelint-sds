# Stylelint for SLDS

## Overview

This repository provides custom **Stylelint rules** designed to ensure adherence to **Salesforce Lightning Design System (SLDS)** styling conventions. These rules help developers maintain consistent styling and identify common issues when working with SLDS components. Follow the instructions below to integrate these rules into your project.

---

## Setup Instructions for Your Components Repository

### 1. Install Dependencies

Install the custom Stylelint package for SLDS:

```bash
npm install @salesforce-ux/stylelint-sds --save-dev
```

2. Configure Stylelint

Create a .stylelintrc.yml file in your project root to enable the Stylelint rules. Use the example configuration provided in this repository as a reference.

Example content for (.stylelintrc.yml)[./stylelintrc.yml]:



This configuration will enforce SLDS rules and show errors or warnings for any violations.

3. Update Project Commands

Add or modify the following commands in your package.json to include linting capabilities:

```
  "scripts": {
    "lint": "stylelint 'src/**/*.css' --config=.stylelintrc.yml",
    "fix": "stylelint 'src/**/*.css' --fix",
    "report": "stylelint 'src/**/*.css' --custom-formatter=node_modules/stylelint-sarif-formatter/index.js --output-file report.sarif"
  }
```

    •	lint: Runs the Stylelint rules on your CSS files and outputs issues.
	•	fix: Attempts to automatically fix violations.
	•	report: Generates a SARIF report for static analysis.

Update the file paths in these commands (src/**/*.css) to match the directories you want to validate in your project.
