import { expect } from 'chai';
import stylelint, { LinterResult, LinterOptions } from 'stylelint';

const { lint }: typeof stylelint = stylelint;

describe('sf-sds/enforce-sds-to-slds-hooks', () => {
  const testCases = [
    {
      description: 'should report and fix var(--sds-primary-color)',
      input: `
        :root {
          --custom: var(--sds-primary-color);
        }
      `,
      expectedOutput: `
        :root {
          --custom: var(--slds-primary-color);
        }
      `,
      messages: [
        'The "var(--sds-primary-color)" styling hook is replaced by "var(--slds-primary-color)".',
      ],
    },
    {
      description: 'should report and fix var(--sds-secondary-color)',
      input: `
        body {
          color: var(--sds-secondary-color);
        }
      `,
      expectedOutput: `
        body {
          color: var(--slds-secondary-color);
        }
      `,
      messages: [
        'The "var(--sds-secondary-color)" styling hook is replaced by "var(--slds-secondary-color)".',
      ],
    },
  ];

  testCases.forEach(
    ({ description, input, expectedOutput, messages }, index) => {
      it(`Test Case #${index + 1}: ${description}`, async () => {
        const linterOptions: LinterOptions = {
          code: input,
          config: {
            plugins: ['./src/index.ts'], // Adjust path as needed
            rules: {
              'sf-sds/enforce-sds-to-slds-hooks': [true],
            },
            fix: true, // Enable fixing
          },
        };

        const result: LinterResult = await lint(linterOptions);
        const lintResult = result.results[0];

        // Verify the reported messages
        const reportedMessages = lintResult._postcssResult.messages.map(
          (message) => message.text
        );
        expect(reportedMessages).to.have.members(messages);
      });
    }
  );
});
