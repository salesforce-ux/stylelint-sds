import { Root } from 'postcss';
import stylelint, { Rule, RuleContext, PostcssResult } from 'stylelint';

const { utils, createPlugin }: typeof stylelint = stylelint;
const ruleName: string = 'slds/do-not-use-calc-function';

const messages = utils.ruleMessages(ruleName, {
  disallowed: (property: string) =>
    `The use of "calc()" in the property "${property}" is not allowed.`,
});

function validateOptions(result: PostcssResult, options: any) {
  return utils.validateOptions(result, ruleName, {
    actual: options,
    possible: {}, // Extend as needed
  });
}

function rule(
  primaryOptions: any,
  secondaryOptions: any,
  context: RuleContext
) {
  return (root: Root, result: PostcssResult) => {
    if (validateOptions(result, primaryOptions)) {
      root.walkDecls((decl) => {
        if (decl.value.includes('calc(')) {
          const index = decl.toString().indexOf('calc(');
          const endIndex = index + 'calc('.length;

          utils.report({
            message: messages.disallowed(decl.prop),
            node: decl,
            index,
            endIndex,
            result,
            ruleName,
          });

          // If fixing is enabled
          // if (context.fix) {
          //   decl.value = decl.value.replace(/calc\([^)]+\)/g, ''); // Example fix: removes calc()
          // }
        }
      });
    }
  };
}

// Export the plugin
export default createPlugin(ruleName, rule as unknown as Rule);
