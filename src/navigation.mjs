export function parseRoute(hash) {
  const match = /^#\/(courses|learn|practice|studio)(?:\/(N5|N4))?$/.exec(hash);
  if (!match) return { view: "courses" };
  const view = match[1] === "learn" ? "lesson" : match[1];
  if (view === "lesson" || view === "practice") {
    return match[2] ? { view, courseId: match[2] } : { view: "courses" };
  }
  return match[2] ? { view: "courses" } : { view };
}

export function routeHash(view, courseId = "N5") {
  if (view === "lesson" || view === "practice") {
    return "#/" + (view === "lesson" ? "learn" : view) + "/" + courseId;
  }
  return "#/" + (view === "studio" ? "studio" : "courses");
}
