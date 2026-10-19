/* =========================================================
   main.js — page interactions
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  $("#year").textContent = new Date().getFullYear();

  /* ---------------- light / dark ---------------- */
  var root = document.documentElement;
  var toggle = $("#themeToggle");
  var themeMeta = $('meta[name="theme-color"]');
  function applyTheme(t, save) {
    root.setAttribute("data-theme", t);
    themeMeta.content = t === "light" ? "#eef3ec" : "#0b2a20";
    toggle.setAttribute("aria-label", t === "light" ? "Switch to dark mode" : "Switch to light mode");
    toggle.setAttribute("aria-pressed", t === "light");
    toggle.title = t === "light" ? "Lights off" : "Lights on";
    if (save) { try { localStorage.setItem("jlb-theme", t); } catch (e) {} }
  }
  applyTheme(root.getAttribute("data-theme") || "dark", false);
  toggle.addEventListener("click", function () {
    applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light", true);
  });
  // follow the device setting until the visitor picks one
  var mq = window.matchMedia("(prefers-color-scheme: light)");
  var onScheme = function (e) {
    var saved = null;
    try { saved = localStorage.getItem("jlb-theme"); } catch (err) {}
    if (!saved) applyTheme(e.matches ? "light" : "dark", false);
  };
  if (mq.addEventListener) mq.addEventListener("change", onScheme);

  /* ---------------- toast ---------------- */
  var toast = $("#toast"), toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 2200);
  }

  /* ---------------- projects (from js/projects.js) ---------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function renderProjects() {
    var list = $("#projectList");
    var items = window.PROJECTS || [];
    if (!items.length) {
      list.innerHTML = '<li class="projects__empty">More projects coming soon.</li>';
      return;
    }
    list.innerHTML = items.map(function (p) {
      var links = "";
      if (p.demo) links += '<a class="btn btn--sm" href="' + esc(p.demo) + '" target="_blank" rel="noopener">' + esc(p.demoLabel || "Live demo") + "</a>";
      if (p.code) links += '<a class="btn btn--glass btn--sm" href="' + esc(p.code) + '" target="_blank" rel="noopener">Source code</a>';
      var tags = (p.tags || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
      return (
        '<li class="project glass' + (p.image ? "" : " project--noimg") + '">' +
          (p.image
            ? '<div class="project__shot"><img src="' + esc(p.image) + '" alt="' + esc(p.imageAlt || p.title) + '" loading="lazy" /></div>'
            : "") +
          '<div class="project__main">' +
            (p.year ? '<span class="project__year">' + esc(p.year) + "</span>" : "") +
            "<h4>" + esc(p.title) + "</h4>" +
            "<p>" + esc(p.description) + "</p>" +
            (p.contribution ? '<p class="project__role"><b>My part:</b> ' + esc(p.contribution) + "</p>" : "") +
            (tags ? '<ul class="tags tags--small">' + tags + "</ul>" : "") +
            (links ? '<div class="project__links">' + links + "</div>" : "") +
          "</div>" +
        "</li>"
      );
    }).join("");
  }
  renderProjects();

  /* ---------------- nav ---------------- */
  var burger = $("#navBurger");
  var links = $("#navLinks");
  burger.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  $$("a", links).forEach(function (a) {
    a.addEventListener("click", function () {
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    });
  });

  var navAnchors = $$(".nav__links a");
  var sections = navAnchors.map(function (a) { return $(a.getAttribute("href")); });
  function markActiveNav() {
    var y = window.scrollY + window.innerHeight * 0.35;
    var current = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
    navAnchors.forEach(function (a, i) { a.classList.toggle("is-active", i === current); });
  }

  /* ---------------- hero: 3D glass portrait ---------------- */
  var heroStage = $("#heroStage");
  var portrait = $("#portrait");
  var target = { x: 0, y: 0 }, cur = { x: 0, y: 0 }, pointerActive = false, pointerTimer;

  if (finePointer) {
    document.querySelector(".hero").addEventListener("pointermove", function (e) {
      var b = heroStage.getBoundingClientRect();
      target.x = clamp((e.clientX - (b.left + b.width / 2)) / (b.width / 2), -1.4, 1.4);
      target.y = clamp((e.clientY - (b.top + b.height / 2)) / (b.height / 2), -1.4, 1.4);
      pointerActive = true;
      clearTimeout(pointerTimer);
      pointerTimer = setTimeout(function () { pointerActive = false; }, 2500);
    });
  }

  function portraitLoop(now) {
    if (!pointerActive && !reduceMotion) {
      // gentle idle sway so the depth reads even without a mouse
      target.x = Math.sin(now / 2600) * 0.55;
      target.y = Math.cos(now / 3400) * 0.35;
    }
    cur.x += (target.x - cur.x) * 0.06;
    cur.y += (target.y - cur.y) * 0.06;
    portrait.style.setProperty("--ry", (cur.x * 14).toFixed(2) + "deg");
    portrait.style.setProperty("--rx", (-cur.y * 10).toFixed(2) + "deg");
    portrait.style.setProperty("--mx", (50 + cur.x * 35).toFixed(1) + "%");
    portrait.style.setProperty("--my", (30 + cur.y * 30).toFixed(1) + "%");
    if (!reduceMotion) requestAnimationFrame(portraitLoop);
  }
  requestAnimationFrame(portraitLoop);

  /* ---------------- app concept phone: sample readings ---------------- */
  var phoneW = $("#phoneW"), phoneLine = $("#phoneLine");
  var history = [];
  for (var i = 0; i < 40; i++) history.push(60 + Math.sin(i / 3) * 18 + Math.random() * 10);
  function phoneTick() {
    var t = Date.now();
    var w = 520 + Math.sin(t / 1800) * 120 + Math.random() * 30;
    phoneW.textContent = Math.round(w);
    history.push(w / 7 + Math.random() * 6);
    if (history.length > 40) history.shift();
    var max = Math.max.apply(null, history.concat([120]));
    phoneLine.setAttribute("points", history.map(function (v, i) {
      return (i * (200 / 39)).toFixed(1) + "," + (66 - (v / max) * 60).toFixed(1);
    }).join(" "));
  }
  phoneTick();
  setInterval(phoneTick, reduceMotion ? 3000 : 600);

  /* ---------------- exploded plug on scroll ---------------- */
  var inside = $("#inside");
  var exStage = $("#explodeStage");
  var ex = window.SmartPlug.build(exStage);
  var steps = $$(".step");
  var callouts = $$(".callout");
  var bar = $("#insideBar");
  var activeStep = -1;

  function fitExplode() {
    var w = exStage.clientWidth, h = exStage.clientHeight;
    ex.setScale(clamp(Math.min(w / (w < 600 ? 500 : 640), h / 560), 0.5, 1.1));
  }

  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function onScrollExplode() {
    var r = inside.getBoundingClientRect();
    var total = inside.offsetHeight - window.innerHeight;
    var p = clamp(-r.top / total, 0, 1);
    bar.style.transform = "scaleX(" + p.toFixed(3) + ")";
    bar.parentNode.style.opacity = p >= 0.999 ? 0 : 1;

    var t = ease(clamp(p / 0.3, 0, 1));            // first 30% of the scroll opens it up
    ex.setExplode(t);
    ex.setRotation(-10 - p * 6, -26 - t * 14 - p * 8);

    var idx = clamp(Math.floor(p * 4.2), 0, 3);
    if (idx !== activeStep) {
      activeStep = idx;
      steps.forEach(function (s, i) { s.classList.toggle("is-active", i === idx); });
    }
    var part = steps[activeStep].dataset.part;
    ex.setFocus(t > 0.6 ? part : null);
    placeCallout(t > 0.6 ? part : null);
  }

  // pin the active callout above its part (uses the projected 3D box)
  function placeCallout(part) {
    var sRect = exStage.getBoundingClientRect();
    callouts.forEach(function (c) {
      var on = c.dataset.for === part;
      c.classList.toggle("is-on", on);
      if (!on) return;
      var node = ex.parts[part];
      var face = node.querySelector(".face") || node;
      var r = face.getBoundingClientRect();
      var x = clamp(r.left + r.width / 2 - sRect.left, c.offsetWidth / 2 + 4, sRect.width - c.offsetWidth / 2 - 4);
      c.style.left = x + "px";
      c.style.top = Math.max(c.offsetHeight + 4, r.top - sRect.top - 22) + "px";
    });
  }

  /* ---------------- tilt on the featured project ---------------- */
  if (!reduceMotion && finePointer) {
    $$("[data-tilt]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var b = card.getBoundingClientRect();
        var x = (e.clientX - b.left) / b.width - 0.5;
        var y = (e.clientY - b.top) / b.height - 0.5;
        card.style.transform = "perspective(1200px) rotateX(" + (-y * 4).toFixed(2) + "deg) rotateY(" + (x * 5).toFixed(2) + "deg)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------------- copy email ---------------- */
  var copyBtn = $("#copyEmail");
  copyBtn.addEventListener("click", function () {
    var email = copyBtn.dataset.email;
    function done() { showToast("Email copied"); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done, function () { fallbackCopy(email); done(); });
    } else { fallbackCopy(email); done(); }
  });
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }
  /* ---------------- profile links + resume (from js/config.js) ---------------- */
  var site = window.SITE || {};
  var profileList = $("#profileLinks");
  [["github", "GitHub"], ["linkedin", "LinkedIn"]].forEach(function (pair) {
    var url = site[pair[0]];
    if (!url) return;
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = url; a.textContent = pair[1]; a.target = "_blank"; a.rel = "noopener";
    li.appendChild(a);
    profileList.insertBefore(li, profileList.firstChild);
  });
  if (site.resume) {
    var rb = $("#resumeBtn");
    rb.href = site.resume;
    rb.hidden = false;
  }

  /* ---------------- wire up ---------------- */
  function onResize() { fitExplode(); onScrollExplode(); }
  window.addEventListener("resize", onResize);
  window.addEventListener("scroll", function () { onScrollExplode(); markActiveNav(); }, { passive: true });
  onResize();
  markActiveNav();
})();
