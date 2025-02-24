import { Command } from 'commander';
import { CliOptions } from '../types';
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
    .option('--config-style <path>', 'Path to stylelint config file', DEFAULT_STYLELINT_CONFIG_PATH)
    .option('--config-eslint <path>', 'Path to eslint config file', DEFAULT_ESLINT_CONFIG_PATH)
    .action(async (options: CliOptions) => {
      try {
        Logger.info('Starting full linting process...');
        const normalizedOptions = normalizeCliOptions(options);
        
        // Scan style files
        Logger.info('Starting style files scan...');
        const styleFileBatches = await FileScanner.scanFiles(normalizedOptions.directory, {
          patterns: StyleFilePatterns,
          batchSize: 100
        });
        
        Logger.info(`Found ${styleFileBatches.reduce((sum, batch) => sum + batch.length, 0)} style files to lint`);
        
        const styleResults = await LintRunner.runLinting(styleFileBatches, 'style', {
          fix: options.fix,
          configPath: options.configStyle
        });
        
        const styleErrorCount = styleResults.reduce((sum, r) => sum + r.errors.length, 0);
        const styleWarningCount = styleResults.reduce((sum, r) => sum + r.warnings.length, 0);
        
        Logger.info(`Style files: ${styleErrorCount} errors and ${styleWarningCount} warnings`);
        
        // Scan component files
        Logger.info('Starting component files scan...');
        const componentFileBatches = await FileScanner.scanFiles(normalizedOptions.directory, {
          patterns: ComponentFilePatterns,
          batchSize: 100
        });
        
        Logger.info(`Found ${componentFileBatches.reduce((sum, batch) => sum + batch.length, 0)} component files to lint`);
        
        const componentResults = await LintRunner.runLinting(componentFileBatches, 'component', {
          fix: options.fix,
          configPath: options.configEslint
        });
        
        const componentErrorCount = componentResults.reduce((sum, r) => sum + r.errors.length, 0);
        const componentWarningCount = componentResults.reduce((sum, r) => sum + r.warnings.length, 0);
        
        Logger.info(`Component files: ${componentErrorCount} errors and ${componentWarningCount} warnings`);
        
        Logger.success('Full linting completed');
        process.exit(styleErrorCount + componentErrorCount > 0 ? 1 : 0);
      } catch (error: any) {
        Logger.error(`Failed to complete linting: ${error.message}`);
        process.exit(1);
      }
    });
} 