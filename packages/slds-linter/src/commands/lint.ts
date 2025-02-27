import { Command } from "commander";
import chalk from "chalk";
import { CliOptions } from "../types";
import { printLintResults } from "../utils/lintResultsUtil";
import { normalizeCliOptions } from "../utils/cli-args";
import { Logger } from "../utils/logger";
import { LintRunner } from "../services/lint-runner";
import { DEFAULT_ESLINT_CONFIG_PATH, DEFAULT_STYLELINT_CONFIG_PATH } from "../services/config.resolver";
import { getFileOrDirectoryBatches } from "../utils/fileUtil"; // ✅ Import the new utility function

export function registerLintCommand(program: Command): void {
  program
    .command("lint [fileOrDir]")
    .option('-d, --directory <path>', 'Target directory to scan (defaults to current directory)')
    .option('--fix', 'Automatically fix problems')
    .option('--config-style <path>', 'Path to stylelint config file')
    .option('--config-eslint <path>', 'Path to eslint config file')
    .option('--editor <editor>', 'Editor to open files with (e.g., vscode, atom, sublime). Defaults to vscode', 'vscode')
    .action(async (fileOrDir: string | undefined, options: CliOptions) => {
      const startTime = Date.now();
      try {
        Logger.info(chalk.blue('Starting full linting process...'));
        const normalizedOptions = normalizeCliOptions(options, {
          configStyle: DEFAULT_STYLELINT_CONFIG_PATH,
          configEslint: DEFAULT_ESLINT_CONFIG_PATH
        });
        const targetPath = options.directory || fileOrDir || process.cwd();

        // ✅ Use the new utility function
        const { styleFileBatches, componentFileBatches } = await getFileOrDirectoryBatches(targetPath);

        // Run Stylelint
        if (styleFileBatches.length > 0) {
          Logger.info(chalk.blue("\nRunning stylelint...\n"));
          const styleResults = await LintRunner.runLinting(styleFileBatches, "style", {
            fix: options.fix,
            configPath: options.configStyle,
          });

          // Print Stylelint results
          printLintResults(styleResults, normalizedOptions.editor);
        }

        // Run ESLint
        if (componentFileBatches.length > 0) {
          Logger.info(chalk.blue("\nRunning ESLint...\n"));
          const componentResults = await LintRunner.runLinting(componentFileBatches, "component", {
            fix: options.fix,
            configPath: options.configEslint,
          });

          // Print ESLint results
          printLintResults(componentResults, normalizedOptions.editor);
        }

        // Final summary
        const totalErrors = styleFileBatches.reduce((sum, batch) => sum + batch.length, 0) +
                            componentFileBatches.reduce((sum, batch) => sum + batch.length, 0);

        Logger.info(`\n${chalk.red(`${totalErrors} error${totalErrors !== 1 ? "s" : ""}`)}`);
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
        Logger.success(chalk.green(`\nFull linting completed in ${elapsedTime} seconds.`));
        process.exit(totalErrors > 0 ? 1 : 0);
      } catch (error: any) {
        Logger.error(chalk.red(`Failed to complete linting: ${error.message}`));
        process.exit(1);
      }
    });
}
