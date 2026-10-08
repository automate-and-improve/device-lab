// Combines all results (collected/<artifact>/<target>/<platform>/result.json) into summary.json + a markdown report.
// Run (in the workflow): node lab/summarize.js <collected dir> <id> > summary.md
// summary.json "failed" = number of failed checks + platforms that did not run (a nightly run fails on > 0 -> GitHub emails).
const fs = require('fs'), path = require('path');
const [dir, id] = process.argv.slice(2);
const ORDER = ['windows-edge', 'windows-chrome', 'windows-firefox', 'windows-chrome-phone', 'mac-safari', 'mac-webkit-iphone', 'ios-sim', 'android'];
const found = [];
const walk = d => { for (const f of fs.existsSync(d) ? fs.readdirSync(d) : []) { const p = path.join(d, f);
  if (fs.statSync(p).isDirectory()) walk(p); else if (f === 'result.json') found.push({ target: path.basename(path.dirname(path.dirname(p))), ...JSON.parse(fs.readFileSync(p, 'utf8')) }); } };
walk(dir);
const targets = [...new Set(found.map(r => r.target))];
const summary = { id, targets: [], failed: 0 };
const lines = [`# Device lab run ${id}`];
for (const t of targets) {
  const rs = found.filter(r => r.target === t).sort((a, b) => ORDER.indexOf(a.platform) - ORDER.indexOf(b.platform));
  const missing = ORDER.filter(p => !rs.some(r => r.platform === p));
  const plats = rs.map(r => ({ platform: r.platform, label: r.label, ok: r.results.filter(x => x.ok).length, total: r.results.length,
    failed: r.results.filter(x => !x.ok), screenshots: r.screenshots, notes: r.notes || [] }));
  summary.targets.push({ target: t, url: (rs[0] || {}).url, platforms: plats, missing });
  summary.failed += plats.reduce((n, p) => n + p.failed.length, 0) + missing.length;
  lines.push('', `## ${t} - ${(rs[0] || {}).url || ''}`, '', '| Platform | Result | Screenshots |', '|---|---|---|');
  for (const p of plats) lines.push(`| ${p.label} | ${p.failed.length ? '**' + p.failed.length + ' failed**' : 'ok'} (${p.ok}/${p.total}) | ${p.screenshots.length} |`);
  for (const m of missing) lines.push(`| ${m} | **did not run** | 0 |`);
  for (const p of plats) for (const f of p.failed) lines.push(`- ${p.label} · ${f.step} · ${f.name}${f.detail ? ': ' + f.detail : ''}`);
  for (const p of plats) for (const n of p.notes) lines.push(`- note (${p.label}): ${n}`);
}
if (!targets.length) { lines.push('', '**No platform produced results.**'); summary.failed = 1; }
fs.writeFileSync('summary.json', JSON.stringify(summary, null, 1));
console.log(lines.join('\n'));
