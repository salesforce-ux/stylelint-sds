import { fileURLToPath } from "url";
// TODO:Move rule meta to metadata package
import {ruleMetadata} from '@salesforce-ux/stylelint-plugin-slds';

export const DEFAULT_ESLINT_CONFIG_PATH = fileURLToPath(import.meta.resolve('@salesforce-ux/eslint-plugin-slds/.eslintrc.yml'));
export const DEFAULT_STYLELINT_CONFIG_PATH = fileURLToPath(import.meta.resolve('@salesforce-ux/stylelint-plugin-slds/.stylelintrc.yml'));
export const STYLELINT_VERSION = process.env.STYLELINT_VERSION;
export const ESLINT_VERSION = process.env.ESLINT_VERSION;
export const LINTER_CLI_VERSION = process.env.CLI_VERSION;

export const getRuleDescription = (ruleId:string)=>{
    const ruleIdWithoutNameSpace = `${ruleId}`.replace(/\@salesforce-ux\//, '');
    return ruleMetadata(ruleIdWithoutNameSpace)?.ruleDesc || '--';
}