import stylelint, { Rule, PostcssResult } from 'stylelint';
import { readFileSync } from 'fs';
import { Root } from 'postcss';
import { metadataFileUrl } from '../../utils/metaDataFileUrl';
import ruleMetadata from '../../utils/rulesMetadata';
import replacePlaceholders from '../../utils/util';
const { utils, createPlugin } = stylelint;

const ruleName: string = 'slds/no-deprecated-slds-hooks';

const { severityLevel = 'error', warningMsg = '', errorMsg = '', ruleDesc = 'No description provided' } = ruleMetadata(ruleName) || {};
const messages = utils.ruleMessages(ruleName, {
  deprecated: (token: string) => replacePlaceholders(warningMsg, { token }),
  replaced: (oldToken: string, newToken: string) =>
    // Replace deprecated hook "${oldToken}" with "${newToken}"
    replacePlaceholders(errorMsg, { oldToken, newToken }),
});

// Read the deprecated tokens file
const isTestEnv = process.env.NODE_ENV === 'test';
const tokenMappingPath = metadataFileUrl(
  './public/metadata/deprecatedHooks.json'
);

const deprecatedHooks = JSON.parse(readFileSync(tokenMappingPath, 'utf8'));

function validateOptions(result: PostcssResult, options: any): boolean {
  return utils.validateOptions(result, ruleName, {
    actual: options,
    possible: {}, // Customize as needed
  });
}

function rule(primaryOptions?: any) {
  return (root: Root, result: PostcssResult) => {
    if (validateOptions(result, primaryOptions)) {
      root.walkDecls((decl) => {
        const parsedPropertyValue = decl.prop;
        if (parsedPropertyValue.startsWith('--slds-c-')) {
          const proposedNewValue = deprecatedHooks[parsedPropertyValue];
          if (proposedNewValue && proposedNewValue !== 'null') {
            const index = decl.toString().indexOf(decl.prop);
            const endIndex = index + decl.prop.length;
            const severity =
              result.stylelint.config.rules[ruleName]?.[1] ||
              severityLevel; // Default to "error"
            utils.report({
              message: messages.replaced(parsedPropertyValue, proposedNewValue),
              node: decl,
              index,
              endIndex,
              result,
              ruleName,
              severity,
            });

            if (result.stylelint.config.fix) {
              decl.prop = proposedNewValue;
            }
          }
          // else {
          //   utils.report({
          //     message: messages.deprecated(parsedPropertyValue),
          //     node: decl,
          //     result,
          //     ruleName
          //   });
          // }
        }
      });
    }
  };
}

export default createPlugin(ruleName, rule as unknown as Rule);
