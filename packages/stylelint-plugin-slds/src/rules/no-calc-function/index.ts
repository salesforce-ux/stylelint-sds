import { Root } from 'postcss';
import stylelint, { PostcssResult, Rule, RuleSeverity } from 'stylelint';
import ruleMetadata from '../../utils/rulesMetadata';
import replacePlaceholders from '../../utils/util';

const { utils, createPlugin }: typeof stylelint = stylelint;

const ruleName:string = 'slds/do-not-use-calc-function';


const { severityLevel = 'error', warningMsg = '', errorMsg = '', ruleDesc = 'No description provided' } = ruleMetadata(ruleName) || {};

const messages = utils.ruleMessages(ruleName, {
  disallowed: (property: string) =>
    replacePlaceholders(errorMsg,{property}),
});

function rule(primaryOptions: boolean, {severity = severityLevel as RuleSeverity}={}) {
  return (root: Root, result: PostcssResult) => {
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
          severity
        });

        // If fixing is enabled
        // if (context.fix) {
        //   decl.value = decl.value.replace(/calc\([^)]+\)/g, ''); // Example fix: removes calc()
        // }
      }
    });
  };
}

// Export the plugin
export default createPlugin(ruleName, rule as unknown as Rule);
