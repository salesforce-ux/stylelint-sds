import stylelint, { PostcssResult } from "stylelint";
import AbstractStylelintRule from '../AbstractStylelintRule';
import { Root } from "postcss"

const ruleName = "no-sds-custom-properties";

const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: (prop: string) => `Unexpected "--sds custom property" within selector "${prop}". Replace with "slds" or "dxp" equivalents. See link.`,
});

class NoSdsCustomPropertiesRule extends AbstractStylelintRule {
  constructor() {
    super(ruleName);
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
        root.walkDecls((decl) => {
          if (decl.prop.startsWith("--sds-")) {
            stylelint.utils.report({
              message: messages.expected(decl.prop),
              node: decl,
              result,
              ruleName: this.getRuleName(),
            });
          }
        });
      }
    };
  }
}

// Export the rule using createPlugin
export default new NoSdsCustomPropertiesRule().createPlugin();