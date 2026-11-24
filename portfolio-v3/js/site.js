/* Site behaviour: menu, progress, floor grid, exploded stacks, tilting planes, pinned layers, contact helpers, lazy voice widget. */
(function () {
  "use strict";
  var doc = document, win = window, root = doc.documentElement;
  var motion = root.classList.contains("motion");
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  // menu
  var mb = $(".menu-btn"), mp = $("#mpanel");
  if (mb && mp) mb.addEventListener("click", function () {
    var open = mp.classList.toggle("open");
    mb.setAttribute("aria-expanded", open ? "true" : "false");
    mb.textContent = open ? "Close" : "Menu";
  });

  var bar = $("#progress-bar");
  var stacks = $$(".scene[data-stack]"), planes = $$(".plane"), lay = $(".lay"), panels = $$(".lay-panel"), layStack = lay ? $(".stack", lay) : null;
  var plates = layStack ? $$(".plate", layStack) : [];
  var ticking = false;

  function frame() {
    ticking = false;
    var y = win.pageYOffset, vh = win.innerHeight, h = root.scrollHeight - vh;
    if (bar) bar.style.width = (h > 0 ? y / h * 100 : 0).toFixed(1) + "%";
    if (!motion) return;
    root.style.setProperty("--sy", y.toFixed(0));
    stacks.forEach(function (sc) {
      var r = sc.getBoundingClientRect();
      var p = clamp((vh - r.top) / (vh + r.height) * 1.5 - 0.12);
      if (sc.closest(".hero")) p = clamp(y / (vh * 0.85));
      sc.style.setProperty("--p", p.toFixed(3));
    });
    planes.forEach(function (el) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--s", clamp((r.top - vh * 0.3) / (vh * 0.7)).toFixed(3));
    });
    if (lay) {
      var r2 = lay.getBoundingClientRect();
      var p2 = clamp(-r2.top / (r2.height - vh));
      var n = panels.length, f = p2 * (n - 0.001), act = Math.min(n - 1, Math.floor(f));
      layStack.style.setProperty("--p", (0.35 + p2 * 0.65).toFixed(3));
      plates.forEach(function (pl, i) {
        var d = Math.abs(i - f - 0.5 + 0.5);
        var lift = Math.max(0, 1 - Math.abs(i - (f - 0.5))) * 46;
        pl.style.transform = "translateZ(calc(" + i + " * (18px + var(--p) * 90px) + " + lift.toFixed(1) + "px))";
        pl.classList.toggle("hot", i === act);
        pl.style.opacity = i === act ? 1 : 0.55;
      });
      panels.forEach(function (pn, i) { pn.classList.toggle("on", i === act); });
    }
  }
  function req() { if (!ticking) { ticking = true; win.requestAnimationFrame(frame); } }
  win.addEventListener("scroll", req, { passive: true });
  win.addEventListener("resize", req);
  frame();

  // pointer parallax for stacks and labels (fine pointers only)
  if (motion && matchMedia("(pointer:fine)").matches) {
    $$(".scene").forEach(function (sc) {
      var host = sc.closest("section") || sc;
      host.addEventListener("pointermove", function (e) {
        var r = sc.getBoundingClientRect();
        sc.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        sc.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      }, { passive: true });
      host.addEventListener("pointerleave", function () { sc.style.setProperty("--mx", 0); sc.style.setProperty("--my", 0); });
    });
  }

  // contact helpers
  var copy = $("#copy-email");
  if (copy) copy.addEventListener("click", function () {
    var t = copy.getAttribute("data-copy");
    try { navigator.clipboard.writeText(t).then(function () { copy.textContent = "Copied"; }, function () {}); } catch (e) {}
  });
  $$("[data-topic]").forEach(function (b) {
    b.addEventListener("click", function () {
      var s = $("#topic"); if (s) s.value = b.getAttribute("data-topic");
      var m = $("#message"); if (m) m.focus();
    });
  });
  $$("form[data-netlify]").forEach(function (f) {
    f.addEventListener("submit", function () {
      var b = f.querySelector("button[type=submit]");
      if (b) { b.disabled = true; b.textContent = "Sending..."; }
    });
  });

  // lazy voice widget
  var fish = false;
  function loadFish() {
    if (fish) return; fish = true;
    var s = doc.createElement("script");
    s.src = "https://unpkg.com/@fishaudio/agent-widget-embed"; s.async = true; doc.body.appendChild(s);
  }
  if ($("fish-agent")) ["pointerdown", "keydown", "touchstart", "scroll"].forEach(function (ev) {
    win.addEventListener(ev, loadFish, { once: true, passive: true });
  });
})();
