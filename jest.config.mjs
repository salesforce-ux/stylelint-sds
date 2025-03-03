export default {
    projects: ['<rootDir>/packages/*'],
    collectCoverage: true,
    coverageDirectory: '<rootDir>/coverage',
    coverageReporters: ['json', 'html'],
    reporters: [
      'default',
      ['jest-html-reporter', {
        outputPath: '<rootDir>/test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
      }],
    ],
  };
  