import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const baseURL = process.env.QA_URL || "http://127.0.0.1:4180";
await mkdir("qa/after", { recursive: true });
const browser = await chromium.launch({
  args: process.env.QA_DISABLE_GPU === "1" ? ["--disable-gpu"] : [],
  executablePath:
    process.env.QA_BROWSER ||
    "C:/Users/Lenovo/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe",
});
const results = {
  date: new Date().toISOString(),
  baseURL,
  browser: browser.version(),
  scans: [],
  checks: [],
  errors: [],
};
const widths = [320, 360, 768, 1024, 1440];
const checked = (name) => {
  results.checks.push(name);
  console.log("PASS " + name);
};
const btn = (page, name) => page.getByRole("button", { name, exact: true });
const visibleNav = (page) =>
  page.locator(
    page.viewportSize().width <= 790 ? ".mobile-bottom-nav" : ".desktop-nav",
  );
async function ready(page) {
  await page.locator("main h1").waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function capture(page, name) {
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: "qa/after/" + name + ".png",
    animations: "disabled",
  });
}
async function scan(page, screen, language = "en") {
  await page.evaluate(async () => {
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) => animation.effect?.getTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    screen + " horizontal overflow",
  );
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  results.scans.push({
    width: page.viewportSize().width,
    language,
    screen,
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    })),
  });
}
async function completePractice(page, answers) {
  for (let i = 0; i < answers.length; i++) {
    await page.getByRole("radio").nth(answers[i]).check();
    await btn(page, "Check answer").click();
    await btn(
      page,
      i === answers.length - 1 ? "See results" : "Next question",
    ).click();
  }
}
try {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: width < 500 ? 844 : 1024 },
    });
    const page = await context.newPage();
    page.on("pageerror", (error) =>
      results.errors.push({ width, error: error.message }),
    );
    await page.goto(baseURL);
    await ready(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toContainText("made simple");
    const cta = await btn(page, "Start N5").first().boundingBox();
    assert(
      cta.y + cta.height < page.viewportSize().height - 64,
      "Primary action visible on arrival",
    );
    await capture(page, "01-courses-" + width);
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main h1")).toBeFocused();
    await btn(page, "Start N5").first().click();
    await expect(page).toHaveURL(/#\/learn\/N5$/);
    await expect(page.locator("h1")).toHaveText("あ・い・う・え・お");
    await page.goBack();
    await expect(page.locator("h1")).toContainText("made simple");
    await page.goForward();
    await expect(page.locator("h1")).toHaveText("あ・い・う・え・お");
    await btn(page, "Mark complete").click();
    await page.reload();
    await expect(btn(page, "Lesson complete")).toBeDisabled();
    await capture(page, "02-lesson-" + width);
    await page.getByRole("tab", { name: "Examples", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("tab", { name: "Reading guide", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await btn(page, "Next lesson").click();
    await expect(page.locator("h1")).toHaveText("こんにちは");
    await btn(page, "Quick practice").click();
    await expect(btn(page, "Check answer")).toBeDisabled();
    await page.getByRole("radio").nth(1).check();
    await btn(page, "Check answer").click();
    await btn(page, "Back to lesson").click();
    await expect(page.locator("h1")).toHaveText("こんにちは");
    await visibleNav(page)
      .getByRole("link", { name: "Practice", exact: true })
      .click();
    await expect(btn(page, "Next question")).toBeVisible();
    await page.reload();
    await expect(btn(page, "Next question")).toBeVisible();
    await btn(page, "Next question").click();
    for (const [i, answer] of [2, 0, 1, 2].entries()) {
      await page.getByRole("radio").nth(answer).check();
      await btn(page, "Check answer").click();
      await btn(page, i === 3 ? "See results" : "Next question").click();
    }
    await expect(page.locator(".nv-score")).toContainText("5 / 5");
    await scan(page, "practice-results");
    await capture(page, "04-results-" + width);
    await page.reload();
    await expect(page.locator(".nv-score")).toContainText("5 / 5");
    await btn(page, "Try again").click();
    await expect(btn(page, "Check answer")).toBeDisabled();
    await capture(page, "03-practice-" + width);
    await btn(page, "NullVibe home").click();
    await expect(page.locator(".last-result")).toContainText("5/5");
    await page
      .getByLabel("Search courses", { exact: true })
      .fill("unavailable course");
    await expect(page.locator(".course-card")).toHaveCount(0);
    await btn(page, "Show all courses").click();
    await expect(page.locator(".course-card")).toHaveCount(2);
    await btn(page, "JLPT N4").click();
    await expect(page.locator(".course-card")).toHaveCount(1);
    const details = btn(page, "N4 course details");
    await details.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await capture(page, "05-access-" + width);
    await page.keyboard.press("Escape");
    await expect(details).toBeFocused();
    await btn(page, "Start N4").click();
    await expect(page.locator("h1")).toContainText("たこと");
    await btn(page, "Mentor").click();
    await btn(page, "Explain たことがある").click();
    await expect(page.getByRole("log")).toContainText("experience");
    await page
      .getByLabel("Your question", { exact: true })
      .fill("<img src=x onerror=alert(1)>");
    await btn(page, "Send").click();
    await expect(page.getByRole("log")).toContainText("Free-form AI answers");
    assert.equal(await page.getByRole("log").locator("img").count(), 0);
    await capture(page, "06-mentor-" + width);
    await page.keyboard.press("Escape");
    await expect(btn(page, "Mentor")).toBeFocused();
    await btn(page, "Staff preview").click();
    await page.getByLabel("Price in LKR", { exact: true }).fill("12000");
    await page.getByLabel("Fixed access duration in days").fill("90");
    await page.getByLabel("Live classes", { exact: true }).selectOption("true");
    await page.getByLabel("Planned video hours").fill("12");
    await btn(page, "Save draft").click();
    await expect(page.locator(".save-message")).toContainText("Saved");
    await page.reload();
    await expect(page.getByLabel("Price in LKR", { exact: true })).toHaveValue(
      "12000",
    );
    await page.getByLabel("Fixed access duration in days").fill("0");
    await btn(page, "Save draft").click();
    assert.equal(
      await page
        .getByLabel("Fixed access duration in days")
        .evaluate((el) => el.validity.valid),
      false,
    );
    await page.getByLabel("Fixed access duration in days").fill("90");
    await capture(page, "07-studio-" + width);
    await btn(page, "NullVibe home").click();
    await btn(page, "N5 course details").click();
    await expect(page.getByRole("dialog")).toContainText("12,000");
    await expect(page.getByRole("dialog")).toContainText("90 days");
    await expect(page.getByRole("dialog")).toContainText("12 hours");
    await page.keyboard.press("Escape");
    checked(
      width +
        "px: first visit, keyboard, history, lesson resume, assessment resume/scoring, search, dialogs, N4 mentor, safe text, settings validation/persistence",
    );

    for (const language of ["en", "si", "ja"]) {
      await page.getByLabel("Language", { exact: true }).selectOption(language);
      for (const [screen, path] of [
        ["courses", "#/courses"],
        ["lesson", "#/learn/N5"],
        ["practice", "#/practice/N5"],
        ["studio", "#/studio"],
      ]) {
        await page.goto(baseURL + "/" + path);
        await ready(page);
        await expect(page.locator("html")).toHaveAttribute("lang", language);
        await scan(page, screen, language);
        if (width === 360 && language !== "en")
          await capture(page, screen + "-" + language + "-360");
      }
      await page.goto(baseURL + "/#/courses");
      await ready(page);
      await page.locator(".course-buttons .text-button").first().click();
      await scan(page, "access-dialog", language);
      await page.keyboard.press("Escape");
      await page.locator(".mentor-trigger").click();
      await scan(page, "mentor-dialog", language);
      await page.keyboard.press("Escape");
    }
    checked(
      width +
        "px: six screens, all three languages, accessibility and overflow",
    );
    await context.close();
  }
  const edgeContext = await browser.newContext({
    viewport: { width: 360, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await edgeContext.newPage();
  page.on("pageerror", (error) =>
    results.errors.push({ screen: "edge-cases", error: error.message }),
  );
  await page.goto(baseURL);
  await ready(page);
  assert.equal(
    await page
      .locator(".catalog-hero")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  await page.evaluate(() => {
    localStorage.setItem(
      "nullvibe.result",
      JSON.stringify({ courseId: {}, score: {}, total: {} }),
    );
    localStorage.setItem(
      "nullvibe.progress",
      JSON.stringify(["N5-99", {}, null]),
    );
    localStorage.setItem(
      "nullvibe.settings.v1",
      JSON.stringify({ N5: { priceLkr: -1 } }),
    );
    localStorage.setItem("nullvibe.language", JSON.stringify({ bad: true }));
    localStorage.setItem("nullvibe.lesson.v1.n5", "999");
    sessionStorage.setItem(
      "nullvibe.practice.v1.N5",
      JSON.stringify({
        version: 1,
        answers: [null],
        checked: "true",
        finished: true,
      }),
    );
  });
  await page.reload();
  await expect(page.locator("h1")).toContainText("made simple");
  await btn(page, "Start N5").first().click();
  await expect(page.locator("h1")).toHaveText("あ・い・う・え・お");
  await btn(page, "Quick practice").click();
  await expect(btn(page, "Check answer")).toBeDisabled();
  await completePractice(page, [0, 0, 1, 0, 0]);
  await expect(page.locator(".nv-score")).toContainText("0 / 5");
  await expect(page.locator(".nv-incorrect")).toHaveCount(5);
  await scan(page, "all-wrong-results");
  await page.goto(baseURL + "/#/practice/N4");
  await completePractice(page, [1, 2, 0, 1, 2]);
  await expect(page.locator(".nv-score")).toContainText("5 / 5");
  await page.goto(baseURL + "/#/learn/N3");
  await expect(page.locator("h1")).toContainText("made simple");
  checked(
    "Malformed storage, unknown routes, reduced motion, all-wrong answer review, complete N4 assessment",
  );

  const blocked = await browser.newContext({
    viewport: { width: 360, height: 844 },
  });
  await blocked.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("Storage disabled");
    };
    Storage.prototype.setItem = () => {
      throw new Error("Storage disabled");
    };
  });
  const noStorage = await blocked.newPage();
  noStorage.on("pageerror", (error) =>
    results.errors.push({ screen: "storage-disabled", error: error.message }),
  );
  await noStorage.goto(baseURL);
  await expect(noStorage.locator(".storage-notice")).toBeVisible();
  await btn(noStorage, "Start N5").first().click();
  await btn(noStorage, "Mark complete").click();
  await expect(btn(noStorage, "Lesson complete")).toBeDisabled();
  await btn(noStorage, "Quick practice").click();
  await expect(noStorage.locator(".nv-draft-status")).toContainText(
    "Saving is unavailable",
  );
  await btn(noStorage, "Staff preview").click();
  await noStorage.getByLabel("Price in LKR", { exact: true }).fill("1000");
  await btn(noStorage, "Save draft").click();
  await expect(noStorage.locator(".save-message")).toContainText(
    "could not save",
  );
  checked("Storage disabled: usable learning and truthful save feedback");
  await blocked.close();
} finally {
  await browser.close();
  await writeFile("qa/results.json", JSON.stringify(results, null, 2));
}
assert.equal(results.errors.length, 0, "Browser runtime errors");
const violations = results.scans.filter((scan) => scan.violations.length);
assert.equal(violations.length, 0, JSON.stringify(violations, null, 2));
console.log(
  JSON.stringify(
    {
      scans: results.scans.length,
      checks: results.checks.length,
      runtimeErrors: results.errors.length,
      accessibilityViolations: 0,
    },
    null,
    2,
  ),
);
