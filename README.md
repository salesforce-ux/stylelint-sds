# Stylelint for SDS

This mono-repo is created to build stylelint rules for Salesforce design system. This repo contains to sub repos - `stylelint-rules` and `example-repository`

## How to get started with this

- Clone this repository
- On the root folder, run the below commands
    ```
      npm run install-all
      npm run build
    ```
- The above commands would setup the packages to run the stylelint rules on `example-repository` .css files.

## stylelint-rules
This package contains all the rules we need for SDS.

## example-repository
This packages is used for testing all the rules added to `stylelint-rules` and `.stylelintrc.yml`

## Other useful commands

### Generate .sarif report
To generate a .sarif report of validation issues, use the below commands

```
npm run report
```
The above command runs on predefined stylelintrc.yml and lint *.css available in example-repository.

If you want to run with specific configuration, you can use the below command

```
  npm run report_custom -c <path to your stylelint config> -d <path to the directory of css files>
```

### Auto fix validation errors.

You can auto fix all the errors at once in a given css file or all the css files using the below command

```
npm run fix
```