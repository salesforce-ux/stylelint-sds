import { Root } from 'postcss';
import stylelint, { Rule, RuleContext, PostcssResult } from 'stylelint';
import { Options } from './option.interface';

const { utils, createPlugin }: typeof stylelint = stylelint;
const ruleName: string = 'sf-sds/no-slds-private-var';

const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: (prop: string) =>
    `Unexpected "--_slds- private variable usage" within selector "${prop}".`,
});

function validateOptions(result: PostcssResult, options: Options) {
  return stylelint.utils.validateOptions(result, ruleName, {
    actual: options,
    possible: {}, // Customize as needed
  });
}

function rule(
  primaryOptions: Options,
  secondaryOptions: Options,
  context: RuleContext
) {
  return (root: Root, result: PostcssResult) => {
    if (validateOptions(result, primaryOptions)) {
      root.walkDecls((decl) => {
        if (decl.prop.startsWith('--_slds-')) {
          stylelint.utils.report({
            message: messages.expected(decl.prop),
            node: decl,
            result,
            ruleName,
          });

          // Optional: Call the fix method if in fixing context
          if (result.stylelint.config.fix) {
            fix(decl);
          }
        }
      });
    }
  };
}

// Implement the fix method
function fix(decl: any): void {
  // Modify the declaration as needed, e.g., remove the deprecated variable or correct it
  decl.prop = decl.prop.replace('--_slds-', '--slds-');
}

export default createPlugin(ruleName, rule as unknown as Rule);
