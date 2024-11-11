import stylelint, { PostcssResult } from 'stylelint';
import valueParser from 'postcss-value-parser';
import { readFileSync } from 'fs';
import { Root } from 'postcss';
import { resolve } from 'path';
import AbstractStylelintRule from '../AbstractStylelintRule';

const ruleName = 'no-aura-tokens';

const messages = stylelint.utils.ruleMessages(ruleName, {
  deprecated: 'Aura tokens are deprecated. Please migrate to SLDS Design Tokens.',
  replaced: (oldValue: string, newValue: string) => `Replace '${oldValue}' with '${newValue}'`,
});

// Read the token mapping file
const tokenMappingPath = resolve(new URL('.', import.meta.url).pathname, './public/metadata/tokenMapping.json');
const tokenMapping = JSON.parse(readFileSync(tokenMappingPath, 'utf8'));

class NoAuraTokensRule extends AbstractStylelintRule {
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

          parsedValue.walk((node) => {
            if (node.type === 'function' && (node.value === 'token' || node.value === 't')) {
              const tokenName = node.nodes[0].value;

              const index = decl.toString().indexOf(decl.value); // Start index of the value
              const endIndex = index + decl.value.length;

              if (tokenName in tokenMapping) {
                const newValue = tokenMapping[tokenName];
                if (typeof newValue === 'string' && newValue.startsWith('--lwc-')) {
                  stylelint.utils.report({
                    message: messages.replaced(decl.value, newValue),
                    node: decl,
                    index,
                    endIndex,
                    result,
                    ruleName: this.getRuleName(),
                  });
                } else {
                  stylelint.utils.report({
                    message: messages.deprecated,
                    node: decl,
                    index,
                    endIndex,
                    result,
                    ruleName: this.getRuleName(),
                  });
                }
              } else {
                stylelint.utils.report({
                  message: messages.deprecated,
                  node: decl,
                  index,
                  endIndex,
                  result,
                  ruleName: this.getRuleName(),
                });
              }
            }
          });
        });
      }
    };
  }
}

// Create and export the plugin
export default new NoAuraTokensRule().createPlugin();