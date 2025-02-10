import { Root } from 'postcss';
import stylelint, { Rule, RuleContext, PostcssResult } from 'stylelint';
import { Options } from './option.interface';

const { utils, createPlugin }: typeof stylelint = stylelint;
const ruleName: string = 'slds/no-important-tag';

function validateOptions(result: PostcssResult, options: Options) {
  return utils.validateOptions(result, ruleName, {
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
    if (validateOptions(result, primaryOptions))
    {
      root.walkDecls((decl) => {
        if (decl.important) {
          const index = decl.toString().indexOf('!important');
          const endIndex = index + '!important'.length;

          utils.report({
            message: "Avoid using '!important' unless absolutely necessary.",
            node: decl,
            index,
            endIndex,
            result,
            ruleName,
          });

          // Call the fix method if in fixing context
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
  decl.important = false;
}

export default createPlugin(ruleName, rule as unknown as Rule);
