const rule = require("./../../src/rules/modal-close-button-issue");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester({
  parser: require.resolve("@html-eslint/parser"), // Specify the parser for HTML files
});

ruleTester.run("slds-modal-button-issue", rule, {
  valid: [
    // ✅ Scenario 1: Correctly formatted modal close button
    {
      code: `<button class="slds-button slds-button_icon slds-modal__close"></button>`,
    },
    // ✅ Scenario 2: Correct lightning-button-icon with proper attributes
    {
      code: `<lightning-button-icon variant="bare" size="large" class="slds-button slds-button_icon"></lightning-button-icon>`,
    },
    // ✅ Scenario 3: Correct lightning-icon usage
    {
      code: `<lightning-icon size="large"></lightning-icon>`,
    },
    {
      code: `<lightning-icon></lightning-icon>`,
    },
    // ✅ Scenario 4: lightning-icon with variant outside a modal close button should be valid
    {
      code: `<lightning-icon variant="bare-inverse"></lightning-icon>`,
    },
    // ✅ Scenario 5: lightning-icon inside a button, but button does NOT have slds-modal__close
    {
      code: `<button><lightning-icon variant="bare-inverse"></lightning-icon></button>`,
    },


    // Scenario 1: This case shouldn't remove the class as button doesn't have a class named slds-modal__close
    {
      code: `<button class="slds-button slds-button_icon slds-button_icon-inverse"></button>`,
    },
    { // Scenario 2: This case shouldn't remove the class as button doesn't have a class named slds-modal__close
      code: `<lightning-button-icon variant="bare-inverse" class="slds-button slds-button_icon"></lightning-button-icon>`
    }
  ],

  invalid: [
    // ❌ Scenario 1: Remove slds-button_icon-inverse from a modal close button
    {
      code: `<button class="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse"></button>`,
      errors: [{ messageId: "removeClass", type: "Tag" }],
      output: `<button class="slds-button slds-button_icon slds-modal__close"></button>`,
    },

    // ❌ Scenario 2: Fix variant="bare-inverse" and ensure size="large" in lightning-button-icon
    {
      code: `<lightning-button-icon variant="bare-inverse" class="slds-button slds-button_icon slds-modal__close"></lightning-button-icon>`,
      errors: [{ messageId: "ensureSizeAttribute" }, { messageId: "changeVariant" }],
      output: `<lightning-button-icon variant="bare" size="large" class="slds-button slds-button_icon slds-modal__close"></lightning-button-icon>`,
    },

    // ❌ Scenario 3: Remove variant attribute in lightning-icon, but only when its parent is a modal close button
    {
      code: `<button class="slds-button slds-modal__close"><lightning-icon variant="bare-inverse" size="medium"></lightning-icon></button>`,
      errors: [
        //{ messageId: "ensureSizeAttribute", type: "Tag" },
        { messageId: "changeVariant" },
        { messageId: "removeVariant" },
      ],
      output: `<button class="slds-button slds-modal__close"><lightning-icon  size="medium"></lightning-icon></button>`,
    },
    {
      code: `<button class="slds-button slds-modal__close"><lightning-icon variant="bare-inverse"></lightning-icon></button>`,
      errors: [
        { messageId: "ensureSizeAttribute", type: "Tag" },
        { messageId: "changeVariant" },
        { messageId: "removeVariant" },
      ],
      output: `<button class="slds-button slds-modal__close"><lightning-icon ></lightning-icon></button>`,
    },
  ],
});