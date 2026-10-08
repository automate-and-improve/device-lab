// What this workflow run tests. Prints JSON { id, nightly, targets: [{ slug, url, checks }] }.
// - nightly (scheduled) run: every site in nightly.json
// - normal run: the newest run request in requests/ (pushed by run.js)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'page';
let out;
if (process.env.GITHUB_EVENT_NAME === 'schedule' || process.env.LAB_MODE === 'nightly') {
  const list = JSON.parse(fs.readFileSync(path.join(root, 'nightly.json'), 'utf8'));
  out = { id: 'nightly-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''), nightly: true,
    targets: list.map(t => ({ slug: slug(t.name), url: t.url, checks: t.checks || 'generic' })) };
} else {
  const f = fs.readdirSync(path.join(root, 'requests')).filter(x => x.endsWith('.json')).sort().pop();
  const r = JSON.parse(fs.readFileSync(path.join(root, 'requests', f), 'utf8'));
  out = { id: r.id, nightly: false, targets: [{ slug: slug(r.checks !== 'generic' ? r.checks : new URL(r.url).hostname), url: r.url, checks: r.checks || 'generic' }] };
}
for (const t of out.targets) if (!/^https:\/\//.test(t.url)) throw new Error('only public https URLs: ' + t.url);
console.log(JSON.stringify(out));
