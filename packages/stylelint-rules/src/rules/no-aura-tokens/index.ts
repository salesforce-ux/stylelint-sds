import { Root } from 'postcss';
import stylelint, { Rule, RuleContext, PostcssResult } from 'stylelint';
import valueParser from 'postcss-value-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const { utils, createPlugin }: typeof stylelint = stylelint;
const ruleName: string = 'sf-sds/no-aura-tokens';

const messages = utils.ruleMessages(ruleName, {
  deprecated:
    'Aura tokens are deprecated. Please migrate to SLDS Design Tokens.',
  replaced: (oldValue: string, newValue: string) =>
    `The '${oldValue}' design token is deprecated. To avoid breaking changes, replace it with '${newValue}' styling hook. Set the fallback to '${oldValue}'. See the New Global Styling Hooks Guidance on lightningdesignsystem.com for more info.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n`,
});

// Load token mapping file
const isTestEnv = process.env.NODE_ENV === 'test';
const tokenMappingPath = resolve(
  isTestEnv
    ? fileURLToPath(
        new URL('../../../public/metadata/tokenMapping.json', import.meta.url)
      )
    : new URL('./public/metadata/tokenMapping.json', import.meta.url).pathname
);

const tokenMapping = JSON.parse(readFileSync(tokenMappingPath, 'utf8'));

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
                });

                if (context.fix && replacementStyle) {
                  decl.value = replacementStyle;
                }
              } else {
                utils.report({
                  message: messages.deprecated,
                  node: decl,
                  index,
                  endIndex,
                  result,
                  ruleName,
                });
              }
            } else {
              utils.report({
                message: messages.deprecated,
                node: decl,
                index,
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
