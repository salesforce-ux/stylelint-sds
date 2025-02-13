const rulesMetadata = {
  // CHECKED
  'slds/enforce-bem-usage': {
    name: 'slds/enforce-bem-usage', // BEM - Double Dash to BEM Notation
    severityLevel: 'warning',
    warningMsg:
      'Consider updating "${oldValue}" to new naming convention "${newValue}"',
    errorMsg:
      'Consider updating "${oldValue}" to new naming convention "${newValue}"',
    ruleDesc: 'Please replace double dashes syntax with equivalent BEM syntax',
  },

  // Checked
  'slds/no-hardcoded-values': {
    name: 'slds/no-hardcoded-values', //DESIGN_TOKEN - Design Token
    severityLevel: 'warning',
    warningMsg:
      'Consider replacing the static value for "${color}" with a design token: ${closestHook}',
    errorMsg:
      'Consider replacing the static value for "${color}" with a design token: ${closestHook}',
    ruleDesc: 'Please consider using Design Token instead of static value',
  },
  'slds/no-hardcoded-values-slds2': {
    name: 'slds/no-hardcoded-values-slds2',
    severityLevel: 'warning',
    warningMsg:
      'Replace the "${color}" value with any styling hook mentioned below "${closestHook}" instead.',
    errorMsg:
      'Replace the "${color}" value with any styling hook mentioned below "${closestHook}" instead.',
    ruleDesc: 'Please consider using Design Token instead of static value'
  },


  // CHECKED
  'slds/no-slds-class-overrides': { //OVERRIDE -- SLDS Classes Override
    name: 'slds/no-slds-class-overrides', 
    severityLevel: 'warning',
    warningMsg:
      'Overriding  "${selector}" isn’t supported. To differentiate SLDS and custom classes, create a CSS class in your namespace. Examples: myapp-input, myapp-button',
    errorMsg:
      'Overriding  "${selector}" isn’t supported. To differentiate SLDS and custom classes, create a CSS class in your namespace. Examples: myapp-input, myapp-button',
    ruleDesc: 'Please creates a new CSS Class instead of overriding SLDS definition'
  },

  

  // CHECKED --- TODO:Kishore do we still need this?
  'slds/no-aura-tokens': {   
    name: 'slds/no-aura-tokens',
    severityLevel: 'warning',
    warningMsg:
      "Consider removing '${oldValue}', or updating to a design token with a corresponding value. To avoid breaking changes, replace it with '${newValue}' styling hook. Set the fallback to 't(colorTextBrowser)'. For more info, read Design Tokens on lightningdesignsystem.com.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n",
    errorMsg:
      "Consider removing '${oldValue}', or updating to a design token with a corresponding value. To avoid breaking changes, replace it with '${newValue}' styling hook. Set the fallback to 't(colorTextBrowser)'. For more info, read Design Tokens on lightningdesignsystem.com.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n",
    ruleDesc: 'Please update to a design token or class with corresponding value'
  },

  // Do we need this?  // this is covered in invalid/deprecated/wcag rules.
  'slds/lwc-to-slds-token': {
    name: 'slds/lwc-to-slds-token',
    severityLevel: 'warning',
    warningMsg: "The '${oldValue}' is currently deprecated.",
    errorMsg:
      "The '${oldValue}' design token is deprecated. To avoid breaking changes, replace it with the '${newValue}' styling hook and set the fallback to '${oldValue}'. For more info, see the New Global Styling Hook Guidance on lightningdesignsystem.com.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n",
    ruleDesc: 'Replace deprecated --lwc tokens with the latest sdls tokens.',
  },
  'slds/enforce-utility-classes': {
    name: 'slds/enforce-utility-classes',// UTILITY_CLASS
    severityLevel: 'warning',
    warningMsg:
      'Instead of declaring the property, consider placing a helper class on your element:\n${table}',
    errorMsg:
      'Instead of declaring the property, consider placing a helper class on your element:\n${table}',
    ruleDesc: 'Instead of custom css declaration, consider leveraging SLDS classes',
  },
  
  // Needs CX review
  'slds/enforce-sds-to-slds-hooks': {
    name: 'slds/enforce-sds-to-slds-hooks',
    severityLevel: 'warning',
    warningMsg:
      'The "${fullMatch}" styling hook is replaced by "${suggestedMatch}".',
    errorMsg:
      'The "${fullMatch}" styling hook is replaced by "${suggestedMatch}".',
    ruleDesc: 'Convert --sds to --slds hooks as much as possible',
  },
  // Needs CX review
  'slds/no-deprecated-slds2-classes': {
    name: 'slds/no-deprecated-slds2-classes',
    severityLevel: 'warning',
    warningMsg:
      'Selector: "${selector}" is no longer available in SLDS2. Please update to a supported selector.',
    errorMsg:
      'Selector: "${selector}" is no longer available in SLDS2. Please update to a supported selector.',
    ruleDesc: 'We’ve found code that’s not currently compatible with the new design for Lightning UI.',
  },

  // New rules
  'slds/no-invalid-tokens': { // INVALID -- Invalid Token and Class (WARNING)
    name: 'slds/no-invalid-tokens',
    severityLevel: 'error',
    warningMsg:
      "Consider removing '${oldValue}', or updating to a design token with a corresponding value. To avoid breaking changes, replace it with '${newValue}' styling hook. Set the fallback to 't(colorTextBrowser)'. For more info, read Design Tokens on lightningdesignsystem.com.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n",
    errorMsg:
      "Consider removing '${oldValue}', or updating to a design token with a corresponding value. To avoid breaking changes, replace it with '${newValue}' styling hook. Set the fallback to 't(colorTextBrowser)'. For more info, read Design Tokens on lightningdesignsystem.com.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n",
    ruleDesc: 'Please update to a design token or class with corresponding value',
  },
  'slds/enforce-wcag-rules': {
    name: 'slds/enforce-wcag-rules',
    severityLevel: 'warning',
    warningMsg:
      'Consider replacing "${oldValue}" with a similar color "${newValue}" styling hook to provide better color contrast',
    errorMsg:
      'Consider replacing "${oldValue}" with a similar color "${newValue}" styling hook to provide better color contrast',
    ruleDesc: 'Please evaluate if using styling hook provides better color contrast experience',
  },
  'slds/no-annotation-rule': {
    name: 'slds/no-annotation-rule',
    severityLevel: 'warning',
    warningMsg:
      'Consider filing a new issue on our salesforce-ux/design-system open source GitHub repo to address your use case.',
    errorMsg:
      'Consider filing a new issue on our salesforce-ux/design-system open source GitHub repo to address your use case.',
    ruleDesc: 'Please visit your annotations to determine if they are necessary',
  },


  // Do We need these rules??
  'slds/no-important-tag': {
    name: 'slds/no-important-tag',
    severityLevel: 'warning',
    warningMsg: "Avoid using '!important' unless absolutely necessary.",
    errorMsg: "Avoid using '!important' unless absolutely necessary.",
    ruleDesc: "Avoid using '!important' unless absolutely necessary.",
  },
  'slds/no-slds-private-var': {
    name: 'slds/no-slds-private-var',
    severityLevel: 'warning',
    warningMsg:
      'Unexpected \'--_slds- private variable usage\' within selector "${prop}".',
    errorMsg:
      'Unexpected \'--_slds- private variable usage\' within selector "${prop}".',
    ruleDesc: 'Do not use \--_slds- private variable\'',
  },
  // NOT NEDED rule : disable mostly.
  'slds/unit-step': {
    name: 'slds/unit-step',
    severityLevel: 'warning',
    warningMsg: '',
    errorMsg: '',
    ruleDesc: 'Only use increment in units and not decimals.',
  },
  
  'slds/no-sds-custom-properties': {
    name: 'slds/no-sds-custom-properties',
    severityLevel: 'warning',
    warningMsg:
      '"${prop}" is currently deprecated in the new design for Lightning UI.',
    errorMsg:
      '"${prop}" is currently deprecated in the new design for Lightning UI.',
    ruleDesc: 'Do not use deprecated --sds custom properties.',
  },
  'slds/no-lwc-custom-properties': {
    name: 'slds/no-lwc-custom-properties',
    severityLevel: 'warning',
    warningMsg:
      'Unexpected "--lwc custom property" within selector "${prop}". Replace with "slds" or "dxp" equivalents. See https://github.com/salesforce-ux/stylelint-sds/blob/main/packages/stylelint-plugin-slds/src/rules/no-lwc-custom-properties/README.md',
    errorMsg:
      'Unexpected "--lwc custom property" within selector "${prop}". Replace with "slds" or "dxp" equivalents. See https://github.com/salesforce-ux/stylelint-sds/blob/main/packages/stylelint-plugin-slds/src/rules/no-lwc-custom-properties/README.md',
    ruleDesc: 'Do not use deprecated --lwc custom properties.',
  },
  'slds/no-deprecated-slds-hooks': {
    name: 'slds/no-deprecated-slds-hooks',
    severityLevel: 'warning',
    warningMsg:
      'The hook "${token}" is deprecated and will not work in SLDS2. Please remove or replace it.',
    errorMsg: 'Replace deprecated hook "${oldToken}" with "${newToken}"',
    ruleDesc: 'Please replace the deprecated hook with a modern equivalent',
  },
  'slds/no-deprecated-slds-classes': {
    name: 'slds/no-deprecated-slds-classes',
    severityLevel: 'warning',
    warningMsg:
      'The class "${className}" is deprecated and not available in SLDS2. Please update to a supported class.',
    errorMsg:
      'The class "${className}" is deprecated and not available in SLDS2. Please update to a supported class.',
    ruleDesc: 'Please replace the deprecated classes with a modern equivalent',
  },

  // Needs CX review
  'slds/do-not-use-calc-function': {
    name: 'slds/do-not-use-calc-function',
    severityLevel: 'warning',
    warningMsg:
      'The use of "calc()" in the property "${property}" is not allowed.',
    errorMsg:
      'The use of "calc()" in the property "${property}" is not allowed.',
    ruleDesc: 'Avoid using calc functions as much as possible.',
  }
} as const; // Ensures it's a readonly object

export default rulesMetadata;
