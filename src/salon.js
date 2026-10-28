/*!
 * Maré's own motion: hair flowing in a hairdryer's airflow (hero), scissors
 * that snip a clean line as you scroll (the craft), the review carousel and
 * a wave that draws itself. Everything has a still, finished state for
 * prefers-reduced-motion.
 */
(function () {
  'use strict';
  var M = window.Motion, RM = M.RM, NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  // A smooth path through points (Catmull-Rom as cubic Béziers).
  function smooth(p) {
    var d = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
    for (var i = 0; i < p.length - 1; i++) {
      var a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
      d += 'C' + (b[0] + (c[0] - a[0]) / 6).toFixed(1) + ' ' + (b[1] + (c[1] - a[1]) / 6).toFixed(1) + ' ' +
        (c[0] - (e[0] - b[0]) / 6).toFixed(1) + ' ' + (c[1] - (e[1] - b[1]) / 6).toFixed(1) + ' ' + c[0].toFixed(1) + ' ' + c[1].toFixed(1);
    }
    return d;
  }
  function rnd(seed) { var x = Math.sin(seed * 999.7) * 43758.5453; return x - Math.floor(x); }
  var ease = function (k) { return 1 - Math.pow(1 - k, 3); };

  document.addEventListener('DOMContentLoaded', function () {
    // ── Hero: flowing strands in the airflow ──
    var scene = document.querySelector('[data-hair-scene]');
    if (scene) {
      var g = scene.querySelector('[data-strands]'), air = scene.querySelector('[data-airflow]');
      var N = 30, strands = [];
      for (var i = 0; i < N; i++) {
        var copper = i % 7 === 3 || i % 11 === 5;
        strands.push({
          path: el('path', { stroke: copper ? 'url(#strand2)' : 'url(#strand)', 'stroke-width': (1 + rnd(i + 1) * 2.4).toFixed(2), opacity: (0.55 + rnd(i + 7) * 0.45).toFixed(2) }, g),
          bx: (i - N / 2) * 1.5, len: 340 + rnd(i + 3) * 130, ph: rnd(i + 11) * 6.28, amp: 14 + rnd(i + 5) * 22, sp: 1.4 + rnd(i + 9) * 0.9, curl: rnd(i + 13),
        });
      }
      var flows = [];
      for (var f = 0; f < 7; f++) flows.push({ path: el('path', { 'stroke-width': f % 2 ? 1 : 1.6, opacity: (0.25 + rnd(f + 40) * 0.45).toFixed(2), 'stroke-dasharray': (18 + f * 4) + ' ' + (26 + f * 3) }, air), y: 270 + f * 10, ph: f * 0.9, len: 300 + rnd(f + 2) * 120 });
      var gust = 0, grow = RM ? 1 : 0, started = RM, t0 = 0;
      var art = scene.closest('.hero-art');
      if (art && M.FINE && !RM) art.addEventListener('pointermove', function () { gust = Math.min(1, gust + 0.08); });

      var draw = function (t) {
        var wind = 1 + 0.18 * Math.sin(t * 0.7) + gust * 0.9;
        strands.forEach(function (s) {
          var pts = [], S = 9, L = s.len * grow;
          for (var k = 0; k <= S; k++) {
            var u = k / S;
            var push = 175 * wind * Math.pow(u, 1.35);
            var wave = s.amp * Math.pow(u, 1.25) * Math.sin(t * s.sp * 2 - u * 5.5 + s.ph) * (0.7 + 0.5 * wind);
            var lift = 120 * wind * Math.pow(u, 2) * (0.45 + s.curl * 0.8);
            pts.push([330 + s.bx * (1 + u * 3.5) + push + wave, 118 + u * L - lift + Math.cos(t * s.sp + u * 4 + s.ph) * 6 * u]);
          }
          s.path.setAttribute('d', smooth(pts));
        });
        flows.forEach(function (fl, j) {
          var pts = [], S = 8;
          for (var k = 0; k <= S; k++) {
            var u = k / S;
            pts.push([214 + u * fl.len, fl.y + (fl.y - 300) * u * 0.9 + Math.sin(t * 3 + u * 6 + fl.ph) * 8 * u]);
          }
          fl.path.setAttribute('d', smooth(pts));
          fl.path.setAttribute('stroke-dashoffset', (-t * (90 + j * 8)).toFixed(1));
        });
        gust *= 0.97;
      };
      draw(1.3);
      if (!RM) {
        var startGrow = function () { if (!started) { started = true; t0 = performance.now(); } };
        var root = document.documentElement;
        if (root.classList.contains('is-loaded')) startGrow();
        else new MutationObserver(function (m, o) { if (root.classList.contains('is-loaded')) { o.disconnect(); setTimeout(startGrow, 450); } }).observe(root, { attributes: true, attributeFilter: ['class'] });
        M.loop(scene, function (t) {
          if (started && grow < 1) grow = ease(Math.min(1, (performance.now() - t0) / 2200));
          draw(t + 1.3);
        });
      }
    }

    // ── The craft: scissors snip a clean line as you scroll ──
    var craft = document.querySelector('.craft'), snip = document.querySelector('[data-snip-scene]');
    if (craft && snip) {
      var cg = snip.querySelector('[data-cut-strands]');
      var sc = snip.querySelector('[data-scissors]'), top = snip.querySelector('[data-blade-top]'), bot = snip.querySelector('[data-blade-bottom]');
      var done = snip.querySelector('[data-cut-done]'), tag = snip.querySelector('[data-craft-tag]');
      var bar = craft.querySelector('[data-craft-bar]'), steps = craft.querySelectorAll('[data-craft-steps] li');
      var LINE = 330, cuts = [];
      for (var j = 0; j < 25; j++) {
        var x = 62 + j * 21.5 + (rnd(j + 30) - 0.5) * 8;
        var end = LINE + 70 + rnd(j + 50) * 120;
        var w = (1.4 + rnd(j + 70) * 2).toFixed(2);
        var stroke = j % 6 === 2 ? 'url(#strand2)' : 'url(#cutStrand)';
        cuts.push({
          x: x, end: end, cut: false, ph: rnd(j + 90) * 6.28,
          top: el('path', { stroke: stroke, 'stroke-width': w, class: 'top' }, cg),
          tip: el('path', { stroke: j % 6 === 2 ? '#A76D4B' : '#0E7C7B', 'stroke-width': w, class: 'tip' }, cg),
          fall: [(rnd(j + 110) - 0.5) * 80, 240 + rnd(j + 130) * 80, (rnd(j + 150) - 0.5) * 70],
        });
      }
      var sway = 0, pr = 0;
      var place = function () {
        cuts.forEach(function (c, k) {
          var off = Math.sin(sway * 1.6 + c.ph) * 5;
          var mid = c.x + off * 0.5;
          c.top.setAttribute('d', 'M' + c.x + ' 42C' + c.x + ' 140 ' + (mid + off * 0.3) + ' 240 ' + (c.x + off) + ' ' + LINE);
          c.tip.setAttribute('d', 'M' + (c.x + off) + ' ' + LINE + 'C' + (c.x + off * 1.2) + ' ' + (LINE + 40) + ' ' + (c.x + off * 1.6) + ' ' + (c.end - 30) + ' ' + (c.x + off * 2) + ' ' + c.end);
        });
      };
      var setCut = function (c, on) {
        if (c.cut === on) return;
        c.cut = on;
        c.tip.classList.toggle('is-cut', on);
        c.tip.style.transform = on ? 'translate(' + c.fall[0] + 'px,' + c.fall[1] + 'px) rotate(' + c.fall[2] + 'deg)' : '';
      };
      cuts.forEach(function (c) { c.tip.style.transformBox = 'fill-box'; c.tip.style.transformOrigin = '50% 0'; });
      var update = function (p) {
        pr = p;
        var k = M.clamp((p - 0.1) / 0.78, 0, 1);
        var sx = -60 + k * 640;
        var open = RM ? 0.6 : (Math.sin(k * Math.PI * 22) + 1) / 2;
        sc.setAttribute('transform', 'translate(' + sx.toFixed(1) + ' ' + LINE + ')');
        top.setAttribute('transform', 'rotate(' + (-open * 17).toFixed(2) + ')');
        bot.setAttribute('transform', 'rotate(' + (open * 17).toFixed(2) + ')');
        var tipX = sx + 110;
        var n = 0;
        cuts.forEach(function (c) { var on = c.x < tipX && k > 0; setCut(c, on); if (on) n++; });
        done.style.strokeDashoffset = (580 - 580 * M.clamp((tipX - 30) / 580, 0, 1)).toFixed(1);
        if (tag) tag.classList.toggle('is-on', p > 0.86);
        if (bar) bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
        var st = p < 0.36 ? 0 : p < 0.7 ? 1 : 2;
        Array.prototype.forEach.call(steps, function (li, i) { li.classList.toggle('is-on', RM || i === st); });
      };
      place();
      if (RM) update(1);
      else {
        M.onScroll(function (y, vh) { update(M.pinned(craft, vh)); });
        M.loop(snip, function (t) { sway = t; place(); });
      }
    }

    // ── Reviews: one at a time, moving on by itself ──
    var stage = document.querySelector('[data-quotes]');
    if (stage) {
      var quotes = stage.querySelectorAll('.quote'), dots = stage.querySelectorAll('.quote-nav button'), idx = 0, timer = 0, DUR = 7000;
      var section = stage.closest('.reviews');
      var show = function (n) {
        idx = (n + quotes.length) % quotes.length;
        Array.prototype.forEach.call(quotes, function (q, i) { q.classList.toggle('is-on', i === idx); });
        Array.prototype.forEach.call(dots, function (d, i) { d.setAttribute('aria-pressed', String(i === idx)); });
      };
      var paused = RM, visible = false;
      var schedule = function () { clearTimeout(timer); if (!paused && visible) timer = setTimeout(function () { show(idx + 1); schedule(); }, DUR); };
      Array.prototype.forEach.call(dots, function (d, i) { d.addEventListener('click', function () { show(i); schedule(); }); });
      stage.addEventListener('mouseenter', function () { paused = true; section.classList.add('paused'); clearTimeout(timer); });
      stage.addEventListener('mouseleave', function () { if (RM) return; paused = false; section.classList.remove('paused'); show(idx); schedule(); });
      if (RM) section.classList.add('paused');
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) { show(idx); schedule(); } else clearTimeout(timer); }, { threshold: 0.3 }).observe(stage);
    }

    // ── A wave that draws as you scroll past the enquiry ──
    var wave = document.querySelector('[data-enq-art]');
    if (wave) {
      var paths = wave.querySelectorAll('path');
      Array.prototype.forEach.call(paths, function (p) { var l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = RM ? 0 : l; p.dataset.len = l; });
      var best = 0;
      if (!RM) M.onScroll(function (y, vh) {
        var k = best = Math.max(best, M.clamp(M.progress(wave, vh) * 1.8, 0, 1));
        Array.prototype.forEach.call(paths, function (p, i) { p.style.strokeDashoffset = (p.dataset.len * (1 - M.clamp(k * 1.2 - i * 0.1, 0, 1))).toFixed(1); });
      });
    }
  });
})();
