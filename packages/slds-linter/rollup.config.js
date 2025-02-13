import ts from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/setup.ts',
    output: {
      file: 'build/setup.js',
      format: 'esm',
    },
    external: ['fs', 'path', 'url'],
    plugins: [
      ts()
    ],
  }
]