(function () {
  'use strict';
  var nav = document.getElementById('nav');
  var menu = document.getElementById('site-menu');
  var toggle = document.querySelector('.nav-toggle');
  var work = document.querySelector('.work-toggle');
  var group = work && work.parentElement;
  function setWork(open) {
    if (!work) return;
    work.setAttribute('aria-expanded', String(open));
    group.classList.toggle('is-open', open);
  }
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    menu.classList.toggle('is-open', open);
    if (!open) setWork(false);
  }
  if (nav) {
    function scrollState() { nav.classList.toggle('scrolled', window.scrollY > 4); }
    scrollState();
    window.addEventListener('scroll', scrollState, { passive: true });
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.matchMedia('(max-width: 960px)').addEventListener('change', function () { setMenu(false); });
  }
  if (work) {
    work.addEventListener('click', function () { setWork(work.getAttribute('aria-expanded') !== 'true'); });
    group.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse' && window.innerWidth > 960) setWork(true);
    });
    group.addEventListener('pointerleave', function () {
      if (window.innerWidth > 960 && !group.contains(document.activeElement)) setWork(false);
    });
    group.addEventListener('focusout', function (e) {
      if (!group.contains(e.relatedTarget)) setWork(false);
    });
  }
  document.addEventListener('click', function (e) {
    if (nav && !nav.contains(e.target)) setMenu(false);
    if (group && !group.contains(e.target)) setWork(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (work && work.getAttribute('aria-expanded') === 'true') { setWork(false); work.focus(); }
    else if (toggle && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  document.querySelectorAll('.faq-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      var open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      button.parentElement.classList.toggle('open', open);
    });
  });
})();
