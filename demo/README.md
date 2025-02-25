# Demo SLDS Linter


### Setep 1 

Basic setup and install dependencies

```
yarn install
yarn build
```

### Step 2

Link `slds-linter` package to global

```
> cd packages/slds-linter/
> npm link

```

### Step 3

Navigate back to `demo` folder

```
> cd slylelint-sds/demo
```

### Step 4
Execute linter command

```
> slds-linter --help

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


