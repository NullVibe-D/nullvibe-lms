import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  LockKey,
  MagnifyingGlass,
  PaperPlaneTilt,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { validateCourseConfig } from "./domain.mjs";

function translator(language) {
  return (english, sinhala, japanese) =>
    ({ en: english, si: sinhala, ja: japanese })[language] || english;
}

function Dialog({
  title,
  onClose,
  children,
  wide = false,
  closeLabel = "Close",
}) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={wide ? "workspace-dialog mentor-dialog" : "workspace-dialog"}
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          ref.current.querySelectorAll(
            'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((element) => element.getClientRects().length);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(event) => {
        if (event.target !== ref.current) return;
        const bounds = ref.current.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      <header>
        <h2>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <X />
        </button>
      </header>
      {children}
    </dialog>
  );
}

export function Catalog({
  language,
  completedIds,
  lastResult,
  currentCourse,
  onOpen,
  onAccess,
}) {
  const t = translator(language);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const countFor = (id) =>
    completedIds.filter((value) => value.startsWith(id + "-")).length;
  const resumeCourse = countFor(currentCourse)
    ? currentCourse
    : countFor("N5")
      ? "N5"
      : countFor("N4")
        ? "N4"
        : null;
  const actionLabel = (id) =>
    countFor(id) === 5
      ? t("Review ", "නැවත බලන්න ", "復習する ") + id
      : countFor(id)
        ? t("Continue ", "ඉදිරියට යන්න ", "続ける ") + id
        : t("Start ", "අරඹන්න ", "始める ") + id;
  const courses = [
    {
      id: "N5",
      title: t("Japanese foundations", "ජපන් භාෂාවේ පදනම", "日本語の基礎"),
      subtitle: t(
        "New to Japanese? Start with letters, greetings and your first sentences.",
        "ජපන් භාෂාවට අලුත්ද? අකුරු, ආචාර සහ සරල වාක්‍යවලින් අරඹන්න.",
        "初めての方へ。文字、あいさつ、簡単な文から始めましょう。",
      ),
      tag: t("Beginner", "ආරම්භක", "入門"),
      keywords: "beginner basics hiragana letters foundation",
    },
    {
      id: "N4",
      title: t("Everyday Japanese", "එදිනෙදා ජපන් භාෂාව", "日常の日本語"),
      subtitle: t(
        "Know the N5 basics? Build longer sentences and everyday conversation skills.",
        "N5 මූලික දැනුම තිබේද? දිගු වාක්‍ය සහ එදිනෙදා සංවාද ඉගෙන ගන්න.",
        "N5の基礎がある方へ。長い文や日常会話を練習しましょう。",
      ),
      tag: t("After N5", "N5 පසු", "N5の次へ"),
      keywords: "intermediate conversation grammar everyday",
    },
  ];
  const visible = courses.filter(
    (course) =>
      (filter === "all" || filter === course.id) &&
      (
        course.id +
        " " +
        course.title +
        " " +
        course.subtitle +
        " " +
        course.tag +
        " " +
        course.keywords
      )
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  return (
    <main id="main-content" className="catalog-page">
      <section className="catalog-hero" aria-labelledby="welcome-heading">
        <div className="catalog-intro">
          <span className="eyebrow">
            {t(
              "YOUR PATH TO JAPANESE",
              "ජපන් භාෂාවට ඔබේ මඟ",
              "日本語への第一歩",
            )}
          </span>
          <h1 id="welcome-heading" tabIndex={-1}>
            {t("Japanese,", "ජපන් භාෂාව,", "日本語を、")}
            <br />
            <em>{t("made simple.", "සරලව ඉගෙන ගන්න.", "わかりやすく。")}</em>
          </h1>
          <p>
            {t(
              "From your first word to your next milestone. Learn at your pace, with clear Sinhala explanations.",
              "ඔබේ පළමු වචනයේ සිට ඊළඟ ඉලක්කය දක්වා. පැහැදිලි සිංහල විස්තර සමඟ ඔබේ වේගයෙන් ඉගෙන ගන්න.",
              "最初の一言から次の目標へ。シンハラ語の解説で、自分のペースで学びましょう。",
            )}
          </p>
          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={() => onOpen(resumeCourse || "N5")}
            >
              {actionLabel(resumeCourse || "N5")}
              <ArrowRight aria-hidden="true" />
            </button>
            <button
              className="text-button"
              onClick={() => document.getElementById("level-heading")?.focus()}
            >
              {t("Find my level", "මගේ මට්ටම තෝරන්න", "レベルを選ぶ")}
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
          <small className="hero-reassurance">
            {resumeCourse
              ? t(
                  "Your progress stays on this browser.",
                  "ප්‍රගතිය මෙම බ්‍රවුසරයේ සුරැකේ.",
                  "進捗はこのブラウザに保存されます。",
                )
              : t(
                  "New to Japanese? N5 is your starting point.",
                  "ජපන් භාෂාවට අලුත්ද? N5 වලින් අරඹන්න.",
                  "初めてなら、N5から。",
                )}
          </small>
        </div>
        <div className="kana-art" aria-hidden="true">
          <div className="kana-orbit"></div>
          <div className="kana-card">
            <span>01 / HIRAGANA</span>
            <strong lang="ja">あ</strong>
            <p>
              a <span>·</span>{" "}
              {t("a new beginning", "නව ආරම්භයක්", "新しい始まり")}
            </p>
            <div>
              <span>あ</span>
              <span>い</span>
              <span>う</span>
              <span>え</span>
              <span>お</span>
            </div>
          </div>
          <span className="kana-caption">
            {t(
              "Small steps. New possibilities.",
              "කුඩා පියවර. නව හැකියාවන්.",
              "小さな一歩、新しい可能性。",
            )}
          </span>
        </div>
      </section>
      <ol
        className="learning-steps"
        aria-label={t("How it works", "ඉගෙන ගන්නා ආකාරය", "学習の流れ")}
      >
        {[
          t("Learn one idea", "එක් කරුණක් ඉගෙන ගන්න", "一つずつ学ぶ"),
          t("Try a short practice", "කෙටි පුහුණුවක් කරන්න", "短い練習に挑戦"),
          t("Build your confidence", "විශ්වාසය වැඩි කරගන්න", "自信をつける"),
        ].map((label, i) => (
          <li key={label}>
            <span>{"0" + (i + 1)}</span>
            {label}
          </li>
        ))}
      </ol>
      <section className="course-section" aria-labelledby="level-heading">
        <div className="section-heading">
          <div>
            <span className="eyebrow">JLPT N5 / N4</span>
            <h2 id="level-heading" tabIndex={-1}>
              {t(
                "Choose your starting point.",
                "ඔබේ ආරම්භය තෝරන්න.",
                "自分に合うコースを。",
              )}
            </h2>
          </div>
          <span className="sample-label">
            {t(
              "Sample lessons available",
              "ආදර්ශ පාඩම් තිබේ",
              "体験レッスン公開中",
            )}
          </span>
        </div>
        <div className="catalog-toolbar">
          <div
            className="filter-group"
            role="group"
            aria-label={t("Course level", "පාඨමාලා මට්ටම", "レベル")}
          >
            {["all", "N5", "N4"].map((value) => (
              <button
                key={value}
                aria-pressed={filter === value}
                className={filter === value ? "selected" : ""}
                onClick={() => setFilter(value)}
              >
                {value === "all"
                  ? t("All courses", "සියලු පාඨමාලා", "すべて")
                  : "JLPT " + value}
              </button>
            ))}
          </div>
          <label className="search-field">
            <MagnifyingGlass aria-hidden="true" />
            <input
              type="search"
              aria-label={t("Search courses", "පාඨමාලා සොයන්න", "コースを検索")}
              placeholder={t(
                "Search courses",
                "පාඨමාලා සොයන්න",
                "コースを検索",
              )}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        <p className="sr-only" role="status">
          {visible.length}{" "}
          {t("courses found", "පාඨමාලා හමු විය", "コースが見つかりました")}
        </p>
        <div className="course-grid">
          {visible.map((course) => (
            <article className="course-card" key={course.id}>
              <div className={"course-art level-" + course.id.toLowerCase()}>
                <span>JLPT</span>
                <strong>{course.id}</strong>
                <BookOpen weight="duotone" aria-hidden="true" />
                <small>{course.tag}</small>
              </div>
              <div className="course-body">
                <h3>{course.title}</h3>
                <p>{course.subtitle}</p>
                <div className="course-meta">
                  <span>
                    <BookOpen aria-hidden="true" />
                    {t("5 sample lessons", "ආදර්ශ පාඩම් 5", "体験レッスン5つ")}
                  </span>
                  <span>
                    <CheckCircle aria-hidden="true" />
                    {t(
                      "Practice & answer review",
                      "පුහුණුව හා පිළිතුරු විමසුම",
                      "練習と解説",
                    )}
                  </span>
                </div>
                {countFor(course.id) > 0 && (
                  <div className="course-progress-row">
                    <progress
                      value={countFor(course.id)}
                      max={5}
                      aria-label={
                        course.id +
                        " " +
                        t(
                          "sample lesson progress",
                          "ආදර්ශ පාඩම් ප්‍රගතිය",
                          "進捗",
                        )
                      }
                    />
                    <span>
                      {countFor(course.id)}/5{" "}
                      {t("complete", "සම්පූර්ණයි", "完了")}
                    </span>
                  </div>
                )}
                <div className="course-buttons">
                  <button
                    className="primary-button"
                    onClick={() => onOpen(course.id)}
                  >
                    {actionLabel(course.id)}
                    <ArrowRight aria-hidden="true" />
                  </button>
                  <button
                    className="text-button"
                    onClick={() => onAccess(course.id)}
                    aria-label={
                      course.id +
                      " " +
                      t("course details", "පාඨමාලා විස්තර", "コースの詳細")
                    }
                  >
                    {t("Course details", "පාඨමාලා විස්තර", "コースの詳細")}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {visible.length === 0 && (
          <div className="empty-state">
            <p>
              {t(
                "No courses found. Try N5, N4 or beginner.",
                "පාඨමාලා හමු නොවීය. N5 හෝ N4 සොයන්න.",
                "該当するコースがありません。N5、N4をお試しください。",
              )}
            </p>
            <button
              className="quiet-button"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              {t(
                "Show all courses",
                "සියලු පාඨමාලා පෙන්වන්න",
                "すべてのコースを表示",
              )}
            </button>
          </div>
        )}
      </section>
      {lastResult && (
        <p className="last-result">
          <CheckCircle aria-hidden="true" />
          {t("Last practice", "අවසන් පුහුණුව", "前回の練習")} ·{" "}
          {lastResult.courseId} · {lastResult.score}/{lastResult.total}
        </p>
      )}
      <p className="catalog-footnote">
        {t(
          "You’re exploring sample content. Full course enrolment, pricing and lesson videos will be confirmed by the teaching team.",
          "ඔබ බලන්නේ ආදර්ශ අන්තර්ගතයකි. ලියාපදිංචිය, ගාස්තු හා පාඩම් වීඩියෝ ගුරු කණ්ඩායම තහවුරු කරනු ඇත.",
          "体験用コンテンツです。正式な受講案内、料金、動画は講師が確認します。",
        )}
      </p>
    </main>
  );
}

export function AccessDialog({
  language,
  courseId,
  config,
  onClose,
  onPreview,
}) {
  const t = translator(language);
  return (
    <Dialog
      title={"JLPT " + courseId}
      onClose={onClose}
      closeLabel={t("Close", "වසන්න", "閉じる")}
    >
      <div className="dialog-body">
        <LockKey size={32} weight="duotone" />
        <h3>{t("Course details", "පාඨමාලා විස්තර", "コースの詳細")}</h3>
        <dl className="access-details">
          <div>
            <dt>{t("Course fee", "පාඨමාලා ගාස්තුව", "受講料")}</dt>
            <dd>
              {config.priceLkr === null
                ? t("To be confirmed", "තහවුරු කිරීමට ඇත", "未定")
                : "LKR " + config.priceLkr.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt>{t("Access", "ප්‍රවේශය", "期間")}</dt>
            <dd>
              {config.accessDays
                ? config.accessDays + t(" days", " දින", "日")
                : t(
                    "Fixed duration · to be confirmed",
                    "ස්ථාවර කාලයක් • තහවුරු කිරීමට ඇත",
                    "固定期間・未定",
                  )}
            </dd>
          </div>
        </dl>
        <dl className="access-details">
          <div>
            <dt>{t("Live classes", "සජීවී පන්ති", "ライブ授業")}</dt>
            <dd>
              {config.liveClasses === null
                ? t("To be confirmed", "තහවුරු කිරීමට ඇත", "未定")
                : config.liveClasses
                  ? t("Planned", "සැලසුම් කර ඇත", "予定あり")
                  : t("Self-paced only", "ස්වයං අධ්‍යයනය පමණි", "自習のみ")}
            </dd>
          </div>
          <div>
            <dt>
              {t("Planned video content", "සැලසුම් කළ වීඩියෝ", "動画の予定")}
            </dt>
            <dd>
              {config.mediaHours === null
                ? t("To be confirmed", "තහවුරු කිරීමට ඇත", "未定")
                : config.mediaHours + t(" hours", " පැය", "時間")}
            </dd>
          </div>
        </dl>
        <p>
          {t(
            "Enrolment opens after pricing and payment options are confirmed. You can explore the sample lessons now.",
            "ගාස්තු සහ ගෙවීම් ක්‍රම තහවුරු වූ පසු ලියාපදිංචිය ඇරඹේ. දැන් ආදර්ශ පාඩම් බලන්න.",
            "料金と支払い方法が決まったら受付開始します。今は体験レッスンをご覧ください。",
          )}
        </p>
        <button className="primary-button" onClick={onPreview}>
          {t("Explore sample lessons", "ආදර්ශ පාඩම් බලන්න", "体験レッスンへ")}
          <ArrowRight />
        </button>
      </div>
    </Dialog>
  );
}

export function Studio({ language, config, onSave, canSave = true }) {
  const t = translator(language);
  const [courseId, setCourseId] = useState("N5");
  const [draft, setDraft] = useState(config);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState(false);
  function change(field, value) {
    setSaveError(false);
    setDraft((previous) => ({
      ...previous,
      [courseId]: { ...previous[courseId], [field]: value },
    }));
    setMessage("");
  }
  function save(event) {
    event.preventDefault();
    if (
      Object.values(draft).some((value) => validateCourseConfig(value).length)
    ) {
      setSaveError(true);
      setMessage(
        t(
          "Check the values and try again.",
          "අගයන් පරීක්ෂා කර නැවත උත්සාහ කරන්න.",
          "入力を確認してください。",
        ),
      );
      return;
    }
    onSave(draft);
    setSaveError(false);
    setMessage(
      t("Draft updated.", "කෙටුම්පත යාවත්කාලීන විය.", "下書きを更新しました。"),
    );
  }
  return (
    <main id="main-content" className="task-view studio-page">
      <span className="eyebrow">
        {t("ADMIN PREVIEW", "පරිපාලක පෙරදසුන", "管理画面プレビュー")}
      </span>
      <h1 tabIndex={-1}>
        {t("Course studio", "පාඨමාලා සැකසුම්", "コース設定")}
      </h1>
      <p className="task-intro">
        {t(
          "Shape the details when your teaching team is ready.",
          "ගුරු කණ්ඩායම සූදානම් වූ විට විස්තර සකසන්න.",
          "講師の準備に合わせて詳細を設定。",
        )}
      </p>
      <p className="studio-notice">
        {t(
          "Local preview settings. Live administration will require a verified staff account.",
          "දේශීය පෙරදසුන් සැකසුම්. සජීවී පරිපාලනයට තහවුරු කළ ගිණුමක් අවශ්‍ය වේ.",
          "端末内のプレビュー設定。本番の管理にはスタッフ認証が必要です。",
        )}
      </p>
      <form className="admin-card" onSubmit={save}>
        <label>
          {t("Course", "පාඨමාලාව", "コース")}
          <select
            aria-label={t("Course", "පාඨමාලාව", "コース")}
            value={courseId}
            onChange={(event) => {
              setCourseId(event.target.value);
              setMessage("");
            }}
          >
            <option>N5</option>
            <option>N4</option>
          </select>
        </label>
        <label>
          {t("Price in LKR", "රුපියල්වලින් මිල", "料金（LKR）")}
          <input
            type="number"
            min="0"
            step="0.01"
            value={draft[courseId].priceLkr ?? ""}
            placeholder={t("To be confirmed", "තහවුරු කිරීමට ඇත", "未定")}
            onChange={(event) =>
              change(
                "priceLkr",
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
          />
        </label>
        <label>
          {t(
            "Fixed access duration in days",
            "ප්‍රවේශ කාලය දිනවලින්",
            "受講期間（日数）",
          )}
          <input
            type="number"
            min="1"
            max="3650"
            step="1"
            value={draft[courseId].accessDays ?? ""}
            placeholder={t("To be confirmed", "තහවුරු කිරීමට ඇත", "未定")}
            onChange={(event) =>
              change(
                "accessDays",
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
          />
        </label>
        <label>
          {t("Live classes", "සජීවී පන්ති", "ライブ授業")}
          <select
            aria-label={t("Live classes", "සජීවී පන්ති", "ライブ授業")}
            value={
              draft[courseId].liveClasses === null
                ? "undecided"
                : String(draft[courseId].liveClasses)
            }
            onChange={(event) =>
              change(
                "liveClasses",
                event.target.value === "undecided"
                  ? null
                  : event.target.value === "true",
              )
            }
          >
            <option value="undecided">
              {t("Undecided", "තීරණය කර නැත", "未定")}
            </option>
            <option value="true">{t("Included", "ඇතුළත්", "あり")}</option>
            <option value="false">
              {t("Self-paced only", "ස්වයං අධ්‍යයනය පමණි", "自習のみ")}
            </option>
          </select>
        </label>
        <label>
          {t("Planned video hours", "සැලසුම් කළ වීඩියෝ පැය", "動画の予定時間")}
          <input
            type="number"
            min="0"
            step="0.1"
            value={draft[courseId].mediaHours ?? ""}
            placeholder={t("To be confirmed", "තහවුරු කිරීමට ඇත", "未定")}
            onChange={(event) =>
              change(
                "mediaHours",
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
          />
        </label>
        <button className="primary-button" type="submit">
          {t("Save draft", "කෙටුම්පත සුරකින්න", "下書き保存")}
          <CheckCircle />
        </button>
        <p role="status" className="save-message">
          {message &&
            (saveError
              ? message
              : canSave
                ? message +
                  " " +
                  t(
                    "Saved on this browser.",
                    "මෙම බ්‍රවුසරයේ සුරැකිණි.",
                    "このブラウザに保存しました。",
                  )
                : t(
                    "Updated for this visit. Your browser could not save the draft.",
                    "මෙම වාරයට යාවත්කාලීන විය. කෙටුම්පත සුරැකිය නොහැක.",
                    "今回は更新しましたが、ブラウザに保存できません。",
                  ))}
        </p>
      </form>
    </main>
  );
}

export function Mentor({ language, courseId, onClose }) {
  const t = translator(language);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const bottom = useRef(null);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);
  const prompts =
    courseId === "N4"
      ? [
          [
            t(
              "Explain たことがある",
              "たことがある පැහැදිලි කරන්න",
              "たことがあるを説明",
            ),
            t(
              "Use a past plain-form verb + ことがある for an experience. 日本に行ったことがあります means “I have been to Japan.” It tells us about experience, rather than when it happened.",
              "අත්දැකීමක් ගැන කියන්න ක්‍රියාපදයේ අතීත සරල රූපයට ことがある යොදන්න. 日本に行ったことがあります යනු “මම ජපානයට ගොස් තිබෙනවා” යන්නයි.",
              "動詞のた形＋ことがあるで経験を表します。「日本に行ったことがあります」は日本へ行く経験があるという意味です。",
            ),
          ],
          [
            t(
              "Practise giving a reason",
              "හේතුවක් කීමට පුහුණු වන්න",
              "理由を言う練習",
            ),
            t(
              "Join a reason and a result with ので. 雨が降っているので、家にいます。 means “Because it is raining, I am staying home.” Try changing the reason.",
              "හේතුව හා ප්‍රතිඵලය ので යොදා සම්බන්ධ කරන්න. 雨が降っているので、家にいます。 යනු “වැස්ස නිසා මම ගෙදර සිටිනවා” යන්නයි. හේතුව වෙනස් කර බලන්න.",
              "のでで理由と結果をつなぎます。「雨が降っているので、家にいます。」理由を変えて練習しましょう。",
            ),
          ],
        ]
      : [
          [
            t(
              "Explain は and です",
              "は සහ です පැහැදිලි කරන්න",
              "はとですを説明",
            ),
            t(
              "は marks the topic. In わたしは がくせいです, わたし is the topic and がくせいです means ‘am a student’. は is pronounced ‘wa’ here.",
              "は මාතෘකාව දක්වයි. わたしは がくせいです යනු ‘මම ශිෂ්‍යයෙක්’ යන්නයි. මෙහි は ‘wa’ ලෙස කියවෙයි.",
              "はは話題を示します。「わたしは がくせいです」は自分が学生であることを表します。助詞のはは「わ」と読みます。",
            ),
          ],
          [
            t(
              "Give me a practice sentence",
              "පුහුණු වාක්‍යයක් දෙන්න",
              "練習の文を教えて",
            ),
            t(
              "Try introducing yourself. わたしは ___ です。 Fill the blank with your name. For example, わたしは アマヤ です。",
              "ඔබව හඳුන්වා දෙන්න. わたしは ___ です。 හිස්තැනට ඔබේ නම යොදන්න. උදාහරණයක් ලෙස わたしは アマヤ です。",
              "自己紹介しましょう。「わたしは ___ です。」に名前を入れてください。例「わたしは アマヤ です。」",
            ),
          ],
        ];
  function send(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages((previous) => [
      ...previous.slice(-38),
      { role: "learner", text: draft.trim() },
      {
        role: "mentor",
        text: t(
          "Free-form AI answers will be available when the mentor service is connected. Try one of the guided examples above for now.",
          "AI සේවාව සම්බන්ධ කළ පසු නිදහස් ප්‍රශ්නවලට පිළිතුරු ලැබේ. දැනට ඉහත ආදර්ශයක් තෝරන්න.",
          "AIサービス接続後、自由な質問に回答できます。今は上の学習例をお試しください。",
        ),
      },
    ]);
    setDraft("");
  }
  return (
    <Dialog
      title={t("Your study companion", "ඔබේ අධ්‍යයන සහකරු", "学習パートナー")}
      onClose={onClose}
      closeLabel={t("Close", "වසන්න", "閉じる")}
      wide
    >
      <div className="mentor-intro">
        <Sparkle weight="duotone" size={30} />
        <p>
          {t(
            "A little clarity goes a long way.",
            "පැහැදිලි අවබෝධයක්, හොඳ ආරම්භයක්.",
            "小さな理解が、大きな一歩に。",
          )}
        </p>
        <small>
          {courseId} ·{" "}
          {t(
            "Guided demo · AI connection pending",
            "මඟපෙන්වන ආදර්ශය • AI සම්බන්ධය සූදානම් කළ යුතුයි",
            "学習デモ・AI接続準備中",
          )}
        </small>
      </div>
      <div className="mentor-prompts">
        {prompts.map(([question, answer]) => (
          <button
            key={question}
            onClick={() =>
              setMessages((previous) => [
                ...previous.slice(-38),
                { role: "learner", text: question },
                { role: "mentor", text: answer },
              ])
            }
          >
            {question}
            <ArrowRight />
          </button>
        ))}
      </div>
      <div
        className="message-list"
        role="log"
        aria-label={t("Study conversation", "අධ්‍යයන සංවාදය", "学習の会話")}
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 && (
          <p className="mentor-empty">
            {t(
              "Choose an example above to get started. These are prepared explanations; live AI replies are not connected yet.",
              "ඉහත ආදර්ශයක් තෝරා අරඹන්න. මේවා සකස් කළ පැහැදිලි කිරීම්ය. සජීවී AI පිළිතුරු තවම සම්බන්ධ කර නැත.",
              "上の例を選んで始めましょう。用意された解説です。AIによる回答はまだ利用できません。",
            )}
          </p>
        )}
        {messages.map((message, index) => (
          <p className={message.role} key={index}>
            {message.text}
          </p>
        ))}
        <span ref={bottom} />
      </div>
      <form className="mentor-form" onSubmit={send}>
        <label className="sr-only" htmlFor="mentor-prompt">
          {t("Your question", "ඔබේ ප්‍රශ්නය", "質問")}
        </label>
        <input
          id="mentor-prompt"
          maxLength={1000}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t(
            "Preview a question…",
            "ආදර්ශ ප්‍රශ්නයක් ලියන්න…",
            "質問を試す…",
          )}
        />
        <button
          aria-label={t("Send", "යවන්න", "送信")}
          type="submit"
          disabled={!draft.trim()}
        >
          <PaperPlaneTilt weight="fill" />
        </button>
      </form>
    </Dialog>
  );
}
