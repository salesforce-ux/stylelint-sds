import stylelint from 'stylelint';
import path from 'path';
import assert from 'assert';

const ruleName = 'sf-sds/no-sds-custom-properties';
const { utils } = stylelint;

describe('sf-sds/no-sds-custom-properties rule', () => {
  it('should report an error when --sds custom properties are used', async () => {
    const css = `
      .foo {
        --sds-color: red;
      }
    `;

    const result = await stylelint.lint({
      code: css,
      config: {
        plugins: ['./src/index.ts'],
        rules: {
          [ruleName]: true
        }
      }
    });

    const warnings = result.results[0].warnings;
    
    assert.strictEqual(warnings.length, 1);
    assert.strictEqual(warnings[0].text, `'--sds-color' is currently deprecated in the new design for Lightning UI. (sf-sds/no-sds-custom-properties)`);
  });

  it('should not report an error when non --sds custom properties are used', async () => {
    const css = `
      .foo {
        --dxp-color: red;
      }
    `;
    
    const result = await stylelint.lint({
      code: css,
      config: {
        plugins: ['./src/index.ts'],
        rules: {
          [ruleName]: true
        }
      }
    });

    const warnings = result.results[0].warnings;
    
    assert.strictEqual(warnings.length, 0);
  });

  it('should report an error for each --sds custom property used', async () => {
    const css = `
      .foo {
        --sds-font-size: 16px;
      }
    `;
    
    const result = await stylelint.lint({
      code: css,
      config: {
        plugins: ['./src/index.ts'],
        rules: {
          [ruleName]: true
        }
      }
    });

    const warnings = result.results[0].warnings;
    
    assert.strictEqual(warnings.length, 1);
    assert.strictEqual(warnings[0].text, `'--sds-font-size' is currently deprecated in the new design for Lightning UI. (sf-sds/no-sds-custom-properties)`);
  });
});