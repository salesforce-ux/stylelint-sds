# Stylelint for SDS

The SLDS Linter plug-in is a customizable linting tool specifically built for Salesforce Lightning Design System (SLDS) 2. SLDS Linter was built on top of ESLint and StyleLint, two widely used linters in modern front-end development. Use SLDS Linter to automatically find potential style problems and wrong patterns in your design code.

## How to get started with this

- Clone this repository
- On the root folder, run the below commands
  ```
    npm run install-all
    npm run build
  ```
- The above commands would setup the packages to run the stylelint rules on `test-repository` .css files.

## stylelint-plugin-slds

This package contains all the rules we need for SDS.

## test-repository

This packages is used for testing all the rules added to `stylelint-plugin-slds` and `.stylelintrc.yml`

## Other useful commands

### Generate .sarif report

To generate a .sarif report of validation issues, use the below commands

```
npm run report
```

The above command runs on predefined stylelintrc.yml and lint *.css available in test-repository.

### Auto fix validation errors.

You can auto fix all the errors at once in a given css file or all the css files using the below command

```
npm run fix
```
