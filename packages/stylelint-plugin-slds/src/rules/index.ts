import noDeprecatedSldsClasses from './no-deprecated-slds-classes';
import noUnsupportedSlds2Hooks from './no-unsupported-slds2-hooks';
import noHardcodedSlds1Values from './no-hardcoded-slds1-values';
import noImportantTag from './no-important-tag';
import noSldsClassOverrides from './no-slds-class-overrides';
import noSldsPrivateVar from './no-slds-private-var';
import lwcTokenToSldsHook from './lwc-token-to-slds-hook';
import noDeprecatedTokenFunctionUsage from './no-deprecated-token-function-usage';
import enforceBemUsage from './enforce-bem-usage';
import noDeprecatedSLDS2Classes from './no-deprecated-slds2-classes';
import noCalcFunction from './no-calc-function';
import noHardcodedSlds2Values from './no-hardcoded-slds2-values';
import enforceSdsToSldsHooks from './enforce-sds-to-slds-hooks';
import reduceAnnotations from './reduce-annotations';
export default [
  enforceSdsToSldsHooks,
  noDeprecatedSldsClasses,
  noUnsupportedSlds2Hooks,
  lwcTokenToSldsHook,
  noCalcFunction,
  noHardcodedSlds1Values,
  noSldsClassOverrides,
  noHardcodedSlds2Values,
  noDeprecatedSLDS2Classes,
  noDeprecatedTokenFunctionUsage,
  enforceBemUsage,
  noSldsPrivateVar,
  noImportantTag,
  reduceAnnotations
];
