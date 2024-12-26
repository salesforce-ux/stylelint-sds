const index = require('../src/index');
const { ESLint } = require('eslint');
const noBemClassRule = require('../src/rules/no-bem-class');
const noDeprecatedSldsClassesRule = require('../src/rules/no-deprecated-slds-classes');

jest.mock('../src/rules/no-bem-class', () => jest.fn());
jest.mock('../src/rules/no-deprecated-slds-classes', () => jest.fn());


describe('ESLint Plugin Rules', () => {
    test('should define no-bem-class rule', () => {
        expect(index.rules).toHaveProperty('no-bem-class');
        expect(typeof index.rules['no-bem-class']).toBe('function');
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
      expect(index.configs.recommended.plugins).toContain('sf-sds');
    });
  
    test('should define recommended configuration with rules', () => {
      expect(index.configs.recommended).toHaveProperty('rules');
      expect(index.configs.recommended.rules).toHaveProperty('sf-sds/no-bem-class', 'error');
      expect(index.configs.recommended.rules).toHaveProperty('sf-sds/no-deprecated-slds-classes', 'error');
    });
});

describe('ESLint Rules Implementation', () => {
  test('no-bem-class rule should be implemented', () => {
    expect(index.rules['no-bem-class']).toBe(noBemClassRule);
  });

  test('no-deprecated-slds-classes rule should be implemented', () => {
    expect(index.rules['no-deprecated-slds-classes']).toBe(noDeprecatedSldsClassesRule);
  });
});