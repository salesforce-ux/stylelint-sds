import stylelint, { Rule, PostcssResult } from 'stylelint';
import { readFileSync } from 'fs';
import { Root } from 'postcss';
import { metadataFileUrl } from '../../utils/metaDataFileUrl';
import ruleMetadata from '../../utils/rulesMetadata';
import replacePlaceholders from '../../utils/util';
import { getClassNodesFromSelector } from '../../utils/selector-utils';
import {deprecatedClasses} from "@salesforce-ux/matadata-slds";

const { utils, createPlugin } = stylelint;

const ruleName: string = 'slds/no-deprecated-slds-classes';

const {
  severityLevel = 'error',
  warningMsg = '',
  errorMsg = '',
  ruleDesc = 'No description provided',
} = ruleMetadata(ruleName) || {};
const messages = stylelint.utils.ruleMessages(ruleName, {
  deprecated: (className: string) =>
    replacePlaceholders(errorMsg, { className }),
});

/* const isTestEnv = process.env.NODE_ENV === 'test';
const tokenMappingPath = metadataFileUrl(
  './public/metadata/deprecatedClasses.json'
);

const defaultDeprecatedClasses = new Set(
  JSON.parse(readFileSync(tokenMappingPath, 'utf8'))
);
 */
// Regex to match classes
const classRegex = /\.[\w-]+/g;

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
    const severity =
      result.stylelint.config.rules[ruleName]?.[1] || severityLevel; // Default to "error"
    if (!validateOptions(result, primaryOptions)) {
      return;
    }
    const deprecatedClassesSet = new Set(deprecatedClasses);

    root.walkRules((rule) => {
      const classNodes = getClassNodesFromSelector(rule.selector);
      const offsetIndex = rule.toString().indexOf(rule.selector);
      classNodes.forEach((classNode) => {
        if (!deprecatedClassesSet.has(classNode.value)) {
          return;
        }
        const index = offsetIndex + classNode.sourceIndex + 1; // find selector in rule plus '.'
        const endIndex = index + classNode.value.length;
        utils.report({
          message: messages.deprecated(classNode.value),
          node: rule,
          result,
          ruleName,
          severity,
          index,
          endIndex
        });
      });
    });
  };
}

export default createPlugin(ruleName, rule as unknown as Rule);
