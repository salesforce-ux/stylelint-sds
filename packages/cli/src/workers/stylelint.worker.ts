import fs from 'fs';
import path from 'path';
import stylelint from 'stylelint';
import { BaseWorker } from './base.worker';
import { WorkerConfig, WorkerResult } from '../types';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StylelintWorker extends BaseWorker<WorkerConfig, WorkerResult> {
  protected async processFile(filePath: string): Promise<WorkerResult> {
    try {
      // Determine the persona
      let persona = this.getPersona();

      // Load Persona-Based Config (Rules + Plugins)
      const personaConfig = this.getPersonaConfig(persona);

      const options: stylelint.LinterOptions = {
        files: filePath,
        fix: this.task.config.fix
      };

      // ✅ Only add `config` if `personaConfig` is not null or empty
      if (personaConfig && Object.keys(personaConfig).length > 0) {
        options.config = {
          plugins: personaConfig.plugins || [],
          rules: personaConfig.rules || {}
        };
      }

      // Load custom config file if provided
      if (this.task.config.configPath) {
        options.configFile = this.task.config.configPath;
      }

      console.log(`🔹 Running stylelint for persona: ${persona}`);

      // Execute stylelint with merged config
      const result = await stylelint.lint(options);
      const fileResult = result.results[0];

      // Convert stylelint results to custom WorkerResult format
      return {
        file: filePath,
        warnings: fileResult?.warnings?.map(warning => ({
          line: warning.line,
          column: warning.column,
          endColumn: warning.endColumn,
          message: warning.text,
          ruleId: warning.rule
        })) || [],
        errors: [] // Stylelint does not differentiate between warnings and errors
      };
    } catch (error: any) {
      console.error("❌ Stylelint Error:", error.message);
      return {
        file: filePath,
        error: error.message
      };
    }
  }

  /**
   * Determines the user's persona from CLI args, VSCode settings, or environment variables.
   */
  private getPersona(): string {
    const args = process.argv;
    const personaIndex = args.indexOf('--persona');

    if (personaIndex !== -1 && args[personaIndex + 1]) {
      return args[personaIndex + 1];
    }

    if (process.env.SLDS_LINTER_PERSONA) {
      return process.env.SLDS_LINTER_PERSONA;
    }

    // const vscodePersona = this.getVSCodePersona();
    // if (vscodePersona) {
    //   return vscodePersona;
    // }

    return 'default'; // Fallback persona
  }

  /**
   * Loads persona-specific stylelint rules and plugins from `persona-config.json` or `persona-config.yml`
   */
  private getPersonaConfig(persona: string): { plugins: string[]; rules: object } {
    const jsonPath = path.resolve(__dirname, '../config/persona-config.json');

    let personaConfigs;

    if (fs.existsSync(jsonPath)) {
      personaConfigs = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } else {
      console.warn('⚠️ Persona configuration file not found. Using default rules.');
      // return { plugins: [], rules: {} };
      return null;
    }

    if (!personaConfigs || typeof personaConfigs !== 'object') {
      console.error('❌ Invalid persona configuration file format.');
      // return { plugins: [], rules: {} };
      return null;
    }

    if (!personaConfigs[persona]) {
      console.warn(`⚠️ Persona "${persona}" not found. Using default rules.`);
      // return { plugins: [], rules: {} };
      return null;
    }

    return {
      plugins: personaConfigs[persona].plugins || [],
      rules: personaConfigs[persona].rules || {}
    };
  }
}

// Initialize and start the worker
const worker = new StylelintWorker();
worker.process().catch(error => {
  console.error('❌ Worker failed:', error);
  process.exit(1);
});
