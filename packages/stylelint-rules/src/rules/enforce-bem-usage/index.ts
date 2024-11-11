import stylelint, { PostcssResult } from "stylelint";
import valueParser from "postcss-value-parser";
import { readFileSync } from "fs";
import { Root } from "postcss";
import { resolve } from "path";
import { parse } from "yaml";
import AbstractStylelintRule from "../AbstractStylelintRule";

const ruleName = "enforce-bem-usage";

interface Item {
  name: string;
  tokenType: string;
  category: string;
  properties: string[];
  tokens: Record<string, string>;
}

interface ParsedData {
  items: Item[];
}

const messages = stylelint.utils.ruleMessages(ruleName, {
  replaced: (oldValue: string, newValue: string) => `Consider updating '${oldValue}' to new naming convention '${newValue}'`,
});

// Read the token mapping file
const tokenMappingPath = resolve(
  new URL(".", import.meta.url).pathname,
  "./public/metadata/bem-naming.yml"
);
const bemMapping: ParsedData = parse(readFileSync(tokenMappingPath, "utf8"));

class EnforceBemUsageRule extends AbstractStylelintRule {
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
          const parsedValue = valueParser(decl.value);
          parsedValue.walk((node) => {
            if (
              node.type === "word" &&
              bemMapping.items[0].tokens[node.value]
            ) {
              const index = decl.toString().indexOf(decl.value);
              const endIndex = index + decl.value.length;
              const newValue = bemMapping.items[0].tokens[node.value];

              if (typeof newValue === "string") {
                stylelint.utils.report({
                  message: messages.replaced(decl.value, newValue),
                  node: decl,
                  index,
                  endIndex,
                  result,
                  ruleName: this.getRuleName(),
                });

                // Call the fix method if in fixing context
                if (result.stylelint.config.fix) {
                  this.fix(decl, newValue);
                }
              }
            }
          });
        });
      }
    };
  }

  // Implement the fix method
  protected fix(decl: any, newValue: string): void {
    decl.value = newValue; // Update the declaration value
  }
}

// Export the rule using createPlugin
export default new EnforceBemUsageRule().createPlugin();