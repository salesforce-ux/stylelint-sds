import { FilePattern } from './file-scanner';

export const StyleFilePatterns: FilePattern = {
  include: [
    '**/*.css',
    '**/*.scss',
    '**/*.less',
    '**/*.sass'
  ],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**'
  ]
};

export const ComponentFilePatterns: FilePattern = {
  include: [
    '**/*.html',
    '**/*.cmp',
    '**/*.component',
    '**/*.app',
    '**/*.page',
    '**/*.interface'
  ],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**'
  ]
}; 