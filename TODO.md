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

- [x] **CI pins Node and gates on lint + tests.** Raised by Copilot on PR #6:
      `.github/workflows/deploy-to-gh-pages.yml` ran only `npm ci && npm run
      build`, with no `actions/setup-node` at all, so it used whatever Node the
      `ubuntu-latest` image happened to ship. Added `setup-node@v4` pinned to
      **24** with `cache: npm` — a single version rather than the `engines.node`
      range, because that range's `>=24` arm would resolve to whatever is newest
      at run time, which is the drift being fixed; the comment in the workflow
      says to keep the two in sync. Split the one combined step into `npm ci` /
      `npm run lint` / `npm test` / `npm run build` so a failure names itself,
      and bumped `actions/checkout` v3 → v4 to match the deploy action. The
      deploy step's master-only guard is untouched. Verified locally: lint exits
      0 (1 warning, the `set-state-in-effect` item below), 8 suites / 25 tests
      pass, build succeeds.

- [x] **Fixed `react-hooks/set-state-in-effect` in `App.tsx`, and stood up
      component testing to do it.** The mount effect that seeded four states
      from localStorage is gone; `App` now holds **one** `puzzleState` object
      from a lazy `useState` initializer, and a single effect persists it.
      - `generatePuzzleStateAndStoreInLocalStorage` was split into a
        side-effect-free `generatePuzzleState` and a `storePuzzleState`, so the
        initializer only ever *reads* storage — every write now happens in the
        persist effect, and storage simply follows state. `newGame` sets
        one thing instead of four, and `tileState` can no longer be `undefined`,
        which removed three `!` assertions and the empty-render branch.
      - **The StrictMode hazard that motivated the design does not exist.** A
        probe confirms StrictMode invokes a `useState` initializer twice and
        keeps the *first* result, so a generate-and-store initializer looked
        like it would leave React on puzzle A and storage on puzzle B. It does
        not: the second invocation finds what the first one stored and takes the
        *read* branch. The naive four-lazy-initializer version passes every test
        here. This change is on ordinary code-quality grounds, not a bug fix.
      - **Component tests now run** (`App.test.tsx`, 5 tests). Most of the
        harness was already there and unused — RTL, `jest-dom` and `user-event`
        were declared devDeps, `setupTests.ts` already imported `jest-dom`, and
        tsconfig already had `jsx`/`dom`. The gaps were `jest-environment-jsdom`
        (unbundled since jest 28) and an asset stub, since ts-jest cannot parse
        `.scss` or `.png` imports. `testEnvironment` stays `node` globally, with
        a per-file `@jest-environment jsdom` docblock, so the 8 pure-logic
        puzzle suites are not slowed down.
      - **Corrupt localStorage no longer crashes the app.** Raised in review:
        the two storage keys are written separately and can go out of step, and
        `readPuzzleStateFromLocalStorage` threw `SyntaxError: Unexpected end of
        JSON input` on a puzzle with a missing tile state. Reproduced with a
        failing test before fixing. Pre-existing, but this refactor moved the
        read into render, where a throw takes the whole app down instead of one
        effect. Anything unusable now falls back to a fresh puzzle.
      - **One persist effect, not two — decided, measured, no action.** Review
        pointed out that the single effect rewrites the `puzzle` key on
        tile-only changes, when `matrix`/`solution` have not moved. True, and
        it is a small regression against the old tile-state-only effect. But
        the payload is 583 bytes, and the extra `JSON.stringify` + `setItem`
        measures **12µs** — 0.07% of one 60fps frame, ~1ms across a drag over
        the entire board. Splitting into two effects buys nothing measurable
        and costs the single "storage mirrors state" invariant that the corrupt
        -storage fallback above leans on. Listed so it is not re-litigated.
      - Verified in the running app, not just under jsdom: fresh generate,
        reload restore, tile-state persistence and Nowa gra all keep the
        rendered board and localStorage in agreement.

- [x] **Added a `typecheck` script and gated CI on it.** `"typecheck": "tsc
      --noEmit"` in `package.json`, and a `Typecheck 🔍` step in
      `.github/workflows/deploy-to-gh-pages.yml` placed **before** lint — it is
      the fastest of the four and the one whose failures are most localised, so
      it should be what a broken PR reports first. Landed green, as predicted on
      the TS 6 bump: `tsc --noEmit` is clean, 9 suites / 32 tests pass, lint
      exits 0, build succeeds.
      - **The gate covers `src/` only.** `tsconfig.json` has `include: ["src"]`,
        so `scripts/**`, `vite.config.ts` and `jest.config.js` are still
        untypechecked — the same project boundary that forces eslint's two-block
        split. Widening it is not free: those files would need the `rootDir` and
        type-aware setup that keeping them out currently avoids. Left as is; the
        uncovered files are one-off scripts and config, not app code.
      - This is now the one command whose behaviour a TypeScript major actually
        changes at the command line, which was the point of doing it first.
        Note TS 7 would **not** be blocked here — its `tsc` binary is the Go
        port and runs fine; the blockers remain `ts-jest` and `typescript-eslint`
        needing the 7.1 JS API.
      - **Found while verifying, and fixed: `npm test` found no suites from
        inside a `.claude/worktrees/` checkout.** Jest's ignore patterns match
        absolute paths, so a bare `"/.claude/"` matched the worktree's own
        ancestor path and excluded its suites — exit 1, `No tests found`,
        pointing at the directory rather than the config. Anchoring both
        patterns to `<rootDir>` fixes it without weakening them: a nested
        worktree is still excluded, which is the only thing they were ever for.
        Verified both directions (9 suites inside a worktree; still 9, not 18,
        with a nested one present). CI was never affected — it checks out clean.

## Open

### Bugs

Nothing open — the base-parsing bug and the board-size limit are both fixed
(see Done above).

### Enhancements

- [ ] **Boards above 136 cells need a wider cell encoding.** `generatePuzzle`
      now rejects them rather than hanging, so this is a feature limit, not a
      bug. Lifting it means giving up one-character cells — the matrix is a
      flat string and `replaceAt` assumes a single character per cell, so a
      two-character encoding is not a drop-in change. Only worth doing if a
      board larger than 136 cells is actually wanted; 7×12 is 84.

### Build / tooling

Nothing open — the typecheck script and its CI gate have landed (see Done).

### Dependencies

- [ ] **Major upgrades, each worth its own PR** (deliberately excluded from #2):
  - [x] `vite` 6 → 8 **+ `@vitejs/plugin-react` 4 → 6, landed together** — they
        had to be, since plugin-react 6 peer-requires `vite: ^8.0.0`. No source
        or config changes at all: `vite.config.ts` is untouched, and the
        `resolve.alias` / `define` blocks still work as-is. Notes:
        - **`npm install` of the pair fails on a peer conflict against the
          existing tree** — plugin-react 6 has an *optional* peer on
          `@rolldown/plugin-babel`, which drags `@babel/core@8` against the
          `@babel/core@7` that plugin-react 4 had pinned. `--force` /
          `--legacy-peer-deps` are not needed: bump both versions in
          `package.json` by hand, delete `node_modules` + `package-lock.json`,
          and plain `npm install` resolves cleanly. Do that before reaching for
          an override.
        - **vite 8 builds on rolldown**, so build output and warning text
          differ. The >500 kB chunk warning now suggests
          `build.rolldownOptions.output.codeSplitting` where it used to name
          rollup options — cosmetic here, since the warning was already present
          and is still unaddressed.
        - `engines.node` (`^20.19.0 || ^22.13.0 || >=24`) already satisfies
          vite 8's `^20.19.0 || >=22.12.0`; CI's pinned Node 24 is fine.
        - Verified: `npm audit` 0 vulnerabilities, `npm run build` succeeds,
          9 suites / 32 tests pass, `npm run lint` exits 0 clean, and the dev
          server renders the board with no console errors.
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
  - [x] `typescript` 5.8 → **6.0.3** — landed. This is the prescribed first half
        of the 5.x → 7 migration, and the whole of what is currently possible.
        - **TS 7 is the Go port, and 7.0 ships no JavaScript compiler API.**
          `typescript@7`'s `.` export is `lib/version.cjs`, which exports
          `version` and `versionMajorMinor` and nothing else — there is no
          `createProgram`, no `transpileModule`. Verified by installing it:
          `npm install` fails outright on `@typescript-eslint/parser`'s peer
          (`>=4.8.4 <6.1.0`) against a **clean** tree — not the stale-tree noise
          described in the vite entry above — and forcing it through with
          `--legacy-peer-deps` fails all 9 suites with *"The TypeScript compiler
          "typescript" (version 7.0.2) does not expose the JavaScript compiler
          API required by ts-jest."* Microsoft expects the new API in **7.1**;
          `@typescript/typescript6` (6.0.2) is the compat package tooling is
          meant to sit on until then. Both of this project's TS consumers —
          `ts-jest` (peer `>=4.3 <7`) and `typescript-eslint` (peer `<6.1.0`) —
          are on the JS API, so TS 7 is blocked on both of them shipping support.
        - **TS 7 would currently buy this project nothing at the command line
          anyway.** Nothing runs `tsc`: `npm run build` is `vite build`, which
          transpiles without typechecking, and there is no `typecheck` script.
          The TS version only reaches the editor's language server and, through
          the JS API, ts-jest and the type-aware lint rules. The 10x native
          compiler has nothing here to be 10x on. Filed as an open item under
          **Build / tooling** above: add a `typecheck` script and gate CI on it
          *before* revisiting 7.
        - **Two tsconfig changes were required**, both flagged by TS 6 as
          deprecation errors — which is the point of the 6.x staging step:
          `moduleResolution` `"node"` (node10) is removed in 7 and is now
          `"bundler"`, correct for a Vite project and compatible with the
          existing `module: "esnext"`; and `rootDir` must now be explicit
          (TS5011) for anything that emits. `tsc --noEmit` did not surface the
          second one — **ts-jest did**, by failing all 9 suites, so run the
          tests and not just `tsc` when validating a TS bump.
        - `strict: true` is already explicit here, so TS 7 turning it on by
          default is a no-op for this repo.
        - Verified: `npx tsc --noEmit` clean, 9 suites / 32 tests pass,
          `npm run lint` exits 0, `npm run build` succeeds, `npm audit` 0.
  - [ ] `typescript` 6 → 7 — blocked until `ts-jest` and `typescript-eslint`
        support the 7.1 API. See above.

- [ ] **Configure Dependabot for the `npm` ecosystem.** `.github/dependabot.yml`
      currently covers `github-actions` only (added when checkout/setup-node had
      drifted two majors behind and surfaced as a Node 20 deprecation warning).
      npm was left out on purpose: the majors above are on hold and meant to land
      one at a time, so an unscoped npm entry would open a pile of PRs that
      contend over `node_modules` and the lockfile. Decide on a scope that does
      not fight that — security-only updates, or patch/minor grouped into a
      single PR with `ignore` entries for the held majors (now just
      `typescript`; vite and `@vitejs/plugin-react` have landed). Note Dependabot only reads its
      config from the default branch.

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
