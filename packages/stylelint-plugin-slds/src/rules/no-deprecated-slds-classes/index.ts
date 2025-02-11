import stylelint, { Rule, PostcssResult } from 'stylelint';
import { readFileSync } from 'fs';
import { Root } from 'postcss';
import { metadataFileUrl } from '../../utils/metaDataFileUrl';
import ruleMetadata from '../../utils/rulesMetadata';
import replacePlaceholders from '../../utils/util';

const { utils, createPlugin } = stylelint;



const ruleName:string = 'slds/no-deprecated-slds-classes';

const { severityLevel = 'error', warningMsg = '', errorMsg = '', ruleDesc = 'No description provided' } = ruleMetadata(ruleName) || {};
const messages = stylelint.utils.ruleMessages(ruleName, {
  deprecated: (className: string) =>
    replacePlaceholders(errorMsg,{className}),
});

const isTestEnv = process.env.NODE_ENV === 'test';
const tokenMappingPath = metadataFileUrl('./public/metadata/deprecatedClasses.json');

const defaultDeprecatedClasses = new Set(
  JSON.parse(readFileSync(tokenMappingPath, 'utf8'))
);

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
  context: any,
  deprecatedClasses = defaultDeprecatedClasses
) {
  return (root: Root, result: PostcssResult) => {
    if (validateOptions(result, primaryOptions)) {
      root.walkRules((rule) => {
        const classMatches = rule.selector.match(classRegex);
        const severity =
                      result.stylelint.config.rules[ruleName]?.[1] || severityLevel; // Default to "error"
        if (classMatches) {
          classMatches.forEach((match) => {
            const className = match.slice(1);
            if (deprecatedClasses.has(className)) {
              utils.report({
                message: messages.deprecated(className),
                node: rule,
                result,
                ruleName,
                severity
              });
            }
          });
        }
      });
    }
  };
}

export default createPlugin(ruleName, rule as unknown as Rule);
