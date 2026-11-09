import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL = process.argv[2] || process.env.QA_URL;
assert(baseURL && new URL(baseURL).protocol === 'https:', 'Provide the HTTPS deployment URL');
const browser = await chromium.launch({ executablePath: process.env.QA_BROWSER || 'C:/Users/Lenovo/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe' });
const report = { date: new Date().toISOString(), baseURL, checks: [], errors: [] };
await mkdir('qa/hosted', { recursive: true });
try {
  for (const width of [360, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
    const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    const headers = response.headers();
    assert.equal(headers['x-content-type-options'], 'nosniff');
    assert.equal(headers['x-frame-options'], 'DENY');
    assert.match(headers['content-security-policy'], /frame-ancestors 'none'/);
    assert.match(headers['x-robots-tag'], /noindex/);
    await expect(page.getByRole('button', { name: 'Start N5', exact: true }).first()).toBeVisible();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `qa/hosted/catalog-${width}.png`, fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: 'Start N5', exact: true }).first().click();
    await expect(page.getByRole('button', { name: 'Mark complete', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Mark complete', exact: true }).click();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: 'Lesson complete', exact: true })).toBeDisabled();
    const assets = await page.evaluate(() => [...new Set(performance.getEntriesByType('resource').map(entry => entry.name))]);
    for (const url of assets.filter(url => new URL(url).origin === new URL(baseURL).origin)) {
      const asset = await context.request.get(url);
      assert.equal(asset.status(), 200, url);
    }
    const missing = await context.request.get(new URL('/assets/does-not-exist-nullvibe.js', baseURL).href);
    assert.equal(missing.status(), 404, 'Missing assets must return 404');
    report.checks.push({ width, headers: 'pass', lessonPersistence: 'pass', assets: assets.length, missingAsset: 404 });
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile('qa/hosted/results.json', JSON.stringify(report, null, 2));
}
assert.equal(report.errors.length, 0, JSON.stringify(report.errors));
console.log(JSON.stringify(report, null, 2));
