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

Nothing open — `npm run lint` now exits clean (see Done above).

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
  - [x] `eslint` 9 → 10, `@eslint/js` 10, `@eslint-react/eslint-plugin` 1 → 5,
        `eslint-plugin-react-hooks` 5 → 7 — done, plus `@eslint/compat` 1 → 2 and
        `eslint-plugin-promise` 7.2 → 7.3 (both needed for the eslint 10 peer).
        Two config changes were required. First, `eslint.config.mjs` imported
        `FlatCompat` from `@eslint/eslintrc` — an **undeclared phantom dep**, and
        eslint 10 drops eslintrc entirely. It was only bridging
        `plugin:react-hooks/recommended`, so it is gone in favour of the plugin's
        own flat config. Second, react-hooks 7 moved the flat config: `configs
        .recommended` and `configs['recommended-latest']` are both still the
        eslintrc array form, the flat one is `configs.flat['recommended-latest']`.
        Removed `eslint-plugin-react` — unused by the config and the hard blocker
        (no release peers eslint 10).
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
