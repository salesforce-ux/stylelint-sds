import { Root, Declaration } from 'postcss';
import stylelint, { PostcssResult } from 'stylelint';
import AbstractStylelintRule from '../AbstractStylelintRule';

const ruleName = 'do-not-use-calc-function'
class DoNotUseCalcFunction extends AbstractStylelintRule {
  constructor() {
    super(ruleName);
  }

  protected validateOptions(result: PostcssResult, options: any): boolean {
    return stylelint.utils.validateOptions(result, this.ruleName, {
      actual: options,
      possible: {}, 
    });
  }

  protected rule(primaryOptions?: any) {
    return (root: Root, result: PostcssResult) => {
      if (this.validateOptions(result, primaryOptions)) {
        root.walkDecls((decl: Declaration) => {
          if (decl.value.includes('calc(')) {
            const index = decl.toString().indexOf('calc(');
            const endIndex = index + 'calc('.length;

            stylelint.utils.report({
              message: `The use of "calc()" in "${decl.prop}" is not allowed.`,
              node: decl,
              index,
              endIndex,
              result,
              ruleName: this.getRuleName(),
            });

            // Call the fix method if in fixing context
            if (result.stylelint.config.fix) {
              this.fix(decl);
            }
          }
        });
      }
    };
  }

  // Implement the fix method
  protected fix(decl: Declaration): void {
    // Example fix: Remove the calc function (this is just a placeholder)
    decl.value = decl.value.replace(/calc\([^)]+\)/g, ''); // Remove calc() usage
  }
}

// Export the rule using createPlugin
export default new DoNotUseCalcFunction().createPlugin();