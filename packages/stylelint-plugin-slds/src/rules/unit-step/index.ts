import { Root } from 'postcss';
import { ContainerBase, parse } from 'postcss-values-parser';
import stylelint, { Rule, RuleContext, PostcssResult } from 'stylelint';

import { wording } from './wording';

import { defaultOptions } from './option';
import { Options } from './option.interface';
import ruleMetadata from '../../utils/rulesMetadata';

const { utils, createPlugin }: typeof stylelint = stylelint;
const ruleName:string = 'slds/unit-step';

const { severityLevel = 'error', warningMsg = '', errorMsg = '', ruleDesc = 'No description provided' } = ruleMetadata(ruleName) || {};

function validateOptions(result: PostcssResult, options: Options) {
  return utils.validateOptions(result, ruleName, {
    actual: options,
    // @ts-ignore
    possible: {
      step: (value) => value > 0,
      units: (value) => defaultOptions.units.includes(value),
      atRules: (value) => defaultOptions.atRules.includes(value),
      properties: (value) => defaultOptions.properties.includes(value),
    },
  });
}

function rule(
  primaryOptions: Options,
  secondaryOptions: Options,
  context: RuleContext
) {
  const options: Options = { ...defaultOptions, ...primaryOptions };

  return (root: Root, result: PostcssResult) => {
    if (validateOptions(result, options)) {
      options.atRules?.map((atRule) => {
        root.walkAtRules(atRule, (decl) => {
          const params: ContainerBase = parse(decl.params);
const severity =
              result.stylelint.config.rules[ruleName]?.[1] || severityLevel; // Default to "error"
          params.walkNumerics((param) => {
            if (
              options.units.includes(param.unit) &&
              Number(param.value) % options.step > 0
            ) {
              const valueFixed: number =
                Math.round(Number(param.value) / options.step) * options.step;

              utils.report({
                message:
                  wording.expected +
                  ' "' +
                  atRule +
                  '" ' +
                  wording.unit +
                  ' "' +
                  param.value +
                  param.unit +
                  '" ' +
                  wording.toBe +
                  ' "' +
                  valueFixed +
                  param.unit +
                  '"',
                node: decl,
                result,
                ruleName,
                word: decl.params,
                severity
              });
              param.value = valueFixed.toString();
            }
          });
          if (context.fix) {
            decl.params = params.toString();
          }
        });
      });
      options.properties?.map((property) => {
        root.walkDecls(property, (decl) => {
          const severity =
                        result.stylelint.config.rules[ruleName]?.[1] || severityLevel; // Default to "error"
          const nodes: ContainerBase = parse(decl.value);

          nodes.walkNumerics((node) => {
            if (
              options.units.includes(node.unit) &&
              Number(node.value) % options.step > 0
            ) {
              const valueFixed: number =
                Math.round(Number(node.value) / options.step) * options.step;

              utils.report({
                message:
                  wording.expected +
                  ' "' +
                  property +
                  '" ' +
                  wording.unit +
                  ' "' +
                  node.value +
                  node.unit +
                  '" ' +
                  wording.toBe +
                  ' "' +
                  valueFixed +
                  node.unit +
                  '"',
                node: decl,
                result,
                ruleName,
                word: decl.value,
                severity
              });
              node.value = valueFixed.toString();
            }
          });
          if (context.fix) {
            decl.value = nodes.toString();
          }
        });
      });
    }
  };
}

export default createPlugin(ruleName, rule as unknown as Rule);
