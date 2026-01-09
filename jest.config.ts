import type { Config } from 'jest';

const config: Config = {
  // Use jsdom for browser-like environment
  testEnvironment: 'jsdom',
  
  // Setup files to run after Jest is loaded
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  
  // Transform TypeScript files with ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.json',
    }],
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Module name mapper for path aliases and static assets
  moduleNameMapper: {
    // Handle path aliases from tsconfig
    '^@/(.*)$': '<rootDir>/src/$1',
    
    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    
    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/src/test/__mocks__/styleMock.ts',
    
    // Handle image imports
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/test/__mocks__/fileMock.ts',
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/*.spec.{ts,tsx}',
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/test/**/*',
  ],
  
  // Coverage thresholds (optional - can be adjusted)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
};

export default config;
