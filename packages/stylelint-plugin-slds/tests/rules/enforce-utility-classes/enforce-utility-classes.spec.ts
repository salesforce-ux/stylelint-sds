import stylelint from 'stylelint';
import assert from 'assert';

const ruleName = 'slds/enforce-utility-classes';

//TODO: Kishore
describe('slds/enforce-utility-classes rule', () => {
  it('should report a message for properties that should use utility classes', async () => {
    const result = await stylelint.lint({
      files: './tests/providers/enforce-utility-classes.css',
      config: {
        plugins: ['./src/index.ts'],
        rules: {
          [ruleName]: true
        }
      }
    });

    const warnings = result.results[0].warnings;
    console.log(`--> ${JSON.stringify(warnings)}`)
    assert.strictEqual(warnings.length, 1);
    assert.strictEqual(warnings[0].text.includes(`Instead of declaring the property, consider placing a helper class on your element:\n".slds-is-visually-empty"`), true);
    
  });

  // it('should not report any warnings for selectors without matching properties', async () => {
  //   const css = `
  //     .foo {
  //       background-color: blue;
  //     }
  //     .bar {
  //       display: flex;
  //     }
  //   `;
    
  //   const result = await stylelint.lint({
  //     code: css,
  //     config: {
  //       rules: {
  //         [ruleName]: true
  //       }
  //     }
  //   });

  //   const warnings = result.results[0].warnings;
    
  //   assert.strictEqual(warnings.length, 0);
  // });

  // it('should only report properties that have a matching utility class', async () => {
  //   const css = `
  //     .foo {
  //       color: red;
  //     }
  //     .bar {
  //       margin-top: 10px;
  //     }
  //     .baz {
  //       padding: 20px;
  //     }
  //     .qux {
  //       font-size: 16px;
  //     }
  //   `;
    
  //   const result = await stylelint.lint({
  //     code: css,
  //     config: {
  //       rules: {
  //         [ruleName]: true
  //       }
  //     }
  //   });

  //   const warnings = result.results[0].warnings;
    
  //   assert.strictEqual(warnings.length, 3);
  //   assert.strictEqual(warnings[0].text.includes("Instead of declaring the property, consider placing a helper class on your element:"), true);
  //   assert.strictEqual(warnings[1].text.includes("Instead of declaring the property, consider placing a helper class on your element:"), true);
  //   assert.strictEqual(warnings[2].text.includes("Instead of declaring the property, consider placing a helper class on your element:"), true);
  // });

  //TODO:Kishore
//   it('should validate rule options correctly', () => {
//     const result = {
//       warnings: [],
//       errored: false,
//       results: []
//     };

//     const validOptions = {};
//     const invalidOptions = {
//       step: -0.125,
//       units: ['unknown-unit']
//     };

//     // Test valid options
//     assert.strictEqual(validateOptions(result, validOptions), true);

//     // Test invalid options
//     assert.strictEqual(validateOptions(result, invalidOptions), false);
//   });
});