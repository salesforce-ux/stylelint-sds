module.exports = {
    rules: {
        "no-bem-class": require("./rules/no-bem-class"),
        "no-deprecated-slds-classes": require("./rules/no-deprecated-slds-classes"),
        "modal-close-button-issue": require('./rules/modal-close-button-issue')
    },
    configs: {
        recommended: {
            parser: "@html-eslint/parser", // Use HTML parser
            plugins: ["slds"],  
            rules: {
                "slds/no-bem-class": "error", 
                "slds/no-deprecated-slds-classes": "error",
                "slds/modal-close-button-issue": "error"
            },
        },
    },
};