import stylelint, { Rule, PostcssResult } from 'stylelint';
import { Root } from 'postcss';
const ruleName = 'slds/no-lwc-custom-properties';
const { utils, createPlugin }: typeof stylelint = stylelint;

const messages = utils.ruleMessages(ruleName, {
  expected: (prop: string) =>
    `Unexpected "--lwc custom property" within selector "${prop}". Replace with "slds" or "dxp" equivalents. See https://github.com/salesforce-ux/stylelint-sds/blob/main/packages/stylelint-plugin-slds/src/rules/no-lwc-custom-properties/README.md`,
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
        if (decl.prop.startsWith('--lwc-')) {
          utils.report({
            message: messages.expected(decl.prop),
            node: decl,
            result,
            ruleName,
          });
        }
      });
    }
  };
}

export default createPlugin(ruleName, rule as unknown as Rule);
