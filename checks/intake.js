// Intake page (https://automate-and-improve.github.io/): owner decisions a visitor can see, walked step by step.
// Each step: `act` (JavaScript run in the page, may be empty) -> wait -> screenshot -> `check` (JavaScript returning
// [{ name, ok, detail }]). Only public texts here: this repo is public.
module.exports = [
  {
    name: '1-welcome',
    act: '',
    check: `[
      { name: 'own title, not inside Google', ok: /Jan L\\./.test(document.title) && window.self === window.top, detail: document.title.slice(0, 60) },
      { name: 'start button visible', ok: !![...document.querySelectorAll('button')].find(b => /Začnimo|Let's start/.test(b.textContent) && b.offsetParent) }
    ]`,
  },
  {
    name: '2-path',
    act: `[...document.querySelectorAll('button')].find(b => /Začnimo|Let's start/.test(b.textContent)).click()`,
    check: `[
      { name: '"fix" and "idea" choices shown', ok: !!document.querySelector('[data-path="fix"]') && !!document.querySelector('[data-path="idea"]') }
    ]`,
  },
  {
    name: '3-problem',
    act: `document.querySelector('[data-path="fix"]').click()`,
    check: `(() => {
      const rec = document.getElementById('rec'), picker = document.getElementById('picker'), text = document.body.innerText;
      const withoutHint = text.replace(/Video ali dokument raje opišite[^)]*\\)?|describe a video or document[^)]*\\)?/gi, '');
      return [
        { name: 'record button shown', ok: !!(rec && rec.offsetParent), detail: rec ? rec.innerText.replace(/\\s+/g, ' ').slice(0, 80) : 'missing' },
        { name: 'photo button says photos (not files)', ok: /Dodajte fotografije|Add photos/.test(text) && !/Dodajte datoteke|Add files/.test(text) },
        { name: 'photo picker asks for photos only', ok: !!picker && picker.getAttribute('accept') === 'image/*', detail: picker ? picker.getAttribute('accept') : 'missing' },
        { name: 'no visible text offers video', ok: !/\\bvideo\\b/i.test(withoutHint) },
        { name: 'browser can record voice in the page', ok: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder), detail: typeof window.MediaRecorder }
      ];
    })()`,
  },
];
