module.exports = {
  preset: "jest-preset-angular",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testMatch: ["**/*.spec.ts"],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/src/test.ts",
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text-summary", "lcov"],

  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/main.ts",
    "!src/polyfills.ts",
    "!src/**/index.ts",
    "!src/environments/**",
    "!src/**/*.routes.ts",
    "!src/**/*.config.ts",
  ],

  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
