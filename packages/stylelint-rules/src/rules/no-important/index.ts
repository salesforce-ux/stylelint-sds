import { Root } from 'postcss';
import stylelint, { PostcssResult } from 'stylelint';
import AbstractStylelintRule from '../AbstractStylelintRule';

class NoImportantRule extends AbstractStylelintRule {
  constructor() {
    super('no-important');
  }

  protected validateOptions(result: PostcssResult, options: any): boolean {
    return stylelint.utils.validateOptions(result, this.ruleName, {
      actual: options,
      possible: {}, // Customize as needed
    });
  }

  protected rule(primaryOptions?: any) {
    return (root: Root, result: PostcssResult) => {
      if (this.validateOptions(result, primaryOptions)) {
        root.walkDecls(decl => {
          if (decl.important) {
            const index = decl.toString().indexOf('!important');
            const endIndex = index + '!important'.length;

            stylelint.utils.report({
              message: "Avoid using '!important' unless absolutely necessary.",
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
  protected fix(decl: any): void {
    decl.important = false; 
  }
  
}


// Export the rule using createPlugin
export default new NoImportantRule().createPlugin();