// One small adapter per platform, all with the same shape:
//   { label, open(url), evaluate(js) -> value, screenshot(file), close() }
// - playwright: Chromium / Edge / Firefox / WebKit (Microsoft's Playwright, pinned in package.json)
// - safari:     real Safari on macOS through Apple's own safaridriver (W3C WebDriver, plain HTTP)
// - ios-sim:    real Mobile Safari in Apple's iPhone simulator, steered by Apple's safaridriver (falls back to screenshots)
// - android:    Chrome in Google's Android emulator through Chrome DevTools (adb forward + WebSocket)
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function playwright({ browser = 'chromium', channel, device, label }) {
  const pw = require('playwright');
  const b = await pw[browser].launch(channel ? { channel } : {});
  const ctx = await b.newContext(device ? { ...pw.devices[device], locale: 'sl-SI' } : { viewport: { width: 1366, height: 900 }, locale: 'sl-SI' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  return {
    label, errors,
    open: url => page.goto(url, { waitUntil: 'networkidle' }),
    evaluate: js => page.evaluate(js),
    screenshot: file => page.screenshot({ path: file, fullPage: true }),
    close: () => b.close(),
  };
}

async function safari({ label = 'macOS Safari', caps = { browserName: 'safari' }, desktop = true, port = 4444 }) {
  execSync('sudo safaridriver --enable');
  const proc = spawn('safaridriver', ['-p', String(port)], { stdio: 'ignore' });
  await sleep(1500);
  const base = `http://127.0.0.1:${port}`;
  const wd = async (method, path, body) => {
    const r = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json(); if (j.value && j.value.error) throw new Error(j.value.error + ': ' + j.value.message); return j.value;
  };
  let s;
  try { s = await wd('POST', '/session', { capabilities: { alwaysMatch: caps } }); } catch (e) { proc.kill(); throw e; }
  const id = s.sessionId;
  if (desktop) await wd('POST', `/session/${id}/window/rect`, { width: 1366, height: 900 });
  return {
    label, errors: [], wd, id,
    open: url => wd('POST', `/session/${id}/url`, { url }),
    evaluate: js => wd('POST', `/session/${id}/execute/sync`, { script: 'return eval(arguments[0]);', args: [js] }),
    screenshot: async file => fs.writeFileSync(file, Buffer.from(await wd('GET', `/session/${id}/screenshot`), 'base64')),
    close: async () => { try { await wd('DELETE', `/session/${id}`); } catch (e) {} proc.kill(); },
  };
}

// iPhone: real Mobile Safari in Apple's simulator, steered by Apple's own safaridriver ('safari:useSimulator').
// Each screenshot is taken twice: the page (WebDriver) and the whole phone screen incl. Safari's bars (simctl).
// If Apple's driver can't steer the simulator, it falls back to screenshot-only (iosSim below) and says so.
async function iosSafari({ label = 'iPhone simulator (Mobile Safari)' }) {
  try {
    const d = await safari({ label, desktop: false, port: 4445,
      caps: { browserName: 'safari', platformName: 'iOS', 'safari:useSimulator': true, 'safari:deviceType': 'iPhone' } });
    let dev = '';
    try { dev = execSync('xcrun simctl list devices booted').toString().match(/^\s+(iPhone[^(]*)\(/m)[1].trim(); } catch (e) {}
    d.label = label + (dev ? ' - ' + dev : '') + ' (steered)';
    const pageShot = d.screenshot;
    d.screenshot = async file => {
      await pageShot(file);
      try { execSync(`xcrun simctl io booted screenshot "${file.replace(/\.png$/, '-phone.png')}"`); } catch (e) {}
    };
    return d;
  } catch (e) {
    const d = await iosSim({ label });
    d.notes = ['Apple\'s driver could not steer the simulator (' + String(e.message).slice(0, 160) + '): screenshot only'];
    return d;
  }
}

async function iosSim({ device = 'iPhone 16', label = 'iPhone simulator (Mobile Safari)' }) {
  const list = JSON.parse(execSync('xcrun simctl list devices available -j').toString());
  const all = Object.entries(list.devices).flatMap(([rt, ds]) => ds.map(d => ({ ...d, rt })));
  const dev = all.filter(d => d.name === device && /iOS/.test(d.rt)).pop() || all.filter(d => /iPhone/.test(d.name) && /iOS/.test(d.rt)).pop();
  if (!dev) throw new Error('no iPhone simulator found');
  try { execSync(`xcrun simctl boot ${dev.udid}`); } catch (e) { /* already booted */ }
  execSync(`xcrun simctl bootstatus ${dev.udid} -b`, { stdio: 'ignore', timeout: 300000 });
  return {
    label: label + ' - ' + dev.name + ' ' + dev.rt.split('.').pop(), errors: [], screenshotOnly: true,
    open: async url => { execSync(`xcrun simctl openurl ${dev.udid} "${url}"`); await sleep(12000); },
    evaluate: async () => { throw new Error('screenshot only'); },
    screenshot: async file => execSync(`xcrun simctl io ${dev.udid} screenshot "${file}"`),
    close: async () => { try { execSync(`xcrun simctl shutdown ${dev.udid}`); } catch (e) {} },
  };
}

async function android({ label = 'Android emulator (Chrome)' }) {
  // The emulator is started by the workflow; here: open the page in Chrome and talk to it over DevTools.
  const adb = cmd => execSync('adb ' + cmd, { timeout: 60000 }).toString();
  adb(`shell "echo 'chrome --disable-fre --no-default-browser-check --no-first-run' > /data/local/tmp/chrome-command-line"`);
  adb('shell am set-debug-app --persistent com.android.chrome');
  return {
    label, errors: [], notes: [],
    _ws: null, _id: 0, _wait: {},
    // Chrome's own welcome screens and pop-ups (not our page): tap them away like a person would, preferring
    // "no" answers. Called after opening and before every screenshot. Returns how many were tapped.
    async dismissPopups() {
      const PREFER = [/^No thanks$/, /^No, thanks$/, /^Use without an account$/, /^Not now$/, /^Accept & continue$/, /^Got it$/, /^Skip$/, /^Done$/, /^Continue$/];
      let tapped = 0;
      for (let i = 0; i < 10; i++) {
        let xml = '';
        try { adb('shell uiautomator dump /sdcard/ui.xml'); xml = adb('shell cat /sdcard/ui.xml'); } catch (e) {}
        // only Chrome's own interface (resource ids of com.android.chrome), never buttons inside our web page
        const nodes = [...xml.matchAll(/<node [^>]*>/g)].map(m => m[0]).filter(n => /resource-id="com\.android\.chrome:id\//.test(n))
          .map(n => ({ text: (n.match(/ text="([^"]*)"/) || [])[1] || '', b: (n.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/) || []).slice(1).map(Number) }))
          .filter(n => n.text && n.b.length === 4);
        let hit = null;
        for (const re of PREFER) { hit = nodes.find(n => re.test(n.text)); if (hit) break; }
        if (!hit) break;
        adb(`shell input tap ${Math.round((hit.b[0] + hit.b[2]) / 2)} ${Math.round((hit.b[1] + hit.b[3]) / 2)}`);
        tapped++; this.notes.push('tapped Chrome pop-up: ' + hit.text);
        await sleep(2000);
      }
      return tapped;
    },
    async open(url) {
      const start = () => adb(`shell am start -n com.android.chrome/com.google.android.apps.chrome.Main -a android.intent.action.VIEW -d "${url}"`);
      start();
      await sleep(6000);
      if (await this.dismissPopups()) { start(); await sleep(6000); await this.dismissPopups(); }
      adb('forward tcp:9222 localabstract:chrome_devtools_remote');
      let target, pages = [];
      for (let i = 0; i < 30 && !target; i++) {
        try { pages = (await (await fetch('http://127.0.0.1:9222/json')).json()).filter(t => t.type === 'page'); target = pages.find(t => t.url.startsWith(url.split('#')[0].slice(0, 30))); } catch (e) {}
        if (!target) await sleep(2000);
      }
      if (!target) throw new Error('Chrome page not found over DevTools (open pages: ' + pages.map(p => p.url.slice(0, 60)).join(', ') + ')');
      this._ws = new WebSocket(target.webSocketDebuggerUrl);
      await new Promise((r, j) => { this._ws.onopen = r; this._ws.onerror = j; });
      this._ws.onmessage = m => { const d = JSON.parse(m.data); if (this._wait[d.id]) { this._wait[d.id](d); delete this._wait[d.id]; } };
    },
    _call(method, params) { return new Promise(r => { this._wait[++this._id] = r; this._ws.send(JSON.stringify({ id: this._id, method, params })); }); },
    async evaluate(js) {
      const r = await this._call('Runtime.evaluate', { expression: js, returnByValue: true, awaitPromise: true });
      if (r.result.exceptionDetails) throw new Error((r.result.exceptionDetails.exception || {}).description || 'page error');
      return r.result.result.value;
    },
    screenshot: async file => fs.writeFileSync(file, execSync('adb exec-out screencap -p', { maxBuffer: 64 * 1024 * 1024 })),
    async close() { try { this._ws && this._ws.close(); } catch (e) {} },
  };
}

module.exports = { playwright, safari, iosSafari, iosSim, android };
