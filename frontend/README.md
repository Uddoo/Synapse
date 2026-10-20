# Explorer frontend

The Vite frontend reads the backend API; it never reads the vault directly. Start the full stack
from the repo root as described in the [project README](../README.md). For frontend-only
development, run `npm ci` then `npm run dev` here with the backend already running.
`npm run build` checks the production bundle.

## Existing seams

- `index.html` owns the Explorer shell, canvas controls, reader, and inline styles.
- `src/explorer.js` wires the shell, filters, reset/path controls, and sort lens.
- `src/graph.js` owns canvas rendering, graph layout, camera, and interaction state.
- `src/wiki.js` owns note rendering and navigation; `src/api.js` is the shared API client.

Reuse these modules before adding alternatives. The
[Explorer kit](../project-management/ui_kit/explorer/KIT.md) owns the visual language;
[module contracts](../project-management/03_MODULE_CONTRACTS.md) document the boundaries.
Local contribution rules are in [AGENTS.md](AGENTS.md).

## Browser verification

UI changes need real Chromium navigation, visibility checks, actual interactions, and screenshots
at multiple viewports. Follow the [E2E setup and specs](../tests/e2e/README.md) using fixture
sources and mocked models.
