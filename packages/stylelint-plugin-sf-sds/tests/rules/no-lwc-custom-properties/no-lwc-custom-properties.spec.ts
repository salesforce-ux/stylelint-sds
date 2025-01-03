import stylelint from 'stylelint';
import fs from 'fs';
import path from 'path';
import { Root } from 'postcss';
import assert from 'assert';
import { createPlugin } from 'stylelint';
import { resolve } from 'path';

const ruleName = 'sf-sds/no-lwc-custom-properties'
describe('sf-sds/no-lwc-custom-properties rule', () => {
  it('should report an error when --lwc custom properties are used', async () => {
    const css = `
      .foo {
        --lwc-color: red;
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
    assert.strictEqual(warnings[0].text, 'Unexpected "--lwc custom property" within selector "--lwc-color". Replace with "slds" or "dxp" equivalents. See https://github.com/salesforce-ux/stylelint-sds/blob/main/packages/stylelint-rules/src/rules/no-lwc-custom-properties/README.md (sf-sds/no-lwc-custom-properties)');
    assert.strictEqual(warnings[0].line, 3);
    assert.strictEqual(warnings[0].column, 9);
  });

  it('should not report an error when non --lwc custom properties are used', async () => {
    const css = `
      .foo {
        --slds-color: red;
        --dxp-font-size: 14px;
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

  it('should report an error for each --lwc custom property used', async () => {
    const css = `
      .foo {
        --lwc-color: red;
        --lwc-font-size: 16px;
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
    
    assert.strictEqual(warnings.length, 2);
    assert.strictEqual(warnings[0].text, 'Unexpected "--lwc custom property" within selector "--lwc-color". Replace with "slds" or "dxp" equivalents. See https://github.com/salesforce-ux/stylelint-sds/blob/main/packages/stylelint-rules/src/rules/no-lwc-custom-properties/README.md (sf-sds/no-lwc-custom-properties)');
    assert.strictEqual(warnings[1].text, 'Unexpected "--lwc custom property" within selector "--lwc-font-size". Replace with "slds" or "dxp" equivalents. See https://github.com/salesforce-ux/stylelint-sds/blob/main/packages/stylelint-rules/src/rules/no-lwc-custom-properties/README.md (sf-sds/no-lwc-custom-properties)');
  });
});