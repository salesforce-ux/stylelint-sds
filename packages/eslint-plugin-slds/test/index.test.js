const index = require('../src/index');
const { ESLint } = require('eslint');
const enforceBemClassRule = require('../src/rules/enforce-bem-class');
const noDeprecatedSldsClassesRule = require('../src/rules/no-deprecated-slds-classes');

jest.mock('../src/rules/enforce-bem-class', () => jest.fn());
jest.mock('../src/rules/no-deprecated-slds-classes', () => jest.fn());


describe('ESLint Plugin Rules', () => {
    test('should define enforce-bem-class rule', () => {
        expect(index.rules).toHaveProperty('enforce-bem-class');
        expect(typeof index.rules['enforce-bem-class']).toBe('function');
    });
    
    test('should define no-deprecated-slds-classes rule', () => {
    expect(index.rules).toHaveProperty('no-deprecated-slds-classes');
    expect(typeof index.rules['no-deprecated-slds-classes']).toBe('function');
    });
});

describe('ESLint Plugin Configurations', () => {
    test('should define recommended configuration', () => {
      expect(index.configs).toHaveProperty('recommended');
    });
  
    test('should define recommended configuration with parser', () => {
      expect(index.configs.recommended).toHaveProperty('parser', '@html-eslint/parser');
    });
  
    test('should define recommended configuration with plugins', () => {
      expect(index.configs.recommended).toHaveProperty('plugins');
      expect(index.configs.recommended.plugins).toContain('slds');
    });
  
    test('should define recommended configuration with rules', () => {
      expect(index.configs.recommended).toHaveProperty('rules');
      expect(index.configs.recommended.rules).toHaveProperty('slds/enforce-bem-class', 'error');
      expect(index.configs.recommended.rules).toHaveProperty('slds/no-deprecated-slds-classes', 'error');
    });
});

describe('ESLint Rules Implementation', () => {
  test('enforce-bem-class rule should be implemented', () => {
    expect(index.rules['enforce-bem-class']).toBe(enforceBemClassRule);
  });

  test('no-deprecated-slds-classes rule should be implemented', () => {
    expect(index.rules['no-deprecated-slds-classes']).toBe(noDeprecatedSldsClassesRule);
  });
});