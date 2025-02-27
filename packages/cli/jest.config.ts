// jest.config.mts
import { createDefaultEsmPreset, type JestConfigWithTsJest } from 'ts-jest'

const presetConfig = createDefaultEsmPreset({
  tsconfig:"tsconfig.spec.json"
})

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
}

export default jestConfig