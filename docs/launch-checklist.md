# SuperTA Launch Checklist

Use this checklist immediately before publicly announcing SuperTA.

## Final verification
- [ ] `npm run build` passes
- [ ] `npm test` passes
- [ ] `node dist/evals/run-evals.js` passes
- [ ] `node dist/plugins/superta/src/plugin/smoke-test.js config.example.json` passes

## Fresh-user dry run
- [ ] follow only `README.md` + `docs/getting-started.md`
- [ ] complete `interactive-setup.js`
- [ ] run `doctor-report.js`
- [ ] inspect state
- [ ] note any confusing wording or rough edges and fix them first

## Messaging alignment
- [ ] describe SuperTA as an **experimental OpenClaw plugin**
- [ ] say student-data handling stays **local or institution-controlled**
- [ ] say the supported workflow uses **local models or deterministic logic only**
- [ ] say there is **no supported external API path** for student-data processing
- [ ] say **draft/review/manual-send**
- [ ] say **structured student case tracking**
- [ ] do **not** call it a managed production SaaS
- [ ] do **not** imply autonomous grading/accommodation/integrity decisions
- [ ] do **not** overclaim legal certification

## Demo readiness
- [ ] use synthetic or clearly safe demo data
- [ ] verify the commands in `docs/public-demo-walkthrough.md`
- [ ] verify the commands in `docs/demo-script.md`

## Docs to link
- [ ] `README.md`
- [ ] `docs/getting-started.md`
- [ ] `docs/privacy-and-deployment.md`
- [ ] `docs/release-readiness.md`

## Final release call
Delay announcement if any of these are false:
- setup is understandable
- privacy boundary is understandable
- caveats are explicit
- messaging matches current code and docs
