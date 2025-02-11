import stylelint, { Rule, PostcssResult } from 'stylelint';
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

function validateOptions(result: PostcssResult, options: any): boolean {
  return utils.validateOptions(result, ruleName, {
    actual: options,
    possible: {}, // Customize as needed
  });
}

function rule(primaryOptions?: any) {
  return (root: Root, result: PostcssResult) => {
    if (validateOptions(result, primaryOptions)) {
      root.walkDecls((decl) => {
        const severity =
                      result.stylelint.config.rules[ruleName]?.[1] || severityLevel; // Default to "error"
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
    }
  };
}

export default createPlugin(ruleName, rule as unknown as Rule);
