# Stylelint for SDS

This mono-repo is created to build stylelint rules for Salesforce design system. This repo contains to sub repos - `stylelint-rules` and `example-repository`

## How to start with this

- Clone this repository
- On the root folder, run the below commands
    ```
      npm run install-all
      npm run build-all
    ```
- The above commands would setup the packages to run the stylelint rules on `example-repository` .css files.

## stylelint-rules
This package contains all the rules we need for SDS.

## example-repository
This packages is used for testing all the rules added to `stylelint-rules` and `.stylelintrc.yml`