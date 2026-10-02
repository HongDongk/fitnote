## Language

- Always answer in Korean.

---

## Encoding

- All text files must be saved as UTF-8.
- When editing files that contain Korean text, verify the file renders correctly after the change.
- If Korean text appears broken in terminal output, re-read the file with explicit UTF-8 before editing.
- Prefer replacing corrupted strings immediately rather than preserving broken text.

---

## Purpose

- Reduce unnecessary changes
- Maintain consistency
- Ensure correctness through verification
- Prefer simplicity over cleverness

**Tradeoff:** prioritize caution over speed

---

## Frontend Principles

- Match existing component, routing, styling, and state-management patterns.
- Do not introduce a new UI library or styling approach unless explicitly requested.
- Prefer existing design-system components over custom one-off UI.
- Keep UI changes scoped to the requested screen or component.
- Verify text wrapping and layout on relevant viewport sizes when UI changes are visible.

---

## Graphify

Graphify is installed in `.venv`, and the current `graphify-out/graph.json` is accepted as the source-code map for the current project root.

Current status:

- `graphify-out/graph.json` exists.
- `graphify-out/GRAPH_REPORT.md` exists.
- `graphify-out/graph.html` exists.
- The graph scan root is the current project root (`.`), so `source_file` values are relative to the project root.
- Treat all supported files under the current project root as within the Graphify scope, except files skipped by Graphify or excluded by ignore rules.

Rules:

- Use Graphify selectively to reduce exploration cost, not as a mandatory first step for every task.
- For narrow tasks where the relevant file is already known, read the file directly first.
- For broad project questions involving feature flow, module relationships, ownership, or "where/how is this used", read `graphify-out/GRAPH_REPORT.md` before broad source searches.
- If Graphify cannot find a relevant node, fall back to reading source files and using `rg`.
- For cross-module questions anywhere under the project root, prefer graph query/path/explain commands before broad source searches.
- After modifying supported files under the project root, run `graphify update .` to keep the graph current. If it fails, report the failure instead of relying on stale graph data.

---

## Thinking Rules

Before coding:

- State assumptions explicitly.
- Ask instead of guessing when intent is unclear.
- Present multiple interpretations if ambiguous.
- Stop if missing information changes the implementation choice.
- Surface tradeoffs when relevant.
- Propose simpler alternatives when possible.

---

## Simplicity & Scope

- Implement only what was requested.
- No speculative features or abstractions.
- No unnecessary configurability.
- Avoid unrealistic edge-case handling.
- Do not refactor unrelated code.

**Rule:**

> If it can be simpler, make it simpler.

---

## Code Changes

- Modify only what is required.
- Match existing style.
- Reuse existing components, hooks, utilities, and tokens.
- Do not change working code without reason.
- Do not create new files unless necessary.

When introducing unused code:

- Remove only what you made unused.

When finding existing dead code:

- Mention only.

---

## Execution & Verification

Convert tasks into verifiable outcomes:

- Bug fix → failing case → pass
- UI change → affected viewport checked
- Validation → invalid case checked
- Refactor → tests pass before/after when feasible

After code changes:

- Run the narrowest verification that directly matches the changed behavior.
- Prefer focused type, lint, unit, story, or browser checks over broad suites unless the change is broad or risky.
- If verification cannot run, report the exact command and failure reason.

---

## Multi-Agent Workflow

Use multi-agents for non-trivial tasks with cross-module impact, ambiguous intent, or independent verification needs.

Prefer a single agent for small, localized edits where implementation and verification can be completed safely in one pass.

Good candidates:

- Changes that affect multiple screens, shared layouts, auth flow, routing, or Server/Client Component boundaries
- Cross-module investigations where graph relationships are useful
- UI changes that need independent responsive, accessibility, or regression review
- Larger changes where investigation, implementation, and verification can be split into clear responsibilities

Avoid multi-agents for:

- Small single-file edits
- Simple text, label, spacing, or style tweaks
- Obvious one-line bug fixes
- Tasks where coordination adds more complexity than value

Rules:

- Give each agent a concrete, non-overlapping responsibility.
- Keep code-writing agents assigned to explicit files or modules.
- Workers must not revert or overwrite changes made by others.
- The main agent integrates findings, reviews the final diff, runs verification, and reports scope, risks, and verification status.

---

## Priority Rules

When conflicts occur:

1. Correctness
2. Minimal change
3. Consistency
4. Simplicity

---

## Output

Always include:

- What changed
- Why this fits the codebase
- Affected scope
- Risks, if any
- Verification status

---

## Definition of Done

Complete only if:

- Requirements satisfied
- Verified or verification limitation reported
- No unnecessary changes
- Existing frontend patterns preserved
- Code is simple
- Assumptions clarified
