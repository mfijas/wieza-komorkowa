# TODO

Open threads discovered while fixing the Dependabot advisory (2026-08-01).

## Done

- [x] Fix all 13 npm audit advisories, incl. GHSA-6g55-p6wh-862q (postcss
      arbitrary file read via `sourceMappingURL`) — PR #1, merged.
- [x] Take all in-range dependency drift (`npm update`) — PR #2, merged.
- [x] Stop every branch push from deploying to GitHub Pages — PR #3, open.
      `on: [push]` had no branch filter, so any branch overwrote the live
      site (Pages serves one site from `gh-pages`; there is no per-branch
      preview URL). Now master-only, with PRs running build-only.
- [x] Fix `npm run lint`, which crashed on generated `coverage/` output —
      PR #4. Added `coverage/**/*.*` to the `ignores` list in
      `eslint.config.mjs`. This exposed 2 real `no-unused-vars` errors that
      the crash had been masking, in a `GeneratePuzzle.test.ts` smoke test
      that asserted nothing; gave it real assertions. Lint now exits 0.
- [x] Add `CLAUDE.md` so future sessions start informed — PR #4.
- [x] Fix the base-parsing bug in `src/puzzle/resolveMatrix.ts:6`. Confirmed
      real: `puzzleGeneration.ts` encodes cells with `n.toString(32)` and
      decodes elsewhere with `parseInt(c, 32)`, so the `parseInt(currentCell, 30)`
      in `resolveMatrix` was the lone outlier — base 32 is the intended
      alphabet. Words 30 (`'u'`) and 31 (`'v'`) are invalid in base 30 and
      parsed to `NaN`, so `words[NaN]` was `undefined` and the resolve threw.
      Latent only: unreachable at the live 7×12 board. Changed 30 → 32 and
      added a regression test to `resolveMatrix.test.ts` that fails against the
      bug. Deleted `baseParsingBug.test.ts` — it asserted the buggy behavior
      (`expect(...).toThrow()`), so it locked the bug in and would have failed
      against the fix.
- [x] Single-source the cell base and validate board size — same PR. The base
      and the `numberToChar`/`charToNumber` pair now live in
      `src/puzzle/cellEncoding.ts`; `resolveMatrix` decodes through
      `charToNumber` instead of its own `parseInt`, so encoder and decoder can
      no longer drift. `generatePuzzle` rejects any board whose worst-case word
      count exceeds `MAX_WORDS`. The real ceiling is **136 cells**, not the 128
      first estimated from `floor(cells / MIN_WORD_LEN)` — that bound ignores
      how `randomizeWordLengths` actually terminates. Without the check an
      oversized board did not corrupt the matrix as first assumed: it hung
      synchronously, blocking the event loop hard enough that Jest's own
      timeout could not fire.

- [x] **Reviewed the lint configuration as a whole** — one deliberate pass over
      `eslint.config.mjs` instead of piecemeal edits. Outcomes:
      - **No React linting beyond `eslint-plugin-react-hooks`.** Decided against
        both candidates, on measurement rather than taste. `eslint-plugin-react`
        is not merely unsupported on eslint 10 (latest 7.37.5 peers `^9.7`), it
        is **broken**: forced in, every rule using the old context API dies with
        `contextOrFilename.getFilename is not a function`. `@eslint-react` 5.18.1
        runs fine and adds exactly **9 warnings — 4 duplicating the react-hooks
        `set-state-in-effect` finding below, and 5 `no-array-index-key`** in
        App.tsx and Grid.tsx, where index keys are arguably correct (the board is
        fixed-size and cells never reorder). One new rule, on code that is
        probably fine, was not worth the dependency. react-hooks 7 is also a much
        wider net than it used to be — it absorbed the React Compiler checks —
        which is why "just react-hooks" is now the mainstream default, and is
        what the `create-vite` React+TS template ships.
      - **Added `eslint-plugin-react-refresh`** (`configs.vite`), the fourth
        plugin in that same Vite template and the one real gap. Its
        `only-export-components` catches a genuine Fast Refresh footgun — a
        module exporting a component *and* something else silently degrades to
        full reloads, losing component state, with no error. Dev-experience only;
        it does not affect the build. Codebase was already clean against it.
      - **Dropped `@eslint/compat` and `eslint-plugin-only-warn`**, both unused.
        `only-warn` was a real decision, not just cleanup: it downgrades every
        rule to a warning, which would have hollowed out the CI lint gate that is
        still open below.
      - **`scripts/**`, `vite.config.ts`, `jest.config.js` and
        `eslint.config.mjs` are now linted** with a second, non-type-aware config
        block. They are outside `tsconfig.json`'s project, so type-aware rules
        crash on them; the block gets the syntactic rules only. Only
        `src/puzzle/words.ts` (generated), `dist/` and `coverage/` remain ignored.
        This **surfaced 3 real errors**, all now fixed: two dead loader functions
        (`loadAspellDump`, `loadOdm`) deleted from the one-off word-list scripts,
        and `no-useless-escape` on `jest.config.js`'s transform pattern, which was
        written `"^.+\.tsx?$"` — in a **string** literal, so the backslash was
        consumed and the regex matched any character where a literal dot was
        meant. Harmless in practice (it still matches every real `.ts`/`.tsx`
        path) but wrong; now `"^.+\\.tsx?$"`. All 8 suites still pass.
      - **Deleted the dead trailing block** and the inert
        `settings: { react: { version: 'detect' } }`. The config is now
        restructured around `tseslint.config()` with `extends` per block, so
        `recommendedTypeChecked` is scoped to `src/**` instead of applying
        globally — which is what made stray JS crash the run in the first place.
        Switched to `projectService: true` over an explicit `project` path.
      - Also removed the stale CRA `eslintConfig` key (`extends: react-app`)
        from `package.json`. Nothing has read it since the flat config landed.

## Open

### Bugs

Nothing open — the base-parsing bug and the board-size limit are both fixed
(see Done above).

### Enhancements

- [ ] **`react-hooks/set-state-in-effect` in `src/components/App/App.tsx:48`**,
      surfaced by the react-hooks 7 upgrade and currently set to `'warn'` in
      `eslint.config.mjs`. The mount effect seeds four states from localStorage.
      The fix is lazy `useState` initializers, but that also changes when the
      persist effect at `App.tsx:34` first fires (it would run on mount and
      write to storage immediately), so it is a behaviour change, not a
      mechanical edit. Own PR.

- [ ] **Boards above 136 cells need a wider cell encoding.** `generatePuzzle`
      now rejects them rather than hanging, so this is a feature limit, not a
      bug. Lifting it means giving up one-character cells — the matrix is a
      flat string and `replaceAt` assumes a single character per cell, so a
      two-character encoding is not a drop-in change. Only worth doing if a
      board larger than 136 cells is actually wanted; 7×12 is 84.

### Build / tooling

- [ ] **CI runs neither lint nor tests, and pins no Node version.**
      `.github/workflows/deploy-to-gh-pages.yml` runs only `npm ci && npm run
      build`, with no `actions/setup-node` step at all — it uses whatever Node
      is preinstalled on `ubuntu-latest`, which drifts as GitHub updates the
      runner image. Raised by Copilot on PR #6. Two parts, both worth doing
      together: add `setup-node` pinned to the declared `engines.node` range
      (with `cache: npm`), and add `npm run lint` and `npm test` as gate steps
      so the PR check verifies more than that the bundle compiles. Note the
      engine floor only starts mattering once lint actually runs in CI — the
      build path does not execute ESLint. `actions/checkout` is still on v3
      while the deploy action is on v4; bump it in the same pass.

### Dependencies

- [ ] **Major upgrades, each worth its own PR** (deliberately excluded from #2):
  - [ ] `@vitejs/plugin-react` 4 → 6 — **blocked on the vite hold, not independent.**
        6.x peer-requires `vite: ^8.0.0`, so it cannot land while vite stays on 6.
        Do it together with vite 6 → 8 or not at all.
  - [x] `jest` 29 → 30 + `@types/jest` 30 — done. No matching `ts-jest` major
        needed: `ts-jest@29.4.12` already declares `jest: ^29 || ^30`, so it
        stays on 29. No config or test changes at all — `jest.config.js` was
        untouched and all 8 suites (25 tests) passed first try, along with
        build, lint and `npm audit`.
  - [x] `eslint` 9 → 10, `@eslint/js` 10, `eslint-plugin-react-hooks` 5 → 7 —
        done, plus `@eslint/compat` 1 → 2 and
        `eslint-plugin-promise` 7.2 → 7.3 (both needed for the eslint 10 peer).
        Two config changes were required. First, `eslint.config.mjs` imported
        `FlatCompat` from `@eslint/eslintrc` — an **undeclared phantom dep**, and
        eslint 10 drops eslintrc entirely. It was only bridging
        `plugin:react-hooks/recommended`, so it is gone in favour of the plugin's
        own flat config. Second, react-hooks 7 moved the flat config: `configs
        .recommended` and `configs['recommended-latest']` are both still the
        eslintrc array form, the flat one is `configs.flat['recommended-latest']`.
        Removed **two unused plugins** rather than upgrading dead weight:
        `eslint-plugin-react` (nothing in the flat config references it, and it
        was the hard blocker — no release peers eslint 10) and
        `@eslint-react/eslint-plugin` (also unreferenced; it was the sole source
        of a `>=22.0.0` Node floor). Neither is needed to run lint in CI; the
        config imports neither. Re-adding either would be a deliberate "we want
        React-specific rules" decision, not a prerequisite for anything.
        `engines.node` is now declared as `^20.19.0 || ^22.13.0 || >=24` — the
        ESLint 10 range, which is the tightest among direct deps and satisfies
        `sass` (>=20.19), `vite` and `jest`. npm does not enforce this without
        `engine-strict`, so it documents and warns rather than protects.
  - [ ] `vite` 6 → 8 — on hold, two majors, no reason to churn
  - [ ] `typescript` 5.8 → 7 — on hold, deliberate project not a dep bump

- [ ] **Watch for more phantom dependencies.** `jest.config.js:8` maps
      `lodash-es` → `lodash`, but `lodash` was never declared — it was only
      present as a transitive of the old eslint tree, and `npm update` pruning
      that transitive broke two suites. Fixed in #2 by declaring it, but the
      same class of breakage can recur on the majors above.

- [ ] **`js-yaml` override in `package.json` — decided: keep, no action.**
      Not redundant: it force-upgrades `@istanbuljs/load-nyc-config` from
      `js-yaml@^3.13.1` onto 4.x, deduping the tree onto a single 4.3.1.
      No longer needed for security (without it the tree resolves to a patched
      3.15.1 and audit is still clean), but it is safe — the only forced
      consumer calls `yaml.load()`, which exists in both majors. Listed so this
      is not re-litigated.
