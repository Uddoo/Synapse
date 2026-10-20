# GBU Review - issue #22 canvas controls

- Reviewer: Codex, sequential `cpto` pass after the `dev` implementation; not an independent
  or human review.
- Date: 2026-10-20
- Target: `fix/22-canvas-controls`, against base `0267d5215fc332ecdb15fead63baa7339b7139b6`.
- Acceptance: reset/path/type/sort/sidebar controls remain independently clickable as the
  viewport and sidebars resize.

## Verdict

**APPROVE WITH CONDITIONS**

The local submission gate passes. The small markup/CSS change uses the existing handlers,
tokens, and flex-wrap vocabulary; it removes the conflicting absolute positions and reserves
space for the sidebar buttons. Actual browser interaction and screenshot evidence support the
fix. Hosted CI and maintainer acceptance are still required before merge.

## GOOD (preserve)

- EXTEND, not duplicate: existing canvas tools and reset/path handlers are reused.
- Regression first: the reset target was obstructed before the product edit.
- The 17-case Chromium regression covers five widths plus collapsed/restored/resized desktop
  sidebars. Existing Explorer E2E also proves a dragged pin is released and a path is drawn.
- The optional CI E2E sequence includes the regression; screenshots stay per-run artifacts.
- No API, vault, provider, storage, permission, or paid-call behavior changed.

## BAD (fix - P0/P1/P2)

- No new blocking finding in the inspected diff.
- Pre-existing limitations, outside #22: the 390 px topbar overflows; five Windows backend
  tests fail identically at the exact base. These are disclosed rather than silently repaired.

## UGLY (rethink - P0/P1/P2)

- None identified within this bounded layout change.

## Evidence checked

The [implementation report](../reports/2026-10-20_issue22_canvas_controls.md) records commands
and results: Linux backend 305 passed, frontend build, adapter guard and its nine-fixture
self-test, five existing real-Chromium specs, and the new 17-case regression. Inspected the
actual HTML/CSS/test/workflow diff and before/after 1024 px plus fixed 390 px screenshots.
Browser checks cover page identity, rendered notes, visibility, hit targets, state changes,
no Vite error overlay, and no captured browser errors.

## Second-opinion gate

Second-opinion gate: triggers checked, none fired.
No security/secrets/spend/deployment behavior or public/cross-CLI contract changed; no
REVISE/REJECT verdict, disputed P0/P1, or human request for a challenge applies.

## Required next actions

1. `dev`: submit the PR template with screenshot attachments and autonomous-AI disclosure.
2. Maintainers: review the diff and hosted checks under the repository's normal gate.
   This agent does not approve workflows, approve the PR, enable auto-merge, or merge it.

## Follow-up to automated review of 2364b69

The external Codex review correctly identified a P2: the transparent toolbar's unused area
intercepted sibling-canvas gestures. A new test first reproduced the wrong hit target. The
follow-up restricts pointer-event restoration to buttons and the lens menu; intermediate
wrappers and gaps pass through. Reviewed the exact CSS/test diff and the repeated green
17-case browser run, which now includes actual wheel zoom in a gap, the existing Explorer
drag/pin/reset run, and the passing build. No additional blocking finding; the conditional
submission verdict stands. This is an automated self-review, not maintainer acceptance.
