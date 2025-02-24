import { Command } from 'commander';
import { CliOptions } from '../types';
import { normalizeCliOptions } from '../utils/cli-args';
import { Logger } from '../utils/logger';
import { FileScanner } from '../services/file-scanner';
import { StyleFilePatterns } from '../services/file-patterns';
import { LintRunner } from '../services/lint-runner';
import { DEFAULT_STYLELINT_CONFIG_PATH } from '../services/config.resolver';

export function registerLintStylesCommand(program: Command): void {
  program
    .command('lint:styles')
    .description('Run stylelint on all style files')
    .option('-d, --directory <path>', 'Target directory to scan (defaults to current directory)')
    .option('--fix', 'Automatically fix problems')
    .option('--config <path>', 'Path to stylelint config file', DEFAULT_STYLELINT_CONFIG_PATH)
    .action(async (options: CliOptions) => {
      try {
        Logger.info('Starting style files linting...');
        const normalizedOptions = normalizeCliOptions(options);
        
        const fileBatches = await FileScanner.scanFiles(normalizedOptions.directory, {
          patterns: StyleFilePatterns,
          batchSize: 100
        });
        
        Logger.info(`Found ${fileBatches.reduce((sum, batch) => sum + batch.length, 0)} files to lint`);
        
        const results = await LintRunner.runLinting(fileBatches, 'style', {
          fix: options.fix,
          configPath: options.config
        });
        
        const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);
        const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);
        
        Logger.info(`Found ${errorCount} errors and ${warningCount} warnings`);
        
        Logger.success('Style files linting completed');
        process.exit(errorCount > 0 ? 1 : 0);
      } catch (error: any) {
        Logger.error(`Failed to lint style files: ${error.message}`);
        process.exit(1);
      }
    });
} 