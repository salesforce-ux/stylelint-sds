import { expect } from 'chai';
import stylelint, { LinterResult, LinterOptions } from 'stylelint';
const { lint }: typeof stylelint = stylelint;

describe('slds/no-deprecated-slds-classes', async () => {


  const tests = [{
    description:"Should report slds-box_border as deprecated",
    input:'.slds-box_border{border:0}',
    expectedMessage:'The class "slds-box_border" is deprecated and not available in SLDS2. Please update to a supported class. (slds/no-deprecated-slds-classes)'
  }, {
    description:"Should not report slds-custom-created",
    input:'.slds-custom-created{border:0}'
  }]

  const testStyleLintRule = async (code:string) => {
    const linterResult: LinterResult = await lint({
      code,
      config: {
        plugins: ['./src/index.ts'],
        rules: {
          'slds/no-deprecated-slds-classes': true,
        },
      },
    } as LinterOptions);
  
    return linterResult.results[0].warnings.map((warning) => warning.text);
  };

  tests.forEach(({description, input, expectedMessage})=>{
    it(description, async ()=>{
       const messages = await testStyleLintRule(input)
       if(expectedMessage){
        expect(messages[0]).to.include(expectedMessage);
       } else {
        expect(messages).to.be.empty;
       }
    })
  });

});
