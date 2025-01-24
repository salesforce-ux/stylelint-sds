import { expect } from 'chai';
import stylelint, { LinterResult, LinterOptions } from 'stylelint';
const { lint }: typeof stylelint = stylelint;

describe('sf-sds/no-deprecated-slds-classes', () => {
  const messages = [
    'The class "slds-box_border" is deprecated and not available in SLDS2. Please update to a supported class. (sf-sds/no-deprecated-slds-classes)',
    'The class "slds-chat-avatar__intials" is deprecated and not available in SLDS2. Please update to a supported class. (sf-sds/no-deprecated-slds-classes)',
  ];

  messages.map((message, index) => {
    it(`test rule #${index}`, async () => {
      const linterResult: LinterResult = await lint({
        files: './tests/providers/no-deprecated-slds-classes.css',
        config: {
          plugins: ['./src/index.ts'],
          rules: {
            'sf-sds/no-deprecated-slds-classes': true,
          },
        },
      } as LinterOptions);

      expect(
        linterResult.results.at(0)?._postcssResult.messages[index]?.text
      ).to.equal(message);
    });
  });
});
