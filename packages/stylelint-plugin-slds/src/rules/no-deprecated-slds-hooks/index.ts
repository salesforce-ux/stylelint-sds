import stylelint, { Rule, PostcssResult } from 'stylelint';
import { readFileSync } from 'fs';
import { Root } from 'postcss';
import { metadataFileUrl } from '../../utils/metaDataFileUrl'
const { utils, createPlugin } = stylelint;

const ruleName = 'slds/no-deprecated-slds-hooks';
const messages = utils.ruleMessages(ruleName, {
  deprecated: (token: string) =>
    `The hook "${token}" is deprecated and will not work in SLDS2. Please remove or replace it.`,
  replaced: (oldToken: string, newToken: string) =>
    `Replace deprecated hook "${oldToken}" with "${newToken}"`,
});

// Read the deprecated tokens file
const isTestEnv = process.env.NODE_ENV === 'test';
const tokenMappingPath = metadataFileUrl('./public/metadata/deprecatedHooks.json');


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
            utils.report({
              message: messages.replaced(parsedPropertyValue, proposedNewValue),
              node: decl,
              index,
              endIndex,
              result,
              ruleName,
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
