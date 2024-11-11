import fs from "fs/promises"; // Use promises to read the file asynchronously
import path from "path";
import stylelint, { PostcssResult } from "stylelint";
import generateTable from "../../utils/generateTable";
import { findClosestColorHook, convertToHex, isHardCodedColor } from './../../utils/color-lib-utils';
import AbstractStylelintRule from '../AbstractStylelintRule';
import { Root } from 'postcss';

// Define the structure of a hook
interface Hook {
  name: string;
  properties: string[];
}

// Define the structure of the color data
interface StylinghookData {
  [value: string]: {
    hooks: Hook[];
  };
}

const ruleName = "no-hardcoded-values";

const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (color: string, closestHook: string) =>
    `Avoid hardcoded color "${color}". Use the closest styling hook "${closestHook}" instead.`,
  suggested: (color: string) => `Replace hardcoded "${color}" with a suitable value`,
});

const isHardCodedDensifyValue = (cssValue: string): boolean => {
  // Regular expression to match number, number with px, or number with rem
  const regex = /^\d+(\.\d+)?(px|rem)?$/;
  return regex.test(cssValue);
}

// Load and parse the JSON file
const loadStylinghooksData = async (): Promise<StylinghookData> => {
  const jsonFilePath = new URL('./public/metadata/slds-plus/slds1-stylinghooks.json', import.meta.url).pathname;
  const jsonData = await fs.readFile(jsonFilePath, "utf8");
  return JSON.parse(jsonData) as StylinghookData; // Cast the parsed data to StylinghookData type
};

/**
 * Check if any of the hook properties match the provided cssProperty using wildcard matching.
 * @param hookProperties - Array of property patterns (can contain wildcards like `*`)
 * @param cssProperty - The CSS property to be checked
 * @returns true if a match is found, otherwise false
 */
function matchesCssProperty(hookProperties: string[], cssProperty: string): boolean {
  return hookProperties.some((propertyPattern: string) => {
    const regexPattern = new RegExp('^' + propertyPattern.replace(/\*/g, '.*') + '$');
    return regexPattern.test(cssProperty);
  });
}

const findExactMatchStylingHook = (
  cssValue: string,
  supportedStylinghooks: StylinghookData,
  cssProperty: string
): { name: string; }[] => {
  return Object.entries(supportedStylinghooks).reduce((acc, [sldsValue, data]) => {
    if (sldsValue && cssValue === sldsValue) {
      const hooks = data.hooks;

      hooks.forEach((hook) => {
        if (matchesCssProperty(hook.properties, cssProperty) && sldsValue === cssValue) {
          acc.push({ name: hook.name });
        }
      });
    }
    return acc;
  }, []);
}

// Define the rule itself
class NoHardcodedValuesRule extends AbstractStylelintRule {
  constructor() {
    super(ruleName);
  }

  protected validateOptions(result: PostcssResult, options: any): boolean {
    return stylelint.utils.validateOptions(result, this.ruleName, {
      actual: options,
      possible: {}, // Customize as needed
    });
  }

  protected rule(primaryOptions?: any) {
    return async (root: Root, result: PostcssResult) => {
      const supportedStylinghooks = await loadStylinghooksData(); // Await the loading of color data
      
      root.walkDecls((decl) => {
        const cssProperty = decl.prop.toLowerCase();
        const colorProperties = ["color", "fill", "background", "background-color", "stroke", "border-*-color", "outline-color"];
        const densificationProperties = ["font-size", "border*", "margin*", "padding*", "width", "height"];
        
        const value = decl.value;
        const index = decl.toString().indexOf(decl.value); // Start index of the value
        const endIndex = index + decl.value.length;

        // For color changes
        if (matchesCssProperty(colorProperties, cssProperty) && isHardCodedColor(value)) {
          const hexValue = convertToHex(value);
          if (hexValue) {
            const closestHooks = findClosestColorHook(hexValue, supportedStylinghooks, cssProperty);
            if (closestHooks.length > 0) {
              stylelint.utils.report({
                message: messages.rejected(value, generateTable(closestHooks)),
                node: decl,
                index,
                endIndex,
                result,
                ruleName: this.getRuleName(),
              });
            } else {
              stylelint.utils.report({
                message: messages.suggested(value),
                node: decl,
                index,
                endIndex,
                result,
                ruleName: this.getRuleName(),
              });
            }
          }
        } else if (matchesCssProperty(densificationProperties, cssProperty) && isHardCodedDensifyValue(value)) {
          const closestHooks = findExactMatchStylingHook(value, supportedStylinghooks, cssProperty);
          if (closestHooks.length > 0) {
            stylelint.utils.report({
              message: messages.rejected(value, generateTable(closestHooks)),
              node: decl,
              index,
              endIndex,
              result,
              ruleName: this.getRuleName(),
            });
          } else {
            stylelint.utils.report({
              message: messages.suggested(value),
              node: decl,
              index,
              endIndex,
              result,
              ruleName: this.getRuleName(),
            });
          }
        }
      });
    };
  }
}

// Export the rule using createPlugin
export default new NoHardcodedValuesRule().createPlugin();
//export { ruleName, messages, StylinghookData };