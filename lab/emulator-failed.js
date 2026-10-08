// The Android emulator didn't boot: write a failed result for every target, with the key lines of the setup and
// emulator logs, so the report says why (instead of "did not run").
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const rd = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split(/[\r\n]+/).filter(l => /^\d\d:\d\d|ERROR|kvm|KVM|phones/.test(l)).slice(-10).join(' / ') : '';
const log = [rd('out/_android/setup.log'), rd('out/_android/emulator.log')].filter(Boolean).join(' / ') || 'no log';
const { targets } = JSON.parse(execFileSync('node', [path.join(__dirname, 'targets.js')], { encoding: 'utf8' }));
for (const t of targets) {
  const dir = path.join('out', t.slug, 'android'); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify({ platform: 'android', url: t.url, label: 'Android emulator (Chrome)',
    results: [{ step: 'start', name: 'emulator booted', ok: false, detail: log.slice(0, 600) }], screenshots: [], notes: [] }));
}
