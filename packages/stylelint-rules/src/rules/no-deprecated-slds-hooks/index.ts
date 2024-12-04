import stylelint, { PostcssResult } from 'stylelint';
import valueParser from 'postcss-value-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import AbstractStylelintRule from '../AbstractStylelintRule';
import { Root, Declaration } from 'postcss';

const ruleName = 'no-deprecated-slds-hooks';
const messages = stylelint.utils.ruleMessages(ruleName, {
  deprecated: (token: string) => `The hook "${token}" is deprecated and will not work in SLDS2. Please remove or replace it.`,
  replaced: (oldToken: string, newToken: string) => `Replace deprecated hook "${oldToken}" with "${newToken}"`,
});

// Read the deprecated tokens file
const tokenMappingPath = resolve(new URL('.', import.meta.url).pathname, './public/metadata/deprecatedHooks.json');
const deprecatedHooks = JSON.parse(readFileSync(tokenMappingPath, 'utf8'));

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
          const parsedPropertyValue = decl.prop;
          if(parsedPropertyValue.startsWith('--slds-c-'))
          {
            const proposedNewValue = deprecatedHooks[parsedPropertyValue];
            if (proposedNewValue && proposedNewValue !== 'null') {
                  const index = decl.toString().indexOf(decl.prop);
                  const endIndex = index + decl.prop.length;
                  stylelint.utils.report({
                    message: messages.replaced(parsedPropertyValue, proposedNewValue),
                    node: decl,
                    index,
                    endIndex,
                    result,
                    ruleName: this.getRuleName(),
                  });
                  
                  if (result.stylelint.config.fix) {
                    decl.prop = proposedNewValue;
                  }
                }
                // else {
                //   stylelint.utils.report({
                //     message: messages.deprecated(parsedPropertyValue),
                //     node: decl,
                //     result,
                //     ruleName: this.getRuleName(),
                //   });
                // }
          }
        });
      }
    };
  }
}

// Export the rule using createPlugin
export default new NoDeprecatedSldsHooksRule().createPlugin();