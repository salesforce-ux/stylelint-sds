import noDeprecatedSldsClasses from './no-deprecated-slds-classes';
import noDeprecatedSldsHooks from './no-deprecated-slds-hooks';
import noHardcodedValues from './no-hardcoded-values';
import noImportantTag from './no-important-tag';
import noLwcCustomProperties from './no-lwc-custom-properties';
import noSdsCustomProperties from './no-sds-custom-properties';
import noSldsClassOverrides from './no-slds-class-overrides';
import noSldsPrivateVar from './no-slds-private-var';
import enforceUtilityClasses from './enforce-utility-classes';
import lwcToSldsToken from './lwc-to-slds-token';
import noInvalidTokensClasses from './no-invalid-tokens-classes';
import enforceBemUsage from './enforce-bem-usage';
import noDeprecatedSLDS2Classes from './no-deprecated-slds2-classes';
import noCalcFunction from './no-calc-function';
import noHardcodedValuesSlds2 from './no-hardcoded-values-slds2';
import enforceSdsToSldsHooks from './enforce-sds-to-slds-hooks';
import enforceWcagRules from './enforce-wcag-rules';
import reduceAnnotations from './reduce-annotations';
export default [
  enforceSdsToSldsHooks,
  noDeprecatedSldsClasses,
  noDeprecatedSldsHooks,
  lwcToSldsToken,
  noCalcFunction,
  noHardcodedValues,
  noLwcCustomProperties,
  noSdsCustomProperties,
  noSldsClassOverrides,
  enforceUtilityClasses,
  noHardcodedValuesSlds2,
  noDeprecatedSLDS2Classes,
  noInvalidTokensClasses,
  enforceBemUsage,
  noSldsPrivateVar,
  noImportantTag,
  enforceWcagRules,
  reduceAnnotations
];
