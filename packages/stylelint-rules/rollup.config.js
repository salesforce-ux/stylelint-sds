import del from 'rollup-plugin-delete';
import ts from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

export default
{
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
					src: 'public',
					dest: 'build',
					rename: './public'

				}
			]
		})
	]
};

