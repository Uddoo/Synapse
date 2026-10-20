# Issue #22 - canvas control layout

Owner: Codex (`dev` for implementation; `cpto` for the separate GBU pass).
Base: `0267d5215fc332ecdb15fead63baa7339b7139b6`.

## Acceptance and reuse

Opening Explorer must leave reset, path, type filters, sort, and sidebar controls independently
clickable as the viewport and sidebars resize.

EXTEND the existing `frontend/index.html` control layout and standalone Playwright conventions.
Reuse the existing reset/path handlers, type pills, lens, and graph debugging seams.
No new component, API, design token, provider, or storage contract is needed.

## Plan (before implementation)

1. Add the missing `frontend/README.md` required by the reuse-first policy.
2. Add a failing real-Chromium regression under `tests/e2e/` for the overlapping controls.
   Cover narrow and wide viewports, expanded/collapsed sidebars, and actual state changes.
3. Fix the existing canvas layout in `frontend/index.html` without changing its visual tokens.
4. Document the regression command in `tests/e2e/README.md` and the fix in `CHANGELOG.md`;
   include the regression in the existing opt-in E2E workflow.
5. Run the new regression, relevant existing Explorer specs, backend tests, frontend build,
   and adapter checks. Record actual results and limits here; perform the GBU review under
   `../reviews/` before submitting a PR.

## Test environment

Use an isolated fixture vault and env file, loopback-only servers, and
`SYNAPSE_MOCK_MODELS=1`. No personal sources or paid calls.
Browser plugin not available; use the repository's Playwright/Chromium workflow.

## Results

- Before the fix, real Chromium showed the type/sort tools covering reset/path at 390 and
  1024 px. The test-first regression failed on the reset button's obstructed hit target.
- After the fix: `node tests/e2e/canvas_controls.spec.mjs` ->
  `PASS: canvas controls independently clickable in 17 viewport/sidebar cases`.
  Widths: 390, 1024, 1280, 1500, 1920 px; desktop also collapses/restores the sidebars and
  drags the menu divider. Actual clicks assert reset feedback, path arming/disarming, note-type
  filtering, and sort selection/results. Nine interior hit probes per button plus canvas
  bounds catch partial overlap/clipping; page identity, meaningful note counts, absence of a
  Vite overlay, and browser error logs are also checked.
- Existing real-Chromium specs passed: `sprint02_explorer` (including drag/pin/reset),
  `sprint04_open_brain` (actual note clicks produce a one-hop path), `sprint05_lens`,
  `sprint06_lens`, and `sprint03_distill_render` (mock summary/image). The new 17-case
  regression also passed with the additional mock-generated summary pill.
- Full backend gate: `SYNAPSE_MOCK_MODELS=1 ./start.sh test` on an isolated WSL Ubuntu 24.04
  ext4 copy, Python 3.12.3 -> `305 passed in 2.14s`.
- Windows Python 3.11.9: `python -m pytest -q` -> 300 passed, 5 failed. The exact same five
  tests fail on the unmodified base above (executable mode, newline handling, `os.geteuid`,
  long filenames, and symlink privileges). This is not a Windows full-suite pass; no system
  settings or backend code were changed to hide the failures.
- `npm run build` passed (Node 24.16.0, locked Vite 7.3.6).
- Both adapter checks passed; the self-test caught all nine intentional drift fixtures.
- `git diff --check` passed.

## Screenshot evidence and limits

Playwright 1.64.1 drove Chromium at `http://localhost:5173/` against a loopback fixture backend.
Per-case PNGs are generated under ignored `tests/screenshots/canvas-controls-*.png`.
Before/after screenshots are attached to the PR rather than committed as stale PNGs.

The existing mobile topbar overflows at 390 px (visible in the before screenshot too); this
canvas-control fix does not redesign it. Chromium is the browser verified here; Firefox and
WebKit are untested. The complete historical E2E collection was not run.
Hosted CI, the optional E2E job, and maintainer review remain separate gates; no workflow
approval, repository setting, or auto-merge change is part of this work.

Implementation, testing, and the GBU pass were performed by an autonomous Codex agent.
No human review or manual verification is claimed.
