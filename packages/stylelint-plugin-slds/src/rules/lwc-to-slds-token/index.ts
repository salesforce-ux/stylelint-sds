import { Root } from 'postcss';
import stylelint, { PostcssResult, Rule, RuleContext } from 'stylelint';
import valueParser from 'postcss-value-parser';
import { readFileSync } from 'fs';
import { Options } from './option.interface';
import { metadataFileUrl } from '../../utils/metaDataFileUrl';
import ruleMetadata from '../../utils/rulesMetadata';
import replacePlaceholders from '../../utils/util';
//import lwcToSLDS from '../../../public/metadata/lwcToSlds.json' with { type: "json" };

const { createPlugin }: typeof stylelint = stylelint;

const ruleName: string = 'slds/lwc-to-slds-token';

const { severityLevel = 'error', warningMsg = '', errorMsg = '', ruleDesc = 'No description provided' } = ruleMetadata(ruleName) || {};
// Define messages for reporting
const messages = stylelint.utils.ruleMessages(ruleName, {
  replaced: (oldValue: string, newValue: string) =>
    replacePlaceholders(errorMsg, { oldValue, newValue }),
  warning: (oldValue: string) => replacePlaceholders(warningMsg, { oldValue }),

  errorWithStyleHooks:(oldValue, newValue)=> `The '${oldValue}' design token is deprecated. To avoid breaking changes, replace it with the '${newValue}' styling hook and set the fallback to '${oldValue}'. For more info, see the New Global Styling Hook Guidance on lightningdesignsystem.com.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n`,
  errorWithNoRecommendation:(oldValue)=> `The '${oldValue}' design token is deprecated. For more info, see the New Global Styling Hook Guidance on lightningdesignsystem.com.`,
  errorWithRawValue:(oldValue, newValue)=> `The '${oldValue}' design token is deprecated. To avoid breaking changes, replace it with '${newValue}'. For more info, see the New Global Styling Hook Guidance on lightningdesignsystem.com.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n`,

});

const tokenMappingPath = metadataFileUrl('./public/metadata/lwcToSlds.json');

const lwcToSLDS = JSON.parse(readFileSync(tokenMappingPath, 'utf8'));

// Validate options for the rule
function validateOptions(result: PostcssResult, options: Options) {
  return stylelint.utils.validateOptions(result, ruleName, {
    actual: options,
    possible: {}, // Customize as needed
  });
}

function isFixed(newValue ='', decl, parsedValue){
  return newValue.startsWith('--slds-') &&
              (decl.value.includes(newValue) || JSON.stringify(parsedValue).includes(newValue));
}

// Define the main rule logic
function rule(
  primaryOptions: Options,
  secondaryOptions: Options,
  context: RuleContext
) {
  return (root: Root, result: PostcssResult) => {
    if (validateOptions(result, primaryOptions)) {
      
      root.walkDecls((decl) => {
        const parsedValue = valueParser(decl.value);
        parsedValue.walk((node) => {
          if (node.type === 'word' && node.value.startsWith('--lwc-')) {
            const oldValue = node.value;

            if(!(oldValue in lwcToSLDS) || lwcToSLDS[oldValue] === 'Continue to use'){
              // Ignore if entry not found in the list or the token is marked to use further
              return;
            }


            const recommendation = lwcToSLDS[oldValue];
            const startIndex = decl.toString().indexOf(decl.value);
            const endIndex = startIndex + decl.value.length;
            const severity = result.stylelint.config.rules[ruleName]?.[1] || severityLevel; // Default to "error"
            const hasRecommendation = recommendation && recommendation !== '--';
            
            if(!hasRecommendation){
              // Found a deprecated token but don't have any alternate recommendation then just report user to follow docs
              stylelint.utils.report({
                message: messages.errorWithNoRecommendation(oldValue),
                node: decl,
                index: startIndex,
                endIndex,
                result,
                ruleName,
                severity,
              });
            }

            // Skip if the value has already been fixed only if the recommendation starts with '--slds-'
            if (hasRecommendation) {
              // If there are multiple --slds- token recommendation for single --lwc we maintain recommendations as array
              let checkFixed = Array.isArray(recommendation)?recommendation:[recommendation];
              if(checkFixed.some(val => isFixed(val, decl, parsedValue))){
                return;
              }
            }

            // Found recommendation, replace value
            let proposedFix = '';
            let canFix = true;
            let message;
            if(Array.isArray(recommendation)){
              message = messages.errorWithStyleHooks(oldValue, recommendation.join(' or '))
              canFix = false;
            } else if(recommendation.startsWith('--slds-')){
              message = messages.errorWithStyleHooks(oldValue, recommendation)
              // add recommendation with fallback
              proposedFix = `var(${recommendation}, ${decl.value})`;
            } else {
              message = messages.errorWithRawValue(oldValue, recommendation)
              // for any raw values, color-mix, calc
              proposedFix = recommendation;
            }        

            stylelint.utils.report({
              message: messages.replaced(oldValue, proposedFix),
              node: decl,
              result,
              index: startIndex,
              endIndex,
              ruleName,
              severity,
            });

            // Fix if the context allows
            if (result.stylelint.config.fix && canFix) {
              decl.value = proposedFix;
            }
          }
        });
      });
    }
  };
}

// Export the plugin
export default createPlugin(ruleName, rule as unknown as Rule);
