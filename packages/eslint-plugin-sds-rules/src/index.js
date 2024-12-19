module.exports = {
    rules: {
        "no-bem-class": require("./rules/no-bem-class"),
        "no-deprecated-slds-classes": require("./rules/no-deprecated-slds-classes")
    },
    configs: {
        recommended: {
            parser: "@html-eslint/parser", // Use HTML parser
            plugins: ["sds-rules"],
            rules: {
                "sds-rules/no-bem-class": "error", // Enable rule
                "sds-rules/no-deprecated-slds-classes": "error"
            },
        },
    },
};