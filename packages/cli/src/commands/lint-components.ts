import { Command } from "commander";
import chalk from "chalk";
import { CliOptions } from "../types";
import { printLintResults } from "../utils/lintResultsUtil";
import { normalizeCliOptions } from "../utils/cli-args";
import { Logger } from "../utils/logger";
import { LintRunner } from "../services/lint-runner";
import { DEFAULT_ESLINT_CONFIG_PATH } from "../services/config.resolver";
import { getFileOrDirectoryBatches } from "../utils/fileUtil"; // ✅ Import the new utility function

export function registerLintComponentsCommand(program: Command): void {
  program
    .command("lint:components [fileOrDir]")
    .description('Run eslint on all markup files')
    .option('-d, --directory <path>', 'Target directory to scan (defaults to current directory)')
    .option('--fix', 'Automatically fix problems')
    .option('--config <path>', 'Path to eslint config file')
    .option('--editor <editor>', 'Editor to open files with (vscode, atom, sublime). Defaults to vscode', 'vscode')
    .action(async (fileOrDir: string | undefined, options: CliOptions) => {
      const startTime = Date.now();
      try {
        Logger.info(chalk.blue('Starting linting of component files...'));
        const normalizedOptions = normalizeCliOptions(options, {
          config: DEFAULT_ESLINT_CONFIG_PATH
        });
        const targetPath = options.directory || fileOrDir || process.cwd();

        // ✅ Use the new utility function
        const { componentFileBatches } = await getFileOrDirectoryBatches(targetPath);

        if (componentFileBatches.length === 0) {
          Logger.warning(chalk.yellow("No valid component files found to lint."));
          return;
        }

        const totalFiles = componentFileBatches.reduce((sum, batch) => sum + batch.length, 0);
        Logger.info(chalk.blue(`Scanning completed: Found ${totalFiles} component file(s).`));

        Logger.info(chalk.blue("Running linting..."));
        const results = await LintRunner.runLinting(componentFileBatches, "component", {
          fix: normalizedOptions.fix,
          configPath: normalizedOptions.config,
        });

        // Print detailed lint results only for files with issues
        printLintResults(results, normalizedOptions.editor);

        const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);
        const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);

        Logger.info(
          chalk.blue(
            `\nSummary: Processed ${totalFiles} file(s) with ${chalk.red(
              errorCount.toString()
            )} error(s) and ${chalk.yellow(warningCount.toString())} warning(s).`
          )
        );

        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
        Logger.success(chalk.green(`Component files linting completed in ${elapsedTime} seconds.`));
        process.exit(errorCount > 0 ? 1 : 0);
      } catch (error: any) {
        Logger.error(chalk.red(`Error during linting: ${error.message}`));
        process.exit(1);
      }
    });
}
