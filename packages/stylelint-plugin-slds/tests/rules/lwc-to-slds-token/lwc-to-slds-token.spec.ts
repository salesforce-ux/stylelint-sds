import { expect } from 'chai';
import stylelint, { LinterResult, LinterOptions } from 'stylelint';

const { lint }: typeof stylelint = stylelint;

describe('lwc-to-slds-token', () => {
  const ruleName = 'slds/lwc-to-slds-token';

  const testCases = [
    {
      description:
        'Replaces deprecated LWC token with SLDS token and adds fallback',
      inputCss: `
        .example {
          border: var(--lwc-borderRadiusCircle);
        }
      `,
      expectedMessage: `The '--lwc-borderRadiusCircle' design token is deprecated. To avoid breaking changes, replace it with the 'var(--slds-g-radius-border-circle, var(--lwc-borderRadiusCircle))' styling hook and set the fallback to '--lwc-borderRadiusCircle'. For more info, see the New Global Styling Hook Guidance on lightningdesignsystem.com.`,
    },
    {
      description:
        'Reports warning for deprecated LWC token without a replacement',
      inputCss: `
          .example {
            color: var(--lwc-unsupported-token);
          }
        `,
      expectedMessage: `The '--lwc-unsupported-token' is currently deprecated.`,
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
