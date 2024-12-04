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
      //if (this.validateOptions(result, primaryOptions)) 
      {
        root.walkRules((rule) => {
          const givenProp = rule.selector.replace(".", ""); //to remove cases like .slds-text-heading_large
          if (bemMapping.items[0].tokens[givenProp]) {
              const index = rule.toString().indexOf(givenProp);
              const endIndex = index + givenProp.length;
              const newValue = bemMapping.items[0].tokens[givenProp];

              if (typeof newValue === "string") {
                stylelint.utils.report({
                  message: messages.replaced(givenProp, newValue),
                  node: rule,
                  index,
                  endIndex,
                  result,
                  ruleName: this.getRuleName(),
                });

                // Call the fix method if in fixing context
                if (result.stylelint.config.fix) {
                  this.fix(rule, newValue);
                }
              }
          }
        });
        // root.walkDecls((decl) => {
        //   const givenProp = decl.prop;
        //   console.log(`Given Prop ${givenProp}`)
        //     if (bemMapping.items[0].tokens[givenProp]) {
        //       console.log(`Given Prop mapped to ${bemMapping.items[0].tokens[givenProp]}`)
        //       const index = decl.toString().indexOf(givenProp);
        //       const endIndex = index + givenProp.length;
        //       const newValue = bemMapping.items[0].tokens[givenProp];

        //       if (typeof newValue === "string") {
        //         stylelint.utils.report({
        //           message: messages.replaced(givenProp, newValue),
        //           node: decl,
        //           index,
        //           endIndex,
        //           result,
        //           ruleName: this.getRuleName(),
        //         });

        //         // Call the fix method if in fixing context
        //         if (result.stylelint.config.fix) {
        //           this.fix(decl, newValue);
        //         }
        //       }
        //     }
        // });
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