import stylelint, { Rule, PostcssResult, RuleSeverity } from 'stylelint';
import { Root } from 'postcss';
import replacePlaceholders from '../../utils/util';
import ruleMetadata from '../../utils/rulesMetadata';
const { utils, createPlugin }: typeof stylelint = stylelint;

const ruleName:string = 'slds/no-sds-custom-properties';

const { severityLevel = 'error', warningMsg = '', errorMsg = '', ruleDesc = 'No description provided' } = ruleMetadata(ruleName) || {};

const messages = utils.ruleMessages(ruleName, {
  expected: (prop: string) =>
    replacePlaceholders(errorMsg,{prop}),
});


function rule(primaryOptions: boolean, {severity = severityLevel as RuleSeverity}={}) {
  return (root: Root, result: PostcssResult) => {
    root.walkDecls((decl) => {
      
      if (decl.prop.startsWith('--sds-')) {
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
