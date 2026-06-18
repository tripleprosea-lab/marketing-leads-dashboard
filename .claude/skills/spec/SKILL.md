---
name: spec
description: Interview the user one question at a time to fully understand a feature or app they want to build, then write a detailed specification to specs/<name>.md. Use when the user runs /spec or asks to spec out, scope, or plan a feature/app before building.
---

# spec

Your job is to turn a fuzzy idea into a precise, checkable specification. You do this in two phases: **interview**, then **write the spec**. Do not write any application code. Do not start building. Your only deliverable is the spec file.

## Phase 1: Interview

Interview the user to fully understand what they want. Follow these rules:

- **Ask exactly one focused question at a time.** Wait for the answer before asking the next one. Never batch multiple questions into one message.
- **Make each question count.** Build on previous answers. Don't ask things the user already told you or that you can reasonably infer.
- **Keep going until you genuinely understand all four of these:**
  1. **The goal** — what the user is trying to achieve and why. Who is it for?
  2. **The must-have requirements** — the specific capabilities and behaviors that have to exist for this to be worth building.
  3. **The constraints** — tech stack, platform, dependencies, performance, security, budget, timeline, design conventions, things that must NOT change, anything that boxes in the solution.
  4. **The definition of done** — what the user can observe or test to confirm the build is finished and correct.
- **Probe the edges.** Ask about error states, empty states, invalid input, limits, permissions, concurrency, and what happens when things go wrong. These become the edge-case section of the spec.
- **Prefer concrete over abstract.** If an answer is vague ("it should be fast", "handle lots of users"), ask for a number or a specific example.
- **Don't lead with your own design.** Surface the user's intent; only suggest options when the user is unsure, and present them as choices.

When you believe you have enough to write a complete spec, briefly summarize your understanding back to the user in a few bullet points and ask them to confirm or correct it before you write the file. Only proceed once they confirm.

## Phase 2: Write the spec

Once the user confirms, write the spec to `specs/<name>.md`. Choose a short, descriptive, kebab-case `<name>` derived from the feature (e.g. `specs/csv-lead-import.md`). Create the `specs/` directory if it doesn't exist.

The spec must be clear and detailed enough that a different engineer (or agent) could build the feature from it without needing to ask the user follow-up questions, and could check their finished work against it. Use this structure:

```markdown
# <Feature / App Name>

## Objective
What we're building and why. The goal and the intended user/audience. 1–3 paragraphs.

## Requirements
The exact, numbered list of must-have requirements. Each one is specific and
testable — describe the behavior, not the implementation, unless the
implementation is itself a constraint. Mark anything explicitly out of scope.

## Constraints
Tech stack, platform, dependencies, performance/security/budget/timeline limits,
existing conventions to follow, and anything that must NOT change.

## Edge Cases
Concrete situations the build must handle correctly: invalid/empty input,
error states, limits, permissions, concurrency, failure modes. For each, state
the expected behavior.

## Definition of Done
A concrete, checkable list. Each item is something a reviewer can verify is
true of the finished build (e.g. "Uploading a malformed CSV shows an inline
error and imports zero rows"). If acceptance tests, commands, or specific
outputs apply, name them.
```

After writing the file, tell the user the path and give a one-line summary. Do not start implementing unless the user explicitly asks you to in a separate request.
