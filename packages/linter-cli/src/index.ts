#!/usr/bin/env node

import { Command } from 'commander';
import { registerLintStylesCommand } from './commands/lint-styles';
import { registerLintComponentsCommand } from './commands/lint-components';
import { registerLintCommand } from './commands/lint';
import { registerReportCommand } from './commands/report';
import { Logger } from './utils/logger';

process.on('unhandledRejection', (error) => {
  Logger.error(`Unhandled rejection: ${error}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  Logger.error(`Uncaught exception: ${error}`);
  process.exit(1);
});

const program = new Command();

program
  .name('linting-cli')
  .description('A CLI tool for linting styles and components')
  .version('1.0.0');

registerLintStylesCommand(program);
registerLintComponentsCommand(program);
registerLintCommand(program);
registerReportCommand(program);

program.parse(process.argv); 