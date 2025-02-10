const rulesMetadata = {
  "enforce-bem-usage": {
    "name": "slds/enforce-bem-usage",
    "severity": "warning",
    "warningMsg": "Consider updating '${oldValue}' to new naming convention '${newValue}'",
    "errorMsg": "Consider updating '${oldValue}' to new naming convention '${newValue}'",
    "ruleDesc": "Bem rule"
  },
  "no-hardcoded-values": {
    "name": "slds/no-hardcoded-values",
    "severity": "error",
    "warningMsg": "Replace the \"${color}\" value with any styling hook mentioned below \"${closestHook}\" instead.",
    "errorMsg": "Replace the \"${color}\" value with any styling hook mentioned below \"${closestHook}\" instead.",
    "ruleDesc": "LWC to SLDS"
  }
} as const; // Ensures it's a readonly object

export default rulesMetadata;