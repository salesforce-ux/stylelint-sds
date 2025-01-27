module.exports = {
    rules: {
        "no-bem-class": require("./rules/no-bem-class"),
        "no-deprecated-slds-classes": require("./rules/no-deprecated-slds-classes")
    },
    configs: {
        recommended: {
            parser: "@html-eslint/parser", // Use HTML parser
            plugins: ["slds"],  
            rules: {
                "slds/no-bem-class": "error", 
                "slds/no-deprecated-slds-classes": "error"
            },
        },
    },
};