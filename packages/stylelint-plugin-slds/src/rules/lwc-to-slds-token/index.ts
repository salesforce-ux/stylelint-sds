import { lwcToSlds } from "@salesforce-ux/metadata-slds";
import { Root } from 'postcss';
import valueParser from 'postcss-value-parser';
import stylelint, { PostcssResult, Rule, RuleSeverity } from 'stylelint';
import ruleMetadata from '../../utils/rulesMetadata';
import replacePlaceholders from '../../utils/util';

const { createPlugin }: typeof stylelint = stylelint;

const ruleName: string = 'slds/lwc-token-to-slds-hook';

const {
  severityLevel = 'error',
  warningMsg = '',
  errorMsg = '',
  ruleDesc = 'No description provided',
} = ruleMetadata(ruleName) || {};
// Define messages for reporting
const messages = stylelint.utils.ruleMessages(ruleName, {
  replaced: (oldValue: string, newValue: string) =>
    replacePlaceholders(errorMsg, { oldValue, newValue }),
  warning: (oldValue: string) => replacePlaceholders(warningMsg, { oldValue }),

  errorWithStyleHooks: (oldValue, newValue) =>
    `The '${oldValue}' design token is deprecated. To avoid breaking changes, replace it with the '${newValue}' styling hook and set the fallback to '${oldValue}'. For more info, see the New Global Styling Hook Guidance on lightningdesignsystem.com.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n`,
  errorWithNoRecommendation: (oldValue) =>
    `The '${oldValue}' design token is deprecated. For more info, see the New Global Styling Hook Guidance on lightningdesignsystem.com.`,
  errorWithRawValue: (oldValue, newValue) =>
    `The '${oldValue}' design token is deprecated. To avoid breaking changes, replace it with '${newValue}'. For more info, see the New Global Styling Hook Guidance on lightningdesignsystem.com.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n`,
});


function shouldIgnoreDetection(lwcToken: string) {
  // Ignore if entry not found in the list or the token is marked to use further
  return (
    !lwcToken.startsWith('--lwc-') ||
    !(lwcToken in lwcToSlds) ||
    lwcToSlds[lwcToken] === 'Continue to use'
  );
}

function getRecommendation(lwcToken: string, reportProps: any) {
  const oldValue = lwcToken;
  const recommendation = lwcToSlds[oldValue];
  const hasRecommendation = recommendation && recommendation !== '--';
  if (!hasRecommendation) {
    // Found a deprecated token but don't have any alternate recommendation then just report user to follow docs
    stylelint.utils.report({
      message: messages.errorWithNoRecommendation(oldValue),
      ...reportProps,
    });
    return;
  }
  return recommendation;
}

function isValueFixed(recommendation, decl, parsedValue) {
  // Skip if the value has already been fixed only if the recommendation starts with '--slds-'
  const isFixed = (newValue: string) =>
    newValue.startsWith('--slds-') &&
    (decl.value.includes(newValue) ||
      JSON.stringify(parsedValue).includes(newValue));

  // If there are multiple --slds- token recommendation for single --lwc we maintain recommendations as array
  let checkFixed = Array.isArray(recommendation)
    ? recommendation
    : [recommendation];
  return checkFixed.some(isFixed);
}

function detectRightSide(decl, basicReportProps, autoFixEnabled) {
  const parsedValue = valueParser(decl.value);
  // Usage on right side
  parsedValue.walk((node) => {
    if (node.type !== 'word' || !node.value.startsWith('--lwc-')) {
      return;
    }

    const oldValue = node.value;

    if (shouldIgnoreDetection(oldValue)) {
      // Ignore if entry not found in the list or the token is marked to use further
      return;
    }

    const startIndex = decl.toString().indexOf(decl.value);
    const endIndex = startIndex + decl.value.length;
    const reportProps = {
      index: startIndex,
      endIndex,
      ...basicReportProps,
    };

    const recommendation = getRecommendation(oldValue, reportProps);
    const hasRecommendation = recommendation && recommendation !== '--';

    if (!hasRecommendation) {
      return;
    }

    // Ignores if value already fixed with --slds token
    if (isValueFixed(recommendation, decl, parsedValue)) {
      return;
    }

    // Found recommendation, replace value
    let proposedFix = '';
    let canFix = true;
    let message;
    if (Array.isArray(recommendation)) {
      message = messages.errorWithStyleHooks(
        oldValue,
        recommendation.join(' or ')
      );
      canFix = false;
    } else if (recommendation.startsWith('--slds-')) {
      message = messages.errorWithStyleHooks(oldValue, recommendation);
      // add recommendation with fallback
      proposedFix = `var(${recommendation}, ${decl.value})`;
    } else {
      message = messages.errorWithRawValue(oldValue, recommendation);
      // for any raw values, color-mix, calc
      proposedFix = recommendation;
    }

    stylelint.utils.report({
      message,
      ...reportProps,
    });

    // Fix if the context allows
    if (autoFixEnabled && canFix) {
      decl.value = proposedFix;
    }
    
  });
}

function detectLeftSide(decl, basicReportProps, autoFixEnabled) {
  // Usage on left side
  const { prop } = decl;
  if (shouldIgnoreDetection(prop)) {
    return;
  }

  const startIndex = decl.toString().indexOf(prop);
  const endIndex = startIndex + prop.length;
  const reportProps = {
    index: startIndex,
    endIndex,
    ...basicReportProps,
  };
  const recommendation = getRecommendation(prop, reportProps);
  const hasRecommendation = recommendation && recommendation !== '--';

  if (!hasRecommendation) {
    return;
  }

  // Found recommendation, replace value
  const oldValue = prop;
  let canFix = false;
  let message;
  if (Array.isArray(recommendation)) {
    message = messages.errorWithStyleHooks(
      oldValue,
      recommendation.join(' or ')
    );
  } else if (recommendation.startsWith('--slds-')) {
    message = messages.errorWithStyleHooks(oldValue, recommendation);
    // add recommendation with fallback
    recommendation;
    canFix = true;
  } else {
    // for any raw values, color-mix, calc just recommend as deprecated
    message = messages.errorWithNoRecommendation(oldValue);
  }

  stylelint.utils.report({
    message,
    ...reportProps,
  });

  // Fix if the context allows
  if (autoFixEnabled && canFix) {
    decl.prop = recommendation;
  }
}

// Define the main rule logic
function rule(primaryOptions: boolean, {severity = severityLevel as RuleSeverity}={}) {
  return (root: Root, result: PostcssResult) => {
    
    const autoFixEnabled = result.stylelint.config.fix;
    root.walkDecls((node) => {
      const basicReportProps = {
        node,
        result,
        ruleName,
        severity,
      };
      detectRightSide(node, basicReportProps, autoFixEnabled);
      detectLeftSide(node, basicReportProps, autoFixEnabled);
    });
  };
}

// Export the plugin
export default createPlugin(ruleName, rule as unknown as Rule);
