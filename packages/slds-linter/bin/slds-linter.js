#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// // ✅ Fix: Get __dirname in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Define paths for built-in configurations
// const eslintConfigPath = path.resolve(__dirname, '../build/.eslintrc.yml');
// const stylelintConfigPath = path.resolve(__dirname, '../build/.stylelintrc.yml');

const eslintConfigPath = fileURLToPath(await import.meta.resolve('@salesforce-ux/eslint-plugin-slds/build/.eslintrc.yml'));
const stylelintConfigPath = fileURLToPath(await import.meta.resolve('@salesforce-ux/stylelint-plugin-slds/build/.stylelintrc.yml'));

// Command-line arguments handling
yargs(hideBin(process.argv))
    .command(
        'lint',
        'Run both ESLint and Stylelint',
        () => {},
        () => {
            console.log(chalk.cyan('🔍 Running ESLint and Stylelint...'));
            try {
                execSync(`eslint . --config ${eslintConfigPath} --ext .js,.jsx,.ts,.tsx,.html,.cmp`, { stdio: 'inherit' });
                execSync(`stylelint "**/*.css" --config ${stylelintConfigPath}`, { stdio: 'inherit' });
                console.log(chalk.green('✅ Linting completed successfully!'));
            } catch (error) {
                console.error(chalk.red('❌ Linting failed. Please fix the errors and try again.'));
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
                execSync(`eslint . --config ${eslintConfigPath} --fix --ext .js,.jsx,.ts,.tsx,.html,.cmp`, { stdio: 'inherit' });
                execSync(`stylelint "**/*.css" --config ${stylelintConfigPath} --fix`, { stdio: 'inherit' });
                console.log(chalk.green('✅ Auto-fix applied successfully!'));
            } catch (error) {
                console.error(chalk.red('❌ Fixing failed. Please check linting errors.'));
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
                execSync(`node node_modules/@salesforce-ux/stylelint-sds/build/report.js ${argv.dir} -c ${stylelintConfigPath}`, { stdio: 'inherit' });
                console.log(chalk.green('✅ Report generated successfully!'));
            } catch (error) {
                console.error(chalk.red('❌ Failed to generate the report.'));
            }
        }
    )
    .help()
    .argv;
