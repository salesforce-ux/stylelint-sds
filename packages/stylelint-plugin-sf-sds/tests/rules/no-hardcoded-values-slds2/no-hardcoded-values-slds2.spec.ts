import { expect } from 'chai';
import stylelint, { LinterResult, LinterOptions } from 'stylelint';

const { lint }: typeof stylelint = stylelint;

describe('no-hardcoded-values-slds2', () => {
  const ruleName = 'sf-sds/no-hardcoded-values-slds2';

  const testCases = [
    {
      description:
        'Reports warning for hardcoded color value with replacement hook',
      inputCss: `
        .example {
          color: #ff0000;
        }
      `,
      expectedMessage:
        'Replace the "#ff0000" value with any styling hook mentioned below "\n1. --slds-g-color-border-error-2 \n" instead. (sf-sds/no-hardcoded-values-slds2)',
    },
    {
      description:
        'Reports warning for hardcoded font size with replacement hook',
      inputCss: `
        .example {
          font-size: 16px;
        }
      `,
      expectedMessage:
        'The "16px" static value has no replacement styling hook. (sf-sds/no-hardcoded-values-slds2)',
    },
    {
      description:
        'Suggests replacement for hardcoded color with no styling hook',
      inputCss: `
        .example {
          background-color: #123456;
        }
      `,
      expectedMessage:
        'Replace the "#123456" value with any styling hook mentioned below "\n1. --slds-g-color-surface-container-inverse-1',
    },
    {
      description:
        'Does not report for valid CSS property with hook replacement',
      inputCss: `
        .example {
          background-color: var(--color-brand);
        }
      `,
      expectedMessage: null, // No warning expected
    },
  ];

  testCases.forEach(({ description, inputCss, expectedMessage }, index) => {
    it(description, async () => {
      const linterResult: LinterResult = await lint({
        code: inputCss,
        config: {
          plugins: ['./src/index.ts'], // Adjust the plugin path if needed
          rules: {
            [ruleName]: true,
          },
        },
      } as LinterOptions);

      const messages = linterResult.results[0].warnings.map(
        (warning) => warning.text
      );

      if (expectedMessage) {
        expect(messages[0]).to.include(expectedMessage);
      } else {
        expect(messages).to.be.empty;
      }
    });
  });
});
