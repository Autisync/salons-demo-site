/*!
 * Cotton & Steel's own motion: clippers that buzz across the side of the
 * head and leave a fade behind them (hero), and a before/after fade that
 * follows the scroll. With prefers-reduced-motion, both show the finished cut.
 */
(function () {
  'use strict';
  var M = window.Motion, RM = M.RM, NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  var ease = function (k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };

  document.addEventListener('DOMContentLoaded', function () {
    // ── Hero: the clippers ──
    var scene = document.querySelector('[data-clipper-scene]');
    if (scene) {
      var uncut = scene.querySelector('[data-uncut]');
      var hairGroup = scene.querySelector('g[clip-path="url(#bUncut)"]');
      var clipper = scene.querySelector('[data-clipper]'), body = scene.querySelector('[data-clipper-body]');
      var tag = scene.querySelector('[data-price-tag]'), line = scene.querySelector('[data-fade-line]');
      var clipsG = scene.querySelector('[data-clips]');
      // The fade line is only drawn where the clippers have been.
      var defs = scene.querySelector('defs');
      var cp = el('clipPath', { id: 'bDone' }, defs), doneRect = el('rect', { x: 0, y: 0, width: 200, height: 600 }, cp);
      line.setAttribute('clip-path', 'url(#bDone)');

      var X0 = 196, X1 = 424, SX0 = 236, SX1 = 420;
      // The bottom edge of the hair on the side of the head, front to back.
      var EDGE = [[236, 300], [270, 352], [320, 420], [370, 458], [424, 420]];
      var baseY = function (x) {
        for (var i = 0; i < EDGE.length - 1; i++) if (x <= EDGE[i + 1][0]) { var a = EDGE[i], b = EDGE[i + 1], k = (x - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * k; }
        return EDGE[EDGE.length - 1][1];
      };
      var setCut = function (x) { uncut.setAttribute('x', x.toFixed(1)); doneRect.setAttribute('width', x.toFixed(1)); };
      var place = function (x, y, rot) { clipper.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(2) + ')'); };

      if (RM) {
        setCut(X1 + 20); place(470, 500, -18); tag.classList.add('is-on');
      } else {
        // Hair clippings that fall from the blade.
        var bits = [];
        for (var i = 0; i < 48; i++) bits.push({ p: el('path', { d: 'M0 0l0 4', opacity: 0 }, clipsG), life: 0 });
        var spawn = function (x, y) {
          var b = bits.filter(function (q) { return q.life <= 0; })[0];
          if (!b) return;
          b.x = x + (Math.random() - .5) * 46; b.y = y + 6; b.vx = (Math.random() - .5) * 60; b.vy = -20 - Math.random() * 60; b.r = Math.random() * 180; b.life = 1;
          b.p.setAttribute('d', 'M0 0l' + (Math.random() * 3).toFixed(1) + ' ' + (3 + Math.random() * 4).toFixed(1));
        };
        var started = false, t0 = 0;
        var root = document.documentElement;
        var go = function () { if (!started) { started = true; t0 = performance.now(); } };
        if (root.classList.contains('is-loaded')) setTimeout(go, 900);
        else new MutationObserver(function (m, o) { if (root.classList.contains('is-loaded')) { o.disconnect(); setTimeout(go, 1100); } }).observe(root, { attributes: true, attributeFilter: ['class'] });
        setCut(X0); place(120, 640, -14); clipper.style.opacity = 0;

        // One cycle: in (0.7s), the pass (3.6s), away + price tag (1.8s), the hair grows back (1s).
        var IN = .7, PASS = 3.6, AWAY = 1.8, BACK = 1.1, CYCLE = IN + PASS + AWAY + BACK;
        M.loop(scene, function (t, dt) {
          if (!started) return;
          var s = ((performance.now() - t0) / 1000) % CYCLE;
          var x, y, rot, buzzing = false;
          if (s < IN) {
            var k = ease(s / IN);
            x = 120 + (SX0 - 120) * k; y = 640 + (baseY(SX0) - 640) * k; rot = -14 + 6 * k;
            clipper.style.opacity = Math.min(1, k * 2); hairGroup.style.opacity = 1; setCut(X0); tag.classList.remove('is-on');
          } else if (s < IN + PASS) {
            var u = (s - IN) / PASS;
            x = SX0 + (SX1 - SX0) * ease(u);
            // Up-and-out flicks along the hairline, the way a barber blends.
            var flick = Math.abs(Math.sin(u * Math.PI * 6));
            y = baseY(x) - flick * 78; rot = -10 + flick * 12;
            setCut(Math.max(X0, X0 + (X1 + 20 - X0) * ease(u)));
            buzzing = true;
            if (flick > .3 && Math.random() < .8) spawn(x, y);
          } else if (s < IN + PASS + AWAY) {
            var a = ease((s - IN - PASS) / AWAY);
            x = SX1 + 60 * a; y = baseY(SX1) + 110 * a; rot = 2 - 22 * a;
            setCut(X1 + 20); tag.classList.add('is-on');
            clipper.style.opacity = 1 - Math.max(0, a - .6) * 2.5;
          } else {
            var g = (s - IN - PASS - AWAY) / BACK;
            x = 120; y = 640; rot = -14; clipper.style.opacity = 0;
            // The grow-out comes back, ready for the next pass.
            setCut(X0); hairGroup.style.opacity = ease(g); if (g > .3) tag.classList.remove('is-on');
          }
          if (buzzing) { x += (Math.random() - .5) * 1.8; y += (Math.random() - .5) * 1.8; rot += (Math.random() - .5) * 1.4; }
          place(x, y, rot);
          clipper.classList.toggle('buzzing', buzzing);
          bits.forEach(function (b) {
            if (b.life <= 0) return;
            b.life -= dt * .9; b.vy += 520 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.r += 240 * dt;
            b.p.setAttribute('transform', 'translate(' + b.x.toFixed(1) + ' ' + b.y.toFixed(1) + ') rotate(' + b.r.toFixed(0) + ')');
            b.p.setAttribute('opacity', Math.max(0, b.life).toFixed(2));
          });
        });
      }
    }

    // ── The fade: before and after, driven by the scroll ──
    var fade = document.querySelector('.fade'), ba = document.querySelector('[data-ba]');
    if (fade && ba) {
      var after = ba.querySelector('[data-ba-after]'), before = ba.querySelector('[data-ba-before]'), div = ba.querySelector('[data-ba-divider]');
      var guards = fade.querySelectorAll('[data-guards] li'), bar = fade.querySelector('[data-fade-bar]');
      var set = function (p) {
        var k = M.clamp((p - .06) / .82, 0, 1);
        var d = 60 + k * 400;
        after.setAttribute('width', d.toFixed(1));
        before.setAttribute('x', d.toFixed(1)); before.setAttribute('width', (520 - d).toFixed(1));
        div.setAttribute('transform', 'translate(' + d.toFixed(1) + ' 0)');
        div.style.opacity = k >= 1 ? 0 : 1;
        Array.prototype.forEach.call(guards, function (li, i) { li.classList.toggle('is-on', RM || k >= i / 4 + .02 || (i === 0 && k > 0)); });
        if (bar) bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
      };
      if (RM) set(1);
      else M.onScroll(function (y, vh) { set(M.pinned(fade, vh)); });
    }
  });
})();
