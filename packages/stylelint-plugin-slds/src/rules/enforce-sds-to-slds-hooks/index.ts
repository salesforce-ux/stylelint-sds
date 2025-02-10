import { Root } from 'postcss';
import stylelint, { Rule, RuleContext, PostcssResult } from 'stylelint';
import { Options } from './option.interface';

const { utils, createPlugin }: typeof stylelint = stylelint;
const ruleName: string = 'slds/enforce-sds-to-slds-hooks';

function validateOptions(result: PostcssResult, options: Options): boolean {
  return utils.validateOptions(result, ruleName, {
    actual: options,
    possible: {}, // Customize if additional options are added
  });
}

function rule(
  primaryOptions: Options,
  secondaryOptions: Options,
  context: RuleContext
) {
  return (root: Root, result: PostcssResult) => {
    const sdsVarPattern = /var\(--sds-[^)]+\)/g;

    root.walkDecls((decl) => {
      const matches = decl.value.matchAll(sdsVarPattern);

      for (const match of matches) {
        const [fullMatch] = match;
        const startIndex = decl.toString().indexOf(fullMatch);
        const endIndex = startIndex + fullMatch.length;

        utils.report({
          message: `The "${fullMatch}" styling hook is replaced by "${fullMatch.replace('--sds-', '--slds-')}".`,
          node: decl,
          index: startIndex,
          endIndex,
          result,
          ruleName,
        });

        // If fixing is enabled, replace the hook
        if (result.stylelint.config.fix) {
          fix(decl, fullMatch);
        }
      }
    });
  };
}

// Fix method to replace var(--sds-...) with var(--slds-...)
function fix(decl: any, fullMatch: string): void {
  decl.value = decl.value.replace(
    fullMatch,
    fullMatch.replace('--sds-', '--slds-')
  );
}

export default createPlugin(ruleName, rule as unknown as Rule);
