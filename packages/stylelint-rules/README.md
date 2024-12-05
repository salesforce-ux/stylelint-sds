# Stylelint for SLDS

## Overview
This repository provides custom Stylelint rules for Salesforce Lightning Design System (SLDS) styling. Follow the setup instructions to contribute or integrate these rules into your project.

## Setup Instructions
To contribute to this repository, please follow these steps:

1. **Clone the Repository**
   ```bash
   git clone git@github.com:salesforce-ux/stylelint-sds.git
   cd stylelint-sds

2. **Install Dependencies**
Run the following command to install the necessary packages:
```
npm install
```

3. **Build the Rules**
To compile the rules into a single file, execute:
```
npm run build
```

After this step, you should see a new build directory containing all required files, including package.json, index.js, and README.js.

## Linking the Repository
Since this package is not yet distributed via npm, you can link it locally for testing purposes:

1.	Change to the build directory:
```
cd build
npm link
```
This command prepares your local npm package for linking to other projects.


## Usage in a Project

After linking the package, you can use it in your project:

1.	Link the package in your project directory:
  ```
  npm link @salesforce-ux/stylelint-sds
  ```
2.	Verify the link by checking the node_modules directory.
3.	Install the required dependencies:
```
npm install stylelint postcss-html --save-dev
```

4.	Create a Stylelint configuration file named .stylelintrc.yml. Below is an example configuration:
Here is an example 
```
plugins:
  - @salesforce-ux/sf-sds-linter

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
      # slds-css/enforce-use-of-utility-classes:
      #   - true
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
      # Apply this custom syntax only to HTML files
      - "**/*.html"  
    # Parse HTML files to extract CSS
    customSyntax: "postcss-html"  
    # You can define specific rules for HTML files, or leave it empty to ignore
    rules: {}  

report: true
```


## Generating SARIF Reports

Use the below command

```
stylelint **/*.css --custom-formatter=node_modules/stylelint-sarif-formatter/index.js --output-file report.sarif
```

## Running Stylelint on a Specific Repository

```
stylelint "path/to/directory/**/*.css" --config path/to/.stylelintrc.json --custom-formatter=node_modules/stylelint-sarif-formatter/index.js --output-file report.sarif
```










