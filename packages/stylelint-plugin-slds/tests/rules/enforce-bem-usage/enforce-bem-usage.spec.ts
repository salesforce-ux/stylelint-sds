import { expect } from 'chai';
import stylelint, { LinterResult, LinterOptions } from 'stylelint';
const { lint }: typeof stylelint = stylelint;

describe('enforce-bem-usage', () => {
  // Define the expected messages for the test
  [
    "Consider updating 'slds-text-heading_large' to new naming convention 'slds-text-heading--large' (slds/enforce-bem-usage)",
  ].map((message, index) => {
    it('should enforce BEM usage for rule #' + index, async () => {
      const linterResult: LinterResult = await lint({
        files: './tests/providers/enforce-bem-usage.css', // Adjust the path to your CSS file
        config: {
          plugins: ['./src/index.ts'], // Adjust the plugin path
          rules: {
            'slds/enforce-bem-usage': true,
          },
        },
      } as LinterOptions);

      // Ensure the expected message is reported by the linter
      expect(
        linterResult.results[0]._postcssResult.messages[index].text
      ).to.equal(message);
    });
  });
});
