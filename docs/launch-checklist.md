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
- [ ] list configured courses
- [ ] inspect state
- [ ] note any confusing wording or rough edges and fix them first

## Messaging alignment
- [ ] describe SuperTA as an **experimental OpenClaw plugin**
- [ ] say **no extra model API required by default**
- [ ] say **one professor across multiple live courses**
- [ ] say **draft-first / human-in-the-loop**
- [ ] do **not** call it a polished production product
- [ ] do **not** imply turnkey Gmail production deployment
- [ ] do **not** imply autonomous grading/accommodation/integrity decisions

## Demo readiness
- [ ] rehearse the 5-minute demo once
- [ ] decide whether to use live Gmail or safer local/demo paths
- [ ] verify the commands in `docs/public-demo-walkthrough.md`
- [ ] verify the commands in `docs/demo-script.md`

## Docs to link in the announcement
- [ ] `README.md`
- [ ] `docs/getting-started.md`
- [ ] `docs/public-demo-walkthrough.md`
- [ ] `docs/release-readiness.md`

## Final release call
If any of these are false, delay announcement:
- setup is understandable
- doctor output is understandable
- plugin smoke test passes
- safety evals pass
- caveats are explicit
- public framing is honest
