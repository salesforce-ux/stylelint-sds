import del from 'rollup-plugin-delete';
import ts from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

export default
[{
	input: 'src/index.ts',
	output:
	[
		{
			file: 'build/index.js',
			format: 'esm'
		}
	],
	plugins:
	[
		del(
		{
			targets: 'build'
		}),
		ts(),
		copy(
		{
			targets:
			[
				{
					src: 'package.json',
					dest: 'build'
				},
				{
					src: 'README.md',
					dest: 'build'
				},
				{
					src: '.stylelintrc.yml',
					dest: 'build'
				},
				{
					src: 'public',
					dest: 'build',
					rename: './public'
				},
				{
					src: 'scripts/config-setup/create-stylelint-config.js',
					dest: 'build/scripts'
				}
			]
		})
	]
},

{
    input: 'src/reports/report.ts', // Entry file for reports folder
    output: [
      {
        file: 'build/report.js', // Output for reporting.js
        format: 'esm', // ES module format
        sourcemap: true // Enable sourcemaps for debugging
      }
    ],
    plugins: [
      ts()
    ]
  }
];

