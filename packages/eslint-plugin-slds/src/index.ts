
export = {
    rules: {
        "enforce-bem-class": require('./rules/enforce-bem-class'),
        "no-deprecated-slds2-classes": require('./rules/no-deprecated-slds2-classes'),
        "modal-close-button-issue": require('./rules/modal-close-button-issue')
    },
    configs: {
        recommended: {
            parser: "@html-eslint/parser", // Use HTML parser
            plugins: ["slds"],  
            rules: {
                "slds/enforce-bem-class": "error", 
                "slds/no-deprecated-slds2-classes": "error",
                "slds/modal-close-button-issue": "error"
            },
        },
    },
};
