#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {npmRunPathEnv} from 'npm-run-path';

const eslintConfigPath = fileURLToPath(await import.meta.resolve('@salesforce-ux/eslint-plugin-slds/.eslintrc.yml'));
const stylelintConfigPath = fileURLToPath(await import.meta.resolve('@salesforce-ux/stylelint-plugin-slds/.stylelintrc.yml'));
const reportGenModulePath = fileURLToPath(await import.meta.resolve('@salesforce-ux/slds-report-generator'));

// ✅ Define CLI Commands using `yargs`
yargs(hideBin(process.argv))
    .command(
        'lint',
        'Run both ESLint and Stylelint',
        () => {},
        () => {
            console.log(chalk.cyan('🔍 Running ESLint and Stylelint...'));
            try {
                execSync(`npx eslint **/*.{html,cmp} --config ${eslintConfigPath} --ext .html,.cmp`, { stdio: 'inherit', env: npmRunPathEnv() });
                execSync(`npx stylelint ./**/*.css --config ${stylelintConfigPath}`, { stdio: 'inherit', env: npmRunPathEnv() });
                console.log(chalk.green('✅ Linting completed successfully!'));
            } catch (error) {
                console.error(chalk.red('❌ Linting failed. Please fix the errors and try again.'));
                process.exit(1);
            }
        }
    )
    .command(
        'lint:styles',
        'Run only Stylelint',
        () => {},
        () => {
            console.log(chalk.cyan('🎨 Running Stylelint...'));
            try {
                execSync(`npx stylelint ./**/*.css --config ${stylelintConfigPath}`, { stdio: 'inherit', env: npmRunPathEnv() });
                console.log(chalk.green('✅ Stylelint completed successfully!'));
            } catch (error) {
                console.error(chalk.red('❌ Stylelint failed. Please fix the errors and try again.'));
                process.exit(1);
            }
        }
    )
    .command(
        'lint:components',
        'Run only ESLint',
        () => {},
        () => {
            console.log(chalk.cyan('🛠️ Running ESLint...'));
            try {
                execSync(`npx eslint **/*.{html,cmp} --config ${eslintConfigPath} --ext .html,.cmp`, { stdio: 'inherit', env: npmRunPathEnv() });
                console.log(chalk.green('✅ ESLint completed successfully!'));
            } catch (error) {
                console.error(chalk.red('❌ ESLint failed. Please fix the errors and try again.'));
                process.exit(1);
            }
        }
    )
    .command(
        'fix',
        'Fix auto-fixable issues',
        () => {},
        () => {
            console.log(chalk.cyan('🔧 Running auto-fix for ESLint and Stylelint...'));
            try {
                execSync(`npx eslint **/*.{html,cmp} --config ${eslintConfigPath} --fix --ext .html,.cmp`, { stdio: 'inherit', env: npmRunPathEnv() });
                execSync(`npx stylelint "**/*.css" -c ${stylelintConfigPath} --fix`, { stdio: 'inherit', env: npmRunPathEnv() });
                console.log(chalk.green('✅ Auto-fix applied successfully!'));
            } catch (error) {
                console.error(chalk.red('❌ Fixing failed. Please check linting errors.'));
                process.exit(1);
            }
        }
    )
    .command(
        'report',
        'Generate a linting report',
        (yargs) => {
            return yargs.option('dir', {
                alias: 'd',
                describe: 'Target directory for linting',
                type: 'string',
                default: 'force-app/'
            });
        },
        (argv) => {
            console.log(chalk.cyan(`📊 Generating linting report for ${argv.dir}...`));
            try {
                execSync(`node ${reportGenModulePath} -d ${argv.dir} --style-config ${stylelintConfigPath} --eslint-confg ${eslintConfigPath}`, { stdio: 'inherit', env: npmRunPathEnv() });
                console.log(chalk.green('✅ Report generated successfully!'));
            } catch (error) {
                console.error(chalk.red('❌ Failed to generate the report.'));
                process.exit(1);
            }
        }
    )
    .help()
    .argv;