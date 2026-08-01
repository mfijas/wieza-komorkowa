# CLAUDE.md

Polish version of the [cell-tower](https://www.andrewt.net/puzzles/cell-tower/)
word game. React 19 + TypeScript, built with Vite, tested with Jest via ts-jest.

## Commands

```bash
npm run dev      # vite dev server
npm run build    # production build into dist/
npm test         # jest, 8 suites
npm run lint     # eslint (flat config)
```

## Layout

- `src/puzzle/` — game logic, no React. Puzzle generation, matrix solving,
  word randomization. This is where the interesting code lives.
- `src/components/` — React UI, one directory per component with a colocated
  `.scss`.
- `scripts/` — one-off Node/TS scripts for building the Polish word list from
  aspell/ODM dumps. Not part of the app build; excluded from lint.

## Gotchas

These have each cost real time. Read before touching dependencies or tooling.

### `lodash-es` is mapped to `lodash` in tests

`jest.config.js` has `moduleNameMapper: { "^lodash-es$": "lodash" }`, because
the app imports the ESM build but Jest runs CommonJS. `lodash` is therefore a
**required devDependency** even though nothing imports it directly.

It was historically absent from `package.json` and only present as a transitive
of the eslint tree — an `npm update` pruned that transitive and two suites broke
with `Could not locate module lodash-es mapped as: lodash`. It is now declared
explicitly. Do not "clean it up" as an unused dependency.

Watch for this class of failure generally: if a dependency upgrade breaks module
resolution, check whether something was relying on a package it never declared.

### Component tests are jsdom per-file, not globally

`testEnvironment` in `jest.config.js` is `"node"`, because the 8 `src/puzzle/`
suites are pure logic and jsdom only slows them down. Component tests opt in
with a `@jest-environment jsdom` docblock at the top of the file — see
`src/components/App/App.test.tsx`.

ts-jest cannot parse `.scss` or `.png`, so asset imports are mapped to
`src/assetStub.ts` via `moduleNameMapper`. It exports a **string**, not an
object, because image imports are used as `src` attributes. A new asset
extension needs adding to that mapping or the suite dies with
`SyntaxError: Invalid or unexpected token` pointing at a binary file.

`jest-environment-jsdom` is a required devDependency — jest has not bundled it
since v28.

### `.claude/` is excluded from jest and eslint on purpose

Claude Code puts worktrees in `.claude/worktrees/`, and those are **full
checkouts of this repo**. Before they were excluded, a single stray one made
jest run every suite twice (17 instead of 9) and made eslint fail every
config-file lint with `No tsconfigRootDir was set, and multiple candidate
TSConfigRootDirs are present` — an error that points at files you never
touched. Local only; CI checks out clean.

Three separate exclusions are needed, because none of these tools reads
`.gitignore`:

- `testPathIgnorePatterns` / `modulePathIgnorePatterns` in `jest.config.js`
- `.claude/**` in the `ignores` block of `eslint.config.mjs`
- `.claude/worktrees/` in `.gitignore`

Do not drop any of them. If lint or tests start behaving oddly anyway, check
`git worktree list` — a worktree can still hold commits that exist nowhere
else, so remove it deliberately rather than deleting the directory.

### What of `.claude/` is committed

`settings.json` (shared permissions) and `launch.json` (dev server config) are
committed; `settings.local.json` is personal and gitignored. Keep the shared
allowlist to project-scoped commands — `npm run`, `npm test`, `npm audit`.
Anything with reach beyond the repo (`git push`, `gh auth`) belongs in the
local file, since committing it grants it to everyone who opens the repo.

### Deploys are master-only, and there are no branch previews

`.github/workflows/deploy-to-gh-pages.yml` publishes to GitHub Pages. Pages
serves a **single** site from the `gh-pages` branch, so any ref that runs the
deploy step overwrites production — there is no per-branch preview URL.

The workflow used to trigger on `on: [push]` with no filter, and branch pushes
were silently overwriting the live site. It is now restricted to `master`, with
`pull_request` running build-only as a verification gate. Keep it that way: if
you add triggers, the deploy step must stay guarded on
`github.event_name == 'push' && github.ref == 'refs/heads/master'`.

### `eslint-plugin-react-hooks` hides its flat config one level down

In v7, both `configs.recommended` and `configs['recommended-latest']` are still
the **eslintrc** array form (`plugins: ['react-hooks']`). The flat config is
`configs.flat['recommended-latest']`. Passing either of the first two to a flat
config fails with "plugins key defined as an array of strings", which reads like
a config bug rather than a wrong import path.

Related: `eslint.config.mjs` used to import `FlatCompat` from `@eslint/eslintrc`
without declaring it — another phantom dep, and eslint 10 removed eslintrc
support outright. Do not reintroduce the eslintrc bridge; use plugins' own flat
configs.

### Type-aware rules crash on anything outside the tsconfig project

Any file linted with `recommendedTypeChecked` but not in `tsconfig.json`'s
project kills the whole run with "You have used a rule which requires type
information". `eslint.config.mjs` now has two blocks: `src/**` gets the
type-aware set, and `scripts/**` + the config files get a non-type-aware block
(`project: false`). Generated output — `src/puzzle/words.ts`, `dist/**`,
`coverage/**` — stays in `ignores`. A new generated directory needs adding
there; new hand-written code outside `src/` needs adding to the second block,
not to `ignores`.

### React linting is react-hooks + react-refresh, deliberately

Neither `eslint-plugin-react` nor `@eslint-react` is installed, and that is a
decision, not an oversight — see TODO.md for the measurements. `eslint-plugin-react`
is *broken* on eslint 10, not just unsupported. Do not add either back casually.

### The `js-yaml` override is deliberate

`package.json` has `overrides: { "js-yaml": "^4.1.1" }`. It force-upgrades
`@istanbuljs/load-nyc-config` from `js-yaml@^3.13.1` onto 4.x, deduping the tree
onto one version. It is no longer needed for security, but it is safe (the
forced consumer calls `yaml.load()`, present in both majors). Decided: keep.

## Conventions

- A PR is not mandatory — match the ceremony to the weight of the change.
  Anything with design choices worth reviewing (logic changes, refactors,
  risky or wide-reaching edits) gets a branch and a PR. Small, low-risk,
  fully verified changes — docs, a clean dependency bump that needed no code
  or config changes — can go straight to `master`. When in doubt, open a PR.
- Never wait by sleeping. A foreground `sleep` is blocked by the harness
  ("Blocked: sleep 60 followed by ..."), and chaining shorter sleeps to get
  around it is blocked too. To wait on CI, use the tool's own blocking flag —
  `gh pr checks <n> --watch --interval 15`, `gh run watch <id>` — or a
  `until <check>; do sleep 2; done` loop. For a long command you started
  yourself, run it in the background and let it notify you.
- Dependency work: verify with `npm audit`, `npm run build`, `npm test` and
  `npm run lint` before claiming done. Take majors one at a time — do not
  run parallel upgrades, they contend over `node_modules` and the lockfile.

## Open work

See `TODO.md` for the current checklist, including the outstanding
base-parsing bug in `src/puzzle/resolveMatrix.ts` and the pending major
dependency upgrades.
