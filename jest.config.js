/** @type {import('ts-jest').JestConfigWithTsJest} **/
export const testEnvironment = "node";
export const transform = {
  "^.+\\.tsx?$": ["ts-jest", {}],
};
export const setupFilesAfterEnv = ["<rootDir>/src/setupTests.ts"];
// Claude Code worktrees are full checkouts of this repo. Without this, a stray
// one doubles the run with duplicate suites. See CLAUDE.md.
//
// Anchored to <rootDir>, not bare "/.claude/": these are matched against
// absolute paths, so an unanchored pattern also matches the *ancestor* path of
// a worktree, and `npm test` inside one silently finds zero suites.
export const testPathIgnorePatterns = ["/node_modules/", "<rootDir>/.claude/"];
export const modulePathIgnorePatterns = ["<rootDir>/.claude/worktrees/"];
export const moduleNameMapper = {
  "^lodash-es$": "lodash",
  "\\.(s?css|png|jpg|svg)$": "<rootDir>/src/assetStub.ts"
};
