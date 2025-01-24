import { expect } from 'chai';
import stylelint, { LinterResult, LinterOptions } from 'stylelint';

const { lint }: typeof stylelint = stylelint;

describe('no-slds-private-var', () => {
  const testCases = [
    {
      message:
        'Unexpected "--_slds- private variable usage" within selector "--_slds-deprecated-var". (sf-sds/no-slds-private-var)',
      code: `
        .example {
          --_slds-deprecated-var: #fff;
        }
      `,
      ruleName: 'sf-sds/no-slds-private-var',
      expectedMessages: [
        'Unexpected "--_slds- private variable usage" within selector "--_slds-deprecated-var". (sf-sds/no-slds-private-var)',
      ],
    },
    {
      message: null,
      code: `
        .example {
          --slds-valid-var: #fff;
        }
      `,
      ruleName: 'sf-sds/no-slds-private-var',
      expectedMessages: [],
    },
  ];

  testCases.forEach((testCase, index) => {
    it(`test rule #${index}`, async () => {
      const linterResult: LinterResult = await lint({
        code: testCase.code,
        config: {
          plugins: ['./src/index.ts'], // Adjust the path to your rule
          rules: {
            [testCase.ruleName]: true,
          },
        },
      } as LinterOptions);

      const messages = linterResult.results[0]._postcssResult.messages;

      // Test for the presence or absence of the message
      if (testCase.message) {
        expect(messages.length).to.equal(1);
        expect(messages[0].text).to.equal(testCase.message);
      } else {
        expect(messages.length).to.equal(0);
      }
    });
  });
});
