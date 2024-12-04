import stylelint, { PostcssResult } from 'stylelint';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import AbstractStylelintRule from '../AbstractStylelintRule';
import { Root, Declaration } from 'postcss';

const ruleName = 'no-deprecated-slds-classes';
const messages = stylelint.utils.ruleMessages(ruleName, {
  deprecated: (className: string) => `The class "${className}" is deprecated and not available in SLDS2. Please update to a supported class.`,
});

// Read the deprecated classes file
const tokenMappingPath = resolve(new URL('.', import.meta.url).pathname, './public/metadata/deprecatedClasses.json');
const deprecatedClasses = new Set(JSON.parse(readFileSync(tokenMappingPath, 'utf8')));

// Regex to match classes
const classRegex = /\.[\w-]+/g;

class NoDeprecatedSldsClassesRule extends AbstractStylelintRule {
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
          const classMatches = rule.selector.match(classRegex);
          if (classMatches) {
            classMatches.forEach((match) => {
              const className = match.slice(1);
              if (deprecatedClasses.has(className)) {
                stylelint.utils.report({
                  message: messages.deprecated(className),
                  node: rule,
                  result,
                  ruleName: this.getRuleName(),
                });
              }
            });
          }
        });
      }
    };
  }
}

// Create and export the plugin
export default new NoDeprecatedSldsClassesRule().createPlugin();