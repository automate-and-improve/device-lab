// Combines all platform results into summary.json + a short markdown report (printed to stdout).
// Run (in the workflow): node lab/summarize.js <collected dir> <id> <url> > summary.md
const fs = require('fs'), path = require('path');
const [dir, id, url] = process.argv.slice(2);
const found = [];
const walk = d => { for (const f of fs.existsSync(d) ? fs.readdirSync(d) : []) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : f === 'result.json' && found.push(JSON.parse(fs.readFileSync(p, 'utf8'))); } };
walk(dir);
const ORDER = ['windows-edge', 'windows-chrome', 'windows-firefox', 'windows-chrome-phone', 'mac-safari', 'mac-webkit-iphone', 'ios-sim', 'android'];
found.sort((a, b) => ORDER.indexOf(a.platform) - ORDER.indexOf(b.platform));
const missing = ORDER.filter(p => !found.some(r => r.platform === p));
const summary = { id, url, platforms: found.map(r => ({ platform: r.platform, label: r.label, ok: r.results.filter(x => x.ok).length, total: r.results.length,
  failed: r.results.filter(x => !x.ok), screenshots: r.screenshots, notes: r.notes })), missing };
fs.writeFileSync('summary.json', JSON.stringify(summary, null, 1));
const lines = [`# Device lab run ${id}`, '', url, '', '| Platform | Result | Screenshots |', '|---|---|---|'];
for (const p of summary.platforms) lines.push(`| ${p.label} | ${p.failed.length ? '**' + p.failed.length + ' failed**' : 'ok'} (${p.ok}/${p.total}) | ${p.screenshots.length} |`);
for (const m of missing) lines.push(`| ${m} | **did not run** | 0 |`);
for (const p of summary.platforms) for (const f of p.failed) lines.push(`- ${p.label} · ${f.step} · ${f.name}${f.detail ? ': ' + f.detail : ''}`);
console.log(lines.join('\n'));
