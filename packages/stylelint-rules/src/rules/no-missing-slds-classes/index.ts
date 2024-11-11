import stylelint, { PostcssResult } from "stylelint";
import { Root } from 'postcss';
import { readFileSync } from "fs";
import { resolve } from "path";
import AbstractStylelintRule from '../AbstractStylelintRule';

const ruleName = "no-missing-slds-classes";

const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: (prop: string) => `Selector: "${prop}" is no longer available in SLDS2`,
});

// Function to load JSON from file
function loadJsonFromFile(filePath: string) {
  const absolutePath = resolve(new URL('.', import.meta.url).pathname, filePath);
  const fileContent = readFileSync(absolutePath, 'utf8');
  return JSON.parse(fileContent);
}

// Load the JSON object from file
const myObject = loadJsonFromFile('./public/metadata/sldsPlus.metadata.json');

class NoMissingSldsClassesRule extends AbstractStylelintRule {
  constructor() {
    super(ruleName);
  }

  protected validateOptions(result: PostcssResult, options: any): boolean {
    return stylelint.utils.validateOptions(result, this.ruleName, {
      actual: options,
      possible: {}, // Customize as needed
    });
  }

  protected rule(primaryOptions?: any) {
    return (root: Root, result: PostcssResult) => {
      if (this.validateOptions(result, primaryOptions)) {
        root.walkRules((rule) => {
          if (myObject.bem.css.deprecated.selectors.some((str: string) => rule.selector.includes(str))) {
            stylelint.utils.report({
              message: messages.expected(rule.selector),
              node: rule,
              result,
              ruleName: this.getRuleName(),
            });
          }
        });
      }
    };
  }
}

// Export the rule using createPlugin
export default new NoMissingSldsClassesRule().createPlugin();