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

### Deploys are master-only, and there are no branch previews

`.github/workflows/deploy-to-gh-pages.yml` publishes to GitHub Pages. Pages
serves a **single** site from the `gh-pages` branch, so any ref that runs the
deploy step overwrites production — there is no per-branch preview URL.

The workflow used to trigger on `on: [push]` with no filter, and branch pushes
were silently overwriting the live site. It is now restricted to `master`, with
`pull_request` running build-only as a verification gate. Keep it that way: if
you add triggers, the deploy step must stay guarded on
`github.event_name == 'push' && github.ref == 'refs/heads/master'`.

### Generated output must stay out of ESLint

`recommendedTypeChecked` applies type-aware rules globally, so any JS outside
the tsconfig project crashes the run with "You have used a rule which requires
type information". `dist/**` and `coverage/**` are both in the `ignores` list in
`eslint.config.mjs` for this reason. Adding a new generated directory means
adding it there too.

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
- Dependency work: verify with `npm audit`, `npm run build`, `npm test` and
  `npm run lint` before claiming done. Take majors one at a time — do not
  run parallel upgrades, they contend over `node_modules` and the lockfile.

## Open work

See `TODO.md` for the current checklist, including the outstanding
base-parsing bug in `src/puzzle/resolveMatrix.ts` and the pending major
dependency upgrades.
