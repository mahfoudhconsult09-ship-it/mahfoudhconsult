/* Free site assistant. Runs fully in the browser: no server, no API, no cost.
   Matches the visitor's question to answers written from this site's content.
   Optional: read answers aloud (browser speech), speak a question (browser speech recognition),
   and a button that starts the Fish Audio voice agent only when clicked. */
(function () {
  "use strict";
  var FISH_ID = "d8d34547fdb741098e5a4843835acee9";
  var WA = "https://wa.me/qr/I7T7C37PKJVEA1";
  var KB = [
    { k: ["who", "about you", "yourself", "introduce", "age", "old", "student", "school", "university", "abuja"], a: "I'm Mahfoudh Musa, 18, an AI software engineer and growth builder in Abuja, Nigeria. I study Computer Science at Yakubu Gowon University of Abuja (year 2). I build AI-powered tools, then set up the marketing that gets them found.", l: [["About me", "about.html"]] },
    { k: ["built", "build", "product", "products", "project", "projects", "shipped", "portfolio", "made", "work"], a: "I've built six products, five live: SEOM (product search and store audit), TrackFlow (order tracking over WhatsApp), PhotoFlow (lead tracker for photographers), PolyLean (prediction-market odds vs forecasts), Qur'an Daily, and ChooseWise (still being built).", l: [["See all work", "work.html"]] },
    { k: ["seom", "search products", "discover"], a: "SEOM lets shoppers search products across countries (Nigeria, Kenya, Ghana, South Africa, the UK, the US, Canada, Australia) and see what's in stock and ships to them. Store owners can paste a link for a free e-commerce and SEO audit.", l: [["Open SEOM", "https://mseom.netlify.app"]] },
    { k: ["trackflow", "tracking", "order", "orders", "delivery"], a: "TrackFlow is order tracking for small online stores. You create an order, send the customer a tracking link on WhatsApp, and move it from new to delivered. It works with your own rider or any courier.", l: [["Open TrackFlow", "https://mtrackflow.netlify.app"]] },
    { k: ["photoflow", "photographer", "photographers", "lead", "leads", "booking"], a: "PhotoFlow is a lead tracker for photographers. Each inquiry moves from new to booked (or lost), and a daily list shows who to follow up with.", l: [["Open PhotoFlow", "https://mphotoflow.netlify.app"]] },
    { k: ["polylean", "polymarket", "prediction", "odds", "forecast"], a: "PolyLean compares live Polymarket odds with independent forecasts and suggests Yes, No or Skip, only when the chance is high and the price is favorable. It's information only, not financial advice.", l: [["Open PolyLean", "https://polyleanc.netlify.app"]] },
    { k: ["quran", "qur'an", "koran", "surah", "recitation", "reciter", "islam"], a: "Qur'an Daily lets you read all 114 surahs in Uthmani script and listen to recitation while you read. Reciters can apply and get reviewed before publishing. I built it end to end on Floot.", l: [["Open Qur'an Daily", "https://quran-daily.floot.app"]] },
    { k: ["choosewise", "decision", "decide"], a: "ChooseWise is a decision helper for everyday choices. It's pre-launch and I'm testing it on real decisions before I announce it.", l: [] },
    { k: ["service", "services", "offer", "help", "marketing", "growth", "do you do"], a: "I offer eight things: Pinterest marketing, Google Shopping, SEO and Search Console, Klaviyo email, multi-channel strategy, AI agents and automation, websites and stores, and graphics and video.", l: [["See the services", "services.html"]] },
    { k: ["pinterest", "pins", "pin"], a: "For Pinterest I set up the product catalog and feed, the Pinterest Tag plus Conversions API for proper attribution, and keyword-rich pin and board creative. Pinterest reports 28% higher ROAS with brand keywords in titles. That's their benchmark, not my result.", l: [["Growth services", "services.html"]] },
    { k: ["shopping", "merchant", "feed", "gtin", "google ads", "performance max"], a: "For Google Shopping I clean up your Merchant Center feed (title order, GTINs, price and stock accuracy), fix disapprovals, then run Shopping and Performance Max campaigns once the feed is clean. Google reports about 20% more clicks on average with GTINs. That's Google's benchmark, not my result.", l: [["Growth services", "services.html"]] },
    { k: ["seo", "search console", "ranking", "rank", "google search", "traffic"], a: "For SEO I fix the technical basics (sitemap, canonicals, speed, structured data), write product and collection copy for search, and review Search Console with you monthly in plain language. I don't promise rankings.", l: [["Run the free audit", "audit.html"]] },
    { k: ["klaviyo", "email", "emails", "flows", "newsletter"], a: "I build Klaviyo welcome, abandoned-cart and post-purchase flows, plus segments and campaigns tied to real purchase data. I have 1 to 2 years of hands-on Klaviyo experience.", l: [["Growth services", "services.html"]] },
    { k: ["ai", "agent", "agents", "automation", "chatbot", "machine learning", "ml", "voice"], a: "I build AI tools that do one job well: assistants like this one, audit and research crawlers, and automations around orders and leads. I'm also studying machine learning next to my degree so future tools can learn from data.", l: [["Growth and AI", "services.html"]] },
    { k: ["website", "web", "design", "shopify", "wordpress", "store build", "site"], a: "I build fast, mobile-first sites and stores on Shopify, WordPress or hand-coded HTML, CSS and JavaScript, with clean structure for search and an accessible plain version.", l: [["See my work", "work.html"]] },
    { k: ["video", "graphics", "canva", "creative", "edit", "editing"], a: "I make ad creatives and product graphics (in Canva) and short video edits for social and ads. I'm a beginner in motion design and improving with every project.", l: [] },
    { k: ["audit", "check my site", "score", "analyse", "analyze", "scan"], a: "The free Stack Audit crawls up to ten pages of your site and scores six layers: search and content, Google Shopping data, trust and policies, marketing stack, AI readability, and mobile speed. The weakest layer comes first, with the fix.", l: [["Run the audit", "audit.html"]] },
    { k: ["store", "stores", "client", "clients", "experience", "worked"], a: "I've worked on 11 online stores across Shopify, WooCommerce, Wix, BigCommerce and Ecwid, on marketing, conversion and design updates.", l: [["See the stores", "work.html"]] },
    { k: ["price", "cost", "rate", "rates", "pay", "charge", "quote", "budget", "how much", "fee"], a: "Pricing depends on the scope, so I don't list fixed prices. I run the audit first, then give you a clear quote for the work that matters most.", l: [["Book a call", "contact.html"]] },
    { k: ["contact", "hire", "book", "call", "email", "whatsapp", "reach", "message", "talk", "available"], a: "The fastest way is WhatsApp. You can also use the contact form or email mahfoudhdigital006@gmail.com. Tell me what you're building or selling, and a link helps.", l: [["Chat on WhatsApp", WA], ["Contact form", "contact.html"]] },
    { k: ["invest", "investor", "backing", "back", "partner", "partnership", "funding"], a: "I'm early and open about it. I've shipped six products, I build the product and the marketing that finds its customers, and I label each project as live or building. If you want to back or partner on something, use the contact form and pick 'Backing or partnering'.", l: [["Contact", "contact.html"]] },
    { k: ["where", "location", "based", "nigeria", "country", "remote"], a: "I'm based in Abuja, Nigeria, and I work with clients anywhere.", l: [] }
  ];
  var CHIPS = ["What have you built?", "What marketing do you do?", "How does the audit work?", "How can I hire you?"];
  var FALLBACK = "I can answer questions about my products, my marketing services, the free audit, pricing, or how to reach me. Try one of the buttons, or message me on WhatsApp for anything else.";

  var root = document.getElementById("assistant");
  if (!root) return;
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x !== undefined) n.textContent = x; return n; }
  var open = false, speak = false, fishOn = false;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  var btn = el("button", "as-btn", "Ask me anything"); btn.type = "button"; btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "as-panel");
  var panel = el("div", "as-panel"); panel.id = "as-panel"; panel.hidden = true; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Ask Mahfoudh's assistant");
  var head = el("div", "as-head"); head.appendChild(el("b", "", "Ask about my work"));
  var close = el("button", "as-x", "Close"); close.type = "button"; head.appendChild(close);
  var log = el("div", "as-log"); log.setAttribute("aria-live", "polite");
  var chips = el("div", "as-chips");
  var form = el("form", "as-form"); var inp = el("input"); inp.type = "text"; inp.placeholder = "Type a question"; inp.setAttribute("aria-label", "Your question"); inp.autocomplete = "off";
  var send = el("button", "as-send", "Ask"); send.type = "submit"; form.appendChild(inp);
  if (SR) { var mic = el("button", "as-mic", "Speak"); mic.type = "button"; mic.setAttribute("aria-label", "Speak your question"); form.appendChild(mic); }
  form.appendChild(send);
  var tools = el("div", "as-tools");
  var spk = el("button", "as-link", "Read answers aloud: off"); spk.type = "button";
  var fish = el("button", "as-link", "Talk to my AI voice agent"); fish.type = "button";
  tools.appendChild(spk); tools.appendChild(fish);
  panel.appendChild(head); panel.appendChild(log); panel.appendChild(chips); panel.appendChild(form); panel.appendChild(tools);
  root.appendChild(panel); root.appendChild(btn);

  function say(who, text, links) {
    var m = el("div", "as-msg " + who); m.appendChild(el("p", "", text));
    if (links && links.length) { var r = el("div", "as-links"); links.forEach(function (l) { var a = el("a", "", l[0]); a.href = l[1]; if (/^http/.test(l[1])) { a.target = "_blank"; a.rel = "noopener noreferrer"; } r.appendChild(a); }); m.appendChild(r); }
    log.appendChild(m); log.scrollTop = log.scrollHeight;
  }
  function answer(q) {
    var t = " " + q.toLowerCase().replace(/[^a-z0-9' ]/g, " ") + " ", best = null, bs = 0;
    KB.forEach(function (e) {
      var s = 0; e.k.forEach(function (k) { if (t.indexOf(" " + k + " ") > -1 || (k.length > 4 && t.indexOf(k) > -1)) s += k.indexOf(" ") > -1 ? 2 : 1; });
      if (s > bs) { bs = s; best = e; }
    });
    return best || { a: FALLBACK, l: [["WhatsApp", WA]] };
  }
  function ask(q) {
    q = (q || "").trim(); if (!q) return;
    say("me", q); var r = answer(q); say("bot", r.a, r.l);
    if (speak && window.speechSynthesis) { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(r.a); u.lang = "en-US"; speechSynthesis.speak(u); }
    inp.value = "";
  }
  CHIPS.forEach(function (c) { var b = el("button", "as-chip", c); b.type = "button"; b.addEventListener("click", function () { ask(c); }); chips.appendChild(b); });
  form.addEventListener("submit", function (e) { e.preventDefault(); ask(inp.value); });
  function toggle(v) {
    open = v; panel.hidden = !v; btn.setAttribute("aria-expanded", v ? "true" : "false"); btn.hidden = v;
    if (v) { if (!log.children.length) say("bot", "Hi, I'm Mahfoudh's site assistant. Ask about my products, marketing services, the free audit, or how to hire me.", []); inp.focus(); }
    else btn.focus();
  }
  btn.addEventListener("click", function () { toggle(true); });
  close.addEventListener("click", function () { toggle(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) toggle(false); });
  spk.addEventListener("click", function () { speak = !speak; spk.textContent = "Read answers aloud: " + (speak ? "on" : "off"); if (!speak && window.speechSynthesis) speechSynthesis.cancel(); if (speak && !window.speechSynthesis) { say("bot", "Your browser can't read aloud.", []); } });
  if (SR) {
    mic.addEventListener("click", function () {
      var rec = new SR(); rec.lang = "en-US"; rec.interimResults = false; mic.textContent = "Listening...";
      rec.onresult = function (e) { ask(e.results[0][0].transcript); };
      rec.onend = function () { mic.textContent = "Speak"; }; rec.onerror = function () { mic.textContent = "Speak"; say("bot", "I couldn't hear that. Try typing instead.", []); };
      try { rec.start(); } catch (e) { mic.textContent = "Speak"; }
    });
  }
  fish.addEventListener("click", function () {
    if (fishOn) return; fishOn = true; fish.textContent = "Starting voice agent...";
    var w = document.createElement("fish-agent"); w.setAttribute("agent-id", FISH_ID); w.setAttribute("position", "bottom-left"); document.body.appendChild(w);
    var s = document.createElement("script"); s.src = "https://unpkg.com/@fishaudio/agent-widget-embed"; s.async = true;
    s.onload = function () { fish.textContent = "Voice agent ready (bottom-left corner)"; toggle(false); };
    s.onerror = function () { fish.textContent = "Voice agent unavailable right now"; fishOn = false; };
    document.body.appendChild(s);
  });
})();
