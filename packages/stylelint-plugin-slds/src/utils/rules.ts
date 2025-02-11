const rulesMetadata = {
  'slds/enforce-bem-usage': {
    name: 'slds/enforce-bem-usage',
    severityLevel: 'warning',
    warningMsg:
      "Consider updating '${oldValue}' to new naming convention '${newValue}'",
    errorMsg:
      "Consider updating '${oldValue}' to new naming convention '${newValue}'",
    ruleDesc: 'Bem rule',
  },
  'slds/no-hardcoded-values': {
    name: 'slds/no-hardcoded-values',
    severityLevel: 'warning',
    warningMsg:
      'Replace the "${color}" value with any styling hook mentioned below "${closestHook}" instead.',
    errorMsg:
      'Replace the "${color}" value with any styling hook mentioned below "${closestHook}" instead.',
    ruleDesc: 'LWC to SLDS',
  },
  'slds/no-slds-private-var': {
    name: 'slds/no-slds-private-var',
    severityLevel: 'warning',
    warningMsg:
      'Unexpected \'--_slds- private variable usage\' within selector "${prop}".',
    errorMsg:
      'Unexpected \'--_slds- private variable usage\' within selector "${prop}".',
    ruleDesc: '',
  },
  'slds/unit-step': {
    name: 'slds/unit-step',
    severityLevel: 'warning',
    warningMsg: '',
    errorMsg: '',
    ruleDesc: '',
  },
  'slds/no-slds-class-overrides': {
    name: 'slds/no-slds-class-overrides',
    severityLevel: 'warning',
    warningMsg:
      'Instead of overriding styles of the SLDS class "${selector}" replace "${selector}" with a custom class and update your markup.',
    errorMsg:
      'Instead of overriding styles of the SLDS class "${selector}" replace "${selector}" with a custom class and update your markup.',
    ruleDesc: '',
  },
  'slds/no-sds-custom-properties': {
    name: 'slds/no-sds-custom-properties',
    severityLevel: 'warning',
    warningMsg:
      '"${prop}" is currently deprecated in the new design for Lightning UI.',
    errorMsg:
      '"${prop}" is currently deprecated in the new design for Lightning UI.',
    ruleDesc: '',
  },
  'slds/no-lwc-custom-properties': {
    name: 'slds/no-lwc-custom-properties',
    severityLevel: 'warning',
    warningMsg:
      'Unexpected "--lwc custom property" within selector "${prop}". Replace with "slds" or "dxp" equivalents. See https://github.com/salesforce-ux/stylelint-sds/blob/main/packages/stylelint-plugin-slds/src/rules/no-lwc-custom-properties/README.md',
    errorMsg:
      'Unexpected "--lwc custom property" within selector "${prop}". Replace with "slds" or "dxp" equivalents. See https://github.com/salesforce-ux/stylelint-sds/blob/main/packages/stylelint-plugin-slds/src/rules/no-lwc-custom-properties/README.md',
    ruleDesc: '',
  },
  'slds/no-important-tag': {
    name: 'slds/no-important-tag',
    severityLevel: 'warning',
    warningMsg: "Avoid using '!important' unless absolutely necessary.",
    errorMsg: "Avoid using '!important' unless absolutely necessary.",
    ruleDesc: '',
  },
  'slds/no-hardcoded-values-slds2': {
    name: 'slds/no-hardcoded-values-slds2',
    severityLevel: 'warning',
    warningMsg:
      'Replace the "${color}" value with any styling hook mentioned below "${closestHook}" instead.',
    errorMsg:
      'Replace the "${color}" value with any styling hook mentioned below "${closestHook}" instead.',
    ruleDesc: '',
  },
  'slds/no-deprecated-slds2-classes': {
    name: 'slds/no-deprecated-slds2-classes',
    severityLevel: 'warning',
    warningMsg:
      'Selector: "${selector}" is no longer available in SLDS2. Please update to a supported selector.',
    errorMsg:
      'Selector: "${selector}" is no longer available in SLDS2. Please update to a supported selector.',
    ruleDesc: '',
  },
  'slds/no-deprecated-slds-hooks': {
    name: 'slds/no-deprecated-slds-hooks',
    severityLevel: 'warning',
    warningMsg:
      'The hook "${token}" is deprecated and will not work in SLDS2. Please remove or replace it.',
    errorMsg: 'Replace deprecated hook "${oldToken}" with "${newToken}"',
    ruleDesc: '',
  },
  'slds/no-deprecated-slds-classes': {
    name: 'slds/no-deprecated-slds-classes',
    severityLevel: 'warning',
    warningMsg:
      'The class "${className}" is deprecated and not available in SLDS2. Please update to a supported class.',
    errorMsg:
      'The class "${className}" is deprecated and not available in SLDS2. Please update to a supported class.',
    ruleDesc: '',
  },
  'slds/do-not-use-calc-function': {
    name: 'slds/do-not-use-calc-function',
    severityLevel: 'warning',
    warningMsg:
      'The use of "calc()" in the property "${property}" is not allowed.',
    errorMsg:
      'The use of "calc()" in the property "${property}" is not allowed.',
    ruleDesc: '',
  },
  'slds/no-aura-tokens': {
    name: 'slds/no-aura-tokens',
    severityLevel: 'warning',
    warningMsg:
      'Aura tokens are deprecated. Please migrate to SLDS Design Tokens.',
    errorMsg:
      "The '${oldValue}' design token is deprecated. To avoid breaking changes, replace it with '${newValue}' styling hook. Set the fallback to '${oldValue}'. See the New Global Styling Hooks Guidance on lightningdesignsystem.com for more info.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n",
    ruleDesc: '',
  },
  'slds/lwc-to-slds-token': {
    name: 'slds/lwc-to-slds-token',
    severityLevel: 'warning',
    warningMsg: "The '${oldValue}' is currently deprecated.",
    errorMsg:
      "The '${oldValue}' design token is deprecated. To avoid breaking changes, replace it with the '${newValue}' styling hook and set the fallback to '${oldValue}'. For more info, see the New Global Styling Hook Guidance on lightningdesignsystem.com.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n",
    ruleDesc: '',
  },
  'slds/enforce-utility-classes': {
    name: 'slds/enforce-utility-classes',
    severityLevel: 'warning',
    warningMsg:
      'Instead of declaring the property, consider placing a helper class on your element:\n${table}',
    errorMsg:
      'Instead of declaring the property, consider placing a helper class on your element:\n${table}',
    ruleDesc: '',
  },
  'slds/enforce-sds-to-slds-hooks': {
    name: 'slds/enforce-sds-to-slds-hooks',
    severityLevel: 'warning',
    warningMsg:
      'The "${fullMatch}" styling hook is replaced by "${suggestedMatch}.',
    errorMsg:
      'The "${fullMatch}" styling hook is replaced by "${suggestedMatch}.',
    ruleDesc: '',
  },
} as const; // Ensures it's a readonly object

export default rulesMetadata;
