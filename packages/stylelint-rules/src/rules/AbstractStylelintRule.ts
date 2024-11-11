import stylelint, { Rule, PostcssResult } from 'stylelint';
import { Root } from 'postcss';
import { namespace } from '../utils/namespace';
export default abstract class AbstractStylelintRule {
  protected ruleName: string;

  constructor(ruleName: string) {
    this.ruleName = namespace(ruleName);
  }

  // Method to get the rule name
  public getRuleName(): string {
    return this.ruleName;
  }

  // Validate the provided options for the rule (if any)
  protected validateOptions(result: PostcssResult, options: any): boolean {
    return stylelint.utils.validateOptions(result, this.ruleName, {
      actual: options,
      possible: {}, // Customize as needed
    });
  }

  // Abstract method to define the rule
  protected abstract rule(primaryOptions?: any): (root: Root, result: PostcssResult) => void;

  // Method to create the plugin
  public createPlugin(): Rule {
      const plugin =  stylelint.createPlugin(
        this.getRuleName(), 
        this.rule.bind(this)) as unknown as Rule;
        plugin.meta = {
          url: 'test'
        }
      return plugin;
  }
}