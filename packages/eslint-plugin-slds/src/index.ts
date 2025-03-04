
export = {
    rules: {
        "enforce-bem-class": require('./rules/enforce-bem-class'),
        "no-deprecated-classes-slds2": require('./rules/no-deprecated-classes-slds2'),
        "modal-close-button-issue": require('./rules/modal-close-button-issue')
    },
    configs: {
        recommended: {
            parser: "@html-eslint/parser", // Use HTML parser
            plugins: ["slds"],  
            rules: {
                "slds/enforce-bem-class": "error", 
                "slds/no-deprecated-classes-slds2": "error",
                "slds/modal-close-button-issue": "error"
            },
        },
    },
};
