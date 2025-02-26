import stylelint, { Rule, PostcssResult, RuleSeverity } from 'stylelint';
import { Root } from 'postcss';
import fs from 'fs';
import generateTable from '../../utils/generateTable';
import CSSClassMatcher from './utility-classes-cache';
import { metadataFileUrl } from '../../utils/metaDataFileUrl';
import ruleMetadata from '../../utils/rulesMetadata';
import replacePlaceholders from '../../utils/util';
const { utils, createPlugin }: typeof stylelint = stylelint;
import {utilities as predefinedClasses} from "@salesforce-ux/metadata-slds";

const ruleName:string = 'slds/enforce-utility-classes';

const { severityLevel = 'error', warningMsg = '', errorMsg = '', ruleDesc = 'No description provided' } = ruleMetadata(ruleName) || {};



// Helper function to normalize property values (trim and lowercase)
function normalizeValue(value: string): string {
  return value.trim().replace(/['"]+/g, '').toLowerCase();
}


function rule(primaryOptions: boolean, {severity = severityLevel as RuleSeverity}={}) {
  return (root: Root, result: PostcssResult) => {
    root.walkRules((rule) => {
      const declarations =
        rule.nodes?.filter((node) => node.type === 'decl') || [];

      const matchedClasses = [];
      const matcher = new CSSClassMatcher(predefinedClasses);
      const exactMatchingClass = matcher.findMatchFromNodes(declarations);
      
      if (exactMatchingClass) {
        matchedClasses.push({ name: exactMatchingClass });
      }

      // If there are matched classes, report them in a table format
      if (matchedClasses.length > 0) {
        const table = generateTable(matchedClasses);

        utils.report({
          message: replacePlaceholders(errorMsg,{table}),
          node: rule,
          result,
          ruleName,
          severity
        });
      }
    });
  };
}

export default createPlugin(ruleName, rule as unknown as Rule);
