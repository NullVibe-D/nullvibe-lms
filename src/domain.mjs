export const defaultConfig = {
  N5: { priceLkr: null, accessDays: null, liveClasses: null, mediaHours: null },
  N4: { priceLkr: null, accessDays: null, liveClasses: null, mediaHours: null },
};

export function validateCourseConfig(config) {
  if (!config || typeof config !== "object") return ["Missing course settings"];
  const errors = [];
  for (const field of ["priceLkr", "mediaHours"]) {
    if (
      config[field] !== null &&
      (typeof config[field] !== "number" ||
        !Number.isFinite(config[field]) ||
        config[field] < 0)
    )
      errors.push("Invalid " + field);
  }
  if (
    config.accessDays !== null &&
    (!Number.isInteger(config.accessDays) ||
      config.accessDays < 1 ||
      config.accessDays > 3650)
  )
    errors.push("Invalid access duration");
  if (![null, true, false].includes(config.liveClasses))
    errors.push("Invalid live class choice");
  return errors;
}

export function sanitizeConfig(value) {
  return Object.fromEntries(
    ["N5", "N4"].map((id) => [
      id,
      validateCourseConfig(value?.[id]).length
        ? { ...defaultConfig[id] }
        : {
            priceLkr: value[id].priceLkr,
            accessDays: value[id].accessDays,
            liveClasses: value[id].liveClasses,
            mediaHours: value[id].mediaHours,
          },
    ]),
  );
}

export function sanitizeProgress(value) {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter(
        (id) => typeof id === "string" && /^(N5|N4)-[0-4]$/.test(id),
      ),
    ),
  ];
}

export function sanitizeResult(value) {
  if (
    !value ||
    !["N5", "N4"].includes(value.courseId) ||
    value.total !== 5 ||
    !Number.isInteger(value.score) ||
    value.score < 0 ||
    value.score > value.total
  )
    return null;
  return { courseId: value.courseId, score: value.score, total: value.total };
}

export function sanitizeAttempt(value, optionCounts) {
  const empty = {
    version: 1,
    answers: [],
    selected: null,
    checked: false,
    finished: false,
  };
  if (
    !value ||
    value.version !== 1 ||
    !Array.isArray(value.answers) ||
    value.answers.length > optionCounts.length ||
    value.answers.some(
      (answer, index) =>
        !Number.isInteger(answer) ||
        answer < 0 ||
        answer >= optionCounts[index],
    ) ||
    typeof value.checked !== "boolean" ||
    typeof value.finished !== "boolean"
  )
    return empty;
  const complete = value.answers.length === optionCounts.length;
  const validSelection =
    value.selected === null ||
    (!complete &&
      Number.isInteger(value.selected) &&
      value.selected >= 0 &&
      value.selected < optionCounts[value.answers.length]);
  if (
    !validSelection ||
    value.finished !== complete ||
    (value.checked && (value.selected === null || complete))
  )
    return empty;
  return {
    version: 1,
    answers: [...value.answers],
    selected: value.selected,
    checked: value.checked,
    finished: value.finished,
  };
}

// Server-side policy reference. The browser demo does not enforce paid access.
export function hasEntitlement(entitlement, courseId, now = Date.now()) {
  if (
    !["N5", "N4"].includes(courseId) ||
    entitlement?.courseId !== courseId ||
    entitlement?.status !== "active"
  )
    return false;
  if (!["number", "string"].includes(typeof entitlement.expiresAt))
    return false;
  const expires =
    typeof entitlement.expiresAt === "number"
      ? entitlement.expiresAt
      : Date.parse(entitlement.expiresAt);
  return Number.isFinite(expires) && Number.isFinite(now) && expires > now;
}
