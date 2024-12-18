# Stylelint for SLDS

## Overview

This repository provides custom **Stylelint rules** specifically for ensuring adherence to **Salesforce Lightning Design System (SLDS)** styling conventions. These rules help developers maintain consistent styling and avoid common issues while working with SLDS components. Follow the setup instructions below to integrate these rules into your project or contribute to the repository.

---

## Setup Instructions for this repository

### 1. Clone the Repository
Start by cloning the repository to your local machine:
```bash
git clone git@github.com:salesforce-ux/stylelint-sds.git
cd stylelint-sds
```

### 2. Install Dependencies

Run the following command to install the required packages:
```
npm install
```

### 3. Build the Rules

Compile the rules into a single file by executing:
```
npm run build
```

After building, you should see a new `build` directory containing the necessary files, including:
	•	package.json
	•	index.js
	•	README.md

### Linking the Repository for local development

Since this package is not yet available via npm, you can link it locally for testing purposes:
	1.	Navigate to the build directory:

```
cd build
npm link
```

	2.	This command prepares the package for local linking to other projects.

## Usage in any repository


1. Install Additional Dependencies

Install the required dependencies for Stylelint:

```
npm install stylelint postcss-html @salesforce-ux/stylelint-sds --save-dev
```

2. Configure Stylelint

Create a .stylelintrc.yml file in your project directory with the following configuration:

```
plugins:
  - @salesforce-ux/stylelint-sds

overrides:
  - files:
      - "**/*.css"
    customSyntax: postcss
    rules:
      slds-css/no-slds-class-overrides:
        - true
        - severity: warning
      slds-css/no-important:
        - true
        - severity: warning
      slds-css/no-hardcoded-values:
        - true
        - severity: error
      slds-css/no-aura-tokens:
        - true
      slds-css/lwc-to-slds-token:
        - true
      slds-css/enforce-bem-usage:
        - true
      slds-css/no-deprecated-slds-classes:
        - true
      slds-css/no-deprecated-slds-hooks:
        - true
      slds-css/no-lwc-custom-properties:
        - true
      slds-css/no-sds-custom-properties:
        - true
      slds-css/no-slds-private-var:
        - true

  - files:
      - "**/*.html"
    customSyntax: "postcss-html"
    rules: {}

report: true
```

### Generating SARIF Reports

To generate a SARIF (Static Analysis Results Interchange Format) report, use the following command:

```
stylelint **/*.css --custom-formatter=node_modules/stylelint-sarif-formatter/index.js --output-file report.sarif
```

#### Running Stylelint on a Specific Repository

You can lint a specific directory or repository with the following command:

stylelint "path/to/directory/**/*.css" --config path/to/.stylelintrc.yml --custom-formatter=node_modules/stylelint-sarif-formatter/index.js --output-file report.sarif

By following these steps, you can ensure that your SLDS components adhere to best practices and stay consistent with Salesforce design guidelines. Happy linting!

