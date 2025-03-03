import { findAttr, isAttributesEmpty } from "./utils/node";

// This rule specific to CVS, find more details here https://issues.salesforce.com/issue/a028c00000zh1iqAAA/modal-close-button-is-not-visible-with-the-new-white-background-after-winter-25-release
export = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Ensure SLDS modal compliance by enforcing correct button and icon attributes.",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      removeClass:
        "Remove the  slds-button_icon-inverse class from the modal close button in components that use the SLDS modal blueprint.",
      changeVariant:
        "Change the variant attribute value from bare-inverse to bare in <lightning-button-icon> or <lightning-icon>.",
      removeVariant:
        "Remove the variant attribute from the <lightning-icon> component  inside the <button> element.",
      ensureButtonClasses:
        "Add or move slds-button and slds-button_icon to the class attribute of the <button> element or <lightning-button-icon> component.",
      ensureSizeAttribute:
        "To size icons properly, set the size attribute ‌to large in the <lightning-icon> and <lightning-button-icon> components.",
    },
  },

  create(context) {
    function check(node) {
      if (isAttributesEmpty(node)) {
        return;
      }

      const tagName = node.name;

      // ✅ Scenario 1: Remove 'slds-button_icon-inverse' from <button> 
      // (optional) when the parent of the button has class name `slds-modal`
      // and also button should have class `slds-modal__close`
      if (tagName === "button") {
        const classAttr = findAttr(node, "class");
        if (classAttr && classAttr.value) {
          const classList = classAttr.value.value.split(/\s+/);

          // ✅ Ensure button has "slds-modal__close" before proceeding
          if (!classList.includes("slds-modal__close")) {
            return; // Stop execution if the class is missing
          }

          if (classList.includes("slds-button_icon-inverse")) {
            context.report({
              node,
              messageId: "removeClass",
              fix(fixer) {
                const newClassList = classList
                  .filter((cls) => cls !== "slds-button_icon-inverse")
                  .join(" ");
                return fixer.replaceText(
                  classAttr, // Replace the full attribute
                  `class="${newClassList}"` // Updated class list
                );
              },
            });
          }
        }
      }

      // ✅ Scenario 2: Fix <lightning-button-icon> and this should have class `slds-modal__close`
      if (tagName === "lightning-button-icon" || tagName === "lightning:buttonIcon") {
        const variantAttr = findAttr(node, "variant");
        const sizeAttr = findAttr(node, "size");
        const classAttr = findAttr(node, "class");

        if (classAttr && classAttr.value) {
          const classList = classAttr.value.value.split(/\s+/);

          // ✅ Ensure button has "slds-modal__close" before proceeding
          if (!classList.includes("slds-modal__close")) {
            return; // Stop execution if the class is missing
          }

          // Fix variant="bare-inverse" to "bare"
          if (variantAttr && variantAttr.value && variantAttr.value.value === "bare-inverse") {
            context.report({
              node: variantAttr,
              messageId: "changeVariant",
              fix(fixer) {
                return fixer.replaceText(variantAttr.value, `bare`);
              },
            });
          }

          // Ensure size="large" exists
          if (!sizeAttr) {
            context.report({
              node,
              messageId: "ensureSizeAttribute",
              fix(fixer) {
                //return fixer.insertTextAfter(node, ' size="large"');
                if(variantAttr)
                {
                  return fixer.insertTextAfterRange([variantAttr?.range[1], variantAttr?.range[1]], ' size="large"')
                }
              },
            });
          }

          // Ensure 'slds-button' and 'slds-button_icon' are in the class attribute 
          if (classAttr && classAttr.value) {
            const classList = classAttr.value.value.split(/\s+/);
            if (!classList.includes("slds-button") || !classList.includes("slds-button_icon")) {
              context.report({
                node: classAttr,
                messageId: "ensureButtonClasses",
                fix(fixer) {
                  const newClassList = [
                    "slds-button",
                    "slds-button_icon",
                    ...classList.filter(
                      (cls) => cls !== "slds-button_icon-inverse"
                    ),
                  ].join(" ");
                  return fixer.replaceText(classAttr.value, `"${newClassList}"`);
                },
              });
            }
          }
        }

      }

      // ✅ Scenario 3: Fix <lightning-icon> inside <button> & the class name of the parent name as button and it should have `slds-modal__close`
      if ((tagName === "lightning-icon" || tagName === "lightning:icon") && node.parent?.name === "button") {
        const parentClassAttr = findAttr(node.parent, "class");
        if (parentClassAttr && parentClassAttr.value) {
          const parentClassList = parentClassAttr.value.value.split(/\s+/);

          // ✅ Ensure the parent <button> has "slds-modal__close" before proceeding
          if (!parentClassList.includes("slds-modal__close")) {
            return; // Stop execution if the class is missing
          }
          const variantAttr = findAttr(node, "variant");
          const sizeAttr = findAttr(node, "size");

          // Fix variant="bare-inverse" to "bare"
          if (variantAttr && variantAttr.value && variantAttr.value.value === "bare-inverse") {
            context.report({
              node: variantAttr,
              messageId: "changeVariant",
              fix(fixer) {
                return fixer.replaceText(variantAttr.value, `"bare"`);
              },
            });
          }

          // Remove variant attribute completely
          if (variantAttr) {
            context.report({
              node: variantAttr,
              messageId: "removeVariant",
              fix(fixer) {
                return fixer.remove(variantAttr);
              },
            });
          }

          //Ensure size="large" is set
          if (!sizeAttr) {
            context.report({
              node,
              messageId: "ensureSizeAttribute",
              fix(fixer) {
                //return fixer.insertTextAfter(node, ' size="large"');
                if(variantAttr)
                {
                  return fixer.insertTextAfterRange([variantAttr.range[1], variantAttr.range[1]], 'size="large"')
                }
              },
            });
          }
        }
      }
    }
    return {
      Tag: check,
    };
  },
};