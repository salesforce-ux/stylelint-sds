const {
    findAttr,
    isAttributesEmpty,
    isExpressionInTemplate,
  } = require("./utils/node");

module.exports = {
    meta: {
      type: "problem", // The rule type
      docs: {
        description: "Enforce consistent class naming using BEM convention",
        category: "Stylistic Issues",
        recommended: true,
      },
      fixable: "code", // This rule can be fixed automatically
      schema: [
        {
          type: "object",
          properties: {
            pattern: { type: "string" }, // Regex pattern for BEM
            flags: { type: "string" }, // Regex flags
          },
          additionalProperties: false,
        },
      ],
      messages: {
        wrongClassName:
          "The class '{{actual}}' does not follow BEM naming convention.",
      },
    },
  
    create(context) {
      const pattern =
         /^(?:[a-z0-9]+(?:-[a-z0-9]+)*)(__[a-z0-9]+(?:-[a-z0-9]+)*)?(--[a-z0-9]+(?:-[a-z0-9]+)*)?$/;
        

        const checkNaming = (name) => { 
            
            return pattern.test(name) 
        }; 
        
        function check(node) {
            if (isAttributesEmpty(node)) {
              return;
            }
            const classAttr = findAttr(node, "class");
            if(classAttr && classAttr.value) {
                
                const classNames = classAttr.value.value.split(/\s+/);

                classNames.forEach((className) => {
                    
                    if (!checkNaming(className)) {
                        
                        context.report({
                            node,
                            data: {
                            actual: className,
                            },
                            messageId: "wrongClassName",
                        });
                    }
                });
            }
        }
      return {
        Tag: check,
      };
    },
  };