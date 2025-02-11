import { Root } from 'postcss';
import stylelint, { Rule, RuleContext, PostcssResult } from 'stylelint';
import { Options } from './option.interface';
import ruleMetadata from '../../utils/rulesMetadata';

const { utils, createPlugin }: typeof stylelint = stylelint;

const ruleName: string = 'slds/no-important-tag';

const { severityLevel = 'error', warningMsg = '', errorMsg = '', ruleDesc = 'No description provided' } = ruleMetadata(ruleName) || {};

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
    if (validateOptions(result, primaryOptions)) {
      root.walkDecls((decl) => {
        if (decl.important) {
          const index = decl.toString().indexOf('!important');
          const endIndex = index + '!important'.length;
          const severity =
            result.stylelint.config.rules[ruleName]?.[1] ||
            severityLevel; // Default to "error"

          utils.report({
            message: errorMsg,
            node: decl,
            index,
            endIndex,
            result,
            ruleName,
            severity,
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
