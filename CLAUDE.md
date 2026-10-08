# device-lab

One command ("test all devices <project>") tests our websites and apps on Windows, macOS + Safari, iPhone simulator and Android using free GitHub Actions machines, with screenshots and a pass/fail report.

## What it is

A shared test lab for all projects. Claude pushes a run request (URL + checks) to the public repo `automate-and-improve/device-lab`; GitHub's machines run the same checks in parallel on Windows, macOS (real Safari), an iPhone simulator (real Mobile Safari) and Android; results and screenshots come back on the `results` branch, and Claude reports only what needs the user. Machines can't test the "Allow microphone" popup, WhatsApp/Viber in-app browsers or the real camera: those stay a 5-minute real-phone check per launch.

Plan, facts and sources: `../opportunity-lab/reports/2026-10-08-device-lab.md`.

## Commands

- **"test all devices <project or URL>"** = `node run.js <url>` (pushes a run request, waits for GitHub, pulls results, prints the report).

## Rules

- The repo is **public** (free minutes): never put secrets, client data, private URLs, names or answers in it. Only public pages are tested.
- Nothing is installed on the user's laptop for this (Windows Smart App Control blocks unsigned tools; GitHub's machines do the work).
- Third-party GitHub Actions or tools: only from verified publishers (e.g. `actions/*`, Microsoft/Playwright), pinned to a version at least 2 weeks old.

## Key decisions

- 2026-10-08: No lab checks for shelf-inventory (client app) or mymodernstay.com for now (user). Nightly = intake only.
- 2026-10-08: Project created (user: "build it, move it to a project, we will use it often while developing"). Option A from the lab report: GitHub Actions, public repo in the org `automate-and-improve`, EUR 0/month.
