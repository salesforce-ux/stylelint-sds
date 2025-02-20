import { Root } from 'postcss';
import stylelint, { PostcssResult, Rule, RuleSeverity } from 'stylelint';
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


// Main rule function
function rule(primaryOptions: boolean, {severity=severityLevel as RuleSeverity}) {
  return (root: Root, result: PostcssResult) => {
    root.walkComments((comment) => {
      const commentText = comment.text.trim();

      // Check for any annotation in the annotation list
      annotationList.forEach(annotation => {
        if (commentText.includes(annotation)) {        
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
  };
}

// Implement the fix method (optional)
function fix(comment: any): void {
  comment.remove(); // Auto-remove the annotation comment
}

export default createPlugin(ruleName, rule as unknown as Rule);