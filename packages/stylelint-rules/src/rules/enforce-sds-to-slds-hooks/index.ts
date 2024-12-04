import { Root } from 'postcss';
import stylelint, { PostcssResult } from 'stylelint';
import AbstractStylelintRule from '../AbstractStylelintRule';

class SDSMappingRule extends AbstractStylelintRule {
  constructor() {
    super('enforce-sds-to-slds-hooks');
  }

  protected validateOptions(result: PostcssResult, options: any): boolean {
    return stylelint.utils.validateOptions(result, this.ruleName, {
      actual: options,
      possible: {}, // Customize if additional options are added
    });
  }

  protected rule(primaryOptions?: any) {
    return (root: Root, result: PostcssResult) => {
      if (this.validateOptions(result, primaryOptions)) {
        const sdsVarPattern = /var\(--sds-[^)]+\)/g;

        root.walkDecls(decl => {
          const matches = decl.value.matchAll(sdsVarPattern);

          for (const match of matches) {
            const [fullMatch] = match;
            const startIndex = decl.toString().indexOf(fullMatch);
            const endIndex = startIndex + fullMatch.length;

            stylelint.utils.report({
              message: `The "${fullMatch}" styling hook is replaced by "${fullMatch.replace('--sds-', '--slds-')}".`,
              node: decl,
              index: startIndex,
              endIndex,
              result,
              ruleName: this.getRuleName(),
            });

            // If fixing is enabled, replace the hook
            if (result.stylelint.config.fix) {
              this.fix(decl, fullMatch);
            }
          }
        });
      }
    };
  }

  // Fix method to replace var(--sds-...) with var(--slds-...)
  protected fix(decl: any, fullMatch: string): void {
    decl.value = decl.value.replace(fullMatch, fullMatch.replace('--sds-', '--slds-'));
  }
}

// Export the rule using createPlugin
export default new SDSMappingRule().createPlugin();