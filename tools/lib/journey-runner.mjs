import { chromium } from 'playwright';
import { mkdirSync, readdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';

function resolveSelector(page, selector) {
  if (selector.startsWith('testid=')) return page.getByTestId(selector.slice('testid='.length));
  return page.locator(selector);
}

async function runAction(page, baseUrl, action) {
  const timeout = action.timeoutMs ?? 10_000;
  switch (action.type) {
    case 'goto':
      await page.goto(new URL(action.url, baseUrl).href, { waitUntil: 'load', timeout });
      return;
    case 'click':
      await resolveSelector(page, action.selector).click({ timeout });
      return;
    case 'fill': {
      const locator = resolveSelector(page, action.selector);
      if (action.delayMs) {
        await locator.fill('', { timeout });
        await locator.pressSequentially(action.value, { delay: action.delayMs, timeout });
      } else {
        await locator.fill(action.value, { timeout });
      }
      return;
    }
    case 'press':
      if (!action.selector) {
        await page.keyboard.press(action.key);
        return;
      }
      await resolveSelector(page, action.selector).press(action.key, { timeout });
      return;
    case 'hover':
      await resolveSelector(page, action.selector).hover({ timeout });
      return;
    case 'expect-visible':
      await resolveSelector(page, action.selector).waitFor({ state: 'visible', timeout });
      return;
    case 'expect-text': {
      const locator = resolveSelector(page, action.selector);
      await locator.waitFor({ state: 'visible', timeout });
      const actual = await locator.innerText();
      if (!actual.includes(action.text)) {
        throw new Error(`expect-text failed: "${actual}" does not contain "${action.text}"`);
      }
      return;
    }
    case 'expect-url': {
      await page.waitForURL((u) => u.href.includes(action.url), { timeout });
      return;
    }
    case 'wait':
      await page.waitForTimeout(action.timeoutMs ?? 500);
      return;
    case 'evaluate':
      await page.evaluate(action.script);
      return;
    default:
      throw new Error(`unknown action type "${action.type}"`);
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runJourney(storyboard, { outDir, durations = {}, video = null, headless = true, initScript = null }) {
  mkdirSync(outDir, { recursive: true });
  const rawDir = join(outDir, 'raw');
  const browser = await chromium.launch({ headless });
  const contextOptions = {};
  if (storyboard.colorScheme) contextOptions.colorScheme = storyboard.colorScheme;
  if (video) {
    mkdirSync(rawDir, { recursive: true });
    contextOptions.viewport = { width: video.width, height: video.height };
    contextOptions.recordVideo = { dir: rawDir, size: { width: video.width, height: video.height }, fps: video.fps };
  }
  const context = await browser.newContext(contextOptions);
  if (initScript) await context.addInitScript({ path: initScript });
  const page = await context.newPage();

  const events = { storyId: storyboard.storyId, ok: true, scenes: [] };
  const t0 = Date.now();
  const now = () => (Date.now() - t0) / 1000;

  try {
    for (const scene of storyboard.scenes) {
      const record = { id: scene.id, tStartSec: now(), ok: true, actions: [] };
      events.scenes.push(record);
      for (const action of scene.actions) {
        try {
          await runAction(page, storyboard.baseUrl, action);
          record.actions.push({ type: action.type, ok: true });
        } catch (err) {
          record.actions.push({ type: action.type, ok: false, error: err.message });
          record.ok = false;
          events.ok = false;
          throw new Error(`scene ${scene.id}, action ${action.type}: ${err.message}`);
        }
      }
      const minHold = Math.max(scene.minHoldSec ?? 1, (durations[scene.id] ?? 0) + 0.3);
      const elapsed = now() - record.tStartSec;
      if (elapsed < minHold) await sleep((minHold - elapsed) * 1000);
      record.tEndSec = now();
    }
  } catch (err) {
    events.error = err.message;
    const last = events.scenes.at(-1);
    if (last && last.tEndSec === undefined) last.tEndSec = now();
  } finally {
    await context.close();
    await browser.close();
  }

  if (video) {
    const webm = readdirSync(rawDir).find((f) => f.endsWith('.webm'));
    if (webm) {
      renameSync(join(rawDir, webm), join(rawDir, 'video.webm'));
      events.videoFile = join(rawDir, 'video.webm');
    } else if (events.ok) {
      events.ok = false;
      events.error = 'recording finished but no webm file was produced';
    }
  }
  return events;
}
