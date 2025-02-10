// Import rulesMetadata directly instead of loading from a file
import rulesData from "./rules";

// Define the structure of the rules
interface Rule {
  name: string;
  severity: string;
  warningMsg: string;
  errorMsg: string;
  ruleDesc: string;
}

// Define a type for the rules object
type Rules = {
  [key: string]: Rule;
};

// Singleton class to manage rules
class RuleManager {
  private static instance: RuleManager;
  private rules: Rules;

  private constructor() {
    this.rules = rulesData; // Directly use imported rulesMetadata
  }

  // Method to get the singleton instance
  public static getInstance(): RuleManager {
    if (!RuleManager.instance) {
      RuleManager.instance = new RuleManager();
    }
    return RuleManager.instance;
  }

  // Utility functions to read values from the rules object
  public getSeverity(ruleKey: string): string | undefined {
    return this.rules[ruleKey]?.severity;
  }

  public getName(ruleKey: string): string | undefined {
    return this.rules[ruleKey]?.name;
  }

  public getWarningMsg(ruleKey: string): string | undefined {
    return this.rules[ruleKey]?.warningMsg;
  }

  public getErrorMsg(ruleKey: string): string | undefined {
    return this.rules[ruleKey]?.errorMsg;
  }

  public getRuleDesc(ruleKey: string): string | undefined {
    return this.rules[ruleKey]?.ruleDesc;
  }
}

// Function to get rule metadata
export default function ruleMetadata(ruleId: string) {
  const ruleManager = RuleManager.getInstance();
  return {
    name: ruleManager.getName(ruleId),
    severity: ruleManager.getSeverity(ruleId),
    warningMsg: ruleManager.getWarningMsg(ruleId),
    errorMsg: ruleManager.getErrorMsg(ruleId),
    ruleDesc: ruleManager.getRuleDesc(ruleId),
  };
}

// // Example usage
// const ruleManager = RuleManager.getInstance();

// console.log(ruleManager.getSeverity("enforce-bem-usage")); // ✅ Output: "error"
// console.log(ruleManager.getWarningMsg("no-hardcoded-values")); // ✅ Output: Corresponding warning message