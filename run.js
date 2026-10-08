// "test all devices": node run.js <url> [checks]     e.g. node run.js https://automate-and-improve.github.io/ intake
// 1. writes requests/<id>.json and pushes it (normal git login; no GitHub CLI, no API key)
// 2. GitHub runs Windows, macOS + iPhone simulator and Android in parallel (.github/workflows/devices.yml)
// 3. waits for results/<id>/ on the `results` branch, copies it to runs/<id>/ (screenshots) and prints the report
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const [url, checks = 'generic'] = process.argv.slice(2);
if (!/^https:\/\/[^\s]+$/.test(url || '')) { console.error('Usage: node run.js <public https URL> [checks name from checks/]'); process.exit(2); }
if (checks !== 'generic' && !fs.existsSync(path.join(__dirname, 'checks', checks + '.js'))) { console.error('No checks/' + checks + '.js'); process.exit(2); }
const git = (...a) => execFileSync('git', a, { cwd: __dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const id = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-');
  fs.mkdirSync(path.join(__dirname, 'requests'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'requests', id + '.json'), JSON.stringify({ id, url, checks }, null, 1) + '\n');
  git('add', 'requests/' + id + '.json');
  git('commit', '-q', '-m', 'run ' + id + ': ' + url + ' (' + checks + ')');
  git('push', '-q', 'origin', 'main');
  console.log('run ' + id + ' sent: ' + url + ' (' + checks + '). GitHub is testing (usually 10-15 min)...');
  const t0 = Date.now();
  for (;;) {
    await sleep(30000);
    try { git('fetch', '-q', 'origin', 'results'); } catch (e) { /* no results branch yet */ }
    let summary = null;
    try { summary = git('show', 'origin/results:results/' + id + '/summary.md'); } catch (e) {}
    if (summary) {
      const out = path.join(__dirname, 'runs', id);
      fs.mkdirSync(out, { recursive: true });
      const files = git('ls-tree', '-r', '--name-only', 'origin/results', 'results/' + id).trim().split('\n');
      for (const f of files) {
        const dest = path.join(out, f.replace('results/' + id + '/', ''));
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, execFileSync('git', ['show', 'origin/results:' + f], { cwd: __dirname, maxBuffer: 64 * 1024 * 1024 }));
      }
      console.log(summary + '\n\nscreenshots: ' + out);
      return;
    }
    if (Date.now() - t0 > 40 * 60000) { console.log('No result after 40 minutes: check https://github.com/automate-and-improve/device-lab/actions'); process.exit(1); }
    process.stdout.write('.');
  }
})().catch(e => { console.error('FAILED: ' + (e.stderr || e.message)); process.exit(1); });
