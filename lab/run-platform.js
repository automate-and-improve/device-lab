// Runs one platform: node lab/run-platform.js <platform> <url> [checks] <out dir>
// platforms: windows-edge, windows-chrome, windows-firefox, mac-safari, mac-webkit-iphone, ios-sim, android
// Writes <out dir>/<platform>/result.json + one screenshot per step. Never throws: failures become results.
const fs = require('fs'), path = require('path');
const drivers = require('./drivers');
const { generic } = require('./checks');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const [platform, url, checksName, outDir] = process.argv.slice(2);
const PLATFORMS = {
  'windows-edge': () => drivers.playwright({ browser: 'chromium', channel: 'msedge', label: 'Windows Edge' }),
  'windows-chrome': () => drivers.playwright({ browser: 'chromium', channel: 'chrome', label: 'Windows Chrome' }),
  'windows-firefox': () => drivers.playwright({ browser: 'firefox', label: 'Windows Firefox' }),
  'windows-chrome-phone': () => drivers.playwright({ browser: 'chromium', channel: 'chrome', device: 'Pixel 7', label: 'Windows Chrome, phone size' }),
  'mac-safari': () => drivers.safari({}),
  'mac-webkit-iphone': () => drivers.playwright({ browser: 'webkit', device: 'iPhone 15', label: 'macOS WebKit as iPhone (interactive)' }),
  'ios-sim': () => drivers.iosSafari({}),
  'android': () => drivers.android({}),
};

(async () => {
  const dir = path.join(outDir, platform); fs.mkdirSync(dir, { recursive: true });
  const result = { platform, url, checks: checksName || 'generic', started: new Date().toISOString(), label: platform, results: [], screenshots: [], notes: [] };
  const save = () => fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(result, null, 1));
  let d;
  try {
    d = await PLATFORMS[platform]();
    result.label = d.label;
    await d.open(url);
    await sleep(2500);
    const steps = checksName && checksName !== 'generic' && fs.existsSync(path.join(__dirname, '..', 'checks', checksName + '.js'))
      ? require(path.join('..', 'checks', checksName + '.js')) : [{ name: '1-page', act: '', check: '[]' }];
    for (const [i, step] of steps.entries()) {
      try {
        if (step.act && !d.screenshotOnly) { await d.evaluate(step.act); await sleep(1800); }
        if (d.dismissPopups) await d.dismissPopups();   // the browser's own pop-ups, not the page under test
        const shot = step.name + '.png';
        await d.screenshot(path.join(dir, shot)); result.screenshots.push(shot);
        const phone = shot.replace(/\.png$/, '-phone.png');   // iPhone: the whole screen incl. Safari's bars
        if (fs.existsSync(path.join(dir, phone))) result.screenshots.push(phone);
        if (d.screenshotOnly) { if (i === 0) result.notes.push('screenshot only: Mobile Safari in the simulator can be looked at, not steered'); break; }
        for (const c of await d.evaluate(step.check)) result.results.push({ step: step.name, ...c });
        if (i === 0) for (const c of await d.evaluate(generic)) result.results.push({ step: 'generic', ...c });
      } catch (e) { result.results.push({ step: step.name, name: 'step ran', ok: false, detail: String(e.message || e).slice(0, 300) }); break; }
    }
    if (d.errors && d.errors.length) result.results.push({ step: 'page', name: 'no script errors on the page', ok: false, detail: d.errors.slice(0, 3).join(' | ') });
  } catch (e) {
    result.results.push({ step: 'start', name: 'platform started and page opened', ok: false, detail: String(e.message || e).slice(0, 300) });
    try { if (d) { await d.screenshot(path.join(dir, 'failed.png')); result.screenshots.push('failed.png'); } } catch (e2) {}   // what the screen showed
  } finally {
    if (d && d.notes && d.notes.length) result.notes.push(...d.notes);
    try { d && await d.close(); } catch (e) {}
    result.finished = new Date().toISOString();
    save();
    const bad = result.results.filter(r => !r.ok).length;
    console.log(`${result.label}: ${result.results.length - bad}/${result.results.length} ok, ${result.screenshots.length} screenshots`);
  }
})();
