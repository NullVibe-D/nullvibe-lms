import { chromium, expect } from "@playwright/test";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import assert from "node:assert/strict";

const browser = await chromium.launch({
  executablePath:
    process.env.QA_BROWSER ||
    "C:/Users/Lenovo/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe",
});
const base = process.env.QA_URL || "http://127.0.0.1:4180";
const evidence = {
  date: new Date().toISOString(),
  kind: "Local compiled build; not field performance or physical-device testing",
  assets: [],
  layoutChecks: [],
  performance: null,
};
try {
  for (const file of await readdir("dist/client/assets")) {
    if (!/\.(js|css)$/.test(file)) continue;
    const body = await readFile("dist/client/assets/" + file);
    evidence.assets.push({
      file,
      bytes: body.length,
      gzipBytes: gzipSync(body).length,
    });
  }
  assert(
    evidence.assets
      .filter((x) => x.file.endsWith(".js"))
      .reduce((n, x) => n + x.gzipBytes, 0) < 105000,
    "JavaScript gzip budget",
  );
  assert(
    evidence.assets
      .filter((x) => x.file.endsWith(".css"))
      .reduce((n, x) => n + x.gzipBytes, 0) < 10000,
    "Stylesheet gzip budget",
  );
  evidence.lessonImageBytes = (
    await stat("public/assets/lesson-teacher.webp")
  ).size;
  assert(evidence.lessonImageBytes < 80000, "Lesson preview image budget");
  const page = await browser.newPage({ viewport: { width: 360, height: 844 } });
  await page.addInitScript(() => {
    window.localMetrics = { lcp: 0, cls: 0, longTasks: [] };
    new PerformanceObserver((list) =>
      list.getEntries().forEach((e) => {
        window.localMetrics.lcp = e.startTime;
      }),
    ).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) =>
      list.getEntries().forEach((e) => {
        if (!e.hadRecentInput) window.localMetrics.cls += e.value;
      }),
    ).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) =>
      list
        .getEntries()
        .forEach((e) => window.localMetrics.longTasks.push(e.duration)),
    ).observe({ type: "longtask", buffered: true });
  });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  evidence.performance = await page.evaluate(() => ({
    ...window.localMetrics,
    paints: performance
      .getEntriesByType("paint")
      .map((e) => ({ name: e.name, milliseconds: e.startTime })),
    resources: performance
      .getEntriesByType("resource")
      .map((e) => ({
        origin: new URL(e.name).origin,
        type: e.initiatorType,
        bytes: e.decodedBodySize,
      })),
    videos: document.querySelectorAll("video").length,
  }));
  for (const width of [320, 640, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const language of ["en", "si", "ja"]) {
      await page.getByLabel("Language", { exact: true }).selectOption(language);
      for (const path of ["courses", "learn/N5", "practice/N5", "studio"]) {
        await page.goto(base + "/#/" + path);
        await page.locator("main h1").waitFor();
        await page.evaluate(() => document.fonts.ready);
        const clipped = await page.evaluate(() =>
          Array.from(
            document.querySelectorAll(
              "button, input, select, a:not(.skip-link)",
            ),
          )
            .filter((el) => {
              const rect = el.getBoundingClientRect();
              return (
                rect.width &&
                rect.height &&
                (rect.left < -1 || rect.right > innerWidth + 1)
              );
            })
            .map((el) => el.outerHTML.slice(0, 150)),
        );
        assert.deepEqual(
          clipped,
          [],
          language + " " + width + " " + path + " clipped controls",
        );
        evidence.layoutChecks.push({
          width,
          language,
          path,
          clippedControls: 0,
        });
      }
    }
  }
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByLabel("Language", { exact: true }).selectOption("en");
  await page.locator(".mentor-trigger").click();
  const close = page.getByRole("button", { name: "Close", exact: true });
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  assert(
    await page.evaluate(() => !!document.activeElement.closest("dialog")),
    "Modal focus contained",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".mentor-trigger")).toBeFocused();
  await page.locator(".mentor-trigger").click();
  await page.getByLabel("Your question", { exact: true }).fill("test");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByRole("log")).toContainText("Free-form AI answers");
  await page.keyboard.press("Escape");
  evidence.shortViewportDialog =
    "320x568: focus containment, input, submit, Escape and focus restoration passed";
  // The hosted build must remain usable when optional web fonts are unavailable.
  const fallback = await browser.newPage({
    viewport: { width: 360, height: 844 },
  });
  await fallback.route("**/fonts/*.woff2", (route) => route.abort());
  await fallback.goto(base);
  await fallback
    .getByRole("button", { name: "Start N5", exact: true })
    .first()
    .click();
  await expect(fallback.locator("h1")).toHaveText("あ・い・う・え・お");
  evidence.fontFailure = "Lesson remains usable with web-font requests blocked";
} finally {
  await browser.close();
  await writeFile("qa/quality.json", JSON.stringify(evidence, null, 2));
}
console.log(
  JSON.stringify(
    {
      layoutChecks: evidence.layoutChecks.length,
      assets: evidence.assets,
      shortViewportDialog: evidence.shortViewportDialog,
      fontFailure: evidence.fontFailure,
    },
    null,
    2,
  ),
);
