// Copies src/ to dist/, writes the photo URLs into the pages and writes
// dist/config.js from the environment, so the site needs no framework and no
// install step on Vercel.
//
//   TRACK_KEY     the website's key from the CRM (Visitors > Tracking), starts
//                 as_. Public (it sits in the page). Empty by default: no
//                 visitor key yet, so visits are not counted until it is set.
//   CRM_API_URL   defaults to https://api.autisync.com/api
//   CRM_APP_URL   defaults to https://app.autisync.com (t.js, full booking page)
//   BOOKING_SLUG  the CRM calendar, default mare-demo
//   SITE_SLUG     the CRM website whose enquiry form is used, default mare-demo
//
// Five pages: / (pick a style), /salon, /barber, /nails, /tattoo. All four
// styles book into the one demo diary, Maré Hair & Beauty (Demo).
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const DEFAULT_TRACK_KEY = '';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('src', 'dist', { recursive: true });

// The demo chrome every page shares: the demo bar and the style switcher.
const STYLES = [
  { key: 'salon', href: '/salon', label: 'Salon', i18n: 'c.swSalon', color: '#0E7C7B', curtain: '#0E7C7B', ink: '#F4FBFA', dot: '#7FD9D6', brand: 'Maré Hair &amp; Beauty' },
  { key: 'barber', href: '/barber', label: 'Barber', i18n: 'c.swBarber', color: '#C33B2C', curtain: '#C33B2C', ink: '#F3EBDD', dot: '#F0675A', brand: 'Cotton &amp; Steel Barber Co.' },
  { key: 'nails', href: '/nails', label: 'Nails', i18n: 'c.swNails', color: '#E0457B', curtain: '#F7C9D6', ink: '#3B1235', dot: '#FF8FB4', brand: 'Gloss Club' },
  { key: 'tattoo', href: '/tattoo', label: 'Tattoo', i18n: 'c.swTattoo', color: '#8F2E26', curtain: '#0E0D0C', ink: '#E8E0CF', dot: '#E8E0CF', brand: 'Hollow Moon Tattoo' },
];
const demoBar = `<div class="demo-bar" role="note"><p><span data-i18n="c.demoText">Demo website by Autisync for a made-up business — bookings and enquiries go into its demo CRM account.</span> <a href="https://www.autisync.com/book" data-i18n="c.demoCta" data-i18n-attr="href=c.demoHref">Get a site like this →</a></p></div>`;
const switcher = (here) => `<nav class="switcher" data-switcher aria-label="Switch style" data-i18n-attr="aria-label=c.swNav">
    <a class="sw-home" href="/" data-keep-lang="/" data-style-link="home" data-color="#2A2A30" data-curtain="#0D0D0F" data-ink="#FFFFFF" data-brand="Salon · Barber · Nails · Tattoo" aria-label="All four styles" data-i18n-attr="aria-label=c.swAllLabel"${here === 'home' ? ' aria-current="page"' : ''}><svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><rect x="2" y="2" width="7" height="7" rx="2"/><rect x="11" y="2" width="7" height="7" rx="2"/><rect x="2" y="11" width="7" height="7" rx="2"/><rect x="11" y="11" width="7" height="7" rx="2"/></svg></a>
    <span class="sw-label" data-i18n="${here === 'home' ? 'c.swPick' : 'c.swLabel'}">${here === 'home' ? 'Jump to' : 'See this as'}</span>
    <div class="sw-track"><span class="sw-pill" aria-hidden="true"></span>${STYLES.map((s) => `
      <a href="${s.href}" data-keep-lang="${s.href}" data-style-link="${s.key}" data-color="${s.color}" data-curtain="${s.curtain}" data-ink="${s.ink}" data-brand="${s.brand}"${s.key === here ? ' aria-current="page"' : ''}><span class="sw-dot" style="--dot:${s.dot}" aria-hidden="true"></span><span data-i18n="${s.i18n}">${s.label}</span></a>`).join('')}
    </div>
  </nav>`;
// Before the first paint: the language (?lang=, then this device, then the
// browser) and, when we arrive from another style, the curtain still down.
const boot = `<script>
  (function () {
    var d = document.documentElement, q = new URLSearchParams(location.search), saved = null;
    d.classList.add('js');
    try { saved = localStorage.getItem('mare-demo-lang'); } catch (e) { /* private mode */ }
    var want = (q.get('lang') || '').toLowerCase();
    var lang = want === 'pt' || want === 'en' ? want : saved === 'pt' || saved === 'en' ? saved : /^pt\\b/i.test(navigator.language || '') ? 'pt' : 'en';
    d.setAttribute('data-lang', lang);
    d.lang = lang === 'pt' ? 'pt-PT' : 'en-GB';
    var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      var t = JSON.parse(sessionStorage.getItem('mare-demo-trans') || 'null');
      sessionStorage.removeItem('mare-demo-trans');
      if (t && Date.now() - t.at < 5000 && !rm) { d.classList.add('pt-enter'); d.style.setProperty('--pt-color', t.color); }
    } catch (e) { /* fine */ }
    // If a script fails, never leave the page hidden.
    setTimeout(function () { d.classList.add('is-loaded'); d.classList.remove('pt-enter'); }, 3000);
  })();
  </script>`;
const tail = (page) => `<script src="/${page}.pt.js"></script>
  <script>window.I18N && window.I18N.apply(document.documentElement.getAttribute('data-lang'));</script>
  ${page === 'home' ? '' : '<script src="/booking.js" defer></script>\n  '}<script src="/core.js" defer></script>
  <script src="/${page}.js" defer></script>`;

// Photos: <img data-photo="key" [data-w="1600"]> gets its src from src/photos.js.
const box = { window: {} };
vm.runInNewContext(readFileSync('src/photos.js', 'utf8'), box);
const PHOTOS = box.window.PHOTOS;
const url = (id, w) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
let missing = 0;
for (const f of readdirSync('dist').filter((n) => n.endsWith('.html'))) {
  const html = readFileSync(`dist/${f}`, 'utf8')
    .replace('<!--@demo-bar-->', demoBar)
    .replace('<!--@boot-->', boot)
    .replace(/<!--@switcher:(\w+)-->/, (all, here) => switcher(here))
    .replace(/<!--@tail:(\w+)-->/, (all, page) => tail(page))
    .replace(/<img\b([^>]*?)\bdata-photo="([^"]+)"([^>]*)>/g, (all, a, key, b) => {
    const p = PHOTOS[key];
    if (!p) { missing++; console.warn(`  ${f}: no photo "${key}" in photos.js`); return all; }
    const w = (/data-w="(\d+)"/.exec(a + b) || [])[1] || 1200;
    return `<img${a}data-photo="${key}" src="${url(p.id, w)}"${b}>`;
  });
  writeFileSync(`dist/${f}`, html);
}

const config = {
  site: 'salons',
  api: (process.env.CRM_API_URL || 'https://api.autisync.com/api').replace(/\/+$/, ''),
  app: (process.env.CRM_APP_URL || 'https://app.autisync.com').replace(/\/+$/, ''),
  bookingSlug: process.env.BOOKING_SLUG || 'mare-demo',
  siteSlug: process.env.SITE_SLUG || process.env.BOOKING_SLUG || 'mare-demo',
  trackKey: process.env.TRACK_KEY ?? DEFAULT_TRACK_KEY,
};
writeFileSync('dist/config.js', `window.SITE_CONFIG = ${JSON.stringify(config)};\n`);
console.log(`Built salons against ${config.api} (calendar ${config.bookingSlug})${config.trackKey ? ', visitors tracked' : ', no TRACK_KEY: visits are not counted'}${missing ? `, ${missing} missing photo(s)` : ''}`);
