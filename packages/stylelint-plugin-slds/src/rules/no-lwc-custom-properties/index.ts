import { Root } from 'postcss';
import stylelint, { PostcssResult, Rule, RuleSeverity } from 'stylelint';
import ruleMetadata from '../../utils/rulesMetadata';
import replacePlaceholders from '../../utils/util';

const ruleName:string = 'slds/no-lwc-custom-properties';

const { severityLevel = 'error', warningMsg = '', errorMsg = '', ruleDesc = 'No description provided' } = ruleMetadata(ruleName) || {};
const { utils, createPlugin }: typeof stylelint = stylelint;

const messages = utils.ruleMessages(ruleName, {
  expected: (prop: string) =>
    replacePlaceholders(errorMsg,{prop}),
});


function rule(primaryOptions: boolean, {severity=severityLevel as RuleSeverity}) {
  return (root: Root, result: PostcssResult) => {
    root.walkDecls((decl) => {
    
      if (decl.prop.startsWith('--lwc-')) {
        utils.report({
          message: messages.expected(decl.prop),
          node: decl,
          result,
          ruleName,
          severity
        });
      }
    });
  };
}

export default createPlugin(ruleName, rule as unknown as Rule);
