import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'node',
  // Transform ignore patterns for ESM packages
  transformIgnorePatterns: ['/node_modules/'],
  // Map module aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Test file patterns
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  // Coverage collection
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    'src/app/api/**/*.ts',
    '!src/lib/db/prisma.ts', // Prisma client singleton — tested via integration
    '!**/*.d.ts',
  ],
};

export default createJestConfig(config);
