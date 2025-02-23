import { fileURLToPath } from "url";
import stylelintPackage from "stylelint/package.json" with {type:"json"};
import eslintPackage from "eslint/package.json" with {type:"json"};
import cliPackage from "../../package.json" with {type:"json"};
// TODO:Move rule Meat to metada package
import {ruleMetadata} from '@salesforce-ux/stylelint-plugin-slds';

export const DEFAULT_ESLINT_CONFIG_PATH = fileURLToPath(import.meta.resolve('@salesforce-ux/eslint-plugin-slds/.eslintrc.yml'));
export const DEFAULT_STYLELINT_CONFIG_PATH = fileURLToPath(import.meta.resolve('@salesforce-ux/stylelint-plugin-slds/.stylelintrc.yml'));
export const STYLELINT_VERSION = stylelintPackage.version;
export const ESLINT_VERSION = eslintPackage.version;
export const LINTER_CLI_VERSION = cliPackage.version;

export const getRuleDescription = (ruleId:string)=>{
    const ruleIdWithoutNameSpace = `${ruleId}`.replace(/\@salesforce-ux\//, '');
    return ruleMetadata(ruleIdWithoutNameSpace)?.ruleDesc || '--';
}