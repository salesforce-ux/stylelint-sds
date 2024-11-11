import { Root } from 'postcss';
import stylelint, { PostcssResult } from 'stylelint';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import AbstractStylelintRule from '../AbstractStylelintRule';

const ruleName = 'no-unused-classes';

class NoUnusedClassesRule extends AbstractStylelintRule {
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
    return async (root: Root, result: PostcssResult) => {
      const cssFilePath = result.opts.from; // Path to the CSS file
      const htmlFilePath = cssFilePath.replace(/\.css$/, '.html'); 

      let htmlContent: string;
      try {
        // Read the HTML file from the same directory as the CSS file
        htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
      } catch (error) {
        return; // If HTML file not found, exit early
      }

      // Parse the HTML content using jsdom
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;

      // Extract all class names used in the HTML file
      const htmlClasses: Set<string> = new Set();
      document.querySelectorAll('*[class]').forEach(element => {
        element.className.split(/\s+/).forEach(className => {
          htmlClasses.add(className); // Add class names to the set
        });
      });

      // Extract CSS class selectors and check for unused ones
      root.walkRules(rule => {
        const classSelectors = rule.selector.split(/\s*,\s*/).filter(sel => sel.startsWith('.'));
        classSelectors.forEach(selector => {
          const className = selector.slice(1); // Remove the leading dot (.)
          if (!htmlClasses.has(className)) {
            stylelint.utils.report({
              message: `Unused CSS class "${className}" detected.`,
              node: rule,
              result,
              ruleName: this.getRuleName(),
            });
          }
        });
      });
    };
  }
}

// Export the rule using createPlugin
export default new NoUnusedClassesRule().createPlugin();