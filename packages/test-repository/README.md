# Why did we create this

In order to test SLDS validation, we need a sample test repo and this is an example repo for testing `stylelint-slds`

## What did we do

Install the required node modules by running


```
npm i
```

## How to configure new rules
Tweak `.stylelintrc.yml` as necessary

## Report in .sarif

Use the below command

```
stylelint **/*.css --custom-formatter=node_modules/stylelint-sarif-formatter/index.js --output-file report.sarif
```