import { expect } from 'chai';
import stylelint, { LinterResult, LinterOptions } from 'stylelint';

const { lint }: typeof stylelint = stylelint;

describe('slds/enforce-wcag-rules', () => {
  const ruleName = 'slds/enforce-wcag-rules';

  const testCases = [
    {
      description: 'Reports warning for a hardcoded color in background-color property',
      inputCss: `
        .my-class {
          background-color: #ff0000;
        }
      `,
      expectedMessage: `Consider replacing "#ff0000" with a similar color ""--slds-g-color-error-container-1"" styling hook to provide better color contrast`,
    },
    {
      description: 'Reports warning for a hardcoded color in border-color property',
      inputCss: `
        .my-class {
          border-color: rgb(255, 0, 0);
        }
      `,
      expectedMessage: `Consider replacing "rgb(255, 0, 0)" with a similar color "
1. --slds-g-color-border-error-1 
2. --slds-s-input-color-border-invalid 
3. --slds-g-color-border-error-2 
" styling hook to provide better color contrast`,
    },
    {
      description: 'Reports warning for a hardcoded fill color',
      inputCss: `
        .icon {
          fill: hsl(0, 100%, 50%);
        }
      `,
      expectedMessage: `Consider replacing "hsl(0, 100%, 50%)" with a similar color "
1. --slds-g-color-error-container-1 
2. --slds-g-color-border-error-1 
3. --slds-g-color-error-base-40 
4. --slds-s-input-color-border-invalid 
5. --slds-g-color-border-error-2 
" styling hook to provide better color contrast`,
    },
    {
      description: 'Does not report for a valid SLDS styling hook',
      inputCss: `
        .my-class {
          background-color: var(--slds-c-brand-primary);
        }
      `,
      expectedMessage: null, // No warning expected
    },
    {
      description: 'Does not report for a non-color property',
      inputCss: `
        .my-class {
          padding: 10px;
        }
      `,
      expectedMessage: null, // No warning expected
    },
  ];

  testCases.forEach(({ description, inputCss, expectedMessage }) => {
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