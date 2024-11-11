import { Root } from 'postcss';
import stylelint, { PostcssResult } from 'stylelint';

import { Options } from './option.interface';
import AbstractStylelintRule from '../AbstractStylelintRule';

const ruleName = 'no-slds-class-overrides';
const defaultOptions : Options =
{
	step: 0.125,
	units:
	[
		'ch',
		'em',
		'ex',
		'rem',
		'vh',
		'vw',
		'vmin',
		'vmax'
	],
	atRules:
	[
		'media'
	],
	properties:
	[
		'border',
		'border-bottom',
		'border-bottom-left-radius',
		'border-bottom-right-radius',
		'border-bottom-width',
		'border-left',
		'border-left-width',
		'border-radius',
		'border-right',
		'border-right-width',
		'border-top',
		'border-top-left-radius',
		'border-top-right-radius',
		'border-top-width',
		'bottom',
		'box-shadow',
		'columns',
		'column-gap',
		'column-width',
		'flex-basis',
		'font',
		'font-size',
		'gap',
		'height',
		'inset',
		'left',
		'letter-spacing',
		'line-height',
		'margin',
		'margin-bottom',
		'margin-left',
		'margin-right',
		'margin-top',
		'max-height',
		'max-width',
		'min-height',
		'min-width',
		'outline',
		'outline-offset',
		'outline-width',
		'padding',
		'padding-bottom',
		'padding-left',
		'padding-right',
		'padding-top',
		'right',
		'row-gap',
		'text-indent',
		'top',
		'width'
	]
}

class NoSldsClassOverridesRule extends AbstractStylelintRule {
  constructor() {
    super(ruleName);
  }

  protected validateOptions(result: PostcssResult, options: Options): boolean {
    return stylelint.utils.validateOptions(result, ruleName, {
        actual: options,
        possible: {
            step: [(value: unknown) => typeof value === 'number' && value > 0],
            units: [(value: unknown) => typeof value === 'string' && defaultOptions.units.includes(value as string)],
            atRules: [(value: unknown) => typeof value === 'string' && defaultOptions.atRules.includes(value as string)],
            properties: [(value: unknown) => typeof value === 'string' && defaultOptions.properties.includes(value as string)],
        },
    });
  }

  protected rule(primaryOptions: Options) {
    const options: Options = { ...defaultOptions, ...primaryOptions };

    return (root: Root, result: PostcssResult) => {
      // Access customUrls safely
      const customUrls = result.stylelint.customUrls || []; // Default to an empty array if undefined

      // Validate options at the start of the rule execution
      if (this.validateOptions(result, options)) 
	  {
        // Walk through all CSS rules
        root.walkRules((rule) => {
          // Split the selectors on commas to check each selector individually
          const selectors: string[] = rule.selector.split(/\s*,\s*/);

          selectors.forEach(selector => {
            if (selector.includes('.slds-')) {
              stylelint.utils.report({
                message: `Instead of overriding styles of the SLDS class "${selector}" replace "${selector}" with a custom class and update your markup.`,
                node: rule,
                result,
                ruleName: this.getRuleName(),
                word: selector,
              });

              // Uncomment below to enable auto-fixing
              // if (context.fix) {
              //   rule.selector = rule.selector.replace(/\.slds-[\w-]+/g, '').trim();
              // }
            }
          });
        });
      }
    };
  }
}



// Export the rule using createPlugin
export default new NoSldsClassOverridesRule().createPlugin();