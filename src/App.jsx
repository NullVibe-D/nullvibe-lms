import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  SquaresFour,
  Sparkle,
  Globe,
  GraduationCap,
  ArrowUpRight,
} from "@phosphor-icons/react";
import { Lesson, Assessment } from "./Learning";
import { Catalog, Studio, Mentor, AccessDialog } from "./Workspace";
import {
  defaultConfig,
  sanitizeConfig,
  sanitizeProgress,
  sanitizeResult,
} from "./domain.mjs";
import { parseRoute, routeHash } from "./navigation.mjs";
import "./workspace.css";

export function translate(language, english, sinhala, japanese) {
  return { en: english, si: sinhala, ja: japanese }[language] || english;
}
function readStored(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export function useStored(key, initial) {
  const [value, setValue] = useState(() => readStored(key, initial));
  const [canSave, setCanSave] = useState(true);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setCanSave(true);
    } catch {
      setCanSave(false);
    }
  }, [key, value]);
  return [value, setValue, canSave];
}

export function App() {
  const [savedLanguage, setLanguage, languageSaved] = useStored(
    "nullvibe.language",
    "en",
  );
  const language = ["en", "si", "ja"].includes(savedLanguage)
    ? savedLanguage
    : "en";
  const t = (en, si, ja) => translate(language, en, si, ja);
  const [route, setRoute] = useState(() => parseRoute(location.hash));
  const [lastCourse, setLastCourse] = useStored("nullvibe.course", "N5");
  const courseId =
    route.courseId || (["N5", "N4"].includes(lastCourse) ? lastCourse : "N5");
  const { view } = route;
  const [savedCompleted, setCompleted, progressSaved] = useStored(
    "nullvibe.progress",
    [],
  );
  const completedIds = sanitizeProgress(savedCompleted);
  const [savedResult, setResult] = useStored("nullvibe.result", null);
  const lastResult = sanitizeResult(savedResult);
  const [accessCourse, setAccessCourse] = useState(null);
  const [mentorOpen, setMentorOpen] = useState(false);
  const [config, setConfig, configSaved] = useStored(
    "nullvibe.settings.v1",
    defaultConfig,
  );
  const safeConfig = sanitizeConfig(config);
  const canSave = languageSaved && progressSaved && configSaved;
  const previousRoute = useRef(view + courseId);

  useEffect(() => {
    const update = () => {
      setRoute(parseRoute(location.hash));
      setMentorOpen(false);
      setAccessCourse(null);
    };
    window.addEventListener("popstate", update);
    window.addEventListener("hashchange", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("hashchange", update);
    };
  }, []);
  useEffect(() => {
    if (route.courseId) setLastCourse(route.courseId);
  }, [route.courseId, setLastCourse]);
  useEffect(() => {
    if (previousRoute.current === view + courseId) return;
    previousRoute.current = view + courseId;
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelector("main h1")?.focus({ preventScroll: true });
  }, [view, courseId]);
  useEffect(() => {
    document.documentElement.lang = language;
    const titles = {
      courses: t("Learn Japanese", "ජපන් ඉගෙන ගන්න", "日本語を学ぶ"),
      lesson: t("My learning", "මගේ ඉගෙනීම", "学習") + " · " + courseId,
      practice: t("Practice", "පුහුණුව", "練習") + " · " + courseId,
      studio: t("Course studio", "පාඨමාලා සැකසුම්", "コース設定"),
    };
    document.title = titles[view] + " | NullVibe";
  }, [language, view, courseId]);

  function navigate(next, id = courseId) {
    const hash = routeHash(next, id);
    if (location.hash !== hash) history.pushState(null, "", hash);
    setRoute(parseRoute(hash));
    setMentorOpen(false);
    setAccessCourse(null);
  }
  function startCourse(id) {
    navigate("lesson", id);
  }
  function markComplete(id) {
    setCompleted((previous) =>
      sanitizeProgress([...sanitizeProgress(previous), id]),
    );
  }
  const navItems = [
    ["courses", SquaresFour, t("Courses", "පාඨමාලා", "コース")],
    ["lesson", BookOpen, t("My learning", "මගේ ඉගෙනීම", "学習")],
    ["practice", GraduationCap, t("Practice", "පුහුණුව", "練習")],
  ];
  const navLinks = (mobile = false) =>
    navItems.map(([id, Icon, label]) => (
      <a
        key={id}
        href={routeHash(id, courseId)}
        className={view === id ? (mobile ? "active" : "selected") : ""}
        aria-current={view === id ? "page" : undefined}
        onClick={(event) => {
          if (
            event.button === 0 &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            !event.altKey
          ) {
            event.preventDefault();
            navigate(id);
          }
        }}
      >
        <Icon
          size={19}
          weight={mobile && view === id ? "fill" : "regular"}
          aria-hidden="true"
        />
        {label}
      </a>
    ));

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.querySelector("main h1")?.focus();
        }}
      >
        {t("Skip to content", "අන්තර්ගතයට යන්න", "本文へ")}
      </a>
      <header className="app-header">
        <button
          className="brand"
          onClick={() => navigate("courses")}
          aria-label="NullVibe home"
        >
          <span className="brand-mark">
            <BookOpen weight="duotone" aria-hidden="true" />
          </span>
          <span>
            <strong>NullVibe</strong>
            <small>JAPANESE LEARNING</small>
          </span>
        </button>
        <nav
          className="desktop-nav"
          aria-label={t(
            "Main navigation",
            "ප්‍රධාන මෙනුව",
            "メインナビゲーション",
          )}
        >
          {navLinks()}
        </nav>
        <div className="header-actions">
          <label className="locale-control">
            <Globe size={18} aria-hidden="true" />
            <span className="sr-only">Language</span>
            <select
              aria-label="Language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="en">English</option>
              <option value="si">සිංහල</option>
              <option value="ja">日本語</option>
            </select>
          </label>
          <button
            className="mentor-trigger"
            onClick={() => setMentorOpen(true)}
            aria-label={t("Mentor", "උපදේශක", "メンター")}
          >
            <Sparkle weight="fill" aria-hidden="true" />
            <span>{t("Mentor", "උපදේශක", "メンター")}</span>
          </button>
        </div>
      </header>
      <div className="demo-ribbon">
        <span>
          {t("LEARNING PREVIEW", "ඉගෙනුම් පෙරදසුන", "学習プレビュー")}
        </span>
        {t(
          "Try a sample lesson. No sign-up needed.",
          "ලියාපදිංචි නොවී ආදර්ශ පාඩමක් බලන්න.",
          "登録なしで体験レッスン。",
        )}
      </div>
      {!canSave && (
        <p className="storage-notice" role="status">
          {t(
            "Your browser cannot save changes. Progress will last only while this page stays open.",
            "මෙම බ්‍රවුසරයේ වෙනස්කම් සුරැකිය නොහැක. පිටුව වසා දැමූ විට ප්‍රගතිය නැති වේ.",
            "保存できません。このページを閉じると進捗が失われます。",
          )}
        </p>
      )}
      <div className="page-area">
        {view === "lesson" && (
          <Lesson
            key={courseId}
            language={language}
            courseId={courseId}
            completedIds={completedIds}
            onComplete={markComplete}
            onPractice={() => navigate("practice")}
            onBack={() => navigate("courses")}
          />
        )}
        {view === "practice" && (
          <Assessment
            key={courseId}
            language={language}
            courseId={courseId}
            onBack={() => navigate("lesson")}
            onResult={setResult}
          />
        )}
        {view === "courses" && (
          <Catalog
            language={language}
            config={safeConfig}
            completedIds={completedIds}
            lastResult={lastResult}
            currentCourse={courseId}
            onOpen={startCourse}
            onAccess={setAccessCourse}
          />
        )}
        {view === "studio" && (
          <Studio
            language={language}
            config={safeConfig}
            onSave={setConfig}
            canSave={configSaved}
          />
        )}
      </div>
      <footer className="app-footer">
        <span>
          {t(
            "Made for your next chapter.",
            "ඔබේ අලුත් ආරම්භය වෙනුවෙන්.",
            "新しい一歩のために。",
          )}{" "}
          <strong>NullVibe.</strong>
        </span>
        <button className="text-button" onClick={() => navigate("studio")}>
          {t("Staff preview", "කාර්ය මණ්ඩල පෙරදසුන", "スタッフ向けプレビュー")}
          <ArrowUpRight aria-hidden="true" />
        </button>
      </footer>
      <nav
        className="mobile-bottom-nav"
        aria-label={t("Mobile navigation", "ජංගම මෙනුව", "モバイルメニュー")}
      >
        {navLinks(true)}
      </nav>
      {mentorOpen && (
        <Mentor
          language={language}
          courseId={courseId}
          onClose={() => setMentorOpen(false)}
        />
      )}
      {accessCourse && (
        <AccessDialog
          language={language}
          courseId={accessCourse}
          config={safeConfig[accessCourse]}
          onClose={() => setAccessCourse(null)}
          onPreview={() => startCourse(accessCourse)}
        />
      )}
    </div>
  );
}
