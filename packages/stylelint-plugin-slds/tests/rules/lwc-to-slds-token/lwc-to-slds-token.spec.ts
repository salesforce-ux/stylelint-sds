import { expect } from 'chai';
import stylelint, { LinterResult, LinterOptions } from 'stylelint';
const { lint }: typeof stylelint = stylelint;

  const errorWithStyleHooks = (oldValue, newValue)=> `The '${oldValue}' design token is deprecated. To avoid breaking changes, replace it with the '${newValue}' styling hook and set the fallback to '${oldValue}'. For more info, see the New Global Styling Hook Guidance on lightningdesignsystem.com.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n`;
  const errorWithNoRecommendation = (oldValue)=> `The '${oldValue}' design token is deprecated. For more info, see the New Global Styling Hook Guidance on lightningdesignsystem.com.`;
  const errorWithRawValue = (oldValue, newValue)=> `The '${oldValue}' design token is deprecated. To avoid breaking changes, replace it with '${newValue}'. For more info, see the New Global Styling Hook Guidance on lightningdesignsystem.com.\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\n`;

const LWC_TOKEN_MAPPINGS = {
  "--lwc-brandDark": "--slds-g-color-accent-dark-1",
  "--lwc-brandBackgroundDark": "--",
  "--lwc-brandBackgroundDarkTransparent": "transparent",
  "--lwc-cardBodyPadding": "0 var(--slds-g-spacing-4)",
  "--lwc-brandPrimaryTransparent10": "color-mix(in oklab, var(--slds-g-color-accent-1), transparent 90%)",
  "--lwc-nubbinTriangleOffset": "-0.1875rem",
  "--lwc-heightTappable": "calc(var(--slds-g-sizing-9) + var(--slds-g-sizing-4))",
  "--lwc-colorBackgroundLight": ["--slds-g-color-surface-1", "--slds-g-color-surface-container-1"],
  "--lwc-varFontSize2": "Continue to use",
  "--lwc-customer-created": null,
}

const CSS_PROP = ['color', 'background', 'background', 'padding', 'color', 'margib-left', 'height', 'background', 'font-size', 'color']

describe('lwc-to-slds-token', () => {
  const ruleName = 'slds/lwc-to-slds-token';
  const testCases = [];

  Object.entries(LWC_TOKEN_MAPPINGS).forEach(([key, val], ind)=>{
    const inputCss = `.testLWC_${ind}{${CSS_PROP[ind]}:var(${key})}`;
    if(val === null){
      testCases.push({
        description: `#Ignore customer created`,
        inputCss
      })
    } else if(Array.isArray(val)){
      testCases.push({
        description: `#suggest multiple recommendations`,
        inputCss,
        expectedMessage: errorWithStyleHooks(key, val.join(' or '))
      })
    } else if(val.startsWith('--slds-')){
      testCases.push({
        description: `#suggest --slds-* token recommendation`,
        inputCss,
        expectedMessage: errorWithStyleHooks(key, val)
      })
    } else if(val === '--'){
      testCases.push({
        description: `#when no recommendation`,
        inputCss,
        expectedMessage: errorWithNoRecommendation(key)
      })
    }  else if(val === 'Continue to use'){
      testCases.push({
        description: `#Continue to use`,
        inputCss
      })
    } else {
      testCases.push({
        description: `#replace with raw value`,
        inputCss,
        expectedMessage: errorWithRawValue(key, val)
      })
    }
  })

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
