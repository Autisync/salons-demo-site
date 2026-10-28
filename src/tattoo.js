/*!
 * Hollow Moon's own motion: a tattoo machine that draws line-art designs onto
 * skin, stroke by stroke, as the page loads (hero) and as you scroll (line by
 * line), with the redness healing away. The flash sheet and the ink-splatter
 * reveals are CSS (tattoo.css). Reduced motion: every design shown finished.
 */
(function () {
  'use strict';
  var M = window.Motion, RM = M.RM, NS = 'http://www.w3.org/2000/svg', I = window.I18N;
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  var inOut = function (k) { return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; };
  /** Copies a flash design's paths (from the sprite) into a group. */
  function clone(id, into) {
    var sym = document.getElementById(id), out = [];
    if (!sym) return out;
    Array.prototype.forEach.call(sym.querySelectorAll('path'), function (p) { out.push(el('path', { d: p.getAttribute('d') }, into)); });
    return out;
  }
  function placeMachine(g, x, y, rot) { g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')'); }

  document.addEventListener('DOMContentLoaded', function () {
    // ── Hero: the machine draws, the skin heals, the next design ──
    var scene = document.querySelector('[data-ink-scene]');
    var machineBody = scene && scene.querySelector('[data-machine-body]');
    if (scene) {
      var inkG = scene.querySelector('[data-ink]'), haloG = scene.querySelector('[data-halo]'), machine = scene.querySelector('[data-machine]');
      var cap = document.querySelector('[data-art-cap]'), capName = cap.querySelector('[data-art-name]'), capPrice = cap.querySelector('[data-art-price]');
      var TX = 110, TY = 150, S = 1.5, REST = [500, 600, 24];
      var DESIGNS = [
        { id: 'f-moon', k: ['t.capMoon', 't.capMoonP'], en: ['Hollow eye · fine-line', 'from £150'] },
        { id: 'f-sprig', k: ['t.capSprig', 't.capSprigP'], en: ['Olive sprig · fine-line', 'from £120'] },
        { id: 'f-butterfly', k: ['t.capMoth', 't.capMothP'], en: ['Moth · blackwork', '£120'] },
      ];
      capName.removeAttribute('data-i18n'); capPrice.removeAttribute('data-i18n');
      var current = 0, strokes = [];
      var caption = function () {
        var d = DESIGNS[current], pt = I.lang() === 'pt';
        capName.textContent = pt && I.pt[d.k[0]] ? I.pt[d.k[0]] : d.en[0];
        capPrice.textContent = pt && I.pt[d.k[1]] ? I.pt[d.k[1]] : d.en[1];
      };
      document.addEventListener('langchange', caption);
      var load = function (i) {
        current = i;
        inkG.innerHTML = ''; haloG.innerHTML = '';
        haloG.classList.remove('healed');
        inkG.style.opacity = 1; haloG.style.opacity = 1;
        var ink = clone(DESIGNS[i].id, inkG), halo = clone(DESIGNS[i].id, haloG);
        strokes = ink.map(function (p, j) { var l = p.getTotalLength(); p.style.strokeDasharray = l; halo[j].style.strokeDasharray = l; return { p: p, h: halo[j], l: l }; });
        caption();
      };
      var draw = function (s, k) { var off = (s.l * (1 - k)).toFixed(2); s.p.style.strokeDashoffset = off; s.h.style.strokeDashoffset = off; var o = k > 0 ? '' : '0'; s.p.style.opacity = o; s.h.style.opacity = o; };
      load(0);
      if (RM) {
        strokes.forEach(function (s) { draw(s, 1); });
        haloG.classList.add('healed'); cap.classList.add('is-on'); machine.style.display = 'none';
      } else {
        strokes.forEach(function (s) { draw(s, 0); });
        placeMachine(machine, REST[0], REST[1], REST[2]);
        var SPEED = 230, HOP = .26, plan = [], total = 0;
        var makePlan = function () {
          plan = []; total = 0;
          strokes.forEach(function (s) { var d = s.l / SPEED; plan.push({ s: s, t0: total + HOP, t1: total + HOP + d }); total += HOP + d; });
        };
        makePlan();
        var t0 = 0, phase = 'wait', last = [REST[0], REST[1]];
        var go = function () { if (phase === 'wait') { phase = 'draw'; t0 = performance.now(); } };
        var root = document.documentElement;
        if (root.classList.contains('is-loaded')) setTimeout(go, 1100);
        else new MutationObserver(function (m, o) { if (root.classList.contains('is-loaded')) { o.disconnect(); setTimeout(go, 1300); } }).observe(root, { attributes: true, attributeFilter: ['class'] });
        M.loop(scene, function () {
          if (phase === 'wait') return;
          var e = (performance.now() - t0) / 1000;
          if (phase === 'draw') {
            var x = REST[0], y = REST[1], rot = 26, buzzing = false;
            for (var i = 0; i < plan.length; i++) {
              var q = plan[i];
              if (e >= q.t1) { draw(q.s, 1); continue; }
              var prevEnd = i ? plan[i - 1] : null;
              var start = q.s.p.getPointAtLength(0);
              if (e < q.t0) {
                // Lifting the needle and moving to the start of the next line.
                var from = prevEnd ? prevEnd.s.p.getPointAtLength(prevEnd.s.l) : null;
                var fx = from ? TX + S * from.x : REST[0], fy = from ? TY + S * from.y : REST[1];
                var k = inOut(Math.max(0, (e - (q.t0 - HOP)) / HOP));
                x = fx + (TX + S * start.x - fx) * k; y = fy + (TY + S * start.y - fy) * k - Math.sin(k * Math.PI) * 18;
              } else {
                var kk = (e - q.t0) / (q.t1 - q.t0);
                draw(q.s, kk);
                var pt = q.s.p.getPointAtLength(q.s.l * kk);
                x = TX + S * pt.x; y = TY + S * pt.y; buzzing = true;
              }
              for (var r = i + 1; r < plan.length; r++) draw(plan[r].s, 0);
              break;
            }
            if (i === plan.length) { phase = 'heal'; t0 = performance.now(); haloG.classList.add('healed'); cap.classList.add('is-on'); last = [x, y]; }
            if (buzzing) { x += (Math.random() - .5) * 1.4; y += (Math.random() - .5) * 1.4; rot += (Math.random() - .5) * 1.2; }
            last = [x, y];
            placeMachine(machine, x, y, rot);
          } else if (phase === 'heal') {
            var a = inOut(Math.min(1, e / 1));
            placeMachine(machine, last[0] + (REST[0] - last[0]) * a, last[1] + (REST[1] - last[1]) * a, 26);
            if (e > 4.2) { phase = 'fade'; t0 = performance.now(); cap.classList.remove('is-on'); }
          } else if (phase === 'fade') {
            var f = Math.min(1, e / .9);
            inkG.style.opacity = 1 - f;
            if (f >= 1) { load((current + 1) % DESIGNS.length); strokes.forEach(function (s) { draw(s, 0); }); makePlan(); phase = 'draw'; t0 = performance.now(); }
          }
        });
      }
    }

    // ── Line by line: stencil, then ink, as you scroll ──
    var line = document.querySelector('.line'), ls = document.querySelector('[data-line-scene]');
    if (line && ls) {
      var stencil = ls.querySelector('[data-stencil]'), lInk = ls.querySelector('[data-line-ink]'), lHalo = ls.querySelector('[data-line-halo]'), lMach = ls.querySelector('[data-line-machine]');
      var healed = ls.querySelector('[data-healed]'), bar = line.querySelector('[data-line-bar]'), stages = line.querySelectorAll('[data-stages] li');
      if (machineBody) lMach.appendChild(machineBody.cloneNode(true));
      var PARTS = [{ id: 'f-dagger', x: 140, y: 56, s: 1.6 }, { id: 'f-sprig', x: 128, y: 150, s: 1.7 }];
      var lines = [], total = 0;
      PARTS.forEach(function (part) {
        var tr = 'translate(' + part.x + ' ' + part.y + ') scale(' + part.s + ')';
        var gs = el('g', { transform: tr }, stencil), gi = el('g', { transform: tr }, lInk), gh = el('g', { transform: tr }, lHalo);
        clone(part.id, gs);
        var ink = clone(part.id, gi), halo = clone(part.id, gh);
        ink.forEach(function (p, j) { var l = p.getTotalLength(); p.style.strokeDasharray = l; halo[j].style.strokeDasharray = l; lines.push({ p: p, h: halo[j], l: l, part: part, a: total }); total += l; });
      });
      var setInk = function (drawn) {
        var at = null;
        lines.forEach(function (o) {
          var k = M.clamp((drawn - o.a) / o.l, 0, 1), off = (o.l * (1 - k)).toFixed(2);
          o.p.style.strokeDashoffset = off; o.h.style.strokeDashoffset = off; o.p.style.opacity = o.h.style.opacity = k > 0 ? '' : '0';
          if (k > 0 && k < 1) at = { o: o, k: k };
        });
        return at;
      };
      var update = function (p) {
        var stencilOn = M.clamp((p - .16) / .16, 0, 1) * (1 - M.clamp((p - .86) / .08, 0, 1));
        stencil.style.opacity = (stencilOn * .85).toFixed(2);
        var k = M.clamp((p - .36) / .5, 0, 1);
        var at = setInk(k * total);
        if (at && !RM) {
          var pt = at.o.p.getPointAtLength(at.o.l * at.k);
          lMach.style.opacity = 1;
          placeMachine(lMach, at.o.part.x + at.o.part.s * pt.x + (Math.random() - .5) * 1.2, at.o.part.y + at.o.part.s * pt.y + (Math.random() - .5) * 1.2, 26);
        } else {
          lMach.style.opacity = k > 0 && k < 1 ? 1 : 0;
          if (k <= 0) placeMachine(lMach, 560, 640, 26);
        }
        lHalo.classList.toggle('healed', p > .9);
        healed.classList.toggle('is-on', p > .92);
        if (bar) bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
        var st = p < .16 ? 0 : p < .3 ? 1 : p < .37 ? 2 : p < .88 ? 3 : 4;
        Array.prototype.forEach.call(stages, function (li, i) { li.classList.toggle('is-on', RM || i === st); });
      };
      if (RM) { update(1); lMach.style.display = 'none'; }
      else M.onScroll(function (y, vh) { update(M.pinned(line, vh)); });
    }
  });
})();
