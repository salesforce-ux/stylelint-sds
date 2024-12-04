import stylelint, { PostcssResult } from 'stylelint';
import valueParser from 'postcss-value-parser';
import { readFileSync } from 'fs';
import { Root } from 'postcss';
import { resolve } from 'path';
import AbstractStylelintRule from '../AbstractStylelintRule';

const ruleName = 'no-aura-tokens';

const messages = stylelint.utils.ruleMessages(ruleName, {
  deprecated: 'Aura tokens are deprecated. Please migrate to SLDS Design Tokens.',
  replaced: (oldValue: string, newValue: string) => `The '${oldValue}' design token is deprecated. To avoid breaking changes, we recommend that you replace it with the '${newValue}' styling hook even though it has noticeable changes. Set the fallback to '${oldValue}'. See the New Global Styling Hooks Guidance on lightningdesignsystem.com for more info. \n
  Old Value: ${oldValue} 
  New Value: ${newValue} \n
  `,
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
                //If it is already fixed - then don't flag again..
                if(JSON.stringify(parsedValue).indexOf(newValue) > 0)
                  return;
                
                if (typeof newValue === 'string' && newValue.startsWith('--lwc-')) {
                  const replacementStyle = `var(${newValue}, ${decl.value})`
                  stylelint.utils.report({
                    message: messages.replaced(decl.value, replacementStyle),
                    node: decl,
                    index,
                    endIndex,
                    result,
                    ruleName: this.getRuleName(),
                  });

                  if (result.stylelint.config.fix && replacementStyle) {
                    decl.value = replacementStyle;
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
              // else {
              //   stylelint.utils.report({
              //     message: messages.deprecated,
              //     node: decl,
              //     index,
              //     endIndex,
              //     result,
              //     ruleName: this.getRuleName(),
              //   });
              // }
            }
          });
        });
      }
    };
  }
}

// Create and export the plugin
export default new NoAuraTokensRule().createPlugin();