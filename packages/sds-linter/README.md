# SDS Linter

## Features

* Component Linting:
  The utility supports linting for two types of Salesforce Lightning components:

  * LWC and Aura components.
    LWC Components (.html): Linting is applied to Lightning Web Components.
  * Aura Components (.cmp): Linting is applied to Aura Components.

- Stylelint for CSS FilesStylelint rules are applied to .css files associated with the components. This ensures consistent styling practices are followed throughout the project.

## Installation

To install the SDS Linter Utility in your project, you can use npm:

```
npm install sds-linter --save-dev
```

### Usage

After installing the package, you need to add a few commands to your `package.json` to allow running the commands needed for linting.

You need to add the below in "scripts" item in `package.json`

```
"lint:styles": "stylelint ./**/*.css --config=.stylelintrc.yml",
"lint:components": "eslint ./**/*.{html,cmp} --ext .html,.cmp --config=.eslintrc.yml",
"lint": "npm run lint:components; npm run lint:styles",
"fix": "stylelint ./**/*.css -c .stylelintrc.yml --fix ",
"report": "node node_modules/@salesforce-ux/stylelint-sds/build/report.js force-app/ -c .stylelintrc.yml",
"setup-lint": "node ./node_modules/@salesforce-ux/sds-linter/build/setup.js"
```

once the above scripts are added. You can setup the configuration by running

```
npm run setup-lint
```

which will inturn create `.eslintrc.yml` & `.stylelintrc.yml` in the root folder.

NOTE: If the project root already containing `.eslintrc.yml` & `.stylelintrc.yml`, we don't overwrite those files and the use needs to merge those files manually. You can find the configuration files in this repostory in the root folder.

### Command-Line Interface (CLI)

* To lint all components and styles in your project:

  ```
  npx run lint
  ```
* To auto-fix some of the most confident fixes automatically.

  ```
  npx run fix
  ```
* To run a report in .sarif format

  ```
  npx run report
  ```

### Contribution

We welcome contributions to improve this utility. If you have any suggestions, bug reports, or want to contribute code, please open an issue or pull request.

### License

This project is licensed under the MIT License - see the LICENSE file for details.

For any questions or issues, feel free to reach out to the maintainers or open an issue in the repository.
