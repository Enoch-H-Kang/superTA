# SuperTA Multi-Course Setup

This document describes the **advanced/manual** setup options.

If you are new to the project, start with the recommended path instead:
- `docs/getting-started.md`

## Recommended first-run path

Use the interactive setup:

```bash
node dist/plugins/superta/src/setup/interactive-setup.js
```

Then run:

```bash
node dist/plugins/superta/src/setup/doctor-report.js local.config.json . 3600000
```

## Manual command set

Use these if you want more control than the interactive flow provides.

### Initialize config
```bash
node dist/plugins/superta/src/setup/init-config.js [configPath] [professorId] [allowedProfessorSender] [webhookPath]
```

### Add a course
Positional version:
```bash
node dist/plugins/superta/src/setup/add-course.js <configPath> <courseId> <termId> <aliasesCsv> <subjectHintsCsv> <courseRoot> [scaffold=true|false]
```

Flag-based version:
```bash
node dist/plugins/superta/src/setup/add-course-flags.js --config local.config.json --course-id cs101-sp26 --term-id sp26 --aliases cs101@school.edu --subject-hints cs101 --course-root ./courses/cs101-sp26 --scaffold true
```

This can scaffold starter files under:
- `course/syllabus.md`
- `course/faq.md`
- `course/policy.yaml`
- `course/schedule.yaml`

### Validate setup
```bash
node dist/plugins/superta/src/setup/validate-setup.js [configPath]
```

Checks for:
- duplicate course ids
- duplicate aliases
- missing course roots
- missing core course files
- missing professor sender allowlist

### List configured courses
```bash
node dist/plugins/superta/src/setup/list-courses.js [configPath]
```

### Run doctor / health check
```bash
node dist/plugins/superta/src/setup/doctor.js [configPath] [stateRoot] [watchThresholdMs]
```

Human-readable report:
```bash
node dist/plugins/superta/src/setup/doctor-report.js [configPath] [stateRoot] [watchThresholdMs]
```

### Bootstrap three courses in one command
Positional version:
```bash
node dist/plugins/superta/src/setup/bootstrap-three-courses.js <configPath> <professorId> <allowedProfessorSender> <course1Spec> <course2Spec> <course3Spec>
```

Flag-based version:
```bash
node dist/plugins/superta/src/setup/bootstrap-three-courses-flags.js --config local.config.json --professor-id prof-enoch --sender prof@example.edu --course1 'cs101-sp26|sp26|cs101@school.edu|cs101|./courses/cs101-sp26' --course2 'econ201-sp26|sp26|econ201@school.edu|econ201|./courses/econ201-sp26' --course3 'stat301-sp26|sp26|stat301@school.edu|stat301|./courses/stat301-sp26'
```

Each `courseSpec` uses:
```text
courseId|termId|alias|subjectHint|courseRoot
```

## Manual three-course example

```bash
node dist/plugins/superta/src/setup/init-config.js local.config.json prof-enoch prof@example.edu /webhooks/gmail
node dist/plugins/superta/src/setup/add-course.js local.config.json cs101-sp26 sp26 cs101@school.edu cs101 ./courses/cs101-sp26 true
node dist/plugins/superta/src/setup/add-course.js local.config.json econ201-sp26 sp26 econ201@school.edu econ201 ./courses/econ201-sp26 true
node dist/plugins/superta/src/setup/add-course.js local.config.json stat301-sp26 sp26 stat301@school.edu stat301 ./courses/stat301-sp26 true
node dist/plugins/superta/src/setup/validate-setup.js local.config.json
node dist/plugins/superta/src/setup/list-courses.js local.config.json
node dist/plugins/superta/src/setup/doctor-report.js local.config.json . 3600000
```
