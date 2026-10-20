// Issue #22: exercise the actual click targets, including when the canvas narrows.
// Use the fixture stack from CI (notes + image/PDF assets), never paid providers.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

await mkdir('tests/screenshots', { recursive: true });
const browser = await chromium.launch();
let cases = 0;
try {
  for (const width of [390, 1024, 1280, 1500, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 850 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    try {
      await page.goto('http://localhost:5173/');
      assert.match(await page.title(), /SYNAPSE.*explorer/);
      await page.waitForFunction(() => /\d+ notes/.test(document.querySelector('#st-notes').textContent));
      if (width <= 700) {
        await page.waitForFunction(() => document.querySelector('.lhs').getBoundingClientRect().right <= 1);
      }
      assert.equal(await page.locator('vite-error-overlay').count(), 0);

      const checkControls = async (state) => {
        const label = `${width}-${state}`;
        const reset = page.locator('[onclick="resetLayout()"]');
        const path = page.locator('#pathBtn');
        const selectors = [
          '[onclick="resetLayout()"]', '#pathBtn', '#typebar .pill', '#lensBtn',
          '[onclick="toggleLhs()"].edgeBtn', '[onclick="toggleReader()"].edgeBtn',
        ];
        // Probe several interior points, not just centers: partial overlap can
        // leave a Playwright click working while a visible part remains unreachable.
        for (const selector of selectors) {
          for (const control of await page.locator(selector).all()) {
            assert.ok(await control.isVisible(), `${label}: ${selector} visible`);
            const hit = await control.evaluate((el) => {
              const r = el.getBoundingClientRect();
              const canvas = document.querySelector('#canvasWrap').getBoundingClientRect();
              const inside = r.left >= canvas.left && r.right <= canvas.right
                && r.top >= canvas.top && r.bottom <= canvas.bottom;
              const clear = [0.2, 0.5, 0.8].every((x) => [0.2, 0.5, 0.8].every((y) =>
                el.contains(document.elementFromPoint(r.x + r.width * x, r.y + r.height * y))));
              return { inside, clear };
            });
            assert.deepEqual(hit, { inside: true, clear: true }, `${label}: ${selector} unobstructed`);
          }
        }

        const gap = await page.locator('#canvasTools').evaluate((tools) => {
          const r = tools.getBoundingClientRect();
          const buttons = [...tools.querySelectorAll('button')].map((b) => b.getBoundingClientRect());
          for (let y = r.top + 4; y < r.bottom - 4; y += 4) {
            for (let x = r.left + 4; x < r.right - 4; x += 4) {
              if (buttons.every((b) => x < b.left - 2 || x > b.right + 2 || y < b.top - 2 || y > b.bottom + 2)) {
                return { x, y, hit: document.elementFromPoint(x, y)?.id };
              }
            }
          }
          return null;
        });
        assert.ok(gap, `${label}: toolbar has whitespace to test`);
        assert.equal(gap.hit, 'graph', `${label}: toolbar whitespace passes through to canvas`);
        const zoom = await page.evaluate(() => window.__synapse.graph().zoom);
        await page.mouse.move(gap.x, gap.y);
        await page.mouse.wheel(0, zoom < 4 ? -120 : 120);
        await page.waitForFunction((before) => window.__synapse.graph().zoom !== before, zoom);

        await reset.click({ timeout: 3000 });
        assert.match(await page.locator('#st-msg').textContent(), /layout reset.*all pins released/);
        assert.deepEqual(await page.evaluate(() => window.__synapse.graph().pinned), []);
        await path.click({ timeout: 3000 });
        assert.equal(await path.getAttribute('data-on'), '1');
        assert.match(await page.locator('#st-msg').textContent(), /click the FIRST note/);
        await path.click();
        assert.match(await page.locator('#st-msg').textContent(), /path mode off/);

        const notes = page.locator('#typebar .pill[data-type="note"]');
        await notes.click();
        assert.match(await notes.getAttribute('class'), /\boff\b/);
        assert.match(await page.locator('#st-notes').textContent(), /filtered by type/);
        await notes.click();
        assert.doesNotMatch(await notes.getAttribute('class'), /\boff\b/);

        await page.locator('#lensBtn').click();
        assert.ok(await page.locator('#lensMenu').isVisible());
        const option = page.locator('#lensMenu [data-lens="links"]');
        await option.click();
        assert.equal(await option.getAttribute('aria-selected'), 'true');
        assert.ok(!(await page.locator('#lensMenu').isVisible()));
        assert.ok(await page.locator('#sresults').isVisible());
        await page.locator('#st-notes').click(); // dismiss the intentional sort-results popup
        assert.ok(!(await page.locator('#sresults').isVisible()));
        await page.screenshot({ path: `tests/screenshots/canvas-controls-${label}.png` });
        cases++;
      };

      await checkControls('default');
      if (width > 700) {
        await page.locator('[onclick="toggleLhs()"].edgeBtn').click();
        await page.waitForFunction(() => document.body.dataset.lhs === 'closed');
        await page.locator('[onclick="toggleReader()"].edgeBtn').click();
        await page.waitForFunction(() => document.body.dataset.reader === 'closed');
        await checkControls('collapsed');
        await page.locator('[onclick="toggleLhs()"].edgeBtn').click();
        await page.locator('[onclick="toggleReader()"].edgeBtn').click();
        await checkControls('restored');
        const divider = await page.locator('#rs-lhs').boundingBox();
        await page.mouse.move(divider.x + divider.width / 2, divider.y + divider.height / 2);
        await page.mouse.down();
        await page.mouse.move(divider.x + divider.width / 2 + 60, divider.y + divider.height / 2, { steps: 5 });
        await page.mouse.up();
        await checkControls('resized');
      }
      assert.deepEqual(errors, [], `${width}: no browser errors`);
    } catch (error) {
      await page.screenshot({ path: `tests/screenshots/canvas-controls-FAIL-${width}.png` });
      throw error;
    } finally {
      await page.close();
    }
  }
  console.log(`PASS: canvas controls independently clickable in ${cases} viewport/sidebar cases`);
} finally {
  await browser.close();
}
