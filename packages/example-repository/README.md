# Why did we create this

In order to test SLDS validation, we need a sample test repo and this is an example repo for testing `stylelint-slds`

## What did we do

Install the required node modules by running


```
npm i
```

## How to configure new rules
Tweak `.stylelintrc.yml` as necessary

Note: As we haven't published the `stylelint-slds` to npm, we need to link that package locally. Follow [this secion](https://git.soma.salesforce.com/lnemalipuri/stylelint-slds#how-to-use-this-in-a-project)


## Report in .sarif

Use the below command

```
stylelint **/*.css --custom-formatter=node_modules/stylelint-sarif-formatter/index.js --output-file report.sarif
```