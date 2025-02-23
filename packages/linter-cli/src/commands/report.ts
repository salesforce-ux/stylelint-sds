import { Command } from 'commander';
import path from 'path';
import { CliOptions } from '../types';
import { normalizeCliOptions } from '../utils/cli-args';
import { Logger } from '../utils/logger';
import { FileScanner } from '../services/file-scanner';
import { StyleFilePatterns, ComponentFilePatterns } from '../services/file-patterns';
import { LintRunner } from '../services/lint-runner';
import { ReportGenerator } from '../services/report-generator';
import { DEFAULT_ESLINT_CONFIG_PATH, DEFAULT_STYLELINT_CONFIG_PATH, ESLINT_VERSION, LINTER_CLI_VERSION, STYLELINT_VERSION } from '../services/config.resolver';

export function registerReportCommand(program: Command): void {
  program
    .command('report')
    .description('Generate SARIF report from linting results')
    .option('-d, --directory <path>', 'Target directory to scan (defaults to current directory)')
    .option('-o, --output <path>', 'Output directory for reports (defaults to current directory)')
    .option('--config-style <path>', 'Path to stylelint config file', DEFAULT_STYLELINT_CONFIG_PATH)
    .option('--config-eslint <path>', 'Path to eslint config file', DEFAULT_ESLINT_CONFIG_PATH)
    .action(async (options: CliOptions) => {
      try {
        Logger.info('Starting report generation...');
        const normalizedOptions = normalizeCliOptions(options);
        
        // Run style linting
        Logger.info('Running style linting...');
        const styleFileBatches = await FileScanner.scanFiles(normalizedOptions.directory, {
          patterns: StyleFilePatterns,
          batchSize: 100
        });
        
        const styleResults = await LintRunner.runLinting(styleFileBatches, 'style', {
          configPath: options.configStyle
        });
        
        // Run component linting
        Logger.info('Running component linting...');
        const componentFileBatches = await FileScanner.scanFiles(normalizedOptions.directory, {
          patterns: ComponentFilePatterns,
          batchSize: 100
        });
        
        const componentResults = await LintRunner.runLinting(componentFileBatches, 'component', {
          configPath: options.configEslint
        });

        // Generate style report
        const styleReportPath = path.join(normalizedOptions.output, 'stylelint-report.sarif');
        await ReportGenerator.generateSarifReport(styleResults, {
          outputPath: styleReportPath,
          toolName: 'stylelint',
          toolVersion: STYLELINT_VERSION
        });

        // Generate component report
        const componentReportPath = path.join(normalizedOptions.output, 'eslint-report.sarif');
        await ReportGenerator.generateSarifReport(componentResults, {
          outputPath: componentReportPath,
          toolName: 'eslint',
          toolVersion: ESLINT_VERSION
        });

        // Generate combined report
        const combinedReportPath = path.join(normalizedOptions.output, 'combined-report.sarif');
        await ReportGenerator.generateSarifReport([...styleResults, ...componentResults], {
          outputPath: combinedReportPath,
          toolName: 'linting-cli',
          toolVersion: LINTER_CLI_VERSION
        });

        Logger.success('Report generation completed');
        process.exit(0);
      } catch (error: any) {
        Logger.error(`Failed to generate report: ${error.message}`);
        process.exit(1);
      }
    });
} 