import stylelint, { PostcssResult } from 'stylelint';
import valueParser from 'postcss-value-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Root } from 'postcss';
import AbstractStylelintRule from '../AbstractStylelintRule';

const ruleName = 'lwc-to-slds-token';

const messages = stylelint.utils.ruleMessages(ruleName, {
  replaced: (oldValue: string, newValue: string) => `The '${oldValue}' design token is deprecated. To avoid breaking changes, we recommend that you replace it with the '${newValue}' styling hook even though it has noticeable changes. Set the fallback to '${oldValue}'. See the New Global Styling Hook Guidance on lightningdesignsystem.com for more info. \n
  Old Value: ${oldValue} 
  New Value: ${newValue} \n
  `,
  warning: (oldValue: string) => `The '${oldValue}' is currently deprecated.`,
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
              const oldValue = node.value;
              if (node.value in lwcToSLDS && lwcToSLDS[node.value] !== "--") {
                const newValue = lwcToSLDS[node.value];
                const proposedNewValue = `var(${newValue}, ${decl.value})`
                node.value = newValue;
                valueChanged = true;

                stylelint.utils.report({
                  message: messages.replaced(decl.value, proposedNewValue),
                  node: decl,
                  result,
                  index,
                  endIndex,
                  ruleName: this.getRuleName(),
                });
              } else {
                stylelint.utils.report({
                  message: messages.warning(decl.value),
                  node: decl,
                  index,
                  endIndex,
                  result,
                  ruleName: this.getRuleName(),
                });
              }
            }
          });

          // if (valueChanged) {
          //   decl.value = parsedValue.toString();
          // }
        });
      }
    };
  }
}

// Create and export the plugin
export default new LwcToSldsTokenRule().createPlugin();