/*!
 * What all five pages share: the visitor tracker, the language switch, the
 * style switcher and its page transition, scroll reveals, split headlines,
 * counters, parallax, the booking widget (the Maré demo diary in the CRM),
 * "next free", the enquiry form, "open now" and the FAQ.
 * Reads window.SITE_CONFIG (build.mjs) and window.I18N (i18n.js). Each page's
 * own animation lives in /<page>.js and uses window.Motion from here.
 */
(function () {
  'use strict';
  var C = window.SITE_CONFIG || {};
  var API = String(C.api || 'https://api.autisync.com/api').replace(/\/+$/, '');
  var APP = String(C.app || 'https://app.autisync.com').replace(/\/+$/, '');
  var I = window.I18N;
  var root = document.documentElement;
  var STYLE = root.getAttribute('data-style') || 'home';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var lang = function () { return I.lang(); };
  var js = function () { return I.js[lang()]; };

  function each(sel, fn, ctx) { Array.prototype.forEach.call((ctx || document).querySelectorAll(sel), fn); }
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // Visitors, in the CRM (Visitors > Tracking gives the key). No cookies.
  if (C.trackKey) {
    var s = document.createElement('script');
    s.src = APP + '/t.js'; s.defer = true;
    s.setAttribute('data-site', C.trackKey); s.setAttribute('data-api', API);
    document.head.appendChild(s);
  }
  function track(type, label) { try { window.autisyncTrack && window.autisyncTrack(type, label); } catch (e) { /* never in the way */ } }

  // ── Motion: one rAF-throttled scroll/resize loop the pages hook into ──
  var subs = [], ticking = false;
  function tick() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset, vh = window.innerHeight;
    for (var i = 0; i < subs.length; i++) try { subs[i](y, vh); } catch (e) { /* one effect never stops the rest */ }
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  var Motion = window.Motion = {
    RM: RM, FINE: FINE, clamp: clamp,
    onScroll: function (fn) { subs.push(fn); request(); return fn; },
    /** 0 when the element's top meets the bottom of the screen, 1 when its bottom leaves the top. */
    progress: function (el, vh) {
      var r = el.getBoundingClientRect(); vh = vh || window.innerHeight;
      return clamp((vh - r.top) / (vh + r.height), 0, 1);
    },
    /** For a tall section with a sticky child: 0 at the start of the pin, 1 at its end. */
    pinned: function (el, vh) {
      var r = el.getBoundingClientRect(); vh = vh || window.innerHeight;
      var run = r.height - vh;
      return run > 0 ? clamp(-r.top / run, 0, 1) : clamp((vh - r.top) / vh, 0, 1);
    },
    /** Runs fn(t, dt) every frame while the element is on screen (never with reduced motion). */
    loop: function (el, fn) {
      if (RM) return;
      var on = false, raf = 0, last = 0, start = 0;
      var frame = function (now) {
        if (!on) return;
        if (!start) start = now;
        fn((now - start) / 1000, last ? Math.min(0.05, (now - last) / 1000) : 0.016);
        last = now; raf = requestAnimationFrame(frame);
      };
      var go = function (v) { if (v === on) return; on = v; if (on) { last = 0; raf = requestAnimationFrame(frame); } else cancelAnimationFrame(raf); };
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { go(es[0].isIntersecting && !document.hidden); }, { rootMargin: '80px' }).observe(el);
      else go(true);
      document.addEventListener('visibilitychange', function () { if (document.hidden) go(false); else request(); });
    },
    /** Calls fn once when the element first comes into view. */
    once: function (el, fn, margin) {
      if (!('IntersectionObserver' in window)) return fn();
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: margin || '0px 0px -12% 0px' });
      io.observe(el);
    },
  };

  // ── Split headlines into words (kept inside <em>, <b>, <br>) ──
  function split(el) {
    var n = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var i = document.createElement('span'); i.className = 'wi'; i.textContent = p;
            w.style.setProperty('--wi', n++);
            w.appendChild(i); frag.appendChild(w);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR' && !c.classList.contains('w')) walk(c);
      });
    })(el);
    el.setAttribute('data-split-done', '');
  }
  function splitAll() { each('[data-split]', function (el) { if (!el.querySelector('.w')) split(el); }); }

  // ── Counters ──
  function target(el) { return parseFloat((lang() === 'pt' && el.getAttribute('data-count-pt')) || el.getAttribute('data-count')); }
  function countUp(el) {
    var to = target(el), dec = +(el.getAttribute('data-decimals') || 0);
    var fmt = function (v) { return new Intl.NumberFormat(js().number, { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: el.hasAttribute('data-group') }).format(v); };
    el.setAttribute('data-counted', '');
    if (RM) { el.textContent = fmt(to); return; }
    var from = parseFloat(el.getAttribute('data-from') || 0), t0 = performance.now(), dur = +(el.getAttribute('data-dur') || 1600);
    (function step(now) {
      var k = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  function refreshCounters() {
    each('[data-count][data-counted]', function (el) {
      var dec = +(el.getAttribute('data-decimals') || 0);
      el.textContent = new Intl.NumberFormat(js().number, { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: el.hasAttribute('data-group') }).format(target(el));
    });
  }

  /** The service names the CRM uses, as each language shows them. */
  function serviceInfo(svc) {
    var n = String(svc.name || '').toLowerCase();
    var hit = I.services.filter(function (x) { return x.names.some(function (y) { return y.toLowerCase() === n; }); })[0];
    return hit && hit[lang()] ? hit[lang()] : null;
  }
  function orderOf(svc) {
    var n = String(svc.name || '').toLowerCase();
    for (var i = 0; i < I.services.length; i++) if (I.services[i].names.some(function (y) { return y.toLowerCase() === n; })) return i;
    return 99;
  }

  ready(function () {
    // ── Language ──
    each('[data-set-lang]', function (b) {
      b.addEventListener('click', function () {
        var want = b.getAttribute('data-set-lang');
        if (want === lang()) return;
        try {
          var u = new URL(location.href); u.searchParams.set('lang', want);
          history.replaceState(null, '', u.pathname + u.search + u.hash);
        } catch (e) { /* old browser */ }
        root.classList.add('lang-swap');
        setTimeout(function () {
          I.apply(want);
          root.classList.remove('lang-swap');
        }, RM ? 0 : 180);
        track('click', 'Language: ' + want);
      });
    });

    splitAll();

    // ── Arrival: the curtain from the last page lifts, then the hero plays ──
    var loaded = function () { root.classList.add('is-loaded'); };
    if (root.classList.contains('pt-enter')) {
      requestAnimationFrame(function () {
        root.classList.add('pt-lift');
        setTimeout(loaded, 260);
        setTimeout(function () { root.classList.remove('pt-enter', 'pt-lift'); }, 900);
      });
    } else requestAnimationFrame(function () { requestAnimationFrame(loaded); });
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { var c = document.querySelector('.pt-curtain'); if (c) c.remove(); root.classList.remove('pt-enter', 'pt-lift', 'pt-leaving'); }
    });

    // ── Style switcher: a sliding pill, and a curtain in the next style's colour ──
    each('[data-switcher]', function (sw) {
      var pill = sw.querySelector('.sw-pill'), links = sw.querySelectorAll('a[data-style-link]');
      var current = sw.querySelector('.sw-track a[aria-current="page"]');
      function moveTo(a) {
        if (!pill) return;
        if (!a) { pill.style.opacity = '0'; return; }
        pill.style.opacity = '1';
        pill.style.width = a.offsetWidth + 'px';
        pill.style.transform = 'translateX(' + a.offsetLeft + 'px)';
        pill.style.background = a.getAttribute('data-color');
      }
      moveTo(current);
      Array.prototype.forEach.call(links, function (a) {
        a.addEventListener('mouseenter', function () { moveTo(a); });
        a.addEventListener('focus', function () { moveTo(a); });
      });
      sw.addEventListener('mouseleave', function () { moveTo(current); });
      window.addEventListener('resize', function () { moveTo(current); });
      document.addEventListener('langchange', function () { requestAnimationFrame(function () { moveTo(current); }); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveTo(current); });
    });
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-style-link]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.getAttribute('aria-current') === 'page') { e.preventDefault(); window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); return; }
      var color = a.getAttribute('data-curtain') || a.getAttribute('data-color') || '#111', ink = a.getAttribute('data-ink') || '#fff';
      track('click', 'Style: ' + a.getAttribute('data-style-link'));
      if (RM) return;
      e.preventDefault();
      try { sessionStorage.setItem('mare-demo-trans', JSON.stringify({ color: color, at: Date.now() })); } catch (x) { /* fine */ }
      var c = document.createElement('div');
      c.className = 'pt-curtain';
      c.style.setProperty('--pt-color', color);
      c.style.setProperty('--pt-ink', ink);
      c.style.setProperty('--x', e.clientX ? e.clientX + 'px' : '50%');
      c.style.setProperty('--y', e.clientY ? e.clientY + 'px' : '100%');
      c.innerHTML = '<span>' + (a.getAttribute('data-brand') || a.textContent) + '</span>';
      document.body.appendChild(c);
      root.classList.add('pt-leaving');
      var href = a.href;
      setTimeout(function () { location.href = href; }, 640);
    });

    // ── Header: shrinks once you scroll; a menu on small screens ──
    var nav = document.querySelector('[data-nav]');
    if (nav) {
      Motion.onScroll(function (y) { nav.classList.toggle('is-scrolled', y > 40); });
      var toggle = nav.querySelector('[data-menu]');
      if (toggle) {
        var setMenu = function (on) { nav.classList.toggle('menu-open', on); toggle.setAttribute('aria-expanded', String(on)); };
        toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('menu-open')); });
        each('.nav-links a', function (a) { a.addEventListener('click', function () { setMenu(false); }); }, nav);
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
      }
    }

    // ── Reveal on scroll ──
    each('[data-stagger]', function (box) {
      Array.prototype.forEach.call(box.children, function (c, i) { c.style.setProperty('--si', i); if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', box.getAttribute('data-stagger') || ''); });
    });
    var reveals = document.querySelectorAll('[data-reveal]');
    if (RM || !('IntersectionObserver' in window)) each('[data-reveal]', function (el) { el.classList.add('is-in'); });
    else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
      // Clipped reveals (mask, wipe) are invisible to IntersectionObserver, so
      // those are checked against the scroll position instead.
      var clipped = [];
      Array.prototype.forEach.call(reveals, function (el) {
        if (/^(mask|wipe|ink)$/.test(el.getAttribute('data-reveal'))) clipped.push(el); else io.observe(el);
      });
      if (clipped.length) Motion.onScroll(function (y, vh) {
        for (var i = clipped.length - 1; i >= 0; i--) {
          var r = clipped[i].getBoundingClientRect();
          if (r.top < vh * 0.88) { clipped[i].classList.add('is-in'); clipped.splice(i, 1); }
        }
      });
    }

    // ── Counters ──
    each('[data-count]', function (el) { Motion.once(el, function () { countUp(el); }); });

    // ── Parallax: data-parallax="0.12" moves with the scroll ──
    if (!RM) {
      var px = document.querySelectorAll('[data-parallax]');
      if (px.length) Motion.onScroll(function (y, vh) {
        Array.prototype.forEach.call(px, function (el) {
          var r = el.parentElement.getBoundingClientRect();
          if (r.bottom < -100 || r.top > vh + 100) return;
          var k = parseFloat(el.getAttribute('data-parallax')) || 0.1;
          var off = (r.top + r.height / 2 - vh / 2) * -k;
          el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
        });
      });
    }

    // ── Magnetic buttons (desktop) ──
    if (FINE && !RM) each('[data-magnetic]', function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });

    // ── Photos: if one doesn't load, its gradient shows instead ──
    each('img[data-photo]', function (img) {
      var off = function () { img.classList.add('ph-off'); };
      if (img.complete && !img.naturalWidth) off();
      img.addEventListener('error', off);
      img.addEventListener('load', function () { img.classList.add('ph-on'); });
      if (img.complete && img.naturalWidth) img.classList.add('ph-on');
    });

    // ── FAQ: details that open smoothly ──
    each('details[data-faq]', function (d) {
      var sum = d.querySelector('summary'), body = d.querySelector('.faq-a');
      if (!sum || !body || RM) return;
      sum.addEventListener('click', function (e) {
        e.preventDefault();
        if (d.open) {
          var h = body.offsetHeight;
          body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 280, easing: 'cubic-bezier(.4,0,.2,1)' }).onfinish = function () { d.open = false; };
        } else {
          d.open = true;
          var h2 = body.offsetHeight;
          body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' });
          track('click', 'FAQ: ' + sum.textContent.trim().slice(0, 60));
        }
      });
    });

    // ── Booking: the Maré demo diary, whatever the style ──
    var host = document.querySelector('[data-booking]');
    if (host && window.AutisyncBooking) {
      window.AutisyncBooking.mount(host, {
        api: API, app: APP, slug: C.bookingSlug, copy: js().booking, lang: lang, order: orderOf,
        label: function (svc) { var info = serviceInfo(svc); return info ? { name: info.name, description: info.description, price: info.price } : null; },
      });
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-book]');
      if (!b || !host) return;
      var name = b.getAttribute('data-book');
      e.preventDefault();
      if (name && window.AutisyncBooking) window.AutisyncBooking.choose(name);
      host.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    });

    // ── Next free time, read from the diary ──
    var found = {};
    function showNext(el) {
      var f = found[el.getAttribute('data-next-free')];
      if (!f || !window.AutisyncBooking) return;
      var n = window.AutisyncBooking.describe(f, js().booking);
      var put = function (sel, v) { var x = el.querySelector(sel); if (x) x.textContent = v || ''; };
      put('[data-nf-day]', n.day); put('[data-nf-time]', n.time);
      put('[data-nf-staff]', n.staff ? js().withStaff(n.staff.split(' ')[0]) : '');
      el.setAttribute('data-state', 'ready');
    }
    each('[data-next-free]', function (el) {
      if (!window.AutisyncBooking) { el.hidden = true; return; }
      var key = el.getAttribute('data-next-free');
      window.AutisyncBooking.nextFree({ api: API, slug: C.bookingSlug, service: key })
        .then(function (f) { if (!f) { el.hidden = true; return; } found[key] = f; showNext(el); })
        .catch(function () { el.hidden = true; });
    });

    // ── Enquiry form: to the Maré demo website's form in the CRM, with the style ──
    var formSection = null;
    function findForm() {
      if (formSection) return Promise.resolve(formSection);
      return fetch(API + '/sites/public/render?siteSlug=' + encodeURIComponent(C.siteSlug), { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('site'); return r.json(); })
        .then(function (d) {
          var all = [];
          (d.pages || [d.page]).forEach(function (p) { (p && p.sections || []).forEach(function (x) { all.push(x); }); });
          var hit = all.filter(function (x) { return x.section_type === 'contact_form'; })[0];
          if (!hit) throw new Error('form');
          formSection = hit.id;
          return formSection;
        });
    }
    each('form[data-enquiry]', function (form) {
      var status = form.querySelector('[data-status]');
      var button = form.querySelector('button[type="submit"]');
      var say = function (msg, kind) { if (status) { status.textContent = msg; status.setAttribute('data-kind', kind || ''); } };
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (form.website && form.website.value) return; // a bot filled the hidden field
        var data = {};
        Array.prototype.forEach.call(form.elements, function (f) {
          if (!f.name || f.name === 'website' || f.type === 'submit') return;
          if (f.type === 'checkbox') { data[f.name] = f.checked ? 'yes' : 'no'; return; }
          if (f.type === 'radio' && !f.checked) return;
          data[f.name] = f.value.trim();
        });
        if (!data.fullName || data.fullName.length < 2) return say(js().needName, 'error');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email || '')) return say(js().badEmail, 'error');
        if (form.querySelector('input[type="checkbox"][required]:not(:checked)')) return say(js().needAge, 'error');
        var style = form.getAttribute('data-style-name') || STYLE;
        data.style = style;
        data.language = lang();
        data.message = '[' + style + ' demo] ' + [data.service ? 'Interested in: ' + data.service : '', data.date ? 'Date: ' + data.date : '', data.message || ''].filter(Boolean).join(' · ');
        var q = new URLSearchParams(location.search);
        button.disabled = true;
        say(js().sending);
        findForm().then(function (id) {
          return fetch(API + '/sites/public/forms/' + id + '/submit', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: data, utm: { source: q.get('utm_source') || '', medium: q.get('utm_medium') || '', campaign: q.get('utm_campaign') || '' }, tracking: { page: location.href } }),
          });
        }).then(function (r) {
          if (!r.ok) throw new Error('send');
          form.reset();
          form.setAttribute('data-sent', '');
          say(js().thanks, 'ok');
          track('convert', form.getAttribute('data-enquiry') || 'Enquiry sent');
        }).catch(function () {
          say(js().failed, 'error');
        }).then(function () { button.disabled = false; });
      });
    });

    // ── Open now / opens at (UK time: the demo account's hours) ──
    var HOURS = { 1: ['09:00', '19:00'], 2: ['09:00', '19:00'], 3: ['09:00', '19:00'], 4: ['09:00', '19:00'], 5: ['09:00', '19:00'], 6: ['09:00', '17:00'] };
    function openNow() {
      each('[data-open-now]', function (el) {
        var w = js(), parts = {};
        new Intl.DateTimeFormat('en-GB', { timeZone: w.zoneOpen, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
          .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
        var dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
        var now = (parts.hour === '24' ? '00' : parts.hour) + ':' + parts.minute;
        var today = HOURS[dow], text;
        el.removeAttribute('data-open');
        if (today && now >= today[0] && now < today[1]) { text = w.openNow(w.hhmm(today[1])); el.setAttribute('data-open', ''); }
        else for (var i = 0; i < 8; i++) {
          var d = (dow + i) % 7, h = HOURS[d];
          if (!h || (i === 0 && now >= h[0])) continue;
          text = w.opensAt(i === 0 ? w.today : i === 1 ? w.tomorrow : w.days[d], w.hhmm(h[0]));
          break;
        }
        var t = el.querySelector('[data-open-text]');
        if (t && text) t.textContent = text;
      });
    }
    openNow();

    // ── When the language changes ──
    document.addEventListener('langchange', function () {
      splitAll();
      refreshCounters();
      if (window.AutisyncBooking) window.AutisyncBooking.setCopy(js().booking);
      each('[data-next-free]', showNext);
      openNow();
      each('form[data-enquiry] [data-status]', function (x) { x.textContent = ''; });
    });

    each('[data-year]', function (el) { el.textContent = new Date().getFullYear(); });
  });
})();
