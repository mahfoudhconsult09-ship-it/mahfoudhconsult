/*
  Renders the store cards on the Work page (and a short list on the Home page).
  Markup: <div id="store-grid" data-src="/data/stores.json" data-limit="6"></div>
  data-limit is optional (show only the first N stores).

  Each card shows: the store's logo (Google's favicon service), the store name,
  the platform, what was worked on, and a link. A preview image from the store's
  own page (Microlink) is added when it loads. If a logo fails, a letter badge
  appears instead. Results are cached in the visitor's browser for 7 days.
*/
(function () {
  "use strict";

  var grid = document.getElementById("store-grid");
  if (!grid) return;

  var SRC = grid.getAttribute("data-src") || "/data/stores.json";
  var LIMIT = parseInt(grid.getAttribute("data-limit"), 10) || 0;
  var CACHE_MS = 7 * 24 * 60 * 60 * 1000;

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return ""; }
  }

  function initials(name) {
    var parts = String(name).split(/\s+/).filter(Boolean);
    return (parts[0] ? parts[0][0] : "?") + (parts[1] ? parts[1][0] : "");
  }

  function cacheGet(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return undefined;
      var item = JSON.parse(raw);
      if (!item || Date.now() - item.t > CACHE_MS) return undefined;
      return item.v;
    } catch (e) { return undefined; }
  }

  function cacheSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value })); } catch (e) {}
  }

  function loadPreview(store, img) {
    var key = "sc:" + hostOf(store.url);
    var cached = cacheGet(key);
    if (cached !== undefined) {
      if (cached) img.src = cached;
      return;
    }
    fetch("https://api.microlink.io/?url=" + encodeURIComponent(store.url))
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (json) {
        var u = json && json.data && json.data.image && json.data.image.url;
        u = typeof u === "string" && /^https:\/\//.test(u) ? u : null;
        cacheSet(key, u);
        if (u) img.src = u;
      })
      .catch(function () {});
  }

  function card(store) {
    var host = hostOf(store.url);
    var article = document.createElement("article");
    article.className = "store-card";

    var preview = document.createElement("div");
    preview.className = "store-preview";
    preview.hidden = true;
    var previewImg = document.createElement("img");
    previewImg.alt = "";
    previewImg.loading = "lazy";
    previewImg.decoding = "async";
    previewImg.addEventListener("load", function () { preview.hidden = false; });
    previewImg.addEventListener("error", function () { preview.hidden = true; });
    preview.appendChild(previewImg);
    article.appendChild(preview);

    var head = document.createElement("div");
    head.className = "store-head";
    var logo = document.createElement("span");
    logo.className = "store-logo";
    var logoImg = document.createElement("img");
    logoImg.alt = "";
    logoImg.width = 40;
    logoImg.height = 40;
    logoImg.src = "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(host) + "&sz=128";
    logoImg.addEventListener("error", function () {
      logo.textContent = initials(store.name);
      logo.className = "store-logo store-logo-fallback";
    });
    logo.appendChild(logoImg);
    head.appendChild(logo);

    var titles = document.createElement("div");
    var name = document.createElement("h3");
    name.className = "store-name";
    name.textContent = store.name;
    var platform = document.createElement("p");
    platform.className = "store-platform";
    platform.textContent = store.platform;
    titles.appendChild(name);
    titles.appendChild(platform);
    head.appendChild(titles);
    article.appendChild(head);

    if (store.worked_on && store.worked_on.length) {
      var label = document.createElement("p");
      label.className = "store-label";
      label.textContent = "What I worked on";
      var list = document.createElement("ul");
      list.className = "store-tags";
      store.worked_on.forEach(function (item) {
        var li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
      article.appendChild(label);
      article.appendChild(list);
    }

    var link = document.createElement("a");
    link.className = "store-link";
    link.href = store.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Visit " + host;
    link.setAttribute("aria-label", "Visit " + store.name + " (opens in a new tab)");
    article.appendChild(link);

    loadPreview(store, previewImg);
    return article;
  }

  fetch(SRC)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var stores = (data && data.stores) || [];
      if (LIMIT) stores = stores.slice(0, LIMIT);
      stores.forEach(function (store) { grid.appendChild(card(store)); });
    })
    .catch(function () {
      grid.textContent = "The store list could not load. Refresh the page to try again.";
    });
})();
