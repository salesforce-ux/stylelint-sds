const fs = require("fs");
const path = require("path");
const { findAttr, isAttributesEmpty } = require("./utils/node");

console.log('Checking deprecated classes')
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
    // Load the JSON file containing deprecated classes
    const deprecatedClassesPath = path.resolve(
      context.getCwd(),
      "./public/metadata/deprecatedClasses.json"
    );

    console.log(`deprecatedClassesPath ${deprecatedClassesPath}`)

    let deprecatedClasses = [];
    try {
      const fileContent = fs.readFileSync(deprecatedClassesPath, "utf8");
      deprecatedClasses = JSON.parse(fileContent);
    } catch (error) {
      console.error(`Failed to load deprecated classes JSON: ${error.message}`);
      return {}; // Exit gracefully if JSON cannot be loaded
    }
    //console.log(`FileContent ${deprecatedClasses}`)
    function check(node) {
      if (isAttributesEmpty(node)) {
        return;
      }

      const classAttr = findAttr(node, "class");
      if (classAttr && classAttr.value) {
        const classNames = classAttr.value.value.split(/\s+/);
        console.log(`Checking deprecated class ${classNames}`)
        classNames.forEach((className) => {
          if (deprecatedClasses.includes(className)) {
            context.report({
              node,
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