# Hosted preview release

Published 10 November 2026; reviewed again 13 November 2026.

- Public URL: https://nullvibe-japanese-lms.vercel.app
- Private source repository: https://github.com/NullVibe-D/nullvibe-lms
- Source branch: feature/nullvibe-prototype
- Deployed application commit: 0bf2f2adc80d8598ba364fabf826729841551d0a
- Vercel team: j-karan-s-projects / team_88QZGhj5i4XSVNprVtcdJOvE
- Existing project: nullvibe-japanese-lms / prj_qNqZcYtihxxt3iPLpMhYOWdReTDg
- Deployment: dpl_5jB3MMm493eugejticKFm7HcUjPH
- Vercel target/status: production / READY
- Framework: Vite; npm ci; npm run build; output dist/client.
- Build elapsed time: approximately 13 seconds, from Vercel buildingAt to ready.

The existing public deployment served the older lesson-03 landing and omitted the prepared security headers. This release replaces it with the reviewed course-first frontend. The public JavaScript and stylesheet names match the local release: index-wF4kk7W1.js and index-DkJrgtjj.css.

The release used an authenticated Vercel source upload: 25 reviewed build inputs, totaling 461,299 bytes, extracted from the committed source. Source files, fonts, font licenses and the WebP illustration were included. Local credentials, browser state, QA screenshots, node_modules and the unused original PNG were excluded. Vercel built these files remotely. Existing deployment protection settings were retained.

This is a source snapshot deployment. Automatic deployment from GitHub pushes is not configured or verified for this project. Deploy the reviewed release explicitly until the repository is connected. Do not treat Git metadata displayed in Vercel as proof that automatic deployment is enabled. Original repository and main branch were not modified.

No paid plan, database, AI service or payment provider was activated. This remains a sample-content learning preview. The current Hobby plan is for personal non-commercial use; review hosting eligibility before launching a commercial course service: https://vercel.com/docs/plans/hobby.

## Verification and repeat release

1. Check the source branch and commit; run npm test, npm run build and npm audit.
2. Test the compiled app with scripts/qa.mjs. For hosted testing, set QA_URL to the public URL and QA_BROWSER to an available isolated test browser executable.
3. Run node scripts/hosted-smoke.mjs https://nullvibe-japanese-lms.vercel.app.
4. Confirm the intended Vercel team/project and deploy only reviewed build inputs. Keep secrets and browser authentication state out of uploads.
5. Confirm READY, public URL, expected asset hashes, security headers and the complete learning flow. Save evidence in qa/ and update QA.md.

Browser exceptions and console errors are captured by the hosted smoke test. There is no application backend in this release, and no persistent application error monitoring was configured. Real-user metrics and physical-device/browser compatibility need separate validation. Runtime accounts, purchases, private media and generated AI remain pending; see ARCHITECTURE.md.
