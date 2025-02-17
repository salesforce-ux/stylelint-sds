import stylelint, { Rule, PostcssResult } from 'stylelint';
import { readFileSync } from 'fs';
import { Root } from 'postcss';
import { metadataFileUrl } from '../../utils/metaDataFileUrl';
import ruleMetadata from '../../utils/rulesMetadata';
import replacePlaceholders from '../../utils/util';
const { utils, createPlugin } = stylelint;
import {sldsPlusMetadata} from "@salesforce-ux/matadata-slds";
const deprecatedSelectorsList = sldsPlusMetadata.bem.css.deprecated.selectors;



const ruleName:string = 'slds/no-deprecated-slds2-classes';

const { severityLevel = 'error', warningMsg = '', errorMsg = '', ruleDesc = 'No description provided' } = ruleMetadata(ruleName) || {};
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: (selector: string) =>
    replacePlaceholders(errorMsg,{selector}),
});

// Check if it's in test environment to load the correct metadata path
const isTestEnv = process.env.NODE_ENV === 'test';

// Load deprecated selectors from a metadata file
/* const deprecatedSelectorsPath = metadataFileUrl('./public/metadata/sldsPlus.metadata.json');

// Read and parse the JSON file containing deprecated selectors
const deprecatedSelectors = JSON.parse(
  readFileSync(deprecatedSelectorsPath, 'utf8')
).bem.css.deprecated.selectors; */

function validateOptions(result: PostcssResult, options: any): boolean {
  return utils.validateOptions(result, ruleName, {
    actual: options,
    possible: {}, // Customize as needed
  });
}

function rule(
  primaryOptions: any,
  secondaryOptions: any,
  context: any
) {
  return (root: Root, result: PostcssResult) => {
    if (validateOptions(result, primaryOptions)) {
      root.walkRules((rule) => {
        // Check if the selector matches any deprecated selectors
        if (
          deprecatedSelectorsList.some((deprecatedSelector: string) =>
            rule.selector.includes(deprecatedSelector)
          )
        ) {
          const severity =
                        result.stylelint.config.rules[ruleName]?.[1] || severityLevel; // Default to "error"
          utils.report({
            message: messages.expected(rule.selector),
            node: rule,
            result,
            ruleName,
            severity
          });
        }
      });
    }
  };
}

export default createPlugin(ruleName, rule as unknown as Rule);
