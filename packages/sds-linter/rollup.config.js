import ts from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: 'src/setup.ts',
    output: {
      file: 'build/setup.js',
      format: 'esm',
    },
    external: ['fs', 'path', 'url'],
    plugins: [
      ts(),

      copy(
        {
          targets:
          [
            {
              src: '.eslintrc.yml',
              dest: 'build'
            },
            {
              src: '.stylelintrc.yml',
              dest: 'build'
            }
          ]
        }
      )

    ],
  },
//   {
//     input: 'src/reports/report.ts',
//     output: {
//       file: 'build/report.js',
//       format: 'esm',
//     },
//     plugins: [ts()],
//   }
]