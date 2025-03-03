import noDeprecatedSldsClasses from './no-deprecated-slds-classes';
import noUnsupportedHooksSlds2 from './no-unsupported-hooks-slds2';
import noHardcodedValuesSlds1 from './no-hardcoded-values-slds1';
import noImportantTag from './no-important-tag';
import noSldsClassOverrides from './no-slds-class-overrides';
import noSldsPrivateVar from './no-slds-private-var';
import lwcTokenToSldsHook from './lwc-token-to-slds-hook';
import noInvalidTokensClasses from './no-invalid-tokens-classes';
import enforceBemUsage from './enforce-bem-usage';
import noDeprecatedSLDS2Classes from './no-deprecated-slds2-classes';
import noCalcFunction from './no-calc-function';
import noHardcodedValuesSlds2 from './no-hardcoded-values-slds2';
import enforceSdsToSldsHooks from './enforce-sds-to-slds-hooks';
import reduceAnnotations from './reduce-annotations';
export default [
  enforceSdsToSldsHooks,
  noDeprecatedSldsClasses,
  noUnsupportedHooksSlds2,
  lwcTokenToSldsHook,
  noCalcFunction,
  noHardcodedValuesSlds1,
  noSldsClassOverrides,
  noHardcodedValuesSlds2,
  noDeprecatedSLDS2Classes,
  noInvalidTokensClasses,
  enforceBemUsage,
  noSldsPrivateVar,
  noImportantTag,
  reduceAnnotations
];
