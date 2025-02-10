import { expect } from 'chai';
import stylelint, { LinterResult, LinterOptions } from 'stylelint';

const { lint } = stylelint;

describe('slds/no-deprecated-slds-hooks', () => {
  const expectedMessages = [
    'Replace deprecated hook "--slds-c-breadcrumbs-spacing-inline-start" with "--slds-c-breadcrumbs-spacing-inlinestart" (slds/no-deprecated-slds-hooks)',
  ];

  expectedMessages.forEach((message, index) => {
    it(`should report deprecated hooks for test case #${index}`, async () => {
      const linterResult: LinterResult = await lint({
        files: './tests/providers/no-deprecated-slds-hooks.css',
        config: {
          plugins: ['./src/index.ts'], // Path to the plugin
          rules: {
            'slds/no-deprecated-slds-hooks': true, // Enable the rule
          },
        },
      } as LinterOptions);

      const reportedMessage =
        linterResult.results[0]._postcssResult.messages[index].text;
      expect(reportedMessage).to.equal(message);
    });
  });
});
