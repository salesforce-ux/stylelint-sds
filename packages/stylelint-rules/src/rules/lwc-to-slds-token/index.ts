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
          let proposedNewValue='';
          
          parsedValue.walk((node) => {
            if (node.type === 'word' && node.value.startsWith('--lwc-')) {
              const index = decl.toString().indexOf(decl.value);
              const endIndex = index + decl.value.length;
              const oldValue = node.value;
              const newValue = lwcToSLDS[node.value];
              
              //If it is already fixed - then don't flag again..
              if(JSON.stringify(parsedValue).indexOf(JSON.stringify(newValue)) > 0 || decl.value.indexOf(newValue) > 0)
                return;

              proposedNewValue = `var(${newValue}, ${decl.value})`

              if (node.value in lwcToSLDS && lwcToSLDS[node.value] !== "--") {
                node.value = newValue;
                
                stylelint.utils.report({
                  message: messages.replaced(decl.value, proposedNewValue),
                  node: decl,
                  result,
                  index,
                  endIndex,
                  ruleName: this.getRuleName()
                });
                if (result.stylelint.config.fix && proposedNewValue) {
                  decl.value = proposedNewValue;
                }
              } 
              else{
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
        });
      }
    };
  }
}

// Create and export the plugin
export default new LwcToSldsTokenRule().createPlugin();