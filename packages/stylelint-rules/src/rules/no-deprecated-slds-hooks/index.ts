import stylelint, { PostcssResult } from 'stylelint';
import valueParser from 'postcss-value-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import AbstractStylelintRule from '../AbstractStylelintRule';
import { Root, Declaration } from 'postcss';

const ruleName = 'no-deprecated-slds-hooks';
const messages = stylelint.utils.ruleMessages(ruleName, {
  replaced: (oldToken: string, newToken: string) => `Replace deprecated hook "${oldToken}" with "${newToken}"`,
  deprecated: (token: string) => `The hook "${token}" is deprecated and will not work in SLDS+. Please remove or replace it.`,
});

// Read the deprecated tokens file
const tokenMappingPath = resolve(new URL('.', import.meta.url).pathname, './public/metadata/deprecatedHooks.json');
const deprecatedTokens = JSON.parse(readFileSync(tokenMappingPath, 'utf8'));

class NoDeprecatedSldsHooksRule extends AbstractStylelintRule {
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
        root.walkDecls((decl) => {
          const parsedValue = valueParser(decl.value);
          let valueChanged = false;

          parsedValue.walk((node) => {
            if (node.type === 'word' && node.value.startsWith('--slds-')) {
              const index = node.toString().indexOf(node.value); // Start index of the value
              const endIndex = index + node.value.length;

              if (node.value in deprecatedTokens) {
                if (deprecatedTokens[node.value] === null) {
                  stylelint.utils.report({
                    message: messages.deprecated(node.value),
                    node: decl,
                    index,
                    endIndex,
                    result,
                    ruleName: this.getRuleName(),
                  });
                } else {
                  const oldValue = node.value;
                  node.value = deprecatedTokens[node.value];
                  valueChanged = true;
                  stylelint.utils.report({
                    message: messages.replaced(oldValue, node.value),
                    node: decl,
                    index,
                    endIndex,
                    result,
                    ruleName: this.getRuleName(),
                  });
                }
              }
            }
          });

          if (valueChanged) {
            decl.value = parsedValue.toString();
          }
        });
      }
    };
  }
}

// Export the rule using createPlugin
export default new NoDeprecatedSldsHooksRule().createPlugin();