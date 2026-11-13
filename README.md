# NullVibe Japanese LMS

A responsive learning preview with a white/light-blue design. English is the default, with Sinhala and Japanese options.

Live preview: https://nullvibe-japanese-lms.vercel.app

Source repository: https://github.com/NullVibe-D/nullvibe-lms (private).

## Run locally

Use Node.js 20.19+ or a compatible current LTS. Run npm ci, then npm run dev -- --host 127.0.0.1 --port 4173 --strictPort.

Open http://127.0.0.1:4173. The first view explains N5/N4 and offers Start N5. My learning resumes the selected course. Staff preview in the footer opens Course studio; Mentor offers clearly labeled guided examples.

For a local compiled preview, build first, then run npm run preview -- --host 127.0.0.1 --port 4180 --strictPort.

## Verification

Run npm run build, npm test, npm run test:qa, node scripts/quality.mjs and npm audit. The browser scripts default to the compiled preview at port 4180. Set QA_URL to test another preview address, including the hosted site. Run node scripts/hosted-smoke.mjs https://nullvibe-japanese-lms.vercel.app to check live security headers, assets and lesson persistence.

The browser QA scripts support a QA_BROWSER environment variable containing a local Chromium-compatible executable. Their default targets the original Windows test browser. The final hosted checks used C:/Program Files/Google/Chrome/Application/chrome.exe with QA_DISABLE_GPU=1 in an isolated browser profile after the bundled browser stalled. Install Chromium through Playwright if needed and set QA_BROWSER to its executable.

## Scope

The prototype includes course discovery, ten sample lessons, two complete assessments, saved local progress and lesson position, draft settings and a mentor interface with level-specific guided examples. Practice drafts/results survive navigation and refresh within the same browser tab. URL routes support direct links and Back/Forward. Course settings start undecided. Browser storage contains demo state only; progress does not sync between devices.

Live sign-in, payments, private videos, server authorization, cross-device progress and generated AI replies remain integration work. The teacher image is generated and the sample teaching content needs professional review.

See docs/ARCHITECTURE.md for the implementation plan, QA.md for test findings, docs/DEPLOYMENT.md for the release record and docs/UIUX-AUDIT.md for the visual walkthrough. Bundled font licenses are in public/fonts.
