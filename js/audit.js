/* Stack Audit front end. Calls /api/audit (Netlify Function) and draws the result as an exploded stack of plates. */
(function () {
  "use strict";
  var form = document.getElementById("audit-form");
  if (!form) return;
  var input = document.getElementById("audit-url"), statusEl = document.getElementById("audit-status"), out = document.getElementById("audit-results");
  var report = document.getElementById("audit-report"), reportUrl = document.getElementById("audit-report-url");
  var btn = form.querySelector("button[type=submit]"), sampleBtn = document.getElementById("audit-sample");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SAMPLE = { site: "https://example-store.com/", pages: 8, score: 63, sample: true, plates: [
    { id: "content", label: "Search and content", score: 72, issues: [
      { sev: "medium", msg: "3 pages share the title 'Home'", fix: "Give every page its own title.", url: "https://example-store.com/collections" },
      { sev: "medium", msg: "No valid sitemap.xml", fix: "Generate one and submit it in Google Search Console." }, { sev: "pass", msg: "Canonical links present" }] },
    { id: "shopping", label: "Google Shopping data", score: 40, issues: [
      { sev: "high", msg: "Product 'Linen Shirt' lacks sku or gtin, availability", fix: "Merchant Center and rich results need price, currency, availability and identifiers.", url: "https://example-store.com/products/linen-shirt" },
      { sev: "low", msg: "No genuine ratings in product data", fix: "Add real reviews once you have them. Never invent them." }] },
    { id: "trust", label: "Trust and policies", score: 76, issues: [{ sev: "medium", msg: "No return page found", fix: "A returns policy is required for Google Shopping." }, { sev: "pass", msg: "Privacy page found" }] },
    { id: "stack", label: "Marketing stack", score: 60, issues: [{ sev: "low", msg: "Pinterest Tag not detected", fix: "Add it if you run that channel." }, { sev: "low", msg: "Klaviyo not detected", fix: "Add it if you run email." }, { sev: "pass", msg: "Detected: Google Analytics 4, Meta Pixel" }] },
    { id: "ai", label: "AI readability", score: 70, issues: [{ sev: "low", msg: "No llms.txt", fix: "Add /llms.txt summarising you and your key pages." }, { sev: "pass", msg: "AI crawlers are not blocked" }] },
    { id: "speed", label: "Mobile and speed", score: 58, issues: [{ sev: "low", msg: "9 images without width and height", fix: "Set dimensions to stop layout shift." }, { sev: "low", msg: "No lazy-loaded images", fix: "Add loading=lazy below the fold." }] }
  ] };

  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x !== undefined) n.textContent = x; return n; }
  function health(s) { return s >= 80 ? "ok" : s >= 55 ? "warn" : "bad"; }
  function col(s) { return s >= 80 ? "#3358FF" : s >= 55 ? "#E7A33B" : "#F85902"; }
  function norm(v) {
    v = (v || "").trim(); if (!v) return null;
    if (!/^https?:\/\//i.test(v)) v = "https://" + v;
    try { var u = new URL(v); return u.hostname.indexOf(".") > 0 ? u.href : null; } catch (e) { return null; }
  }

  function draw(d) {
    out.textContent = ""; out.hidden = false;
    var top = el("div", "res-top");
    var left = el("div");
    left.appendChild(el("div", "mono", d.sample ? "Sample result, not a real site" : "Result for " + d.site.replace(/^https?:\/\//, "")));
    var sc = el("div", "score", String(d.score)); sc.appendChild(el("small", "", "/100")); left.appendChild(sc);
    left.appendChild(el("p", "note", d.pages + " page" + (d.pages === 1 ? "" : "s") + " checked across six layers. Plates that are blue are healthy, amber needs work, orange needs fixing first."));
    var scene = el("div", "scene"), stack = el("div", "stack");
    
    d.plates.forEach(function (p, i) {
      var pl = el("div", "plate"); pl.style.setProperty("--i", i); pl.style.borderColor = col(p.score);
      pl.appendChild(el("span", "drop"));
      var t = el("span", "tag", p.label.split(" ")[0] + " " + p.score); t.style.color = col(p.score); t.style.borderColor = col(p.score); pl.appendChild(t);
      var tears = p.issues.filter(function (x) { return x.sev === "high"; }).length;
      var svg = '<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="' + col(p.score) + '" stroke-width="1.6" fill="none" opacity=".7"><rect x="14" y="18" width="72" height="14" rx="3"/><rect x="14" y="40" width="34" height="34" rx="3"/><rect x="54" y="40" width="32" height="14" rx="3"/><rect x="54" y="60" width="32" height="14" rx="3"/>' + (tears ? '<path d="M10 90L90 10" stroke="#0A0F1C" stroke-width="2.2"/>' : "") + "</g></svg>";
      pl.insertAdjacentHTML("beforeend", svg);
      stack.appendChild(pl);
    });
    scene.appendChild(stack); top.appendChild(left); top.appendChild(scene); out.appendChild(top);
    // animate explode
    var t0 = null;
    function step(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1400); stack.style.setProperty("--p", (1 - Math.pow(1 - k, 3)).toFixed(3)); if (k < 1) requestAnimationFrame(step); }
    if (reduce) stack.style.setProperty("--p", 0.6); else requestAnimationFrame(step);

    var list = el("div", "plist");
    d.plates.slice().sort(function (a, b) { return a.score - b.score; }).forEach(function (p, idx) {
      var det = el("details", "pl " + health(p.score)); if (idx < 2) det.open = true;
      var sm = el("summary"); sm.appendChild(el("span", "dot")); sm.appendChild(el("span", "", p.label)); sm.appendChild(el("span", "sc", String(p.score))); det.appendChild(sm);
      var ul = el("ul");
      p.issues.forEach(function (i) {
        var li = el("li", i.sev); li.appendChild(el("b", "", (i.sev === "pass" ? "Good: " : "") + i.msg));
        if (i.fix) li.appendChild(el("small", "", i.fix));
        if (i.url) li.appendChild(el("small", "u", i.url));
        ul.appendChild(li);
      });
      if (!p.issues.length) ul.appendChild(el("li", "", "Nothing to flag in this layer."));
      det.appendChild(ul); list.appendChild(det);
    });
    out.appendChild(list);
    if (report && !d.sample) { reportUrl.value = d.site; report.hidden = false; }
    out.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var url = norm(input.value);
    if (!url) { statusEl.textContent = "Enter a full website address, like yourstore.com."; input.focus(); return; }
    btn.disabled = true; statusEl.textContent = "Crawling your site and scoring six layers. This takes 10 to 30 seconds."; out.hidden = true;
    var ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 55000);
    fetch("/api/audit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: url }), signal: ctl.signal })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) { if (!x.ok) throw new Error(x.j.error || "The audit failed."); statusEl.textContent = ""; draw(x.j); })
      .catch(function (err) { statusEl.textContent = err.name === "AbortError" ? "That took too long. Try again, or message me and I will run it by hand." : (err.message === "Failed to fetch" || /JSON/.test(err.message) ? "The audit service is not reachable here. Message me on WhatsApp and I will run it for you." : err.message); })
      .then(function () { clearTimeout(to); btn.disabled = false; });
  });
  if (sampleBtn) sampleBtn.addEventListener("click", function () { statusEl.textContent = ""; draw(SAMPLE); });
})();
