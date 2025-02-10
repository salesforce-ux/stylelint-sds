import stylelint, { Rule, PostcssResult } from 'stylelint';
import valueParser from 'postcss-value-parser';
import { readFileSync } from 'fs';
import { Root } from 'postcss';
import { parse } from 'yaml';
import { metadataFileUrl } from '../../utils/metaDataFileUrl';
const { utils, createPlugin } = stylelint;

const ruleName = 'slds/enforce-bem-usage';

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
    `Consider updating '${oldValue}' to new naming convention '${newValue}'`,
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
    if (validateOptions(result, primaryOptions))
    {
      root.walkRules((rule) => {
        const givenProp = rule.selector.replace('.', ''); //to remove cases like .slds-text-heading_large
        if (bemMapping.items[0].tokens[givenProp]) {
          const index = rule.toString().indexOf(givenProp);
          const endIndex = index + givenProp.length;
          const newValue = bemMapping.items[0].tokens[givenProp];

          if (typeof newValue === 'string') {
            stylelint.utils.report({
              message: messages.replaced(givenProp, newValue),
              node: rule,
              index,
              endIndex,
              result,
              ruleName,
            });

            // Call the fix method if in fixing context
            if (result.stylelint.config.fix) {
              fix(rule, newValue);
            }
          }
        }
      });
    }
  };
}

function fix(decl: any, newValue: string): void {
  decl.value = newValue; // Update the declaration value
}

export default createPlugin(ruleName, rule as unknown as Rule);
