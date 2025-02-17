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
	external: [
		'stylelint', // External stylelint
		'fs', // Node.js core module
		'fs/promises', // Node.js core module
		'path', // Node.js core module
		'url', // Node.js core module
		'yaml', // Third-party module
		'postcss-value-parser', // Third-party module
		'postcss-values-parser', // Third-party module
		'chroma-js', // Third-party module
		'cli-progress'
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
	external: [
		'fs', // Native Node.js module
		'path', // Native Node.js module
		'child_process', // Native Node.js module
		'util', // Native Node.js module
		'fs/promises', // Native Node.js module
		'cross-spawn', // Third-party library
		'jq', // Third-party library
		'rimraf',
		'glob',
		'cli-progress',
		'JSONStream',
		'stream/promises'
	],
    plugins: [
      ts()
    ]
  }
];

