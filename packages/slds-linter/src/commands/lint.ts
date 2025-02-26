import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { CliOptions } from '../types';
import { getEditorLink, createClickableLineCol } from '../utils/editorLinkUtil';
import { printLintResults } from '../utils/lintResultsUtil';
import { normalizeCliOptions } from '../utils/cli-args';
import { Logger } from '../utils/logger';
import { FileScanner } from '../services/file-scanner';
import { StyleFilePatterns, ComponentFilePatterns } from '../services/file-patterns';
import { LintRunner } from '../services/lint-runner';
import { DEFAULT_ESLINT_CONFIG_PATH, DEFAULT_STYLELINT_CONFIG_PATH } from '../services/config.resolver';

export function registerLintCommand(program: Command): void {
  program
    .command('lint')
    .description('Run both style and component linting')
    .option('-d, --directory <path>', 'Target directory to scan (defaults to current directory)')
    .option('--fix', 'Automatically fix problems')
    .option('--config-style <path>', 'Path to stylelint config file')
    .option('--config-eslint <path>', 'Path to eslint config file')
    .option('--editor <editor>', 'Editor to open files with (e.g., vscode, atom, sublime). Defaults to vscode', 'vscode')
    .action(async (options: CliOptions) => {
      const startTime = Date.now();
      try {
        Logger.info(chalk.blue('Starting full linting process...'));
        const normalizedOptions = normalizeCliOptions(options, {
          configStyle: DEFAULT_STYLELINT_CONFIG_PATH,
          configEslint: DEFAULT_ESLINT_CONFIG_PATH
        });

        // 1) STYLE LINT
        Logger.info(chalk.blue('\nScanning style files...'));
        const styleFileBatches = await FileScanner.scanFiles(normalizedOptions.directory, {
          patterns: StyleFilePatterns,
          batchSize: 100,
        });
        const totalStyleFiles = styleFileBatches.reduce((sum, batch) => sum + batch.length, 0);
        Logger.info(chalk.blue(`Found ${totalStyleFiles} style file(s). Running stylelint...\n`));

        const styleResults = await LintRunner.runLinting(styleFileBatches, 'style', {
          fix: options.fix,
          configPath: options.configStyle,
        });

        // Print style lint issues (only for files with issues)
        styleResults.forEach(result => {
          const hasErrors = result.errors?.length > 0;
          const hasWarnings = result.warnings?.length > 0;
          if (!hasErrors && !hasWarnings) return;

          const absolutePath = result.filePath || '';
          const relativeFile = path.relative(process.cwd(), absolutePath) || 'Unknown file';
          Logger.info(`\n${chalk.bold(relativeFile)}`);

          result.errors?.forEach(err => {
            const lineCol = `${err.line}:${err.column}`;
            const clickable = createClickableLineCol(lineCol, absolutePath, err.line, err.column, normalizedOptions.editor);
            const ruleId = err.ruleId ? chalk.dim(err.ruleId) : '';
            Logger.error(`  ${clickable}  ${err.message}  ${ruleId}`);
          });
          result.warnings?.forEach(warn => {
            const lineCol = `${warn.line}:${warn.column}`;
            const clickable = createClickableLineCol(lineCol, absolutePath, warn.line, warn.column, normalizedOptions.editor);
            const ruleId = warn.ruleId ? chalk.dim(warn.ruleId) : '';
            Logger.warning(`  ${clickable}  ${warn.message}  ${ruleId}`);
          });
        });

        const styleErrorCount = styleResults.reduce((sum, r) => sum + r.errors.length, 0);
        const styleWarningCount = styleResults.reduce((sum, r) => sum + r.warnings.length, 0);

        // 2) COMPONENT LINT
        Logger.info(chalk.blue('\nScanning component files...'));
        const componentFileBatches = await FileScanner.scanFiles(normalizedOptions.directory, {
          patterns: ComponentFilePatterns,
          batchSize: 100,
        });
        const totalComponentFiles = componentFileBatches.reduce((sum, batch) => sum + batch.length, 0);
        Logger.info(chalk.blue(`Found ${totalComponentFiles} component file(s). Running eslint...\n`));

        const componentResults = await LintRunner.runLinting(componentFileBatches, 'component', {
          fix: options.fix,
          configPath: options.configEslint,
        });

        // Print component lint issues (only for files with issues)
        printLintResults(componentResults, normalizedOptions.editor);

        const componentErrorCount = componentResults.reduce((sum, r) => sum + r.errors.length, 0);
        const componentWarningCount = componentResults.reduce((sum, r) => sum + r.warnings.length, 0);

        // Final summary
        const totalErrors = styleErrorCount + componentErrorCount;
        const totalWarnings = styleWarningCount + componentWarningCount;
        Logger.info(
          `\n${chalk.red(`${totalErrors} error${totalErrors !== 1 ? 's' : ''}`)}` +
          `  ${chalk.yellow(`${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}`)}`
        );
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
        Logger.success(chalk.green(`\nFull linting completed in ${elapsedTime} seconds.`));
        process.exit(totalErrors > 0 ? 1 : 0);
      } catch (error: any) {
        Logger.error(chalk.red(`Failed to complete linting: ${error.message}`));
        process.exit(1);
      }
    });
}
