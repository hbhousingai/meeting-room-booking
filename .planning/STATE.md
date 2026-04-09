# Project State

## Current Milestone
- [x] Initial Codebase Review
- [x] GitHub Actions Deployment Setup
- [x] Fix Timezone Migration Issues (UTC vs Local)
- [ ] Verification of Secret Injection

## Decisions
- **2026-04-09**: Fixed `normalizeRow` to use local timezone methods (`getHours`, `getDate`) instead of UTC methods. This resolves the issue where bookings were appearing on the wrong day and outside the standard hours due to the +8 hour offset in Taiwan.
- **2026-04-08**: Switched from Serverless Proxy to Direct Fetch for GitHub Pages compatibility.
- **2026-04-08**: Re-evaluated Vercel vs. GitHub Pages. Decided to stick with **GitHub Pages** for better responsiveness.

## Blockers
- None. Waiting for User to set GitHub Secret `APPS_SCRIPT_URL`.
