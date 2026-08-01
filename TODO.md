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

## Open

### Bugs

- [ ] **Single-char cell limit caps puzzles at 32 words.** `numberToChar` in
      `src/puzzle/puzzleGeneration.ts:18` returns `n.toString(32)`, which is two
      characters from 32 upward (`'10'`). Matrix cells are single characters, so
      `setAt`/`replaceAt` would corrupt the matrix rather than throw. Not
      reachable at the live 7×12 board (84 cells / min word length 4 = 21 words
      max), and not reachable at any board under 128 cells. Fix by widening the
      cell encoding (or asserting the word count) if larger boards are ever
      wanted — see the base-parsing fix below for the encode/decode contract.

### Build / tooling

Nothing open — `npm run lint` now exits clean (see Done above).

### Dependencies

- [ ] **Major upgrades, each worth its own PR** (deliberately excluded from #2):
  - [ ] `@vitejs/plugin-react` 4 → 6 (pairs with vite; config-surface changes)
  - [ ] `jest` 29 → 30 + `@types/jest` 30 (needs matching `ts-jest`; only 6 small suites)
  - [ ] `eslint` 9 → 10, `@eslint/js` 10, `@eslint-react/eslint-plugin` 1 → 5,
        `eslint-plugin-react-hooks` 5 → 7 (lint-only, cannot break the build, but
        will surface many new findings — do after the lint fix above)
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
