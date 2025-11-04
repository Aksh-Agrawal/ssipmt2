module.exports = {
  // Use the ESM-aware ts-jest preset because this package is ESM (type: module)
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '(.+)\\.js': '$1'
  },
  // Use explicit transform for ts-jest and enable ESM mode for TypeScript
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }]
  },
  // Treat TypeScript files as ESM so imports like '../foo.js' resolve correctly
  extensionsToTreatAsEsm: ['.ts']
};
