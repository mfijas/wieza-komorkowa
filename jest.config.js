/** @type {import('ts-jest').JestConfigWithTsJest} **/
export const testEnvironment = "node";
export const transform = {
  "^.+\\.tsx?$": ["ts-jest", {}],
};
export const setupFilesAfterEnv = ["<rootDir>/src/setupTests.ts"];
// Claude Code worktrees are full checkouts of this repo. Without this, a stray
// one doubles the run with duplicate suites. See CLAUDE.md.
export const testPathIgnorePatterns = ["/node_modules/", "/.claude/"];
export const modulePathIgnorePatterns = ["/.claude/worktrees/"];
export const moduleNameMapper = {
  "^lodash-es$": "lodash",
  "\\.(s?css|png|jpg|svg)$": "<rootDir>/src/assetStub.ts"
};
