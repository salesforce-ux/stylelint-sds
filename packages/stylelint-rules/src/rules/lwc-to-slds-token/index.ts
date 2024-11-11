import stylelint, { PostcssResult } from 'stylelint';
import valueParser from 'postcss-value-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Root } from 'postcss';
import AbstractStylelintRule from '../AbstractStylelintRule';

const ruleName = 'lwc-to-slds-token';

const messages = stylelint.utils.ruleMessages(ruleName, {
  replaced: (oldValue: string, newValue: string) => `Replace '${oldValue}' with '${newValue}'`,
  warning: 'This LWC token may not function in SLDS+. Consider updating to an SLDS token.',
});

// Read the LWC to SLDS mapping file
const tokenMappingPath = resolve(new URL('.', import.meta.url).pathname, './public/metadata/lwcToSlds.json');
const lwcToSLDS = JSON.parse(readFileSync(tokenMappingPath, 'utf8'));

class LwcToSldsTokenRule extends AbstractStylelintRule {
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
            if (node.type === 'word' && node.value.startsWith('--lwc-')) {
              const index = decl.toString().indexOf(decl.value); // Start index of the value
              const endIndex = index + decl.value.length;

              if (node.value in lwcToSLDS && lwcToSLDS[node.value].startsWith('--slds-')) {
                const newValue = lwcToSLDS[node.value];
                const oldValue = node.value;
                node.value = newValue;
                valueChanged = true;

                stylelint.utils.report({
                  message: messages.replaced(oldValue, newValue),
                  node: decl,
                  result,
                  index,
                  endIndex,
                  ruleName: this.getRuleName(),
                });
              } else {
                stylelint.utils.report({
                  message: messages.warning,
                  node: decl,
                  index,
                  endIndex,
                  result,
                  ruleName: this.getRuleName(),
                });
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

// Create and export the plugin
export default new LwcToSldsTokenRule().createPlugin();