import { Root } from 'postcss';
import stylelint, { Rule, RuleContext, PostcssResult } from 'stylelint';
import valueParser from 'postcss-value-parser';
import { readFileSync } from 'fs';
import { metadataFileUrl } from '../../utils/metaDataFileUrl';
import ruleMetadata from '../../utils/rulesMetadata';
import replacePlaceholders from '../../utils/util';
import {tokenMapping} from "@salesforce-ux/matadata-slds";

const { utils, createPlugin }: typeof stylelint = stylelint;
const ruleName: string = 'slds/no-invalid-tokens-classes';


const { severityLevel = 'error', warningMsg = '', errorMsg = '', ruleDesc = 'No description provided' } = ruleMetadata(ruleName) || {};

const messages = utils.ruleMessages(ruleName, {
  deprecatedMsg: 'Aura tokens are deprecated. Please migrate to SLDS Design Tokens.',
  replaced: (oldValue: string, newValue: string) =>
    replacePlaceholders(errorMsg, { oldValue, newValue }),
});

// Load token mapping file
/* const tokenMappingPath = metadataFileUrl('./public/metadata/tokenMapping.json');

const tokenMapping = JSON.parse(readFileSync(tokenMappingPath, 'utf8')); */

function validateOptions(result: PostcssResult, options: any) {
  return utils.validateOptions(result, ruleName, {
    actual: options,
    possible: {}, // Extend as needed
  });
}

function rule(
  primaryOptions: any,
  secondaryOptions: any,
  context: RuleContext
) {
  return (root: Root, result: PostcssResult) => {
    if (validateOptions(result, primaryOptions)) {
      root.walkDecls((decl) => {
        const parsedValue = valueParser(decl.value);

        parsedValue.walk((node) => {
          if (
            node.type === 'function' &&
            (node.value === 'token' || node.value === 't')
          ) {
            const tokenName = node.nodes[0].value;

            const index = decl.toString().indexOf(decl.value); // Start index of the value
            const endIndex = index + decl.value.length;
            const severity =
              result.stylelint.config.rules[ruleName]?.[1] ||
              severityLevel; // Default to "error"
            if (tokenName in tokenMapping) {
              const newValue = tokenMapping[tokenName];

              // Skip if already fixed
              if (decl.value.includes(newValue)) return;

              if (
                typeof newValue === 'string' &&
                newValue.startsWith('--lwc-')
              ) {
                const replacementStyle = `var(${newValue}, ${decl.value})`;

                utils.report({
                  message: messages.replaced(decl.value, replacementStyle),
                  node: decl,
                  index,
                  endIndex,
                  result,
                  ruleName,
                  severity,
                });

                if (context.fix && replacementStyle) {
                  decl.value = replacementStyle;
                }
              } else {
                utils.report({
                  message: messages.deprecatedMsg,
                  node: decl,
                  index,
                  endIndex,
                  result,
                  ruleName,
                  severity,
                });
              }
            } else {
              utils.report({
                message: messages.deprecatedMsg,
                node: decl,
                index,
                endIndex,
                result,
                ruleName,
                severity,
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
