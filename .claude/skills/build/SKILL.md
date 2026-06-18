---
name: build
description: Read a spec in specs/<name>.md and build exactly what it describes — no extra features, no unrelated refactors, no invented requirements. When done, report which spec requirements were covered for review. Use when the user runs /build or asks to build/implement a spec.
---

# build

Your job is to implement a spec faithfully — nothing more, nothing less. The spec is the contract. Build exactly what it says, then report coverage so the review step can check your work against it.

## Step 1: Find and read the spec

- If the user named a spec (`/build csv-lead-import`), read `specs/csv-lead-import.md`.
- If they didn't name one, list `specs/*.md`. If there's exactly one, use it. If there are several, ask which one. If there are none, tell the user there's no spec to build and suggest running `/spec` first. Do not invent a spec.
- Read the **entire** spec before writing any code. Pay attention to all sections: Objective, Requirements, Constraints, Edge Cases, and Definition of Done.

## Step 2: Build exactly what the spec describes

Implement every requirement in the spec, and only what the spec describes. Hold yourself to these rules:

- **No scope creep.** Do not add features, options, endpoints, fields, or UI that the spec doesn't ask for — not even "nice to have" ones. If you think something is missing, note it for the user instead of building it.
- **No unrelated refactors.** Touch only the code needed to satisfy the spec. Do not reformat, rename, restructure, or "clean up" code that the spec doesn't require you to change. Keep the diff focused.
- **No invented requirements.** Don't add validation, error handling, or behavior beyond what the spec states. Implement the edge cases the spec lists, the way it describes them.
- **Respect the constraints.** Follow the spec's stated tech stack, dependencies, conventions, and anything it says must NOT change. Match the surrounding code's style and idioms.
- **Handle the listed edge cases.** Each edge case in the spec must behave as specified.

If the spec is ambiguous or contradictory on a point that blocks you, stop and ask the user one focused question rather than guessing or inventing a requirement. If something in the spec is genuinely impossible or unsafe to build as written, raise it rather than silently working around it.

Verify your work as you go (build it, run it, run any tests or commands the spec's Definition of Done names) so the coverage report reflects reality, not intent.

## Step 3: Report requirement coverage

When you finish, output a coverage report mapping each spec requirement to what you did, so the review step can check the build against the spec. Format it as a checklist:

```
## Coverage for specs/<name>.md

### Requirements
- [x] <Requirement 1, quoted or summarized from the spec> — <where/how it's implemented (file:line)>
- [x] <Requirement 2> — <where/how>
- [ ] <Any requirement NOT done> — <why it's incomplete or blocked>

### Edge cases
- [x] <Edge case from spec> — <how it's handled>

### Definition of done
- [x] <Each item from the spec's Definition of Done> — <verified how, e.g. test name / command output>

### Notes
- Anything you noticed but deliberately did NOT build because it wasn't in the spec.
- Any spec ambiguity you resolved and the assumption you made.
```

Mark an item `[x]` only if it's actually done and verified; use `[ ]` for anything incomplete and say why. Be honest — the coverage report is what the reviewer trusts. Do not claim a requirement is covered if it isn't.
