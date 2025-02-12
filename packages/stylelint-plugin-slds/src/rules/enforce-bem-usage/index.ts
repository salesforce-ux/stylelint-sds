import stylelint, { Rule, PostcssResult } from 'stylelint';
import { readFileSync } from 'fs';
import { Root } from 'postcss';
import SelectorParser from 'postcss-selector-parser';
import { parse } from 'yaml';
import { metadataFileUrl } from '../../utils/metaDataFileUrl';
const { utils, createPlugin } = stylelint;
import ruleMetadata from './../../utils/rulesMetadata';
import replacePlaceholders from '../../utils/util';

const ruleName: string = 'slds/enforce-bem-usage';
const selectorParser = SelectorParser();

const {
  severityLevel = 'error',
  warningMsg = '',
  errorMsg = '',
  ruleDesc = 'No description provided',
} = ruleMetadata(ruleName) || {};

interface Item {
  name: string;
  tokenType: string;
  category: string;
  properties: string[];
  tokens: Record<string, string>;
}

interface ParsedData {
  items: Item[];
}

const messages = stylelint.utils.ruleMessages(ruleName, {
  replaced: (oldValue: string, newValue: string) =>
    replacePlaceholders(errorMsg, { oldValue, newValue }),
  //`Consider updating '${oldValue}' to new naming convention '${newValue}'`,
});

const isTestEnv = process.env.NODE_ENV === 'test';
const tokenMappingPath = metadataFileUrl('./public/metadata/bem-naming.yml');

const bemMapping: ParsedData = parse(readFileSync(tokenMappingPath, 'utf8'));

function validateOptions(result: PostcssResult, options: any): boolean {
  return stylelint.utils.validateOptions(result, ruleName, {
    actual: options,
    possible: {}, // Customize as needed
  });
}

function rule(primaryOptions?: any) {
  return (root: Root, result: PostcssResult) => {
    if (validateOptions(result, primaryOptions)) {
      root.walkRules((rule) => {
        let fixOffset = 0; // aggregate position change if using auto-fix, tracked at the rule level
        for (const classNode of getClassesFromSelector(rule.selector)) {
          // check mapping data for this class name
          const newValue = bemMapping.items[0].tokens[classNode.value];
          if (newValue) {
            const index =
              rule.toString().indexOf(rule.selector) +
              classNode.sourceIndex +
              1; // find selector in rule plus '.'
            const endIndex = index + classNode.value.length;
            const severity =
              result.stylelint.config.rules[ruleName]?.[1] || severityLevel; // Default to "error"
            const fix = () => {
              rule.selector =
                rule.selector.substring(0, fixOffset + index) +
                newValue +
                rule.selector.substring(fixOffset + endIndex);
              fixOffset += newValue.length - (endIndex - index);
            };

            if (typeof newValue === 'string') {
              stylelint.utils.report({
                message: messages.replaced(classNode.value, newValue),
                node: rule,
                index,
                endIndex,
                result,
                ruleName,
                severity,
                fix,
              });
            }
          }
        }
      });
    }
  };
}

function getClassesFromSelector(selector: string) {
  const selectorAst = selectorParser.astSync(selector);
  const classNames = [];
  selectorAst.walkClasses((classNode) => {
    classNames.push(classNode);
  });
  return classNames;
}

rule.meta = { ruleName, messages, fixable: true };

export default createPlugin(ruleName, rule as unknown as Rule);
