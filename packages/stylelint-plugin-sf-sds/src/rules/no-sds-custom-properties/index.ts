import stylelint, { Rule, PostcssResult } from 'stylelint';
import { Root } from 'postcss';
const { utils, createPlugin }: typeof stylelint = stylelint;

const ruleName = 'sf-sds/no-sds-custom-properties';

const messages = utils.ruleMessages(ruleName, {
  expected: (prop: string) =>
    `'${prop}' is currently deprecated in the new design for Lightning UI.`,
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
        if (decl.prop.startsWith('--sds-')) {
          utils.report({
            message: messages.expected(decl.prop),
            node: decl,
            result,
            ruleName
          });
        }
      });
    }
  };
}

export default createPlugin(ruleName, rule as unknown as Rule);
