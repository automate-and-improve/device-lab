// The checks every platform runs, as plain JavaScript evaluated INSIDE the page (works in Playwright, Safari via
// WebDriver, and Android Chrome via DevTools). Each check returns { name, ok, detail }.
// Generic checks run on every page; a project can add its own steps in checks/<project>.js (same format).
// Never put secrets, names or private URLs here: this repo is public.

// Generic: runs right after the page has loaded.
exports.generic = `(() => {
  const out = [];
  const add = (name, ok, detail) => out.push({ name, ok: !!ok, detail: detail || '' });
  add('page has a title', document.title.trim().length > 0, document.title.slice(0, 80));
  add('no sideways scrolling', document.documentElement.scrollWidth <= window.innerWidth + 1, document.documentElement.scrollWidth + ' vs ' + window.innerWidth);
  const imgs = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.src);
  add('no broken images', imgs.length === 0, imgs.map(i => i.src).slice(0, 3).join(' '));
  const small = [...document.querySelectorAll('button, a, input, [role=button]')].filter(e => {
    const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 24 && getComputedStyle(e).visibility !== 'hidden';
  });
  add('tap targets not tiny (< 24 px)', small.length <= 2, small.length + ' small: ' + small.slice(0, 3).map(e => (e.textContent || e.name || e.tagName).trim().slice(0, 20)).join(', '));
  add('readable text (not under 12 px)', ![...document.querySelectorAll('p, li, label, button, span')].some(e => e.offsetParent && e.textContent.trim() && parseFloat(getComputedStyle(e).fontSize) < 12));
  return out;
})()`;
