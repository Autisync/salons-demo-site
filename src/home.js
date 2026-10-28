/*!
 * The landing page: the style name in the headline changes every two
 * seconds, each in its own business's type. The previews are CSS and SMIL;
 * with reduced motion everything holds still.
 */
(function () {
  'use strict';
  var M = window.Motion;
  document.addEventListener('DOMContentLoaded', function () {
    if (M.RM) {
      Array.prototype.forEach.call(document.querySelectorAll('svg'), function (s) { if (s.pauseAnimations) { s.pauseAnimations(); try { s.setCurrentTime(1); } catch (e) { /* fine */ } } });
      return;
    }
    var rot = document.querySelector('[data-rot]');
    if (!rot) return;
    var words = rot.querySelectorAll('b'), i = 0;
    setInterval(function () {
      if (document.hidden) return;
      var cur = words[i];
      i = (i + 1) % words.length;
      cur.classList.remove('is-on'); cur.classList.add('is-out');
      words[i].classList.remove('is-out'); words[i].classList.add('is-on');
      setTimeout(function () { cur.classList.remove('is-out'); }, 900);
    }, 2200);
  });
})();
