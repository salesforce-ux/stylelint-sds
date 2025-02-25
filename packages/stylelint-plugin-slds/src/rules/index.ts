import noDeprecatedSldsClasses from './no-deprecated-slds-classes';
import noDeprecatedSldsHooks from './no-deprecated-slds-hooks';
import noHardcodedValues from './no-hardcoded-values';
import noImportantTag from './no-important-tag';
import noSldsClassOverrides from './no-slds-class-overrides';
import noSldsPrivateVar from './no-slds-private-var';
import lwcToSldsToken from './lwc-to-slds-token';
import noInvalidTokensClasses from './no-invalid-tokens-classes';
import noCalcFunction from './no-calc-function';
import noHardcodedValuesSlds2 from './no-hardcoded-values-slds2';
import enforceSdsToSldsHooks from './enforce-sds-to-slds-hooks';
import reduceAnnotations from './reduce-annotations';
export default [
  enforceSdsToSldsHooks,
  noDeprecatedSldsClasses,
  noDeprecatedSldsHooks,
  lwcToSldsToken,
  noCalcFunction,
  noHardcodedValues,
  noSldsClassOverrides,
  noHardcodedValuesSlds2,
  noInvalidTokensClasses,
  noSldsPrivateVar,
  noImportantTag,
  reduceAnnotations
];
