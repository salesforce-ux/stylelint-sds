import { strict as assert } from 'assert';
import rules from '../src/rules';
import exportedRules from '../src/index';

describe('index.ts', () => {
  it('should correctly export the rules array from rules.ts', () => {
    // Validate that exportedRules matches the imported rules
    assert.deepEqual(
      exportedRules,
      rules,
      'The exported rules array does not match the imported rules array.'
    );
  });

  it('should export an array', () => {
    assert(Array.isArray(exportedRules), 'Exported rules is not an array.');
  });

  // it('should contain the expected rule names', () => {
  //   const expectedRules = ['rule1', 'rule2', 'rule3'];
  //   console.log(expectedRules)
  //   assert.deepEqual(exportedRules, expectedRules, 'Exported rules do not match expected rule names.');
  // });
});
