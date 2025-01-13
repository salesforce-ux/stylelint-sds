import { Root } from 'postcss';
import stylelint, { PostcssResult, Rule, RuleContext } from 'stylelint';
import valueParser from 'postcss-value-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Options } from './option.interface';
import { metadataFileUrl } from '../../utils/metaDataFileUrl';

const { utils, createPlugin }: typeof stylelint = stylelint;
const ruleName: string = 'sf-sds/lwc-to-slds-token';

// Define messages for reporting
const messages = stylelint.utils.ruleMessages(ruleName, {
  replaced: (oldValue: string, newValue: string) =>
    `The '${oldValue}' design token is deprecated. To avoid breaking changes, replace it with the '${newValue}' styling hook and set the fallback to '${oldValue}'. For more info, see the New Global Styling Hook Guidance on lightningdesignsystem.com.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n`,
  warning: (oldValue: string) => `The '${oldValue}' is currently deprecated.`,
});

const tokenMappingPath = metadataFileUrl('./public/metadata/lwcToSlds.json');

const lwcToSLDS = JSON.parse(readFileSync(tokenMappingPath, 'utf8'));

// Validate options for the rule
function validateOptions(result: PostcssResult, options: Options) {
  return stylelint.utils.validateOptions(result, ruleName, {
    actual: options,
    possible: {}, // Customize as needed
  });
}

// Define the main rule logic
function rule(
  primaryOptions: Options,
  secondaryOptions: Options,
  context: RuleContext
) {
  return (root: Root, result: PostcssResult) => {
    if (validateOptions(result, primaryOptions)) {
      root.walkDecls((decl) => {
        const parsedValue = valueParser(decl.value);

        parsedValue.walk((node) => {
          if (node.type === 'word' && node.value.startsWith('--lwc-')) {
            const oldValue = node.value;
            const newValue = lwcToSLDS[oldValue] === 'Continue to use' ? '' : lwcToSLDS[oldValue];
            const startIndex = decl.toString().indexOf(decl.value);
            const endIndex = startIndex + decl.value.length;

            // Skip if the value has already been fixed
            if (
              newValue &&
              (decl.value.includes(newValue) ||
                JSON.stringify(parsedValue).includes(newValue))
            ) {
              return;
            }

            if (newValue && newValue !== '--') {
              const proposedNewValue = `var(${newValue}, ${decl.value})`;

              stylelint.utils.report({
                message: messages.replaced(oldValue, proposedNewValue),
                node: decl,
                result,
                index: startIndex,
                endIndex,
                ruleName,
              });

              // Fix if the context allows
              if (result.stylelint.config.fix) {
                decl.value = proposedNewValue;
              }
            } else {
              stylelint.utils.report({
                message: messages.warning(oldValue),
                node: decl,
                index: startIndex,
                endIndex,
                result,
                ruleName,
              });
            }
          }
        });
      });
    }
  };
}

// Export the plugin
export default createPlugin(ruleName, rule as unknown as Rule);
