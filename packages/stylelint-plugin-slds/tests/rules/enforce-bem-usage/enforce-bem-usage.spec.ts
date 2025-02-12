import { expect } from 'chai';
import stylelint, { LinterResult, LinterOptions } from 'stylelint';
const { lint }: typeof stylelint = stylelint;

describe('enforce-bem-usage', () => {
  // Define the expected messages for the test
  [
    'Consider updating "slds-text-heading_large" to new naming convention "slds-text-heading--large" (slds/enforce-bem-usage)',
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

  [
    {
      description: 'should report and fix bem usage when sole selector',
      input: `
        .slds-text-heading_large {
          border-start-start-radius: 0;
        }
      `,
      expectedOutput: `
        .slds-text-heading--large {
          border-start-start-radius: 0;
        }
      `,
      messages: [
        "Consider updating 'slds-text-heading_large' to new naming convention 'slds-text-heading--large' (slds/enforce-bem-usage)",
      ],
      messagePositions: [[1, 24]],
    },
    {
      description: 'should report and fix bem usage when multiple selectors',
      input: `
        .slds-dl_horizontal__label,
        .slds-dl_horizontal__detail {
          display: none;
        }
      `,
      expectedOutput: `
        .slds-dl--horizontal__label,
        .slds-dl--horizontal__detail {
          display: none;
        }
      `,
      messages: [
        "Consider updating 'slds-dl_horizontal__label' to new naming convention 'slds-dl--horizontal__label' (slds/enforce-bem-usage)",
        "Consider updating 'slds-dl_horizontal__detail' to new naming convention 'slds-dl--horizontal__detail' (slds/enforce-bem-usage)",
      ],
      messagePositions: [
        [1, 26],
        [37, 63],
      ],
    },
    {
      description: 'should report and fix bem usage in psuedo-selector',
      input: `
        .slds-dl_horizontal__label:last-of-type {
          border-bottom: none;
        }
      `,
      expectedOutput: `
        .slds-dl--horizontal__label:last-of-type {
          border-bottom: none;
        }
      `,
      messages: [
        "Consider updating 'slds-dl_horizontal__label' to new naming convention 'slds-dl--horizontal__label' (slds/enforce-bem-usage)",
      ],
      messagePositions: [[1, 26]],
    },
    {
      description: 'should report and fix bem usage in complex selector',
      input: `
        div.slds-dl_horizontal__label {
          border-bottom: none;
        }
      `,
      expectedOutput: `
        div.slds-dl--horizontal__label {
          border-bottom: none;
        }
      `,
      messages: [
        "Consider updating 'slds-dl_horizontal__label' to new naming convention 'slds-dl--horizontal__label' (slds/enforce-bem-usage)",
      ],
      messagePositions: [[4, 29]],
    },
    {
      description: 'should report and fix bem usage in chained selector',
      input: `
        .slds-dl_horizontal__label div {
          border-bottom: none;
        }
      `,
      expectedOutput: `
        .slds-dl--horizontal__label div {
          border-bottom: none;
        }
      `,
      messages: [
        "Consider updating 'slds-dl_horizontal__label' to new naming convention 'slds-dl--horizontal__label' (slds/enforce-bem-usage)",
      ],
      messagePositions: [[1, 26]],
    },
    {
      description: 'should report and fix bem usage in chained direct selector',
      input: `
        .slds-dl_horizontal__label > div {
          border-bottom: none;
        }
      `,
      expectedOutput: `
        .slds-dl--horizontal__label > div {
          border-bottom: none;
        }
      `,
      messages: [
        "Consider updating 'slds-dl_horizontal__label' to new naming convention 'slds-dl--horizontal__label' (slds/enforce-bem-usage)",
      ],
      messagePositions: [[1, 26]],
    },
    {
      description: 'should report and fix bem usage in chained direct selector',
      input: `
.slds-dl_horizontal__label, .slds-dl_horizontal__detail {}

.slds-dl_horizontal__label {}
      `,
      expectedOutput: `
.slds-dl--horizontal__label, .slds-dl--horizontal__detail {}

.slds-dl--horizontal__label {}
      `,
      messages: [
        "Consider updating 'slds-dl_horizontal__label' to new naming convention 'slds-dl--horizontal__label' (slds/enforce-bem-usage)",
        "Consider updating 'slds-dl_horizontal__detail' to new naming convention 'slds-dl--horizontal__detail' (slds/enforce-bem-usage)",
        "Consider updating 'slds-dl_horizontal__label' to new naming convention 'slds-dl--horizontal__label' (slds/enforce-bem-usage)",
      ],
      messagePositions: [
        [1, 26],
        [29, 55],
        [1, 26],
      ],
    },
  ].forEach(
    (
      { description, input, expectedOutput, messages, messagePositions },
      index
    ) => {
      it(`Test Case #${index + 1}: ${description}`, async () => {
        let lintResult = await processLint(input, false);

        // Verify the reported messages
        // console.log(lintResult._postcssResult.messages);
        const reportedMessages = lintResult._postcssResult.messages.map(
          (message) => message.text
        );
        expect(reportedMessages).to.have.members(messages);
        const reportedPositions = lintResult._postcssResult.messages.map(
          (message) => [message.index, message.endIndex]
        );
        expect(reportedPositions).to.have.deep.members(messagePositions);

        lintResult = await processLint(input, true);

        expect(lintResult._postcssResult.root.toString()).to.equal(
          expectedOutput
        );
      });
    }
  );
});

async function processLint(input: string, fixable = false) {
  const linterOptions: LinterOptions = {
    code: input,
    config: {
      plugins: ['./src/index.ts'], // Adjust path as needed
      rules: {
        'slds/enforce-bem-usage': true,
      },
      fix: fixable,
    },
  };

  const result: LinterResult = await lint(linterOptions);
  return result.results[0];
}
