import { Root } from 'postcss';
import stylelint, { PostcssResult, Rule, RuleSeverity } from 'stylelint';
import ruleMetadata from '../../utils/rulesMetadata';

const { utils, createPlugin }: typeof stylelint = stylelint;

const ruleName: string = 'slds/no-important-tag';

const { severityLevel = 'error', warningMsg = '', errorMsg = '', ruleDesc = 'No description provided' } = ruleMetadata(ruleName) || {};


function rule(primaryOptions: boolean, {severity=severityLevel as RuleSeverity}) {
  return (root: Root, result: PostcssResult) => {
    root.walkDecls((decl) => {
      if (decl.important) {
        const index = decl.toString().indexOf('!important');
        const endIndex = index + '!important'.length;          

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
  };
}

// Implement the fix method
function fix(decl: any): void {
  decl.important = false;
}

export default createPlugin(ruleName, rule as unknown as Rule);
