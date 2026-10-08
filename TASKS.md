# device-lab - Tasks

Status: active

## Questions for me

- Shelf-inventory (client's live app): a nightly test would be useful, but its address must not go into this public repo. Options: (a) a private copy of the lab (uses free private minutes, Mac costs extra), (b) run it from the laptop with Windows browsers only, (c) skip. Recommended: (b).
- mymodernstay.com (your rental site): add a nightly check? It would publicly link the site to this lab (public repo). Recommended: only if you don't mind that.

## Now


## Next

- [ ] When steel-fabcert's website goes live: add it to nightly.json + a checks file
- [ ] Check the first nightly run (2026-10-09 06:30) went through and that a failure would email you

## Later

## Done

- [x] iPhone simulator steered with Apple's safaridriver (falls back to screenshots), phone-screen screenshots too; nightly runs of nightly.json at 06:30 with GitHub email on failure; several sites per run; 5-minute real-phone checklist (2026-10-08)
- [x] Device lab working (2026-10-08): `node run.js <url> [checks]` -> 8 platforms on GitHub (Windows Edge/Chrome/Firefox + phone size, macOS Safari, WebKit-as-iPhone, iPhone 16 simulator, Android 14 Chrome); intake: 13/13 on every steerable platform; Chrome pop-ups tapped away; screenshot + diagnostics on failure. 5 runs to get there (macOS queue, Android folder + first-start screens)
## Schedule
