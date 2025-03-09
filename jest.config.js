/** @type {import('ts-jest').JestConfigWithTsJest} **/
export const testEnvironment = "node";
export const transform = {
  "^.+\.tsx?$": ["ts-jest", {}],
};
export const setupFilesAfterEnv = ["<rootDir>/src/setupTests.ts"];
export const moduleNameMapper = {
  "^lodash-es$": "lodash"
};
