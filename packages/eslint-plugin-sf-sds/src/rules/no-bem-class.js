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
            if (classAttr && classAttr.value) {
              const classNames = classAttr.value.value.split(/\s+/);
              classNames.forEach((className) => {
                  if (className && !checkNaming(className)) {

                      // Find the exact location of the problematic class name
                      const classNameStart = classAttr.value.value.indexOf(className) +7; // 7 here is for `class= "`
                      const classNameEnd = classNameStart + className.length;

                      // Use the loc property to get line and column from the class attribute
                      const startLoc = {
                          line: classAttr.loc.start.line,
                          column: classAttr.loc.start.column + classNameStart,
                      };
                      const endLoc = {
                          line: classAttr.loc.start.line,
                          column: classAttr.loc.start.column + classNameEnd,
                      };

                      context.report({
                          node,
                          loc: { start: startLoc, end: endLoc },
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