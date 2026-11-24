// Generates every page. Run: node tools/build.mjs   (output goes next to this tools folder)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://mahfoudhconsult.netlify.app";
const EMAIL = "mahfoudhdigital006@gmail.com";
const WA = "https://wa.me/qr/I7T7C37PKJVEA1";
const FISH = "d8d34547fdb741098e5a4843835acee9";
const stores = JSON.parse(fs.readFileSync(path.join(ROOT, "data/stores.json"), "utf8"));
const testi = JSON.parse(fs.readFileSync(path.join(ROOT, "data/testimonials.json"), "utf8"));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const logo = `<svg viewBox="0 0 34 34" aria-hidden="true" focusable="false"><path d="M17 3l14 6-14 6L3 9z" fill="#3358FF"/><path d="M3 15l14 6 14-6" fill="none" stroke="#0A0F1C" stroke-width="2.4" stroke-linejoin="round"/><path d="M3 21l14 6 14-6" fill="none" stroke="#F85902" stroke-width="2.4" stroke-linejoin="round"/></svg>`;

/* plate artwork: simple line drawings, one per layer */
const art = {
  interface: `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#3358FF" stroke-width="1.8"><rect x="10" y="16" width="80" height="62" rx="6"/><path d="M10 30h80"/><circle cx="19" cy="23" r="2"/><circle cx="27" cy="23" r="2"/><rect x="18" y="38" width="36" height="8" rx="2"/><rect x="18" y="52" width="24" height="18" rx="2"/><rect x="48" y="52" width="34" height="18" rx="2"/></g></svg>`,
  products: `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#3358FF" stroke-width="1.8"><rect x="12" y="14" width="34" height="34" rx="5"/><rect x="54" y="14" width="34" height="34" rx="5"/><rect x="12" y="54" width="34" height="34" rx="5"/><rect x="54" y="54" width="34" height="34" rx="5"/></g><path d="M62 70l8 8 12-16" fill="none" stroke="#F85902" stroke-width="3" stroke-linecap="round"/></svg>`,
  agents: `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#3358FF" stroke-width="1.8"><path d="M20 50L50 22L80 50L50 78Z"/><path d="M20 50h60M50 22v56"/></g><g fill="#fff" stroke="#3358FF" stroke-width="1.8"><circle cx="20" cy="50" r="6"/><circle cx="80" cy="50" r="6"/><circle cx="50" cy="22" r="6"/><circle cx="50" cy="78" r="6"/></g><circle cx="50" cy="50" r="8" fill="#F85902"/></svg>`,
  growth: `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#3358FF" stroke-width="1.8"><rect x="14" y="56" width="14" height="28" rx="2"/><rect x="36" y="44" width="14" height="40" rx="2"/><rect x="58" y="30" width="14" height="54" rx="2"/></g><path d="M12 48L40 34 62 20 88 12" fill="none" stroke="#F85902" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};
const LAYERS = [
  ["interface", "Interface", "the part people judge in a blink", ["Fast, mobile-first sites and stores on Shopify, WordPress or hand-coded HTML, CSS and JavaScript", "Scroll and 3D experiences like this site. Every page here is a layer, built without a framework", "Accessible by default, with a plain version for anyone who prefers less motion"]],
  ["products", "Products", "one painfully specific problem each", ["Six built so far, five live, from order tracking to a Qur'an app", "Shipped end to end: database, sign-in, publishing, then changed after real use", "Each one is a working link you can open right now"]],
  ["agents", "Agents and AI", "tools that do a job, not a demo", ["A voice assistant lives on this site. Open it and ask it about my work", "PolyLean turns live market odds into Yes, No or Skip. My audit crawler reads a store and scores it", "Studying machine learning next to my degree, so the next tools learn from data"]],
  ["growth", "Growth", "so the product actually gets found", ["Pinterest catalog, tag and Conversions API. Google Merchant Center feeds with proper identifiers", "Search Console reviews, technical SEO, Klaviyo flows that run while you sleep", "Tracking installed first, so every channel can be measured from day one"]]
];
function stackHtml(n = 4, chips = false) {
  const keys = ["interface", "products", "agents", "growth"], tags = ["Interface", "Products", "Agents", "Growth"];
  let h = `<div class="stack"><i class="beam b1"></i><i class="beam b2"></i><i class="beam b3"></i><i class="beam b4"></i>`;
  for (let i = 0; i < n; i++) h += `<div class="plate${i === n - 1 ? " hot" : ""}" style="--i:${i}"><span class="drop"></span>${art[keys[i % 4]]}<span class="tag">${tags[i % 4]}</span></div>`;
  h += `</div>`;
  if (chips) h += ["Pinterest feed", "Merchant Center", "Voice agent", "Search Console", "Klaviyo flow"].map((c, i) => `<span class="chip3d c${i + 1}"><i></i>${c}</span>`).join("");
  return h;
}
const NAV = [["work.html", "Work"], ["services.html", "Growth"], ["audit.html", "Audit"], ["about.html", "About"], ["contact.html", "Contact"]];

function head(file, title, desc, extra = "") {
  const url = SITE + "/" + (file === "index.html" ? "" : file);
  const full = title === "Mahfoudh Musa" ? "Mahfoudh Musa | AI software engineer and growth builder in Abuja" : title + " | Mahfoudh Musa";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Mahfoudh Musa">
<meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#EDF0F6">
<link rel="icon" type="image/png" sizes="32x32" href="assets/logo/favicon-32.png">
<link rel="apple-touch-icon" href="assets/logo/apple-touch-icon.png">
<link rel="preload" href="fonts/bricolage-grotesque-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/instrument-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<script>(function(){var d=document.documentElement;d.classList.add("js");if(!matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("motion")})()</script>
<link rel="stylesheet" href="css/site.css">
${extra}</head>`;
}
function header(file) {
  const links = NAV.map(([h, t]) => `<a href="${h}"${h === file ? ' aria-current="page"' : ""}>${t}</a>`).join("");
  const mlinks = NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join("");
  return `<body>
<a class="skip" href="#main">Skip to content</a>
<div class="floor" aria-hidden="true"></div>
<header class="top">
  <div class="wrap row">
    <a class="brand" href="index.html" aria-label="Mahfoudh Musa, home">${logo}<span>Mahfoudh Musa</span></a>
    <nav class="nav" aria-label="Main">${links}</nav>
    <a class="btn sm" href="contact.html">Book a call</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mpanel">Menu</button>
  </div>
  <div class="wrap"><nav class="mpanel" id="mpanel" aria-label="Mobile">${mlinks}<a href="${WA}" target="_blank" rel="noopener noreferrer">WhatsApp</a></nav></div>
  <div class="progress" aria-hidden="true"><i id="progress-bar"></i></div>
</header>
<main id="main">`;
}
function footer(scripts = "") {
  return `</main>
<footer><div class="wrap">
  <div class="fcols">
    <div><a class="brand" href="index.html">${logo}<span>Mahfoudh Musa</span></a><p style="margin-top:12px;color:var(--mute);max-width:36ch">AI software engineer and growth builder in Abuja, Nigeria.</p></div>
    <div><h2>Pages</h2><ul>${NAV.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></div>
    <div><h2>Layers</h2><ul><li><a href="work.html">Products</a></li><li><a href="services.html#agents">Agents and AI</a></li><li><a href="services.html#growth">Growth</a></li><li><a href="audit.html">Free audit</a></li></ul></div>
    <div><h2>Contact</h2><ul><li><a href="mailto:${EMAIL}">${EMAIL}</a></li><li><a href="${WA}" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></li><li>Abuja, Nigeria</li></ul></div>
  </div>
  <div class="fbot"><span>&copy; 2026 Mahfoudh Musa</span><span><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></span></div>
</div></footer>
<script src="js/site.js" defer></script>
<div id="assistant"></div>
<script src="js/assistant.js" defer></script>
${scripts}
</body>
</html>
`;
}
const phead = (kick, h1, lead) => `<section class="phead"><div class="wrap">
  <div class="hero-copy"><span class="mono">${kick}</span><h1 style="font-size:clamp(2.2rem,6vw,4.2rem)">${h1}</h1><p class="lead" style="color:var(--mute);font-size:1.15rem;max-width:56ch">${lead}</p></div>
  <div class="scene" data-stack aria-hidden="true">${stackHtml(4)}</div>
</div></section>`;
const cta = (h = "Got a product that isn't getting found?", p = "Send me the link. I'll run the audit, read what it says, and tell you the first things I'd fix. No pitch deck.") => `<section class="blk"><div class="wrap plane"><div class="cta-band"><h2>${h}</h2><p>${p}</p><div class="cta-row"><a class="btn" href="contact.html">Book a project fit call</a><a class="btn ghost" style="color:#fff;box-shadow:inset 0 0 0 1.5px #fff" href="${WA}" target="_blank" rel="noopener noreferrer">WhatsApp me</a></div></div></div></section>`;

/* ---------- projects ---------- */
const NSTORES = stores.stores.length, NPLAT = stores.platforms.length;
const PRODUCTS = [
  { n: "SEOM", s: "LIVE", u: "https://mseom.netlify.app", d: "Search for products across countries and see at a glance what is in stock and what ships to you. Store owners can paste their link and get a free e-commerce and SEO audit.", x: ["Country filter: Nigeria, Kenya, Ghana, South Africa, the UK, the US, Canada, Australia", "Discovers public store and product pages automatically", "Audit covers discoverability, trust signals, mobile UX and SEO basics"], p: "Good stores are hard to find, and shoppers can't tell what actually ships to them." },
  { n: "TrackFlow", s: "LIVE", u: "https://mtrackflow.netlify.app", d: "Order tracking for small online stores. Create an order, send the customer a tracking link on WhatsApp, and move it through new, preparing, out for delivery and delivered.", x: ["One tap sends the link on WhatsApp", "Works with your own rider or any courier, nothing to integrate", "One dashboard for every order's status"], p: "Small sellers run delivery through chat threads and answer \"where is my order?\" all day." },
  { n: "PhotoFlow", s: "LIVE", u: "https://mphotoflow.netlify.app", d: "A lead tracker for photographers. Every inquiry moves through a pipeline until it becomes a booking, and the dashboard tells you who to follow up with today.", x: ["Stages: new, contacted, quote sent, follow-up, booked, lost", "Tracks session type, event date, estimated value and lead source", "A daily \"follow up today\" list"], p: "Bookings slip away when a follow-up is forgotten." },
  { n: "PolyLean", s: "LIVE", u: "https://polyleanc.netlify.app", d: "Puts live Polymarket odds next to independent forecasts, then suggests Yes, No or Skip. It only recommends an action when the chance is high and the price is favorable.", x: ["You set the minimum chance before it suggests anything", "Shows the sources behind each forecast", "Keeps its own scorecard, and an optional bankroll input to size stakes"], p: "Prediction-market prices are easy to read and hard to judge. Information only, not financial advice." },
  { n: "Qur'an Daily", s: "LIVE", u: "https://quran-daily.floot.app", d: "A calm place for the Qur'an. Read all 114 surahs in Uthmani script, listen to recitation that plays while you read, and follow verified reciters.", x: ["Multiple Qira'at and Riwayat, adjustable text size", "Reciters apply, submit a trial recitation, and are reviewed before publishing", "Accounts, uploads, supporter tools. Built end to end on Floot"], p: "Reading, listening and reciter publishing usually live in separate apps." },
  { n: "ChooseWise", s: "BUILDING", u: "", d: "A decision helper for everyday choices, made for the general public. I'm testing it with real decisions before I announce it.", x: ["Status: pre-launch", "Next: a public release and a write-up of what testing taught me"], p: "Everyday decisions with too many options and too little structure." }
];
const productCard = (x) => `<article class="card tilt"><h3>${esc(x.n)} <span class="badge${x.s === "BUILDING" ? " build" : ""}">${x.s}</span></h3><p>${esc(x.d)}</p><ul class="det">${x.x.map((i) => `<li>${esc(i)}</li>`).join("")}</ul><p class="meta"><b>The problem:</b> ${esc(x.p)}</p>${x.u ? `<a class="go" href="${x.u}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(x.n)}">Open ${esc(x.n)} &rarr;</a>` : ""}</article>`;

const pages = {};

/* ---------- home ---------- */
pages["index.html"] = head("index.html", "Mahfoudh Musa", `Mahfoudh Musa, 18, builds AI products and the Pinterest, Google Shopping, SEO and email systems that get them found. Six products built, ${NSTORES} online stores worked on. Abuja, Nigeria.`) +
  `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: "Mahfoudh Musa", jobTitle: "AI software engineer and growth builder", address: { "@type": "PostalAddress", addressLocality: "Abuja", addressCountry: "NG" }, url: SITE, email: EMAIL, alumniOf: "Yakubu Gowon University of Abuja" })}</script>\n` +
  header("index.html") + `
<section class="hero"><div class="wrap">
  <div class="hero-copy">
    <span class="mono">AI software engineer · Abuja, Nigeria · 18</span>
    <h1>Most products don't fail. They just <em>never get found.</em></h1>
    <p class="lead">I build AI-powered tools, then wire up the Pinterest, Google Shopping, SEO and email systems that put them in front of buyers. Six products built. ${NSTORES} online stores worked on. One question on every project: who will actually find this?</p>
    <div class="cta-row"><a class="btn" href="work.html">See what I've shipped</a><a class="btn ghost" href="audit.html">Audit your own site</a></div>
  </div>
  <div class="scene hero-scene" data-stack aria-hidden="true">${stackHtml(4, true)}</div>
</div></section>

<section class="blk" style="padding-top:0"><div class="wrap plane"><div class="facts">
  <div><b>6</b><span>products built, 5 live today</span></div><div><b>${NSTORES}</b><span>online stores marketed or redesigned</span></div><div><b>${NPLAT}</b><span>platforms: ${stores.platforms.join(", ")}</span></div><div><b>1</b><span>degree in progress: B.Sc Computer Science, year 2</span></div>
</div></div></section>

<section class="blk" id="shipped"><div class="wrap">
  <div class="head plane"><span class="mono">Shipped</span><h2>Six things I built because I kept seeing the same problem.</h2><p>Each one is live or close to it. Open them, use them, tell me what breaks. That is how they get better.</p></div>
  <div class="grid plane">${PRODUCTS.map(productCard).join("")}</div>
  <p style="margin-top:22px"><a class="btn ghost" href="work.html">See the ${NSTORES} stores I've worked on</a></p>
</div></section>

<section class="lay" id="layers" aria-labelledby="lay-h">
  <div class="wrap"><div class="lay-stick">
    <div>
      <div class="head" style="margin-bottom:22px"><span class="mono">How it fits together</span><h2 id="lay-h">A product is a stack. Most people only build one layer.</h2></div>
      <div class="lay-panels">${LAYERS.map(([k, t, h, li], i) => `<div class="lay-panel${i === 0 ? " on" : ""}"><span class="lay-count">LAYER ${i + 1} OF 4</span><h3>${t}: ${h}</h3><ul>${li.map((x) => `<li>${x}</li>`).join("")}</ul></div>`).join("")}</div>
    </div>
    <div class="scene" data-nostack aria-hidden="true">${stackHtml(4)}</div>
  </div></div>
</section>

<section class="blk"><div class="wrap">
  <div class="head plane"><span class="mono">How I work</span><h2>Three rules I don't break.</h2></div>
  <div class="cols3 plane">
    <div class="principle"><h3>Measure before building</h3><p>I start from your real data: Search Console, your store analytics, an audit of the site. Opinions come second.</p></div>
    <div class="principle"><h3>Ship small, learn from use</h3><p>A first version goes live fast. Then real people break it, and I fix what they actually hit.</p></div>
    <div class="principle"><h3>Show my sources</h3><p>When I quote a number from Google or Pinterest, I label it as their benchmark, never as my result.</p></div>
  </div>
</div></section>

<section class="blk"><div class="wrap two">
  <div class="plane"><span class="mono">Free tool</span><h2 style="margin:12px 0 16px">What would a crawler say about your store?</h2><p style="color:var(--mute);max-width:52ch;margin-bottom:22px">Stores quietly lose traffic on small things: a returns page Google expects, product data Shopping can't read, a tag nobody installed. Paste your address and I crawl up to ten pages and score six layers. You see the weakest plate first, with the fix.</p><a class="btn" href="audit.html">Audit my site</a></div>
  <div class="plane"><span class="mono">Building right now</span><ul class="log" style="margin-top:16px">
    <li><b>ChooseWise</b><span>A decision helper for everyday choices. Pre-launch, being tested on real decisions.</span></li>
    <li><b>Prediction tools</b><span>Growing PolyLean into a fuller way to read markets and judge forecasts.</span></li>
    <li><b>Machine learning</b><span>Studying it next to my degree, so the next tools learn from data instead of rules.</span></li></ul></div>
</div></section>
` + cta() + footer();

/* ---------- work ---------- */
const storeChips = stores.stores.map((s) => `<a class="chip" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" title="${esc(s.platform)}">${esc(s.name)}</a>`).join("");
const worked = [...new Set(stores.stores.flatMap((s) => s.worked_on || []))];
const proofHtml = (testi.testimonials || []).length ? `<section class="blk"><div class="wrap plane"><div class="head"><span class="mono">In their words</span><h2>What store owners said.</h2></div><div class="testi">${testi.testimonials.map((t) => `<figure class="testimonial"><blockquote>${esc(t.quote)}</blockquote><figcaption>${esc([t.name, t.store].filter(Boolean).join(", "))}</figcaption></figure>`).join("")}</div>${(testi.proof_images || []).length ? `<div class="proofs">${testi.proof_images.map((p) => `<a href="${p.src}" target="_blank" rel="noopener"><img src="${p.src}" alt="${esc(p.alt || "Client result screenshot")}" loading="lazy" decoding="async"${p.w ? ` width="${p.w}" height="${p.h}"` : ""}></a>`).join("")}</div>${testi.proof_note ? `<p class="proof-note">${esc(testi.proof_note)}</p>` : ""}` : ""}</div></section>` : "";
pages["work.html"] = head("work.html", "Work", `Six products built from scratch and ${NSTORES} online stores worked on across ${NPLAT} platforms, with what each one does and why it exists.`) + header("work.html") +
  phead("Work", "Six products. " + NSTORES + " stores. Here's the proof.", "Every product below is a link you can open. Every store is a real business I worked on. Nothing here is a mockup.") + `
<section class="blk"><div class="wrap">
  <div class="head plane"><span class="mono">My products</span><h2>Built from scratch, from the problem up.</h2><p>For each one: what it does, the details that make it different, and the problem that made me build it.</p></div>
  <div class="grid plane">${PRODUCTS.map(productCard).join("")}</div>
</div></section>
<section class="blk"><div class="wrap plane">
  <div class="head"><span class="mono">Client stores</span><h2>${NSTORES} stores I've worked on for other people.</h2><p>Across ${stores.platforms.join(", ")}. On these stores I worked on ${worked.map((w) => w.toLowerCase()).join(", ")}. Hover a name to see its platform. Store names and logos belong to their owners.</p></div>
  <div class="chips">${storeChips}</div>
</div></section>
${proofHtml}` + cta() + footer();

/* ---------- growth / services ---------- */
const SVC = [
  ["Pinterest marketing", "People use Pinterest to plan what to buy, so your products can be found before they ever search on Google.", ["Catalog and product feed setup", "Pinterest Tag plus Conversions API, so sales are attributed properly", "Pin and board creative with keyword-rich titles"], "an approved feed, working tracking and a pin plan you can run.", "Pinterest reports 28% higher ROAS with brand keywords in titles, and 23.7% more attributed conversions with Tag plus Conversions API. Their benchmark, not my result."],
  ["Google Shopping", "Shopping ads and free listings only show products whose data Google can read and trust.", ["Merchant Center feed cleanup: title order, GTINs, price and stock accuracy", "Fix diagnostics and disapprovals", "Shopping and Performance Max campaigns once the feed is clean"], "a feed Google accepts and campaigns you can read.", "Google reports about 20% more clicks on average when products have GTINs. Their benchmark, not my result."],
  ["SEO and Search Console", "Search Console tells you exactly what Google sees: impressions, clicks, position, and what it can't crawl.", ["Technical fixes: sitemap, canonicals, speed, structured data", "Product and collection page copy written for search and for people", "A monthly Search Console review in plain language"], "a ranked fix list, then monthly proof of what moved.", ""],
  ["Email with Klaviyo", "Email is the one channel you own. Flows keep earning while you do other work.", ["Welcome, abandoned-cart and post-purchase flows", "Segments and campaigns tied to real purchase data", "1 to 2 years of hands-on Klaviyo experience"], "flows that run on their own and a clear read on revenue per recipient.", ""],
  ["Multi-channel strategy", "Pinterest, Google, email and content should feed each other, not compete.", ["Tracking installed first so every channel can be measured", "One plan that shows which channel earns what", "Monthly review against your own dashboards"], "a single plan instead of five disconnected tactics.", ""],
  ["AI agents and automation", "The repetitive work in a store is the easiest thing to hand to software.", ["Voice and chat assistants, like the one on this site", "Audit and research crawlers that read sites and report", "Small automations around orders, leads and reports"], "a tool that does one job reliably, with a link you can open.", ""],
  ["Websites and stores", "A fast, clear site is what every other channel sends people to.", ["Shopify, WordPress or hand-coded HTML, CSS and JavaScript", "Mobile-first, accessible, clean structure for search", "Scroll and 3D design when it helps tell the story"], "a site you can edit yourself and that loads fast on a phone.", ""],
  ["Graphics and video", "Ads and posts need creative that matches the offer.", ["Ad creatives and product graphics (I work in Canva)", "Short video edits for social and ads", "Beginner in motion design, improving with every project"], "ready-to-post assets sized for each channel.", ""]
];
pages["services.html"] = head("services.html", "Growth and AI", "Pinterest marketing, Google Shopping feeds, SEO and Search Console, Klaviyo email, multi-channel strategy, AI agents and web builds, with what you get from each.") + header("services.html") +
  phead("Growth and AI", "Get found. Get chosen. Get remembered.", "Eight services, each with what I actually do and what you walk away with. I show results from your own accounts and never promise rankings or sales.") + `
<section class="blk" id="growth"><div class="wrap">
  <div class="head plane"><span class="mono">What I do</span><h2>Eight services. One goal: your product gets found and bought.</h2></div>
  <div class="grid plane">${SVC.map(([t, why, li, get, bench], i) => `<article class="card tilt" id="${i === 5 ? "agents" : "s" + i}"><h3>${t}</h3><p class="why">${why}</p><ul class="det">${li.map((x) => `<li>${x}</li>`).join("")}</ul><p class="get"><b>You get:</b> ${get}</p>${bench ? `<p class="note">${bench}</p>` : ""}</article>`).join("")}</div>
</div></section>
<section class="blk"><div class="wrap plane two">
  <div><span class="mono">How a project runs</span><h2 style="margin:12px 0 0">Measure first. Then build.</h2></div>
  <ol class="steps"><li><b>Audit</b><span>I run the stack audit on your site and read your accounts, so we start from facts.</span></li><li><b>Plan</b><span>A short list of the fixes that matter most, in plain language.</span></li><li><b>Build</b><span>I ship in small steps you can see and approve.</span></li><li><b>Review</b><span>We check the numbers in your own dashboards, not in a slide deck.</span></li></ol>
</div></section>` + cta() + footer();

/* ---------- audit ---------- */
pages["audit.html"] = head("audit.html", "Free Stack Audit", "Paste your store address and get a six-layer audit: search, Google Shopping data, trust, marketing tags, AI readability and speed.") + header("audit.html") +
  `<section class="phead"><div class="wrap">
  <div class="hero-copy"><span class="mono">Free tool</span><h1 style="font-size:clamp(2.2rem,6vw,4.2rem)">See your site as a stack.</h1><p class="lead" style="color:var(--mute);font-size:1.15rem;max-width:56ch">Paste a store or site address. I crawl up to ten pages and score six layers. Weakest plates come first.</p>
  <form id="audit-form" class="audit-form" novalidate><input id="audit-url" type="text" inputmode="url" autocomplete="url" placeholder="yourstore.com" aria-label="Website address" required><button class="btn" type="submit">Run the audit</button></form>
  <p id="audit-status" role="status" aria-live="polite"></p><p><button type="button" id="audit-sample" class="chip" style="cursor:pointer">See a sample result</button></p></div>
  <div class="scene" data-stack aria-hidden="true">${stackHtml(4)}</div>
</div></section>
<section class="blk"><div class="wrap">
  <div id="audit-results" hidden></div>
  <div id="audit-report" hidden class="plane" style="margin-top:40px"><div class="head"><h2>Want the full report?</h2><p>Leave your email and I'll send a plain-language fix list.</p></div>
    <form class="form" name="audit-report" method="POST" action="/thanks.html" data-netlify="true" netlify-honeypot="bot-field"><input type="hidden" name="form-name" value="audit-report"><p class="hp"><label>Leave empty <input name="bot-field"></label></p>
    <input type="hidden" id="audit-report-url" name="site-url"><div class="field"><label for="ar-email">Email</label><input id="ar-email" type="email" name="email" autocomplete="email" required></div><button class="btn" type="submit">Send me the report</button></form></div>
  <div class="two plane" style="margin-top:56px"><div><span class="mono">What it checks</span><h2 style="margin-top:12px">Six layers.</h2></div>
  <ul class="log"><li><b>Search and content</b><span>Titles, descriptions, headings, sitemap, robots, alt text.</span></li><li><b>Google Shopping data</b><span>Product schema: price, currency, availability, identifiers.</span></li><li><b>Trust and policies</b><span>Shipping, returns, privacy, contact, HTTPS.</span></li><li><b>Marketing stack</b><span>Analytics, Pinterest Tag, Meta Pixel, Klaviyo, Search Console.</span></li><li><b>AI readability</b><span>Structured data, llms.txt, whether AI crawlers are blocked.</span></li><li><b>Mobile and speed</b><span>Viewport, image sizes, lazy loading, optional Google score.</span></li></ul></div>
  <p class="note" style="margin-top:30px">It reads public pages only and reports what it measures. It is a starting point, not a full review.</p>
</div></section>` + footer(`<script src="js/audit.js" defer></script>\n`);

/* ---------- about ---------- */
pages["about.html"] = head("about.html", "About", "Mahfoudh Musa, 18, studies computer science in Abuja. He has built six products and worked on online stores, and is going deeper into AI and machine learning.") + header("about.html") +
  phead("About", "Learning by shipping.", "I'm 18, in the second year of a Computer Science degree in Abuja. I'd rather build something real than study it from a distance.") + `
<section class="blk"><div class="wrap two">
  <div class="plane prose"><h2 style="margin-top:0">The short story</h2>
    <p>I study Computer Science at Yakubu Gowon University of Abuja. Alongside my degree I build tools people can use, and I run marketing for online stores.</p>
    <p>Almost every product I've built began as something I kept watching go wrong: sellers losing track of orders, photographers forgetting follow-ups, shoppers unable to find stores that ship to them. I build a first version, put it live, and fix what real use shows me.</p>
    <p>Marketing taught me the other half. A good product with no traffic is invisible, so I learned Pinterest, Google Shopping, Search Console and Klaviyo by working on real stores.</p>
    <p>Now I'm going deeper into AI and machine learning, because the best tools I can build are ones that learn from data.</p></div>
  <div class="plane"><span class="mono">Toolbox</span><div class="chips" style="margin-top:14px">${["HTML", "CSS", "JavaScript", "WordPress", "Shopify", "AI agents", "SEO", "Search Console", "Google Shopping", "Pinterest", "Klaviyo", "Video editing", "Canva"].map((t) => `<span class="chip">${t}</span>`).join("")}</div>
  <p style="margin-top:24px;color:var(--mute)">Based in Abuja, Nigeria. I work with clients anywhere.</p></div>
</div></section>
<section class="blk"><div class="wrap">
  <div class="head plane"><span class="mono">The case for backing me</span><h2>Early, and honest about it.</h2><p>I'm young and I say so. Here is what you can check for yourself.</p></div>
  <div class="cols3 plane">
    <div class="principle"><h3>I ship</h3><p>Six products built, five live. Each is a link you can open today, not a slide.</p></div>
    <div class="principle"><h3>I build and I sell</h3><p>I work both sides: the product, and the Pinterest, Google, SEO and email systems that find its customers. ${NSTORES} stores worked on.</p></div>
    <div class="principle"><h3>I'm open about the stage</h3><p>PolyLean, ChooseWise and the rest are early. I label each as live or building, and say what's next.</p></div>
    <div class="principle"><h3>I keep learning</h3><p>Machine learning alongside my degree, new tools every project, and Qur'an Daily taught me full-stack work on a platform I'd never used.</p></div>
  </div>
</div></section>
<section class="blk"><div class="wrap plane two"><div><span class="mono">Right now</span><h2 style="margin:12px 0 0">What I'm building and learning.</h2></div>
  <ul class="log"><li><b>ChooseWise</b><span>A decision helper for everyday choices. Pre-launch.</span></li><li><b>Prediction tools</b><span>Growing PolyLean.</span></li><li><b>Machine learning</b><span>Studying alongside my degree.</span></li><li><b>My Fiverr offers</b><span>Redesigning my gigs and studying top e-commerce sellers.</span></li></ul></div></section>` + cta() + footer();

/* ---------- contact ---------- */
pages["contact.html"] = head("contact.html", "Contact", "Book a project fit call with Mahfoudh Musa in Abuja, or message on WhatsApp or email. Tell him what you're building or selling.") + header("contact.html") +
  phead("Contact", "Book a project fit call.", "Tell me what you're building or selling. I'll look at your site and reply with an honest view of where I can help, and where I can't.") + `
<section class="blk"><div class="wrap two">
  <form class="form plane" name="contact" method="POST" action="/thanks.html" data-netlify="true" netlify-honeypot="bot-field"><input type="hidden" name="form-name" value="contact"><p class="hp"><label>Leave empty <input name="bot-field"></label></p>
    <div class="field"><label for="name">Your name</label><input id="name" name="name" autocomplete="name" required></div>
    <div class="field"><label for="email">Email</label><input id="email" type="email" name="email" autocomplete="email" required></div>
    <div class="field"><label for="link">Website or store link (optional, but it helps me help you)</label><input id="link" name="link" inputmode="url"></div>
    <div class="field"><label for="topic">What do you need?</label><select id="topic" name="topic"><option>Pinterest marketing</option><option>Google Shopping</option><option>SEO and Search Console</option><option>Email with Klaviyo</option><option>AI agent or automation</option><option>Website or store build</option><option>Backing or partnering on a product</option><option>Something else</option></select></div>
    <div class="field"><label for="message">What are you trying to achieve?</label><textarea id="message" name="message" required></textarea></div>
    <button class="btn" type="submit">Send message</button></form>
  <div class="plane prose"><h2 style="margin-top:0">What happens next</h2>
    <ol class="steps"><li><b>You send the details</b><span>A link to your site or idea is enough.</span></li><li><b>I audit it</b><span>I run my stack audit and look at what it finds.</span></li><li><b>I reply with the first fixes</b><span>Plain language, no pitch deck, and a clear yes or no on whether I'm the right person.</span></li></ol>
    <p><a class="btn" href="${WA}" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></p>
    <p>Email: <a class="tlink" href="mailto:${EMAIL}">${EMAIL}</a> <button type="button" id="copy-email" data-copy="${EMAIL}" class="chip" style="cursor:pointer">Copy</button></p>
    <p>Location: Abuja, Nigeria</p></div>
</div></section>` + footer();

/* ---------- thanks, 404, legal ---------- */
pages["thanks.html"] = head("thanks.html", "Thank you", "Your message was sent.", '<meta name="robots" content="noindex">\n') + header("thanks.html") +
  `<section class="blk"><div class="wrap"><div class="head"><span class="mono">Sent</span><h1 style="font-size:clamp(2.2rem,6vw,4rem)">Thank you. I'll be in touch.</h1><p>If it's urgent, message me on WhatsApp.</p></div><div class="cta-row"><a class="btn" href="index.html">Back home</a><a class="btn ghost" href="${WA}" target="_blank" rel="noopener noreferrer">WhatsApp</a></div></div></section>` + footer();
pages["404.html"] = head("404.html", "Page not found", "That page is not here.", '<meta name="robots" content="noindex">\n') + header("404.html") +
  `<section class="blk"><div class="wrap"><div class="head"><span class="mono">404</span><h1 style="font-size:clamp(2.2rem,6vw,4rem)">That layer doesn't exist.</h1><p>The page may have moved. Start from the top.</p></div><div class="cta-row"><a class="btn" href="index.html">Home</a><a class="btn ghost" href="work.html">Work</a></div></div></section>` + footer();
const legal = (file, title, body) => head(file, title, title + " for mahfoudhconsult.netlify.app.") + header(file) + `<section class="blk"><div class="wrap"><div class="head"><h1 style="font-size:clamp(2.2rem,6vw,4rem)">${title}</h1></div><span class="draft">Draft: review before relying on this</span><div class="prose">${body}</div></div></section>` + footer();
pages["privacy.html"] = legal("privacy.html", "Privacy", `<p>This page explains what happens to the information you give this site. I'm Mahfoudh Musa. Reach me at <a class="tlink" href="mailto:${EMAIL}">${EMAIL}</a>.</p><h2>Forms</h2><p>The contact form collects your name, email, an optional website link and your message. The audit report form collects your email and the site you audited. I use this only to reply to you. Netlify processes form submissions.</p><h2>The free audit</h2><p>The site address you enter is sent to my audit service, which fetches your public pages, robots.txt, sitemap and llms.txt to score them. I do not store the result. If a Google PageSpeed key is configured, the address is also sent to Google's PageSpeed service.</p><h2>Third-party services</h2><ul><li>The voice assistant is provided by Fish Audio. It loads only after you first interact with the page. If you use it, your voice is processed by that service.</li><li>Fonts are hosted on this site.</li></ul><p>These services may set their own cookies or collect technical data such as your IP address.</p><h2>Your choices</h2><p>Write to me and I will delete a message you sent. You can choose not to use the forms, the audit or the voice assistant.</p>`);
pages["terms.html"] = legal("terms.html", "Terms", `<p>By using this site you agree to the points below. Questions: <a class="tlink" href="mailto:${EMAIL}">${EMAIL}</a>.</p><h2>What this site is</h2><p>The portfolio of Mahfoudh Musa, an AI software engineer and growth builder. It describes my work and projects. It is not an offer or a contract. Any work is agreed with you directly before it starts.</p><h2>The free audit</h2><p>The audit reads public pages and reports what it measures. Results can change between runs, and they are a starting point, not a full review. I can't promise it will work every time. Nothing here is financial advice, including PolyLean.</p><h2>Stores and screenshots</h2><p>Store names, logos and links belong to their owners. Results vary by store.</p><h2>Links to other sites</h2><p>This site links to other sites and loads some third-party services. I'm not responsible for their content or data practices.</p><h2>Changes</h2><p>I may update these terms. The version on this page is the current one.</p>`);

for (const [f, html] of Object.entries(pages)) fs.writeFileSync(path.join(ROOT, f), html);
const urls = ["index.html", "work.html", "services.html", "audit.html", "about.html", "contact.html", "privacy.html", "terms.html"];
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}/${u === "index.html" ? "" : u}</loc></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, "llms.txt"), `# Mahfoudh Musa\n> AI software engineer and growth builder in Abuja, Nigeria. Builds AI products and runs Pinterest, Google Shopping, SEO and Klaviyo marketing for online stores.\n\n- [Work](${SITE}/work.html): products and client stores\n- [Growth and AI](${SITE}/services.html): services\n- [Free audit](${SITE}/audit.html): six-layer site audit\n- [Contact](${SITE}/contact.html)\n`);
console.log("built", Object.keys(pages).length, "pages");
