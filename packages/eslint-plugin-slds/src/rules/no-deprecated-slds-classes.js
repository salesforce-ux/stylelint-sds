const fs = require("fs");
const path = require("path");
const { findAttr, isAttributesEmpty } = require("./utils/node");

module.exports = {
  meta: {
    type: "problem", // The rule type
    docs: {
      description: "Disallow usage of deprecated CSS classes",
      category: "Best Practices",
      recommended: true,
    },
    schema: [], // No additional options needed
    messages: {
      deprecatedClass: "The class '{{className}}' is deprecated and should not be used.",
    },
  },

  create(context) {
    let deprecatedClassesPath = path.resolve(
      __dirname, 
      "./public/metadata/deprecatedClasses.json"
    );
    if(process.env.NODE_ENV === 'test')
    {
      // In case of testing, we grab the json from local folder.
      deprecatedClassesPath = path.resolve(
        __dirname, 
        "./../../public/metadata/deprecatedClasses.json"
      );
    }

    let deprecatedClasses = [];
    try {
      const fileContent = fs.readFileSync(deprecatedClassesPath, "utf8");
      deprecatedClasses = JSON.parse(fileContent);
    } catch (error) {
      console.error(`Failed to load deprecated classes JSON: ${error.message}`);
      return {}; // Exit gracefully if JSON cannot be loaded
    }

    function check(node) {
      if (isAttributesEmpty(node)) {
        return;
      }

      const classAttr = findAttr(node, "class");
      if (classAttr && classAttr.value) {
        const classNames = classAttr.value.value.split(/\s+/);
        classNames.forEach((className) => {
          if (className && deprecatedClasses.includes(className)) {
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
                className,
              },
              messageId: "deprecatedClass",
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