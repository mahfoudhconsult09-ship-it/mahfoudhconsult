/* mahfoudhconsult: shared behaviour. Everything here is an enhancement:
   the pages read and work without it. */
(function () {
  "use strict";
  var doc = document;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var raf = window.requestAnimationFrame.bind(window);
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };

  /* ---- mobile menu ---- */
  var menuBtn = $(".menu-btn"), panel = $("#mobile-panel");
  function setMenu(open) {
    if (!menuBtn || !panel) return;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { setMenu(menuBtn.getAttribute("aria-expanded") !== "true"); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") { setMenu(false); menuBtn.focus(); } });
    $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth > 900) setMenu(false); });
  }

  /* ---- reading progress ---- */
  var bar = $("#progress-bar"), ticking = false;
  function progress() {
    var h = doc.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
    if (bar) bar.style.transform = "scaleX(" + p + ")";
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; raf(progress); } }, { passive: true });
  progress();

  /* ---- hero chart that leans toward the pointer ---- */
  var hero = $(".hero"), svg = $("#hero-chart");
  if (hero && svg) {
    var bars = $$("rect", svg), line = $("polyline", svg), dot = $("circle", svg);
    var base = [64, 108, 92, 164, 148, 222, 300];
    var BASE_Y = 380, W = 58, cur = base.map(function () { return 0; });
    var px = null, active = false, visible = true, start = performance.now();
    function paint(h) {
      var pts = [];
      bars.forEach(function (b, i) {
        var x = parseFloat(b.getAttribute("x"));
        b.setAttribute("y", (BASE_Y - h[i]).toFixed(1));
        b.setAttribute("height", Math.max(0, h[i]).toFixed(1));
        pts.push((x + W / 2).toFixed(1) + "," + (BASE_Y - h[i] - 16).toFixed(1));
      });
      line.setAttribute("points", pts.join(" "));
      var last = pts[pts.length - 1].split(",");
      dot.setAttribute("cx", last[0]); dot.setAttribute("cy", last[1]);
    }
    if (reduce) { paint(base); }
    else {
      hero.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") return;
        var r = svg.getBoundingClientRect();
        px = (e.clientX - r.left) / r.width * 600;
        active = true;
      });
      hero.addEventListener("pointerleave", function () { active = false; });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) loop(); }).observe(hero);
      }
      var running = false;
      var loop = function () {
        if (running) return; running = true;
        (function frame(now) {
          if (!visible) { running = false; return; }
          var t = now - start, out = [];
          for (var i = 0; i < base.length; i++) {
            var intro = ease(Math.max(0, Math.min(1, (t - 300 - i * 90) / 800)));
            var cx = 20 + i * 82 + W / 2;
            var infl = active && px !== null ? Math.exp(-Math.pow((px - cx) / 85, 2)) : 0;
            var target = base[i] * (1 + 0.32 * infl) * intro + Math.sin(t / 1100 + i * 1.3) * 3 * intro;
            cur[i] += (target - cur[i]) * 0.14;
            out.push(cur[i]);
          }
          paint(out);
          raf(frame);
        })(performance.now());
      };
      loop();
    }
  }

  /* ---- rotating "I fix ..." line ---- */
  var rot = $("#rot");
  if (rot && !reduce) {
    var words = ["thin product pages.", "weak search visibility.", "checkouts that lose people."], wi = 0;
    setInterval(function () {
      wi = (wi + 1) % words.length;
      var s = doc.createElement("span"); s.textContent = words[wi];
      rot.textContent = ""; rot.appendChild(s);
    }, 2800);
  }

  /* ---- count up the two real numbers ---- */
  var counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        co.unobserve(en.target);
        var el = en.target, to = parseInt(el.getAttribute("data-count"), 10), t0 = performance.now();
        (function tick(now) {
          var p = Math.min(1, (now - t0) / 1100);
          el.textContent = Math.round(to * ease(p));
          if (p < 1) raf(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { c.textContent = "0"; co.observe(c); });
  }

  /* ---- how it works: the line fills as you read ---- */
  var steps = $("#steps");
  if (steps) {
    var lis = $$("li", steps);
    var upd = function () {
      var r = steps.getBoundingClientRect(), vh = window.innerHeight, mark = vh * 0.62;
      var pct = Math.max(0, Math.min(1, (mark - r.top) / r.height));
      steps.style.setProperty("--fill", (pct * 100).toFixed(1) + "%");
      lis.forEach(function (li) { li.classList.toggle("on", li.getBoundingClientRect().top < mark); });
    };
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  }

  /* ---- services: highlight the section you are reading ---- */
  var nav = $("#svc-nav");
  if (nav && "IntersectionObserver" in window) {
    var links = $$("a", nav);
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id); });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    $$(".svc-item").forEach(function (s) { so.observe(s); });
    if (links[0]) links[0].classList.add("on");
  }

  /* ---- store cards: staggered reveal, platform groups and filters ---- */
  var grid = $("#store-grid");
  var filters = $("#filters");
  var seen = null;
  if (grid) {
    var revealIO = "IntersectionObserver" in window && !reduce
      ? new IntersectionObserver(function (entries) {
          var n = 0;
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            var el = en.target; revealIO.unobserve(el);
            el.style.transitionDelay = (n++ * 70) + "ms";
            el.classList.add("in");
          });
        }, { threshold: 0.08 })
      : null;

    var current = "all";
    var apply = function () {
      $$(".store-card", grid).forEach(function (c) {
        var p = $(".store-platform", c);
        c.hidden = !(current === "all" || (p && p.textContent === current));
      });
      $$(".grp", grid).forEach(function (g) { g.hidden = !(current === "all" || g.getAttribute("data-p") === current); });
      if (filters) $$(".chip", filters).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === current)); });
    };
    var fromHash = function () {
      var h = decodeURIComponent((location.hash || "").slice(1)).toLowerCase();
      if (!filters || !h) return;
      var match = $$(".chip", filters).filter(function (b) { return b.getAttribute("data-filter").toLowerCase() === h; })[0];
      if (match) { current = match.getAttribute("data-filter"); apply(); }
    };

    var decorate = function () {
      var cards = $$(".store-card", grid);
      if (!cards.length || seen === cards.length) return;
      seen = cards.length;
      if (filters) {
        var last = null;
        $$(".grp", grid).forEach(function (g) { g.remove(); });
        cards.forEach(function (c) {
          var p = $(".store-platform", c).textContent;
          if (p !== last) {
            var g = doc.createElement("div"); g.className = "grp"; g.id = p.toLowerCase(); g.setAttribute("data-p", p);
            var count = cards.filter(function (x) { return $(".store-platform", x).textContent === p; }).length;
            g.innerHTML = "<h2></h2><span></span>";
            g.firstChild.textContent = p; g.lastChild.textContent = count + (count === 1 ? " store" : " stores");
            grid.insertBefore(g, c); last = p;
          }
        });
        filters.hidden = false;
        fromHash();
      }
      cards.forEach(function (c) { if (revealIO) revealIO.observe(c); else c.classList.add("in"); });
    };
    new MutationObserver(decorate).observe(grid, { childList: true });
    decorate();

    if (filters) {
      filters.addEventListener("click", function (e) {
        var b = e.target.closest(".chip"); if (!b) return;
        current = b.getAttribute("data-filter"); apply();
        if (history.replaceState) history.replaceState(null, "", current === "all" ? location.pathname : "#" + current.toLowerCase());
      });
      window.addEventListener("hashchange", fromHash);
    }
  }

  /* ---- audit page ---- */
  var auditForm = $("#audit-form");
  if (auditForm) {
    var box = $("#audit-box"), statusEl = $("#audit-status"), resultsEl = $("#audit-results");
    var items = $$("#scanlist li"), si = 0, timer = null;
    new MutationObserver(function () {
      var on = /^Scanning/.test(statusEl.textContent);
      box.classList.toggle("scanning", on);
      clearInterval(timer);
      if (on) {
        timer = setInterval(function () {
          items.forEach(function (li, i) { li.classList.toggle("hot", i === si % items.length); });
          si++;
        }, 900);
      } else items.forEach(function (li) { li.classList.remove("hot"); });
    }).observe(statusEl, { childList: true, characterData: true, subtree: true });

    var pending = false;
    new MutationObserver(function () {
      if (pending) return; pending = true;
      raf(function () {
        pending = false;
        $$(".audit-score-value", resultsEl).forEach(function (v) {
          if (v.getAttribute("data-done")) return;
          v.setAttribute("data-done", "1");
          var txt = v.textContent, n = parseInt(txt, 10);
          if (isNaN(n)) { v.style.setProperty("--p", txt === "Yes" || txt === "No" ? 100 : 0); return; }
          if (reduce) { v.style.setProperty("--p", n); return; }
          var t0 = performance.now();
          (function tick(now) {
            var p = ease(Math.min(1, (now - t0) / 1000));
            v.style.setProperty("--p", (n * p).toFixed(1));
            v.textContent = Math.round(n * p);
            if (p < 1) raf(tick);
          })(t0);
        });
        if (!resultsEl.hidden) resultsEl.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    }).observe(resultsEl, { childList: true });

    var q = new URLSearchParams(location.search).get("url");
    if (q) {
      $("#audit-url").value = q;
      setTimeout(function () { if (auditForm.requestSubmit) auditForm.requestSubmit(); }, 350);
    }
  }

  /* ---- contact page ---- */
  var copyBtn = $("#copy-mail");
  if (copyBtn && navigator.clipboard) {
    copyBtn.hidden = false;
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(copyBtn.getAttribute("data-copy")).then(function () {
        copyBtn.textContent = "Copied";
        setTimeout(function () { copyBtn.textContent = "Copy"; }, 1600);
      });
    });
  }
  var cMe = $("#clock-me"), cYou = $("#clock-you");
  if (cMe && cYou && window.Intl) {
    var fmt = function (tz) {
      try {
        return new Intl.DateTimeFormat([], { weekday: "short", hour: "numeric", minute: "2-digit", timeZone: tz }).format(new Date());
      } catch (e) { return ""; }
    };
    var tick = function () {
      var mine = cMe.getAttribute("data-tz");
      var yours = Intl.DateTimeFormat().resolvedOptions().timeZone;
      cMe.textContent = fmt(mine);
      cYou.textContent = fmt(yours) + (yours ? " (" + yours.replace(/_/g, " ").split("/").pop() + ")" : "");
    };
    tick(); setInterval(tick, 20000);
  }
  var topics = $("#topics"), msg = $("#c-message");
  if (topics && msg) {
    topics.hidden = false; $("#topics-title").hidden = false;
    var picked = [];
    var write = function () {
      var rest = msg.value.replace(/^I need help with: .*\n?\n?/, "");
      msg.value = picked.length ? "I need help with: " + picked.join(", ") + ".\n\n" + rest : rest;
    };
    topics.addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b) return;
      var t = b.textContent.trim(), i = picked.indexOf(t);
      if (i > -1) picked.splice(i, 1); else picked.push(t);
      b.setAttribute("aria-pressed", String(i === -1));
      write();
    });
  }
  $$("form[data-netlify]").forEach(function (f) {
    f.addEventListener("submit", function () {
      var b = $("button[type=submit]", f);
      if (b) { b.disabled = true; b.textContent = "Sending"; }
    });
  });
})();
