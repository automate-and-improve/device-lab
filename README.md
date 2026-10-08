# device-lab

Test any public website on 8 platforms at once, with screenshots, on GitHub's free machines. Nothing runs or installs on the laptop.

```
node run.js <public https URL> [checks]        # e.g.  node run.js https://automate-and-improve.github.io/ intake
```
Takes ~10-15 minutes (macOS machines sometimes queue). Prints a table and saves screenshots to `runs/<id>/<platform>/` (not in git; the full copy is on the `results` branch).

| Platform | What it really is | Steered? |
|---|---|---|
| Windows Edge / Chrome / Firefox | real browsers on Windows Server 2025 (Playwright) | yes |
| Windows Chrome, phone size | Chrome with a Pixel-size screen and touch | yes |
| macOS Safari | real Safari 26 on macOS 15 via Apple's safaridriver | yes |
| macOS WebKit as iPhone | Safari's engine with an iPhone screen (Playwright) | yes |
| iPhone simulator | real Mobile Safari on an iPhone 16 simulator (iOS 26) | screenshot only |
| Android emulator | real Chrome on an Android 14 Pixel emulator (Chrome DevTools) | yes |

**Checks**: `lab/checks.js` (generic, every page: title, no sideways scroll, no broken images, tap targets, readable text) + `checks/<project>.js` (a walk through the page: action → screenshot → checks). Add a file per project. Everything runs as JavaScript inside the page.

**Machines can't see**: the "Allow microphone?" popup, the phone's own file/camera sheets, links opened inside WhatsApp/Viber, real camera/mic. Keep a 5-minute real-phone check for launches.

**Rules**: public repo = free minutes, so never put secrets, client data, names or private URLs here. Only official GitHub actions (`actions/*`) and Playwright (Microsoft), pinned.

How it works: `run.js` commits `requests/<id>.json` and pushes → `.github/workflows/devices.yml` runs Windows, macOS (+ iPhone simulator) and Android in parallel (`lab/run-platform.js` + `lab/drivers.js`) → the report job writes `results/<id>/` to the `results` branch → `run.js` pulls it.
