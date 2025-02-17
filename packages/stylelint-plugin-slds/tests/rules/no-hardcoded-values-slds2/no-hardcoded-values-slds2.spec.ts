import { expect } from 'chai';
import stylelint, { LinterResult, LinterOptions } from 'stylelint';

const { lint }: typeof stylelint = stylelint;

describe('no-hardcoded-values-slds2', () => {
  const ruleName = 'slds/no-hardcoded-values-slds2';

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
        'Consider replacing the static value for "#ff0000" with a design token: "--slds-g-color-on-error-2"'
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
        'Consider replacing the static value for "16px" with a design token: "--slds-g-font-scale-2"',
    },
    {
      description:
        'Suggests replacement for hardcoded color with no styling hook',
      inputCss: `
        .example {
          background-color: #123456;
        }
      `,
      expectedMessage:`Consider replacing the static value for \"#123456\" with a design token: "\n1. --slds-g-color-surface-inverse-1 \n2. --slds-g-color-surface-container-inverse-1 \n3. --slds-g-color-surface-inverse-2 \n4. --slds-g-color-surface-container-inverse-2 \n5. --slds-g-color-accent-container-1 \n" (slds/no-hardcoded-values-slds2)`,
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
      console.log(`-->> expectedMessage ${expectedMessage}`)
      console.log(`Whats coming ${messages[0]}`)

      if (expectedMessage) {
        expect(messages[0]).to.include(expectedMessage);
      } else {
        expect(messages).to.be.empty;
      }
    });
  });
});
