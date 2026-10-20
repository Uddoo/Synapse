# E2E — real-Chromium checks (Playwright)

Per the E2E doctrine (`.claude/policies/e2e-doctrine.md`): a real browser via `page.goto()`,
visibility assertions, screenshots to `../screenshots/`. Never `request.get()`.

## Running

```bash
./start.sh                      # live stack with an ingested vault (run ingest once)
npm i -D playwright && npx playwright install chromium   # one-time, anywhere convenient
node tests/e2e/sprint01_dashboard.spec.mjs               # acceptance flow: ingest×2, invariance, index
node tests/e2e/keys_panel.spec.mjs                       # model-keys UX (write flow needs a SCRATCH stack + E2E_KEYS_WRITE_OK=1)
node tests/e2e/sprint01_wiki_popup.spec.mjs              # wiki popup: wikilink nav, infobox, Esc
node tests/e2e/canvas_controls.spec.mjs                 # reset/path/type/sort controls across viewport/sidebar states
```

The canvas-controls regression expects the CI fixture vault (repo_a + repo_b + the
assets-enabled repo_photos root) and `SYNAPSE_MOCK_MODELS=1`. It uses real button clicks,
checks for overlapping/clipped hit targets, and saves screenshots at 390, 1024, 1280,
1500, and 1920 px, including collapsed/restored/resized desktop sidebars.

Both scripts exit non-zero on failure and drop screenshots into `tests/screenshots/`.
They run against the LIVE dev stack (the founder's actual acceptance path). They are
vault-agnostic: `E2E_FILTER` (default `alpha` — a note that exists in the committed fixture
repos, and therefore also in any vault that ingested this repo) picks the note used for the
filter/navigation steps.

**CI:** the `e2e` job in `.github/workflows/ci.yml` runs all five specs (sprint01 ×2,
sprint02, sprint03, keys_panel) against a FIXTURE vault (repo_a + repo_b) with real Chromium and
`SYNAPSE_MOCK_MODELS=1` (the AI flow costs nothing). Opt-in via repo variable
`ENABLE_E2E_CI=true` — kept off the always-on path because it needs a browser download +
a live stack (~2–3 min). Screenshots are uploaded as the `explorer-e2e-evidence` artifact.
