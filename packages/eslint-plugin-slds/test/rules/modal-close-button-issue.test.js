const rule = require("./../../src/rules/modal-close-button-issue");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester({
  parser: require.resolve("@html-eslint/parser"), // Specify the parser for HTML files
});

ruleTester.run("slds-modal-button-issue", rule, {
  valid: [
    {
      code: `<button class="slds-button slds-button_icon slds-modal__close"></button>`,
    },
    {
      code: `<lightning-button-icon variant="bare" size="large" class="slds-button slds-button_icon"></lightning-button-icon>`,
    },
    {
      code: `<lightning-icon size="large"></lightning-icon>`,
    },
    {
        code: `<lightning-icon></lightning-icon>`
    },
    // Scenario 3.b: Do not remove variant attribute in lightning-icon if it is not in the <button>
    {
        code: `<lightning-icon variant="bare-inverse"></lightning-icon>`
    }
    
  ],

  invalid: [
    // Scenario 1: Remove slds-button_icon-inverse
    {
      code: `<button class="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse"></button>`,
      errors: [{ messageId: "removeClass", type: "Tag" }],
      output: `<button class="slds-button slds-button_icon slds-modal__close"></button>`,
    },

    // // Scenario 2: Fix variant in lightning-button-icon
    {
      code: `<lightning-button-icon variant="bare-inverse" class="slds-button slds-button_icon"></lightning-button-icon>`,
      errors: [{messageId: "ensureSizeAttribute"}, { messageId: "changeVariant" }],
      output: `<lightning-button-icon variant="bare" size="large" class="slds-button slds-button_icon"></lightning-button-icon>`,
    },

    // // Scenario 3: Remove variant attribute in lightning-icon
    {
      code: `<button><lightning-icon variant="bare-inverse"></lightning-icon></button>`,
      errors: [{ messageId: "ensureSizeAttribute", type: "Tag" }, { messageId: "changeVariant" }, { messageId: 'removeVariant'}],
      output: `<button><lightning-icon ></lightning-icon></button>`,
    }
  ]
});