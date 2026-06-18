---
name: review
description: Compare the current build against specs/<name>.md requirement by requirement, list every gap, bug, or missing piece naming the exact spec item it fails, and write specific fixes for /build to address. Only pass when every spec requirement is fully met. Use when the user runs /review or asks to review/verify a build against its spec.
---

# review

Your job is to verify a build against its spec, requirement by requirement, and report a verdict. You are the gate: the build passes only when **every** requirement in the spec is fully met. Be rigorous and skeptical — assume nothing is done until you've confirmed it in the code or by running it.

## Step 1: Find and read the spec

- If the user named a spec (`/review csv-lead-import`), use `specs/csv-lead-import.md`.
- If they didn't, list `specs/*.md`. If there's exactly one, use it; if several, ask which; if none, tell the user there's no spec to review against.
- Read the **entire** spec: Objective, Requirements, Constraints, Edge Cases, and Definition of Done. These are the items you will check against.

## Step 2: Check the build against every spec item

Go through the spec **one item at a time** — every requirement, every constraint, every edge case, every Definition-of-Done item. For each one:

- **Find the evidence.** Locate the code that satisfies it (cite `file:line`). Don't take a coverage report's word for it — confirm the code actually does what the item requires. Where the spec's Definition of Done names a test or command, run it and use the real result.
- **Judge it honestly:**
  - **Met** — the build fully satisfies the item.
  - **Partial** — some of it works but it's incomplete or only handles some cases.
  - **Missing** — not implemented at all.
  - **Buggy** — implemented but incorrect, or it breaks on a case the spec requires.
- **Watch for scope violations too.** The spec is the contract in both directions: flag features, behavior, or changes in the build that the spec does NOT ask for, since `/build` is supposed to implement only the spec.

Be specific about failures. "Validation is weak" is not useful; "Uploading a CSV with a missing `email` column is accepted and imports blank rows, but Requirement 4 says malformed rows must be rejected with an inline error" is.

## Step 3: Report the verdict

### If anything fails

List every gap, bug, missing piece, and scope violation. For each one, name the **exact spec item** it fails and write the **specific fix** needed, so `/build` can pick it up and address it directly:

```
## Review of specs/<name>.md — CHANGES NEEDED

### Failing items
1. **[Requirement N: <quoted spec item>]** — <Missing | Partial | Buggy>
   - Problem: <exactly what's wrong, with file:line if it exists>
   - Fix: <the specific change needed to satisfy this spec item>

2. **[Edge case: <quoted spec item>]** — <status>
   - Problem: ...
   - Fix: ...

### Scope violations (in the build but not in the spec)
- <What was added that the spec doesn't ask for> (file:line) — Fix: <remove, or confirm with user>

### Passing items
- [x] <spec items that are fully met>
```

End with a clear instruction: **run `/build` to apply these fixes, then `/review` again.** Do not fix the code yourself — your job is to find and specify the fixes; `/build` implements them. (If the user explicitly asks you to apply the fixes, that's a separate request.)

### If everything passes

Only declare a pass when **every** requirement, constraint, edge case, and Definition-of-Done item is fully met — no partials, no missing pieces, no unresolved scope violations. Then:

```
## Review of specs/<name>.md — PASS

Every spec item is fully met:
- [x] <each requirement> — verified <how: file:line / test / command output>
- [x] <each edge case>
- [x] <each definition-of-done item>

No scope violations found. The build matches the spec.
```

Do not pass a build with any item that is partial, missing, buggy, or unverified. When in doubt, fail it and say what you couldn't confirm.
