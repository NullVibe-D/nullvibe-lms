import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultConfig,
  sanitizeConfig,
  sanitizeProgress,
  hasEntitlement,
  validateCourseConfig,
  sanitizeResult,
  sanitizeAttempt,
} from "../src/domain.mjs";
import { parseRoute } from "../src/navigation.mjs";

test("undecided values survive validation", () =>
  assert.deepEqual(validateCourseConfig(defaultConfig.N5), []));
test("bad persisted config falls back safely", () =>
  assert.deepEqual(
    sanitizeConfig({ N5: { priceLkr: "free" } }),
    defaultConfig,
  ));
test("negative or fractional duration rejected", () => {
  for (const accessDays of [-1, 0, 1.5, 3651])
    assert(validateCourseConfig({ ...defaultConfig.N5, accessDays }).length);
});
test("progress deduplicates and rejects unknown lesson IDs", () =>
  assert.deepEqual(
    sanitizeProgress(["N5-2", "N5-2", "N4-4", "N5-9", {}, null]),
    ["N5-2", "N4-4"],
  ));
test("entitlement denies missing, expired, wrong course and revoked access", () => {
  const active = { courseId: "N5", status: "active", expiresAt: 2000 };
  assert.equal(hasEntitlement(active, "N5", 1000), true);
  for (const value of [
    null,
    { ...active, status: "revoked" },
    { ...active, expiresAt: null },
    { ...active, expiresAt: "garbage" },
    { ...active, expiresAt: 1000 },
  ])
    assert.equal(hasEntitlement(value, "N5", 1000), false);
  assert.equal(hasEntitlement(active, "N4", 1000), false);
});

test("untrusted saved result cannot inject objects or impossible scores into the UI", () => {
  for (const value of [
    null,
    {},
    { courseId: {}, score: 1, total: 5 },
    { courseId: "N5", score: -1, total: 5 },
    { courseId: "N4", score: 6, total: 5 },
    { courseId: "N5", score: "5", total: 5 },
  ])
    assert.equal(sanitizeResult(value), null);
  assert.deepEqual(
    sanitizeResult({ courseId: "N4", score: 0, total: 5, extra: "ignored" }),
    { courseId: "N4", score: 0, total: 5 },
  );
});
test("practice restores only structurally consistent drafts for the current question set", () => {
  const counts = [3, 3, 3, 3, 3];
  const draft = {
    version: 1,
    answers: [1],
    selected: 2,
    checked: true,
    finished: false,
  };
  assert.deepEqual(sanitizeAttempt(draft, counts), draft);
  for (const value of [
    { ...draft, version: 2 },
    { ...draft, answers: [9] },
    { ...draft, selected: 3 },
    { ...draft, selected: null },
    { ...draft, finished: true },
    { ...draft, answers: [1, 1, 1, 1, 1, 1] },
    { ...draft, checked: "true" },
  ])
    assert.deepEqual(sanitizeAttempt(value, counts).answers, []);
  const completed = {
    version: 1,
    answers: [1, 2, 0, 1, 2],
    selected: null,
    checked: false,
    finished: true,
  };
  assert.deepEqual(sanitizeAttempt(completed, counts), completed);
});
test("only supported local routes and course IDs are accepted", () => {
  assert.deepEqual(parseRoute("#/practice/N4"), {
    view: "practice",
    courseId: "N4",
  });
  for (const hash of [
    "",
    "#/learn/N3",
    "#/studio/N5",
    "#/learn",
    "#/learn/N5/extra",
    "#/../studio",
  ])
    assert.deepEqual(parseRoute(hash), { view: "courses" });
});
