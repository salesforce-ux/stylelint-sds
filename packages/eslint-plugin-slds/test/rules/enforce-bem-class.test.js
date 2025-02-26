const { RuleTester } = require("eslint"); // Import RuleTester
const rule = require("../../src/rules/enforce-bem-class"); // Import the rule

const ruleTester = new RuleTester({
  parser: require.resolve("@html-eslint/parser"), // Specify the parser for HTML files
});

ruleTester.run("enforce-bem-class", rule, {
  valid: [
    {
      code: `<div class="block__element--modifier"></div>`, // Valid BEM class name
    },
    {
      code: `<div class="block block__element block__element--modifier"></div>`, // Multiple valid BEM class names
    },
    {
      code: `<div class="header__logo header__logo--small"></div>`, // Another valid BEM example
    },
    {
      code: `<div></div>`, // No class attribute
    },
  ],
  invalid: [
    {
      code: `<div class="block__element_modifier"></div>`, // Invalid: underscore instead of double underscore
      errors: [
        {
          message: "The class 'block__element_modifier' does not follow BEM naming convention.",
          line: 1,
          column: 13,
        },
      ],
      //output: `<div class="block__element--modifier"></div>`, // Expected fix (if mapping exists)
    },
    {
      code: `<div class="Block--modifier"></div>`, // Invalid: Uppercase letters
      errors: [
        {
          message: "The class 'Block--modifier' does not follow BEM naming convention.",
          line: 1,
          column: 13,
        },
      ],
      //output: `<div class="block--modifier"></div>`, // Expected fix (converted to lowercase)
    },
    {
      code: `<div class="block__element--"></div>`, // Invalid: Ends with `--`
      errors: [
        {
          message: "The class 'block__element--' does not follow BEM naming convention.",
          line: 1,
          column: 13,
        },
      ],
      //output: `<div class="block__element"></div>`, // Expected fix (removes trailing `--`)
    },
    {
      code: `<div class="block block_element slds-border_left"></div>`, // Invalid: `block_element` not in BEM
      errors: [
        {
          message: "The class 'block_element' does not follow BEM naming convention.",
          line: 1,
          column: 19,
        },
        {
          message: "The class 'slds-border_left' does not follow BEM naming convention.",
          line: 1,
          column: 33,
        }
      ],
      output: `<div class="block block_element slds-border--left"></div>`, // Expected fix (replaces `block_element`)
    },
    {
      code: `<div class="slds-p-right_xxx-small"></div>`, // Invalid: Missing block name
      errors: [
        {
          message: "The class 'slds-p-right_xxx-small' does not follow BEM naming convention.",
          line: 1,
          column: 13,
        },
      ],
      output: `<div class="slds-p-right--xxx-small"></div>`, // Expected fix (if mapping exists)
    },
  ],
});