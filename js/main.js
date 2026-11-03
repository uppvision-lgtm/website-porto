(function(){
  "use strict";
  var d = document;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- menu mobile ---------- */
  var nav = d.getElementById("nav");
  var toggle = d.querySelector(".nav-toggle");
  var menu = d.getElementById("menu-mobile");

  function setMenu(open){
    menu.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    d.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  }
  toggle.addEventListener("click", function(){ setMenu(!menu.classList.contains("open")); });
  menu.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", function(){ setMenu(false); });
  });
  d.addEventListener("keydown", function(e){ if(e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function(){ if(window.innerWidth > 900) setMenu(false); });

  /* ---------- shadow nav saat scroll ---------- */
  function onScroll(){ nav.classList.toggle("scrolled", window.scrollY > 4); }
  onScroll();
  window.addEventListener("scroll", onScroll, {passive:true});

  /* ---------- reveal saat scroll (kelas .reveal dipasang via JS,
       jadi tanpa JS konten tetap tampil) ---------- */
  var targets = d.querySelectorAll(".sec-head, .card, .work, .step, .quote, .faq, .included, .stats, .cta-band > *");
  if(!reduce && "IntersectionObserver" in window){
    var groups = new Map();
    var fold = (window.innerHeight || d.documentElement.clientHeight) * 0.95;
    targets.forEach(function(el){
      var r = el.getBoundingClientRect();
      if(r.top < fold){
        /* sudah kelihatan saat halaman dibuka -> tampil instan,
           tanpa animasi & tanpa delay (ini penyebab terasa "ngeleg") */
        return;
      }
      el.classList.add("reveal");
      var p = el.parentElement;
      var i = groups.get(p) || 0;
      groups.set(p, i + 1);
      el.style.transitionDelay = (i % 4) * 50 + "ms";
    });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, {threshold:.12, rootMargin:"0px 0px -40px 0px"});
    targets.forEach(function(el){ io.observe(el); });
  }

  /* ---------- link nav aktif mengikuti section ---------- */
  var links = Array.prototype.slice.call(d.querySelectorAll(".nav-links a"));
  if("IntersectionObserver" in window && links.length){
    var io2 = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          links.forEach(function(l){
            l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id);
          });
        }
      });
    }, {rootMargin:"-40% 0px -55% 0px"});
    links.forEach(function(l){
      var href = l.getAttribute("href") || "";
      /* link antar-halaman (mis. karya.html / index.html#faq) bukan selector —
         dilewati supaya querySelector tidak lempar error di halaman lain */
      if(href.charAt(0) !== "#") return;
      var s = d.querySelector(href);
      if(s) io2.observe(s);
    });
  }

  /* ---------- angka stats count-up ---------- */
  var nums = d.querySelectorAll(".n[data-count]");
  function render(el){ el.textContent = el.dataset.count + (el.dataset.suffix || ""); }
  function countUp(el){
    var target = parseInt(el.dataset.count, 10) || 0;
    var suffix = el.dataset.suffix || "";
    var dur = 1200, t0 = null;
    function tick(ts){
      if(t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + suffix;
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if(reduce || !("IntersectionObserver" in window)){
    nums.forEach(render);
  } else {
    var io3 = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          if(parseInt(en.target.dataset.count, 10) === 0){ render(en.target); }
          else{ countUp(en.target); }
          io3.unobserve(en.target);
        }
      });
    }, {threshold:.5});
    nums.forEach(function(el){ io3.observe(el); });
  }

  /* ---------- tombol copy email ---------- */
  var copy = d.getElementById("copy-email");
  if(copy){
    copy.addEventListener("click", function(){
      var email = copy.dataset.email;
      function done(){
        copy.textContent = "Tercopy ✓";
        setTimeout(function(){ copy.textContent = "Copy Email 📋"; }, 1600);
      }
      function fallback(){
        var i = d.createElement("textarea");
        i.value = email;
        i.setAttribute("readonly", "");
        i.style.position = "absolute";
        i.style.left = "-9999px";
        d.body.appendChild(i);
        i.select();
        try{ d.execCommand("copy"); done(); }catch(e){ /* diabaikan */ }
        d.body.removeChild(i);
      }
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(email).then(done, fallback);
      } else { fallback(); }
    });
  }

  /* ---------- tahun footer otomatis ---------- */
  var y = d.getElementById("tahun");
  if(y) y.textContent = new Date().getFullYear();
})();
