---
name: next-todo
description: Use when asked to pick up the next item of open work in this repo — "next todo", "what's next", "carry on with the todo list", "grab the next task" — or when a session starts with no specific task and TODO.md is the source of truth.
---

# Next TODO

Pick the next actionable item out of `TODO.md`, name the session after it, and do
the work end to end.

## Workflow

1. **Read `TODO.md` in full.** The `## Done` section is not just history — it
   records decisions ("decided: keep", "listed so it is not re-litigated") that
   stop you from reopening settled questions.

2. **Select one item** from `## Open`, using Selection below. One item, not a
   batch: several of these contend over `node_modules` and the lockfile.

3. **Name the work** before starting it. Mark a chapter
   (`mcp__ccd_session_mgmt__mark_chapter`) titled after the item — short and
   specific: `Add typecheck script + CI gate`, not `TODO work` — and state the
   chosen item in your first line of reply, so the user can redirect before you
   spend anything.

   A session **cannot rename itself**: `set_session_title` and `list_sessions`
   both exclude the current session by contract. Do not burn calls rediscovering
   this. If the user wants the session title changed, they do it, or another
   session does it.

4. **Do the work**, following `CLAUDE.md` — its Gotchas section exists because
   each entry already cost someone real time, and several of them are directly
   about the open items.

5. **Verify before claiming done.** For anything touching code, config or
   dependencies: `npm run lint`, `npm test`, `npm run build`, and `npm audit`
   for dependency work. Paste real output; do not assert green from expectation.

6. **Update `TODO.md` in the same change.** Move the item to `## Done`, checked,
   rewritten as what was actually found — the surprise, the measurement, the
   thing that was wrong about the original framing. If the work spawned new
   questions, file them under `## Open`. An item that turns out to be a
   non-issue still moves to Done, with the reasoning that closed it.

7. **Branch or straight to master** per the Conventions section of `CLAUDE.md`:
   design choices worth reviewing get a PR; small, low-risk, fully verified
   changes need not. When in doubt, PR.

## Selection

Work top-down through `## Open` — Bugs, then Enhancements, then Build / tooling,
then Dependencies — and take the first item that is actionable.

An item is **actionable** when:

- it is not `[x]`, and
- nothing in its own text blocks it (`blocked until…`, `only worth doing if…`),
  and
- it does not depend on another open item. Ordering constraints are written
  into the entries themselves — *"Do this before revisiting TypeScript 7"* means
  the typecheck item outranks the TS 7 item regardless of section order.

Items whose text is an explicit decision to do nothing (**"decided: keep, no
action"**) are not work. Skip them.

**If no item is clearly actionable, or two are equally next, stop and ask** —
present the candidates and let the user pick. Do not invent work that is not on
the list, and do not widen a listed item into a bigger project than it says.

## Red flags

| Thought | Reality |
|---|---|
| "I'll knock out two of these while I'm here" | One item. Parallel dependency work corrupts the lockfile. |
| "The list is stale, I'll just do what's obviously needed" | TODO.md is the source of truth. Ask before going off-list. |
| "This item is bigger than it looks, I'll do the first part" | Scope creep in reverse. Say so and confirm. |
| "Lint/tests almost certainly still pass" | Run them. Evidence before assertions. |
| "I'll update TODO.md at the end / in a follow-up" | The TODO update ships with the work, or it never ships. |
| "It says blocked, but I bet it works now" | Re-check the stated blocker specifically, and report what you found — don't just try it and see. |
