import stylelint, { PostcssResult } from 'stylelint';
import { Root } from 'postcss';
import fs from 'fs';
import { namespace } from '../../utils/namespace';
import generateTable from '../../utils/generateTable';
import CSSClassMatcher from './utility-classes-cache';
import AbstractStylelintRule from '../AbstractStylelintRule';

// Load the predefined classes from a JSON file
const jsonFilePath = new URL('./public/metadata/utilities.json', import.meta.url).pathname;
const predefinedClasses = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

// Define the rule name
const ruleName = 'enforce-use-of-utility-classes';

// Helper function to normalize property values (trim and lowercase)
function normalizeValue(value: string): string {
  return value.trim().replace(/['"]+/g, '').toLowerCase();
}
class EnforceUseOfUtilityClassesRule extends AbstractStylelintRule {
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
        root.walkRules((rule) => {
          const declarations = rule.nodes?.filter(node => node.type === 'decl') || [];

          const matchedClasses = [];
          const matcher = new CSSClassMatcher(predefinedClasses);
          const exactMatchingClass = matcher.findMatchFromNodes(declarations);

          if (exactMatchingClass) {
            matchedClasses.push({ "name": exactMatchingClass });
          }

          // If there are matched classes, report them in a table format
          if (matchedClasses.length > 0) {
            const table = generateTable(matchedClasses);

            stylelint.utils.report({
              message: `Instead of declaring the property, consider placing a helper class on your element:\n${table}`,
              node: rule,
              result,
              ruleName: this.getRuleName(),
            });
          }
        });
      }
    };
  }
}

// Create and export the plugin
export default new EnforceUseOfUtilityClassesRule().createPlugin();