import path from 'path';
import fs from 'fs/promises';
import { Logger } from '../utils/logger';
import { LintResult } from '../types';
import { SarifBuilder, SarifRunBuilder, SarifResultBuilder, SarifRuleBuilder } from 'node-sarif-builder';

export interface ReportOptions {
  outputPath: string;
  toolName: string;
  toolVersion: string;
}

export class ReportGenerator {
  /**
   * Generate SARIF report from lint results
   */
  static async generateSarifReport(
    results: LintResult[],
    options: ReportOptions
  ): Promise<void> {
    try {
      const builder = new SarifBuilder();
      const runBuilder = new SarifRunBuilder().initSimple({
        toolDriverName: options.toolName,
        toolDriverVersion: options.toolVersion,
        url: options.toolName === 'eslint' 
          ? 'https://eslint.org' 
          : 'https://stylelint.io'
      });

      // Add rules
      const rules = this.extractRules(results);
      for (const rule of rules) {
        const ruleBuilder = new SarifRuleBuilder().initSimple({
          ruleId: rule.id,
          shortDescriptionText: rule.shortDescription?.text,
          helpUri: rule.helpUri
        });
        runBuilder.addRule(ruleBuilder);
      }

      // Add results
      for (const result of results) {
        this.addResultsToSarif(runBuilder, result);
      }

      // Add run to builder
      builder.addRun(runBuilder);

      // Generate the report
      const sarifReport = builder.buildSarifJsonString({ indent: true });
      
      // Ensure output directory exists
      const outputDir = path.dirname(options.outputPath);
      await fs.mkdir(outputDir, { recursive: true });
      
      // Write the report
      await fs.writeFile(options.outputPath, sarifReport);

      Logger.success(`SARIF report generated: ${options.outputPath}`);
    } catch (error: any) {
      Logger.error(`Failed to generate SARIF report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract unique rules from results
   */
  private static extractRules(results: LintResult[]): any[] {
    const rules = new Map();

    for (const result of results) {
      // Process errors
      for (const error of result.errors) {
        if (!rules.has(error.ruleId)) {
          rules.set(error.ruleId, {
            id: error.ruleId,
            shortDescription: {
              text: error.message
            },
            helpUri: error.ruleId.startsWith('slds/') 
              ? `https://github.com/salesforce/slds-linting-plugin/blob/main/docs/rules/${error.ruleId.replace('slds/', '')}.md`
              : `https://stylelint.io/user-guide/rules/${error.ruleId}`,
            properties: {
              category: 'Style'
            }
          });
        }
      }

      // Process warnings
      for (const warning of result.warnings) {
        if (!rules.has(warning.ruleId)) {
          rules.set(warning.ruleId, {
            id: warning.ruleId,
            shortDescription: {
              text: warning.message
            },
            helpUri: warning.ruleId.startsWith('slds/') 
              ? `https://github.com/salesforce/slds-linting-plugin/blob/main/docs/rules/${warning.ruleId.replace('slds/', '')}.md`
              : `https://stylelint.io/user-guide/rules/${warning.ruleId}`,
            properties: {
              category: 'Style'
            }
          });
        }
      }
    }

    return Array.from(rules.values());
  }

  /**
   * Add lint results to SARIF report
   */
  private static addResultsToSarif(
    runBuilder: SarifRunBuilder,
    lintResult: LintResult
  ): void {
    // Add errors
    for (const error of lintResult.errors) {
      const resultBuilder = new SarifResultBuilder().initSimple({
        ruleId: error.ruleId,
        level: 'error',
        messageText: error.message,
        fileUri: lintResult.filePath,
        startLine: error.line,
        startColumn: error.column,
        endLine: error.line,
        endColumn: error.column + 1
      });
      runBuilder.addResult(resultBuilder);
    }

    // Add warnings
    for (const warning of lintResult.warnings) {
      const resultBuilder = new SarifResultBuilder().initSimple({
        ruleId: warning.ruleId,
        level: 'warning',
        messageText: warning.message,
        fileUri: lintResult.filePath,
        startLine: warning.line,
        startColumn: warning.column,
        endLine: warning.line,
        endColumn: warning.column + 1
      });
      runBuilder.addResult(resultBuilder);
    }
  }
} 