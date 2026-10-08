// Runs the given platforms for every target of this run: node lab/run-all.js <platform> [<platform> ...]
// Results: out/<target slug>/<platform>/ (result.json + screenshots).
const { execFileSync } = require('child_process');
const path = require('path');
const { targets } = JSON.parse(execFileSync('node', [path.join(__dirname, 'targets.js')], { encoding: 'utf8' }));
for (const t of targets) for (const p of process.argv.slice(2)) {
  try { execFileSync('node', [path.join(__dirname, 'run-platform.js'), p, t.url, t.checks, path.join('out', t.slug)], { stdio: 'inherit', timeout: 15 * 60000 }); }
  catch (e) { console.log(p + ' on ' + t.slug + ': runner stopped (' + String(e.message).slice(0, 120) + ')'); }
}
