/*
  Free store audit, built on Google's PageSpeed Insights API (v5).

  Markup this script expects on the Audit page (the ids matter):
    <form id="audit-form" novalidate>
      <input id="audit-url" type="text" inputmode="url" autocomplete="url" required>
      <button type="submit">Run the free audit</button>
    </form>
    <p id="audit-status" role="status" aria-live="polite"></p>
    <div id="audit-results" hidden></div>
  Optional, shown after a scan so the visitor can ask for the full report:
    <div id="audit-report" hidden> ...form with <input type="hidden" id="audit-report-url" name="store-url"> </div>
*/
(function () {
  "use strict";

  // Paste your Google API key between the quotes. In Google Cloud, restrict it
  // to your site's address (HTTP referrers) and to the PageSpeed Insights API.
  var API_KEY = "PASTE_YOUR_KEY_HERE";

  var ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  var TIMEOUT_MS = 90000;
  var CATEGORIES = [
    { id: "performance", label: "Speed" },
    { id: "seo", label: "SEO basics" },
    { id: "accessibility", label: "Accessibility" },
    { id: "best-practices", label: "Best practices" }
  ];
  var METRICS = [
    ["first-contentful-paint", "First Contentful Paint"],
    ["largest-contentful-paint", "Largest Contentful Paint"],
    ["total-blocking-time", "Total Blocking Time"],
    ["cumulative-layout-shift", "Layout shift"],
    ["speed-index", "Speed Index"]
  ];

  var form = document.getElementById("audit-form");
  if (!form) return;
  var input = document.getElementById("audit-url");
  var statusEl = document.getElementById("audit-status");
  var resultsEl = document.getElementById("audit-results");
  var reportEl = document.getElementById("audit-report");
  var reportUrlEl = document.getElementById("audit-report-url");
  var button = form.querySelector("button[type=submit]");

  function setStatus(message) { statusEl.textContent = message || ""; }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function normalise(raw) {
    var value = (raw || "").trim();
    if (!value) return null;
    if (!/^https?:\/\//i.test(value)) value = "https://" + value;
    try {
      var u = new URL(value);
      if (u.hostname.indexOf(".") === -1) return null;
      return u.href;
    } catch (e) {
      return null;
    }
  }

  function levelFor(score) {
    if (score === null) return "unknown";
    if (score >= 90) return "good";
    if (score >= 50) return "ok";
    return "poor";
  }

  function scoreBox(value, label, level) {
    var box = el("div", "audit-score");
    box.setAttribute("data-level", level);
    box.appendChild(el("span", "audit-score-value", value));
    box.appendChild(el("span", "audit-score-label", label));
    return box;
  }

  function render(json, targetUrl) {
    var lh = json && json.lighthouseResult;
    if (!lh || !lh.categories) throw new Error("no-lighthouse");

    resultsEl.textContent = "";
    var finalUrl = lh.finalUrl || targetUrl;
    var https = /^https:\/\//i.test(finalUrl);

    resultsEl.appendChild(el("p", "audit-summary", "Results for " + finalUrl + " (mobile)"));

    var scores = el("div", "audit-scores");
    CATEGORIES.forEach(function (c) {
      var cat = lh.categories[c.id];
      var raw = cat && typeof cat.score === "number" ? Math.round(cat.score * 100) : null;
      scores.appendChild(scoreBox(raw === null ? "-" : String(raw), c.label, levelFor(raw)));
    });
    scores.appendChild(scoreBox(https ? "Yes" : "No", "Secure (HTTPS)", https ? "good" : "poor"));
    resultsEl.appendChild(scores);

    var metrics = el("ul", "audit-metrics");
    METRICS.forEach(function (m) {
      var a = lh.audits && lh.audits[m[0]];
      if (a && a.displayValue) {
        var li = el("li");
        li.appendChild(el("span", "audit-metric-name", m[1]));
        li.appendChild(el("span", "audit-metric-value", a.displayValue));
        metrics.appendChild(li);
      }
    });
    if (metrics.children.length) resultsEl.appendChild(metrics);

    var issues = [];
    Object.keys(lh.audits || {}).forEach(function (key) {
      var a = lh.audits[key];
      if (a && typeof a.score === "number" && a.score < 0.5 &&
          (a.scoreDisplayMode === "binary" || a.scoreDisplayMode === "numeric")) {
        issues.push(a);
      }
    });
    issues.sort(function (x, y) { return x.score - y.score; });
    if (issues.length) {
      resultsEl.appendChild(el("h3", "audit-issues-title", "Biggest things to look at"));
      var list = el("ul", "audit-issues");
      issues.slice(0, 5).forEach(function (a) { list.appendChild(el("li", "", a.title)); });
      resultsEl.appendChild(list);
    }

    resultsEl.hidden = false;
    if (reportUrlEl) reportUrlEl.value = finalUrl;
    if (reportEl) reportEl.hidden = false;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var target = normalise(input.value);
    if (!target) {
      setStatus("Enter your store address, for example yourstore.com");
      input.focus();
      return;
    }

    var url = new URL(ENDPOINT);
    url.searchParams.set("url", target);
    url.searchParams.set("strategy", "mobile");
    CATEGORIES.forEach(function (c) { url.searchParams.append("category", c.id); });
    if (API_KEY && API_KEY.indexOf("PASTE") !== 0) url.searchParams.set("key", API_KEY);

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
    button.disabled = true;
    resultsEl.hidden = true;
    if (reportEl) reportEl.hidden = true;
    setStatus("Scanning your store. This can take up to a minute.");

    fetch(url.toString(), { signal: controller.signal })
      .then(function (res) {
        if (!res.ok) {
          var err = new Error("http");
          err.status = res.status;
          throw err;
        }
        return res.json();
      })
      .then(function (json) {
        render(json, target);
        setStatus("Scan finished.");
      })
      .catch(function (err) {
        if (err && err.name === "AbortError") setStatus("The scan took too long. Try again in a moment.");
        else if (err && err.status === 400) setStatus("Google could not read that address. Check the link and try again.");
        else if (err && err.status === 429) setStatus("Too many scans right now. Try again in a minute.");
        else setStatus("The scan did not work this time. Try again, or message me and I will run it for you.");
      })
      .then(function () {
        clearTimeout(timer);
        button.disabled = false;
      });
  });
})();
