import { expect } from 'chai';
import stylelint, { LinterResult, LinterOptions } from 'stylelint';

const { lint }: typeof stylelint = stylelint;

describe('unit-step', () => {
  [
    'Expected "media" unit "50.1em" to be "50.125em"',
    'Expected "font" unit "1.1em" to be "1.125em"',
    'Expected "height" unit "1.05em" to be "1em"',
    'Expected "width" unit "1.20em" to be "1.25em"',
  ].map((message, index) => {
    it('test rule #' + index, async () => {
      const linterResult: LinterResult = await lint({
        files: './tests/providers/unit-step.css',
        config: {
          plugins: ['./src/index.ts'],
          rules: {
            'slds/unit-step': true,
          },
        },
      } as LinterOptions);

      expect(
        linterResult.results.at(0)._postcssResult.messages[index].text
      ).to.equal(message);
    });
  });
});
