import { Root } from 'postcss';
import stylelint, { Rule, RuleContext, PostcssResult } from 'stylelint';
import { Options } from './option.interface'
import ruleMetadata from '../../utils/rulesMetadata';

const { utils, createPlugin }: typeof stylelint = stylelint;

const ruleName: string = 'slds/reduce-annotations';

// Metadata for the rule
const { severityLevel = 'warning', warningMsg = '', errorMsg = '', ruleDesc = 'This rule checks for temporary validation annotations like @sldsValidatorAllow and @sldsValidatorIgnore.' } = ruleMetadata(ruleName) || {};

// List of annotations to check
const annotationList = [
  "@sldsValidatorAllow",
  "@sldsValidatorIgnore"
];

// Function to validate options
function validateOptions(result: PostcssResult, options: Options) {
  return utils.validateOptions(result, ruleName, {
    actual: options,
    possible: {}, // Customize as needed
  });
}

// Main rule function
function rule(
  primaryOptions: Options,
  secondaryOptions: Options,
  context: RuleContext
) {
  return (root: Root, result: PostcssResult) => {
    if (validateOptions(result, primaryOptions)) {
      root.walkComments((comment) => {
        const commentText = comment.text.trim();

        // Check for any annotation in the annotation list
        annotationList.forEach(annotation => {
          if (commentText.includes(annotation)) {
            const severity =
              result.stylelint.config.rules[ruleName]?.[1] ||
              severityLevel; // Default to "warning"

            utils.report({
              message: `Avoid using '${annotation}'. This is a temporary bypass and should be removed in the future.`,
              node: comment,
              result,
              ruleName,
              severity,
            });

            // Optionally fix by removing the annotation (if desired)
            if (result.stylelint.config.fix) {
              fix(comment);
            }
          }
        });
      });
    }
  };
}

// Implement the fix method (optional)
function fix(comment: any): void {
  comment.remove(); // Auto-remove the annotation comment
}

export default createPlugin(ruleName, rule as unknown as Rule);