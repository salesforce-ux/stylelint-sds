import { Root } from 'postcss';
import stylelint, { Rule, PostcssResult } from 'stylelint';

import { Options } from './option.interface';
import ruleMetadata from '../../utils/rulesMetadata';
import replacePlaceholders from '../../utils/util';
import { getClassNodesFromSelector } from '../../utils/selector-utils';
import { metadataFileUrl } from '../../utils/metaDataFileUrl';
import { readFileSync } from 'fs';
const { utils, createPlugin }: typeof stylelint = stylelint;

const ruleName: string = 'slds/no-slds-class-overrides';

const {
  severityLevel = 'error',
  warningMsg = '',
  errorMsg = '',
  ruleDesc = 'No description provided',
} = ruleMetadata(ruleName) || {};

const tokenMappingPath = metadataFileUrl('./public/metadata/slds_classes.json');
const sldsClasses = JSON.parse(readFileSync(tokenMappingPath, 'utf8'));
const sldsSet = new Set(sldsClasses);

function rule(primaryOptions: Options) {
  return (root: Root, result: PostcssResult) => {
    const severity =
      result.stylelint.config.rules[ruleName]?.[1] || severityLevel; // Default to "error"

    root.walkRules((rule) => {
      const classNodes = getClassNodesFromSelector(rule.selector);

      const offsetIndex = rule.toString().indexOf(rule.selector);
      classNodes.forEach((classNode) => {
        if (!classNode.value.startsWith('slds-')) {
          // Ignore if the selector do not start with `slds-*`
          return;
        } else {
          //match against slds_classes.json entries. As of now we have 4k_ entries.
          if (sldsSet.has(classNode.value)) {
            const index = offsetIndex + classNode.sourceIndex + 1; // find selector in rule plus '.'
            const endIndex = index + classNode.value.length;
            utils.report({
              message: replacePlaceholders(errorMsg, {
                selector: `.${classNode.value}`,
              }),
              node: rule,
              result,
              ruleName,
              severity,
              index,
              endIndex,
            });
          }
        }
      });
    });
  };
}

export default createPlugin(ruleName, rule as unknown as Rule);
