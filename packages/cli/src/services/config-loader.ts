import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Logger } from '../utils/logger';

// Manually define __dirname for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PERSONA_CONFIG_PATH = path.resolve(__dirname, '../config/persona-config.json');

export function loadPersonaConfig(persona: string): { styleConfig?: object; eslintConfig?: object } {
  let personaConfigs;

  if (fs.existsSync(PERSONA_CONFIG_PATH)) {
    personaConfigs = JSON.parse(fs.readFileSync(PERSONA_CONFIG_PATH, 'utf8'));
  } else {
    Logger.info('⚠️ No persona configuration found. Using default linting rules.');
    return {};
  }

  if (!personaConfigs || typeof personaConfigs !== 'object') {
    Logger.error('❌ Invalid persona configuration format.');
    return {};
  }

  if (!personaConfigs[persona]) {
    Logger.info(`⚠️ Persona "${persona}" not found. Using default linting rules.`);
    return {};
  }

  return {
    styleConfig: personaConfigs[persona].style || {},
    eslintConfig: personaConfigs[persona].eslint || {},
  };
}
