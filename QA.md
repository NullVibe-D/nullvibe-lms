# NullVibe verification report

7 November 2026 · branch feature/nullvibe-prototype · local compiled preview at http://127.0.0.1:4180.

## Tested scope

This is verification of the interactive frontend and domain policy reference. It is not verification of a deployed LMS, live payments, account authorization or an AI provider. Main remains at 27fa2dc61f742ef9927c5386d3a32af01b8806c3. No deployment or paid service was created.

| Check | Evidence |
| --- | --- |
| Production build | Vite build and Sites packaging completed; dist/client/index.html, dist/server/index.js and dist/.openai/hosting.json present |
| Unit / packaging tests | 12 tests passed: configuration validation, progress/result sanitization, assessment draft consistency, supported routes, entitlement denial cases and static packaging |
| Browser matrix | Chromium 148.0.7778.96; 320, 360, 768, 1024 and 1440 pixel widths; English, Sinhala and Japanese |
| Accessibility scans | Catalog, lessons, practice, course details, mentor and staff preview in every size/language, plus answer-review states; exact results in qa/results.json |
| Layout checks | 36 additional screen/size/language combinations with no controls extending beyond the viewport |
| Short screen | 320 × 568: dialog focus wrapping, question entry, submit, Escape and return focus passed |
| Font failure | Lesson flow remains usable with font requests blocked |
| Dependencies | npm audit reported zero vulnerabilities at verification time |
| Patch whitespace | git diff --check passed |

## Functional coverage

- First visit opens courses in English; Start N5 is visible without scrolling at every tested width. New learners start with hiragana rather than lesson 03.
- Skip link, keyboard resource tabs, language selection/persistence, mobile navigation, visible return links, Back/Forward and refresh.
- Completion and per-course lesson position persist. Invalid lesson IDs, locale objects, settings and result objects fall back safely.
- Practice selection, checked state, current question and results survive leaving the view and refreshing the same tab. Both N5 and N4 have complete scoring paths; perfect and all-wrong results are checked. Retry resets the attempt.
- Search, level filtering and empty-result recovery. Course configuration changes appear in course details, including price, duration, live-class choice and video hours. Native number constraints reject zero access days.
- N4 mentor prompts match N4 content. Arbitrary submitted text renders literally, and free-form replies explicitly identify the missing AI connection.
- Dialog scroll locking, Escape, focus restoration and keyboard wrapping. Background interaction remains unavailable while a modal is open.
- Storage-denied operation gives truthful saving feedback and allows the current learning flow to continue.

## Performance evidence

The final bundle contains 304,102 bytes of JavaScript (91,842 gzip) and 24,810 bytes of CSS (6,449 gzip). The lesson illustration is 69,224 bytes. Locally served font files are 36,932 bytes for Latin and 129,932 bytes for Sinhala; Japanese uses system fonts. No external font, video, payment or AI request is needed to use the preview.

A local 360-pixel Chromium sample recorded first contentful paint and largest contentful paint at 876 ms with cumulative layout shift 0. These are single-run local measurements on this workstation, with other QA work running. They are not field Core Web Vitals, mobile-network measurements or a loading-time promise. Raw observations, including long tasks, are retained in qa/quality.json.

## Findings fixed during this review

1. Replaced the lesson-03 arrival with clear course-first onboarding.
2. Made N5/N4 levels and next actions understandable; separated staff navigation.
3. Preserved lesson positions, assessment drafts and browser navigation.
4. Rejected malformed browser state before rendering or grading.
5. Corrected form labels and storage-failure feedback.
6. Corrected dialog outside-click behavior, background scrolling and keyboard wrapping.
7. Matched mentor examples to the selected level and bounded retained messages.
8. Kept text fully opaque during motion and respected reduced-motion preferences.
9. Removed the remote font stylesheet dependency and bundled licensed fonts locally.

The first automated pass sampled opacity transitions before they finished. The final UI uses transform-only motion and the scanner waits for finite animations to settle. A harness error in the additional all-wrong scan was also corrected to use an explicit Playwright browser context; it was not an application error.

## Limits and remaining launch work

- Automated accessibility scans cover detectable rules only. Real screen-reader sessions, inclusive user testing, physical iOS/Android testing, Safari/Firefox and real network/device performance remain necessary. See the [Playwright accessibility guidance](https://playwright.dev/docs/accessibility-testing).
- Demo browser storage is editable by the learner. It is not authentication, trusted grading or a paid-access boundary. Authorization must be verified on every server request when the backend is integrated, as described in the [OWASP authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
- Staff configuration is a local preview. Live identity/roles, payments/webhooks, entitlement expiry/revocation, private media, cross-device persistence and generated AI answers are not implemented services.
- Course videos, teacher branding, course fees, duration, live-class delivery, payment methods and provider/budget decisions need client inputs. Sample content and Sinhala/Japanese translations need qualified teacher review.

The numbered visual walkthrough is [docs/UIUX-AUDIT.md](docs/UIUX-AUDIT.md). Screenshots were captured during this review, and the final browser evidence is in [qa/results.json](qa/results.json) and [qa/quality.json](qa/quality.json).
