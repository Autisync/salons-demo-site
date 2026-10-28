/*!
 * Gloss Club's own motion: a hand whose nails are painted one by one, in
 * brush strokes, with the colours cycling (and a palette that recolours
 * it); one nail built layer by layer as you scroll (the ritual); tilting
 * menu cards. Reduced motion: the hand is shown painted, the nail finished.
 */
(function () {
  'use strict';
  var M = window.Motion, RM = M.RM, NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  var ease = function (k) { return 1 - Math.pow(1 - k, 3); };
  var inOut = function (k) { return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; };
  var D2R = Math.PI / 180;
  function nailPath(nw, y0, y1, nh) {
    return 'M' + (-nw / 2) + ' ' + (y0 - 4) + 'C' + (-nw / 2) + ' ' + (y0 + 4) + ' ' + (nw / 2) + ' ' + (y0 + 4) + ' ' + (nw / 2) + ' ' + (y0 - 4) +
      'L' + (nw / 2) + ' ' + (y1 + nh * .42) + 'C' + (nw / 2) + ' ' + (y1 + nh * .12) + ' ' + (nw * .2) + ' ' + y1 + ' 0 ' + y1 +
      'C' + (-nw * .2) + ' ' + y1 + ' ' + (-nw / 2) + ' ' + (y1 + nh * .12) + ' ' + (-nw / 2) + ' ' + (y1 + nh * .42) + 'Z';
  }

  document.addEventListener('DOMContentLoaded', function () {
    // ── The hand ──
    var hand = document.querySelector('[data-hand]');
    if (hand) {
      var rootG = hand.querySelector('[data-hand-root]'), brush = hand.querySelector('[data-brush]'), tip = hand.querySelector('[data-brush-tip]');
      var defs = hand.querySelector('defs');
      var SKIN = '#EDC1A6';
      var FINGERS = [
        { x: 212, y: 338, a: -8, L: 182, w: 43 },  // index
        { x: 257, y: 326, a: -1, L: 200, w: 45 },  // middle
        { x: 301, y: 334, a: 6, L: 184, w: 43 },   // ring
        { x: 341, y: 358, a: 14, L: 146, w: 37 },  // little
        { x: 186, y: 440, a: -46, L: 134, w: 48 }, // thumb
      ];
      var skinG = el('g', {}, rootG);
      var nails = [];
      FINGERS.forEach(function (f, i) {
        var g = el('g', { transform: 'translate(' + f.x + ' ' + f.y + ') rotate(' + f.a + ')' }, skinG);
        el('rect', { x: -f.w / 2, y: -f.L, width: f.w, height: f.L + 40, rx: f.w / 2, fill: SKIN }, g);
        el('path', { d: 'M' + (-f.w * .28) + ' ' + (-f.L * .48) + 'q' + (f.w * .28) + ' -7 ' + (f.w * .56) + ' 0', fill: 'none', stroke: '#9C5A45', 'stroke-opacity': .35, 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g);
        el('path', { d: 'M' + (-f.w * .22) + ' ' + (-f.L * .16) + 'q' + (f.w * .22) + ' -5 ' + (f.w * .44) + ' 0', fill: 'none', stroke: '#9C5A45', 'stroke-opacity': .25, 'stroke-width': 1.4, 'stroke-linecap': 'round' }, g);
        var nw = f.w * .7, nh = nw * 1.45, y0 = -f.L + nh * .78, y1 = y0 - nh;
        var d = nailPath(nw, y0, y1, nh);
        var cp = el('clipPath', { id: 'nail' + i }, defs); el('path', { d: d }, cp);
        el('path', { d: d, fill: '#F7D3CB', stroke: '#B97462', 'stroke-opacity': .35, 'stroke-width': 1.2 }, g);
        var base = el('path', { d: d, fill: 'none' }, g);
        var cg = el('g', { 'clip-path': 'url(#nail' + i + ')' }, g);
        var H = y0 - y1 + 12;
        var cols = [[-nw * .2, nw * .4], [-nw / 2 - 2, nw * .38], [nw * .12, nw * .4 + 2]].map(function (c) { return el('rect', { x: c[0], y: y0 + 6, width: c[1], height: 0 }, cg); });
        el('path', { d: 'M' + (-nw * .22) + ' ' + (y0 - 8) + 'L' + (-nw * .22) + ' ' + (y1 + nh * .3), stroke: '#fff', 'stroke-opacity': .55, 'stroke-width': nw * .1, 'stroke-linecap': 'round' }, g);
        nails.push({ f: f, base: base, cols: cols, y0: y0, y1: y1, H: H, nw: nw, color: null });
      });
      // The back of the hand over the bases of the fingers.
      el('path', { d: 'M186 322C212 304 324 306 364 340C380 384 374 444 348 486L340 600H212L206 510C178 482 160 450 160 408C160 372 170 342 186 322Z', fill: SKIN }, skinG);
      el('path', { d: 'M186 322C212 304 324 306 364 340C380 384 374 444 348 486L340 600H212L206 510C178 482 160 450 160 408C160 372 170 342 186 322Z', fill: 'url(#skinShade)', opacity: .55 }, skinG);
      [[220, 352], [262, 342], [304, 350], [340, 370]].forEach(function (k) { el('path', { d: 'M' + (k[0] - 10) + ' ' + k[1] + 'q10 -6 20 0', fill: 'none', stroke: '#9C5A45', 'stroke-opacity': .3, 'stroke-width': 1.6, 'stroke-linecap': 'round' }, skinG); });
      el('path', { d: 'M214 600c0-30 6-60 8-80M334 600c0-26-4-50-8-70', fill: 'none', stroke: '#9C5A45', 'stroke-opacity': .18, 'stroke-width': 2 }, skinG);
      // A bracelet, for a bit of luxury.
      el('path', { d: 'M210 550c36 13 100 13 134 0', fill: 'none', stroke: '#C9A45C', 'stroke-width': 7, 'stroke-linecap': 'round' }, skinG);
      el('circle', { cx: 277, cy: 560, r: 7, fill: '#F6E3A8', stroke: '#8E6A2A', 'stroke-width': 1.5 }, skinG);

      // Where a point on a finger is, in the scene.
      var at = function (f, lx, ly) { var c = Math.cos(f.a * D2R), s = Math.sin(f.a * D2R); return [f.x + lx * c - ly * s, f.y + lx * s + ly * c]; };
      var setStroke = function (n, j, k) { var h = n.H * Math.max(0, Math.min(1, k)); n.cols[j].setAttribute('y', (n.y0 + 6 - h).toFixed(1)); n.cols[j].setAttribute('height', h.toFixed(1)); };
      var setNail = function (n, color) { n.color = color; n.base.setAttribute('fill', color || 'none'); n.cols.forEach(function (r, j) { setStroke(n, j, 0); }); };
      var paintCols = function (color) { nails.forEach(function (n) { n.cols.forEach(function (r) { r.setAttribute('fill', color); }); }); };
      var placeBrush = function (x, y, rot) { brush.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')'); };
      var REST = [440, 250, 28];

      // Sparkles around the hand.
      var sp = hand.querySelector('[data-sparkles]');
      [[90, 150, 1], [430, 120, .8], [470, 330, .6], [70, 330, .7], [140, 70, .5], [400, 470, .9], [60, 500, .6], [470, 560, .5], [250, 40, .7]].forEach(function (s, i) {
        var p = el('path', { d: 'M0 -12L3 -3 12 0 3 3 0 12 -3 3 -12 0 -3 -3Z', transform: 'translate(' + s[0] + ' ' + s[1] + ') scale(' + s[2] + ')' }, sp);
        p.style.setProperty('--dl', (-i * .37).toFixed(2) + 's'); p.style.setProperty('--t', (2 + (i % 4) * .4) + 's');
      });
      var burst = function (n) {
        if (RM) return;
        var c = at(n.f, 0, n.y1), g = el('g', { class: 'burst' }, hand);
        for (var i = 0; i < 6; i++) {
          var a = i / 6 * Math.PI * 2, p = el('path', { d: 'M0 -5L1.4 -1.4 5 0 1.4 1.4 0 5 -1.4 1.4 -5 0 -1.4 -1.4Z', transform: 'translate(' + c[0].toFixed(1) + ' ' + c[1].toFixed(1) + ')' }, g);
          p.style.setProperty('--bx', (Math.cos(a) * 18).toFixed(1) + 'px'); p.style.setProperty('--by', (Math.sin(a) * 18).toFixed(1) + 'px');
        }
        setTimeout(function () { g.remove(); }, 1000);
      };

      // Shades, and the picker.
      var sw = document.querySelector('[data-swatches]'), nameEl = document.querySelector('[data-shade-name]');
      var buttons = sw ? Array.prototype.slice.call(sw.querySelectorAll('button')) : [];
      var SHADES = buttons.map(function (b) { return { c: b.getAttribute('data-shade'), n: b.getAttribute('data-name'), b: b }; });
      var shadeIdx = 0;
      var showShade = function (i) {
        shadeIdx = i;
        buttons.forEach(function (b, j) { b.setAttribute('aria-pressed', String(j === i)); });
        if (nameEl) nameEl.textContent = SHADES[i].n;
      };

      var job = null, nextAt = 0, holdUntil = 0, ORDER = [0, 1, 2, 3, 4];
      var MOVE = .42, STROKE = .3;
      var start = function (i, speed) {
        showShade(i);
        var c = SHADES[i].c;
        // Whatever was half-done is finished in its own colour first.
        if (job) nails.forEach(function (n) { if (n.color !== job.color) setNail(n, job.color); });
        paintCols(c);
        tip.setAttribute('fill', c.indexOf('url') === 0 ? (c.indexOf('gold') > 0 ? '#C9A45C' : '#B9A2E8') : c);
        job = { color: c, speed: speed, t0: performance.now(), from: null, done: [] };
      };

      if (RM) {
        brush.style.display = 'none';
        nails.forEach(function (n) { setNail(n, SHADES[0].c); });
        buttons.forEach(function (b, i) { b.addEventListener('click', function () { showShade(i); nails.forEach(function (n) { setNail(n, SHADES[i].c); }); }); });
      } else {
        placeBrush(REST[0], REST[1], REST[2]);
        buttons.forEach(function (b, i) {
          b.addEventListener('click', function () { start(i, 2.2); holdUntil = performance.now() + 9000; });
        });
        var began = false, rootEl = document.documentElement;
        var begin = function () { if (!began) { began = true; start(0, 1); } };
        if (rootEl.classList.contains('is-loaded')) setTimeout(begin, 1200);
        else new MutationObserver(function (m, o) { if (rootEl.classList.contains('is-loaded')) { o.disconnect(); setTimeout(begin, 1500); } }).observe(rootEl, { attributes: true, attributeFilter: ['class'] });

        M.loop(hand, function () {
          var now = performance.now();
          if (!job) {
            if (began && nextAt && now > nextAt && now > holdUntil) { nextAt = 0; start((shadeIdx + 1) % SHADES.length, 1); }
            return;
          }
          var D = (MOVE + 3 * STROKE) / job.speed, e = (now - job.t0) / 1000;
          var idx = Math.floor(e / D), local = e - idx * D;
          for (var q = 0; q < Math.min(idx, 5); q++) {
            var dn = nails[ORDER[q]];
            if (job.done.indexOf(q) < 0) { job.done.push(q); dn.cols.forEach(function (r, j) { setStroke(dn, j, 1); }); burst(dn); }
          }
          if (idx >= 5) {
            // The set is done: the colour becomes the nail, the brush goes back.
            var k = Math.min(1, (e - 5 * D) / .6);
            if (!job.committed) { job.committed = true; nails.forEach(function (n) { setNail(n, job.color); }); job.last = job.last || [REST[0], REST[1], REST[2]]; }
            var l = job.last;
            placeBrush(l[0] + (REST[0] - l[0]) * inOut(k), l[1] + (REST[1] - l[1]) * inOut(k) - Math.sin(k * Math.PI) * 30, l[2] + (REST[2] - l[2]) * inOut(k));
            if (k >= 1) { job = null; nextAt = now + 1600; }
            return;
          }
          var n = nails[ORDER[idx]], f = n.f;
          var mv = MOVE / job.speed, st = STROKE / job.speed;
          var x, y, r;
          var rot = f.a + 18;
          if (local < mv) {
            var from = job.from || [REST[0], REST[1], REST[2]];
            var to = at(f, -n.nw * .04, n.y0 - 2);
            var m = inOut(local / mv);
            x = from[0] + (to[0] - from[0]) * m; y = from[1] + (to[1] - from[1]) * m - Math.sin(m * Math.PI) * 40; r = from[2] + (rot - from[2]) * m;
          } else {
            var s = (local - mv) / st, j = Math.min(2, Math.floor(s)), kk = Math.min(1, s - j);
            for (var z = 0; z < 3; z++) setStroke(n, z, z < j ? 1 : z === j ? ease(kk) : 0);
            var lx = [0, -n.nw * .3, n.nw * .3][j];
            var p = at(f, lx, n.y0 - (n.y0 - n.y1) * ease(kk));
            x = p[0]; y = p[1]; r = rot + Math.sin(kk * Math.PI) * 4;
            job.from = [x, y, r]; job.last = [x, y, r];
          }
          placeBrush(x, y, r);
        });
      }
    }

    // ── The ritual: one nail, built up as you scroll ──
    var ritual = document.querySelector('.ritual'), macro = document.querySelector('[data-macro]');
    if (ritual && macro) {
      var q = function (s) { return macro.querySelector(s); };
      var clip = q('[data-macro-clip]'), bed = q('[data-macro-bed]'), cut = q('[data-macro-cuticle]'), outline = q('[data-macro-outline]');
      var mBase = q('[data-macro-base]'), c1 = q('[data-macro-c1]'), c2 = q('[data-macro-c2]'), c3 = q('[data-macro-c3]'), shine = q('[data-macro-shine]');
      var lamp = q('[data-lamp]'), file = q('[data-file]'), sparks = q('[data-macro-sparks]'), drop = q('[data-drop]');
      var steps = ritual.querySelectorAll('[data-steps] li'), ring = ritual.querySelector('[data-ring]'), num = ritual.querySelector('[data-step-num]');
      var X = 210, L = 132, R = 288, Y0 = 280, Y1 = 46;
      var shape = function (s) {
        var nh = Y0 - Y1, yr = Y1 + 22 + s * nh * .4, cy = Y1 + 4 + s * nh * .13, cx = (1 - s) * 62 + s * 24, ap = Y1 - s * 6;
        return 'M' + L + ' ' + (Y0 - 10) + 'C' + L + ' ' + (Y0 + 14) + ' ' + R + ' ' + (Y0 + 14) + ' ' + R + ' ' + (Y0 - 10) +
          'L' + R + ' ' + yr.toFixed(1) + 'C' + R + ' ' + cy.toFixed(1) + ' ' + (X + cx).toFixed(1) + ' ' + ap.toFixed(1) + ' ' + X + ' ' + ap.toFixed(1) +
          'C' + (X - cx).toFixed(1) + ' ' + ap.toFixed(1) + ' ' + L + ' ' + cy.toFixed(1) + ' ' + L + ' ' + yr.toFixed(1) + 'Z';
      };
      cut.setAttribute('d', 'M' + (L - 6) + ' ' + (Y0 + 2) + 'C' + (L + 10) + ' ' + (Y0 + 30) + ' ' + (R - 10) + ' ' + (Y0 + 30) + ' ' + (R + 6) + ' ' + (Y0 + 2));
      var cutLen = cut.getTotalLength();
      cut.style.strokeDasharray = cutLen;
      var H = Y0 - Y1 + 30;
      var grow = function (r, k) { var h = H * Math.max(0, Math.min(1, k)); r.setAttribute('y', (Y0 + 14 - h).toFixed(1)); r.setAttribute('height', h.toFixed(1)); };
      var seg = function (p, i) { return M.clamp(p * 6 - i, 0, 1); };
      var lastStep = -1;
      var draw = function (p) {
        var s0 = seg(p, 0), s1 = seg(p, 1), s2 = seg(p, 2), s3 = seg(p, 3), s4 = seg(p, 4), s5 = seg(p, 5);
        var d = shape(ease(s1));
        clip.setAttribute('d', d); bed.setAttribute('d', d); outline.setAttribute('d', d);
        var oLen = 760;
        outline.style.strokeDasharray = oLen; outline.style.strokeDashoffset = (oLen * (1 - ease(s0))).toFixed(1);
        outline.style.opacity = s3 > .9 ? 1 - (s3 - .9) * 10 : 1;
        cut.style.strokeDashoffset = (cutLen * (1 - ease(Math.min(1, s0 * 1.4)))).toFixed(1);
        // The file, while shaping.
        file.style.opacity = s1 > 0 && s1 < 1 ? Math.min(1, Math.min(s1, 1 - s1) * 8) : 0;
        file.setAttribute('transform', 'translate(' + (X + Math.sin(s1 * Math.PI * 7) * 40).toFixed(1) + ' ' + (Y1 - 22) + ') rotate(90)');
        mBase.setAttribute('opacity', (.7 * ease(s2)).toFixed(2));
        grow(c1, ease(Math.min(1, s3 * 3))); grow(c2, ease(M.clamp(s3 * 3 - 1, 0, 1))); grow(c3, ease(M.clamp(s3 * 3 - 2, 0, 1)));
        lamp.setAttribute('opacity', (Math.sin(s4 * Math.PI) * (.75 + .25 * Math.sin(s4 * Math.PI * 8))).toFixed(2));
        shine.setAttribute('opacity', (s5 > 0 ? .9 : 0));
        shine.setAttribute('x', (60 + s5 * 260).toFixed(1));
        sparks.classList.toggle('is-on', s5 > .5);
        drop.setAttribute('opacity', s5 > .1 && s5 < .95 ? 1 : 0);
        drop.setAttribute('transform', 'translate(0 ' + (ease(M.clamp((s5 - .1) * 2, 0, 1)) * 240).toFixed(1) + ')');
        var step = Math.min(5, Math.floor(p * 6));
        if (step !== lastStep) {
          lastStep = step;
          Array.prototype.forEach.call(steps, function (li, i) { li.classList.toggle('is-on', RM ? false : i === step); li.classList.toggle('is-done', !RM && i < step); });
          if (num) num.textContent = '0' + (step + 1);
        }
        if (ring) ring.style.strokeDashoffset = (163.4 * (1 - p)).toFixed(1);
      };
      if (RM) { draw(.999); shine.setAttribute('opacity', 0); drop.setAttribute('opacity', 0); }
      else M.onScroll(function (y, vh) { draw(M.pinned(ritual, vh)); });
    }

    // ── Menu cards tilt towards the pointer ──
    if (M.FINE && !RM) Array.prototype.forEach.call(document.querySelectorAll('[data-tilt]'), function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.setProperty('--ry', (x * 14).toFixed(1) + 'deg'); c.style.setProperty('--rx', (-y * 14).toFixed(1) + 'deg');
      });
      c.addEventListener('pointerleave', function () { c.style.setProperty('--ry', '0deg'); c.style.setProperty('--rx', '0deg'); });
    });
  });
})();
