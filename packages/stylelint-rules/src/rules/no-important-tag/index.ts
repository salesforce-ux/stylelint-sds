import { Root } from 'postcss';
import stylelint, { Rule, RuleContext, PostcssResult } from 'stylelint';
import AbstractStylelintRule from '../AbstractStylelintRule';
import { Options } from './option.interface';

const { utils, createPlugin } : typeof stylelint = stylelint;
const ruleName : string = 'sf-sds/no-important-tag';

function validateOptions(result : PostcssResult, options : Options)
{
  return stylelint.utils.validateOptions(result, ruleName, {
    actual: options,
    possible: {}, // Customize as needed
  });
}

function rule(primaryOptions : Options, secondaryOptions : Options, context : RuleContext)
{
  return (root: Root, result: PostcssResult) => {
    //if (this.validateOptions(result, primaryOptions)) 
    {
      root.walkDecls(decl => {
        if (decl.important) {
          const index = decl.toString().indexOf('!important');
          const endIndex = index + '!important'.length;

          stylelint.utils.report({
            message: "Avoid using '!important' unless absolutely necessary.",
            node: decl,
            index,
            endIndex,
            result,
            ruleName,
          });

          // Call the fix method if in fixing context
          if (result.stylelint.config.fix) {
            this.fix(decl);
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