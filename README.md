# NullVibe Japanese LMS

A responsive local frontend based on the selected white/light-blue lesson workspace. English is the default, with Sinhala and Japanese options.

## Run locally

Use Node.js 20.19+ or a compatible current LTS. Run npm ci, then npm run dev -- --host 127.0.0.1 --port 4173 --strictPort.

Open http://127.0.0.1:4173. The first view explains N5/N4 and offers Start N5. My learning resumes the selected course. Staff preview in the footer opens Course studio; Mentor offers clearly labeled guided examples.

The compiled preview is available at http://127.0.0.1:4180 during this delivery. To start it later, build first, then run npm run preview -- --host 127.0.0.1 --port 4180 --strictPort.

## Verification

Run npm run build, npm test, npm run test:qa, node scripts/quality.mjs and npm audit. The browser scripts default to the compiled preview at port 4180. Set QA_URL to test another local preview address.

The browser QA script supports a QA_BROWSER environment variable containing a local Chromium executable. Its default targets the existing Windows test browser used during this delivery. Install Chromium through Playwright if needed and set QA_BROWSER to its executable.

## Scope

The prototype includes course discovery, ten sample lessons, two complete assessments, saved local progress and lesson position, draft settings and a mentor interface with level-specific guided examples. Practice drafts/results survive navigation and refresh within the same browser tab. URL routes support direct links and Back/Forward. Course settings start undecided. Browser storage contains demo state only; progress does not sync between devices.

Live sign-in, payments, private videos, server authorization, cross-device progress and generated AI replies remain integration work. The teacher image is generated and the sample teaching content needs professional review.

See docs/ARCHITECTURE.md for the implementation plan, QA.md for test findings and docs/UIUX-AUDIT.md for the visual walkthrough. Bundled font licenses are in public/fonts. The application has not been deployed.
