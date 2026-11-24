// Stack Audit: crawls a public site and scores it in six layers.
// POST /api/audit {"url":"https://store.com"}  ->  { score, plates:[{id,label,score,issues:[...]}], ... }
// No API key needed. Optional env PSI_KEY adds Google PageSpeed to the Speed layer.
import dns from "node:dns/promises";
import net from "node:net";

export const config = { path: "/api/audit" };

const MAX_PAGES = 10, TIMEOUT = 8000, MAX_BYTES = 1_500_000;
const UA = "Mozilla/5.0 (compatible; MahfoudhStackAudit/1.0; +https://mahfoudhconsult.netlify.app/audit.html)";
const AI_BOTS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"];
const TRACKERS = {
  "Google Analytics 4": /gtag\(|googletagmanager\.com\/gtag|["']G-[A-Z0-9]{6,}/,
  "Google Tag Manager": /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/,
  "Meta Pixel": /fbevents\.js|fbq\(/,
  "Pinterest Tag": /s\.pinimg\.com\/ct\/core\.js|pintrk\(/,
  "TikTok Pixel": /analytics\.tiktok\.com|ttq\./,
  "Klaviyo": /klaviyo\.com|_learnq/,
  "Google Ads": /AW-[0-9]{6,}|googleadservices/
};
const PLATES = [
  ["content", "Search and content"], ["shopping", "Google Shopping data"], ["trust", "Trust and policies"],
  ["stack", "Marketing stack"], ["ai", "AI readability"], ["speed", "Mobile and speed"]
];

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function privateIp(ip) {
  if (net.isIPv6(ip)) return /^(::1|fc|fd|fe80|::ffff:(10|127|169\.254|192\.168|172\.(1[6-9]|2\d|3[01]))\.)/i.test(ip);
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254) || a >= 224;
}
async function safeUrl(u) {
  const url = new URL(u);
  if (!/^https?:$/.test(url.protocol)) throw new Error("Only http and https addresses can be audited.");
  if (process.env.AUDIT_ALLOW_LOCAL === "1") return url;
  if (net.isIP(url.hostname)) { if (privateIp(url.hostname)) throw new Error("That address is private."); return url; }
  const addrs = await dns.lookup(url.hostname, { all: true });
  if (!addrs.length || addrs.some((a) => privateIp(a.address))) throw new Error("That address is not a public website.");
  return url;
}
async function get(u, tries = 4) {
  let url = await safeUrl(u);
  for (let i = 0; i < tries; i++) {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), TIMEOUT);
    try {
      const r = await fetch(url, { redirect: "manual", signal: ctl.signal, headers: { "user-agent": UA, accept: "text/html,*/*" } });
      if (r.status >= 300 && r.status < 400 && r.headers.get("location")) { url = await safeUrl(new URL(r.headers.get("location"), url).href); continue; }
      const type = r.headers.get("content-type") || "";
      let text = "";
      if (/html|xml|text|json/.test(type)) text = (await r.text()).slice(0, MAX_BYTES);
      return { status: r.status, url: url.href, text, type };
    } catch (e) { return { status: 0, url: url.href, text: "", type: "" }; } finally { clearTimeout(t); }
  }
  return { status: 0, url: url.href, text: "", type: "" };
}

const attr = (tag, name) => { const m = tag.match(new RegExp(name + "\\s*=\\s*(\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i")); return m ? (m[2] ?? m[3] ?? m[4] ?? "") : null; };
const metas = (html) => [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
const metaVal = (ms, key) => { for (const m of ms) { const n = attr(m, "name") || attr(m, "property"); if (n && n.toLowerCase() === key) return attr(m, "content") || ""; } return null; };
function ld(html) {
  const out = [];
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const d = JSON.parse(m[1]); (Array.isArray(d) ? d : d["@graph"] || [d]).forEach((x) => x && out.push(x)); } catch {}
  }
  return out;
}
const typesOf = (d) => [].concat(d["@type"] || []);

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Send a POST with a url." }, 405);
  let body; try { body = await req.json(); } catch { return json({ error: "Invalid request." }, 400); }
  let raw = String(body.url || "").trim();
  if (!raw) return json({ error: "Enter a website address." }, 400);
  if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
  let start;
  try { start = await safeUrl(raw); } catch (e) { return json({ error: e.message || "Invalid address." }, 400); }

  const issues = Object.fromEntries(PLATES.map(([id]) => [id, []]));
  const add = (id, sev, msg, fix, url, pts) => issues[id].push({ sev, msg, fix, url: url || null, pts: sev === "pass" ? 0 : pts });
  const host = start.host;

  // crawl
  const seen = new Set([start.href]), queue = [start.href], pages = [], trackers = new Set(), allUrls = [];
  while (queue.length && pages.length < MAX_PAGES) {
    const u = queue.shift();
    const r = await get(u);
    if (r.status >= 400 || r.status === 0) { if (pages.length === 0) return json({ error: "That site did not respond (status " + r.status + ")." }, 422); add("content", "high", "Page returned status " + r.status, "Fix or redirect this URL.", u, 4); continue; }
    if (!/html/.test(r.type) || !r.text) continue;
    pages.push(r); allUrls.push(r.url);
    for (const [k, rx] of Object.entries(TRACKERS)) if (rx.test(r.text)) trackers.add(k);
    for (const m of r.text.matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#]+)["']/gi)) {
      try {
        const l = new URL(m[1], r.url);
        if (l.host === host && /^https?:$/.test(l.protocol) && !/\.(png|jpe?g|gif|svg|webp|pdf|zip|css|js|xml|ico|woff2?|mp4)(\?|$)/i.test(l.pathname)) {
          l.hash = ""; l.pathname = l.pathname.replace(/index\.html$/, ""); const n = l.href;
          if (!seen.has(n) && seen.size < 60) { seen.add(n); queue.push(n); }
        }
      } catch {}
    }
  }
  const titles = {};
  pages.forEach((p, idx) => {
    const html = p.text, ms = metas(html), home = idx === 0, u = p.url;
    const title = ((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim();
    const desc = (metaVal(ms, "description") || "").trim();
    const h1 = (html.match(/<h1\b/gi) || []).length;
    const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
    const words = html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    (titles[title] = titles[title] || []).push(u);
    if (!title) add("content", "high", "Missing page title", "Add a unique 30-60 character title with the main keyword.", u, 4);
    else if (title.length < 20 || title.length > 70) add("content", "low", "Title is " + title.length + " characters", "Aim for about 30-60.", u, 1);
    if (!desc) add("content", "medium", "Missing meta description", "Write 120-160 characters that earn the click.", u, 2);
    if (h1 !== 1) add("content", "medium", h1 + " H1 headings", "Use exactly one H1 that states the page topic.", u, 2);
    if (!/<link\b[^>]*rel=["']canonical["']/i.test(html)) add("content", "low", "No canonical link", "Add rel=canonical to avoid duplicate-URL issues.", u, 1);
    if (/noindex/i.test(metaVal(ms, "robots") || "")) add("content", "high", "Page is set to noindex", "Remove noindex if this page should rank.", u, 5);
    if (words < 120 && !/cart|checkout|login|account/i.test(u)) add("content", "low", "Thin page (" + words + " words)", "Add useful content or keep utility pages out of the index.", u, 1);
    if (!metaVal(ms, "viewport")) add("speed", "high", "No viewport meta tag", "Add width=device-width so the page works on phones.", u, 5);
    const noDim = imgs.filter((i) => !(attr(i, "width") && attr(i, "height"))).length;
    if (noDim > 3) add("speed", "low", noDim + " images without width and height", "Set dimensions to stop layout shift.", u, 1);
    if (imgs.length > 4 && !imgs.some((i) => /loading\s*=\s*["']?lazy/i.test(i))) add("speed", "low", "No lazy-loaded images", "Add loading=lazy below the fold.", u, 1);
    const noAlt = imgs.filter((i) => attr(i, "alt") === null).length;
    if (noAlt) add("content", "medium", noAlt + " of " + imgs.length + " images have no alt text", "Describe images for search and screen readers.", u, 2);
    if (home && !(metaVal(ms, "og:title") && metaVal(ms, "og:image"))) add("content", "medium", "Missing Open Graph title or image", "Shares and Pinterest pins need og:title and og:image.", u, 2);

    const data = ld(html), types = data.flatMap(typesOf);
    if (home) {
      if (types.some((t) => /Organization|LocalBusiness|Person|Store|WebSite/.test(t))) add("ai", "pass", "Entity data found on home page", "", u);
      else add("ai", "medium", "No Organization, Person or WebSite structured data", "Add JSON-LD so search and AI assistants know who you are.", u, 3);
    }
    if (/<(h2|h3)\b/i.test(html) === false && words > 300) add("ai", "low", "Long page with no subheadings", "Clear H2/H3 structure helps people and AI summarisers.", u, 1);
    for (const d of data.filter((d) => typesOf(d).includes("Product"))) {
      let o = d.offers; o = Array.isArray(o) ? o[0] : o;
      const need = { image: d.image, description: d.description, brand: d.brand, "sku or gtin": d.sku || d.gtin || d.gtin13 || d.gtin14 || d.mpn, price: o && (o.price || o.lowPrice), currency: o && o.priceCurrency, availability: o && o.availability };
      const miss = Object.entries(need).filter(([, v]) => !v).map(([k]) => k);
      if (miss.length) add("shopping", "high", "Product '" + String(d.name || "?").slice(0, 50) + "' lacks " + miss.join(", "), "Merchant Center and rich results need price, currency, availability and identifiers.", u, 3);
      else add("shopping", "pass", "Product '" + String(d.name || "?").slice(0, 50) + "' schema is complete", "", u);
      if (!d.aggregateRating && !d.review) add("shopping", "low", "No genuine ratings in product data", "Add real reviews once you have them. Never invent them.", u, 1);
    }
    if (!home && /product|\/p\//i.test(u) && !types.includes("Product")) add("shopping", "medium", "Product-style URL without Product schema", "Add Product JSON-LD with price and availability.", u, 3);
  });
  for (const [t, us] of Object.entries(titles)) if (t && us.length > 1) add("content", "medium", us.length + " pages share the title '" + t.slice(0, 50) + "'", "Give every page its own title.", us[0], 2);

  // site-level
  const origin = start.origin;
  const [rb, sm, lm] = await Promise.all([get(origin + "/robots.txt"), get(origin + "/sitemap.xml"), get(origin + "/llms.txt")]);
  if (rb.status !== 200) add("content", "medium", "No robots.txt", "Add robots.txt with a Sitemap line.", origin + "/robots.txt", 2);
  else {
    if (!/^sitemap:/im.test(rb.text)) add("content", "low", "robots.txt has no Sitemap line", "Add a Sitemap: line.", null, 1);
    const blocked = AI_BOTS.filter((b) => new RegExp("user-agent:\\s*" + b + "[\\s\\S]*?disallow:\\s*/\\s*(\\n|$)", "i").test(rb.text));
    if (blocked.length) add("ai", "medium", "robots.txt blocks AI crawlers: " + blocked.join(", "), "Allow them if you want AI assistants to cite you.", null, 3);
    else add("ai", "pass", "AI crawlers are not blocked", "");
    if (/user-agent:\s*\*\s*[\r\n]+(?:[^\r\n]*[\r\n]+)*?\s*disallow:\s*\/\s*$/im.test(rb.text)) add("content", "high", "robots.txt may block every crawler", "Check Disallow: / under User-agent: *.", null, 5);
  }
  if (sm.status !== 200 || !/<urlset|<sitemapindex/.test(sm.text)) add("content", "medium", "No valid sitemap.xml", "Generate one and submit it in Google Search Console.", origin + "/sitemap.xml", 2);
  else add("content", "pass", "Sitemap lists " + (sm.text.match(/<loc>/g) || []).length + " URLs", "");
  if (lm.status !== 200) add("ai", "low", "No llms.txt", "Add /llms.txt summarising you and your key pages for AI assistants. It is an emerging convention, not a ranking factor.", null, 1);
  else add("ai", "pass", "llms.txt found", "");
  if (start.protocol !== "https:") add("trust", "high", "Not served over HTTPS", "Enable HTTPS and redirect HTTP.", start.href, 6);

  const low = allUrls.join(" ").toLowerCase();
  const allText = pages.map((p) => p.text.toLowerCase()).join(" ");
  for (const [k, rx, why] of [["shipping", /shipping|delivery/, "Shoppers and Merchant Center expect a shipping policy."], ["return", /return|refund/, "A returns policy is required for Google Shopping."], ["privacy", /privacy/, "A privacy policy builds trust and is often legally required."], ["contact", /contact/, "Give shoppers an obvious way to reach you."]]) {
    if (!rx.test(low) && !new RegExp("href=[\"'][^\"']*" + k, "i").test(allText)) add("trust", "medium", "No " + k + " page found", why, null, 3);
    else add("trust", "pass", k[0].toUpperCase() + k.slice(1) + " page found", "");
  }
  if (!/google-site-verification/.test(allText)) add("stack", "low", "No Search Console verification tag", "Fine if you verified by DNS or file. Otherwise verify in Google Search Console.", null, 1);
  if (!trackers.has("Google Analytics 4") && !trackers.has("Google Tag Manager")) add("stack", "high", "No Google Analytics or Tag Manager", "Install GA4 or GTM so you can measure anything.", null, 5);
  for (const t of ["Pinterest Tag", "Meta Pixel", "Klaviyo"]) if (!trackers.has(t)) add("stack", "low", t + " not detected", "Add it if you run that channel.", null, 2);
  add("stack", "pass", "Detected: " + ([...trackers].join(", ") || "none"), "");

  // optional PageSpeed
  let psi = null;
  if (process.env.PSI_KEY) {
    try {
      const r = await fetch("https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance&url=" + encodeURIComponent(start.href) + "&key=" + process.env.PSI_KEY, { signal: AbortSignal.timeout(25000) });
      const d = await r.json(); psi = Math.round(((d.lighthouseResult || {}).categories || {}).performance?.score * 100);
      if (psi < 50) add("speed", "high", "Google mobile performance score " + psi + "/100", "Compress images, defer scripts and cut third-party tags.", start.href, 10);
      else if (psi < 90) add("speed", "medium", "Google mobile performance score " + psi + "/100", "There is room to improve LCP and blocking time.", start.href, 4);
      else add("speed", "pass", "Google mobile performance score " + psi + "/100", "");
    } catch {}
  }

  const plates = PLATES.map(([id, label]) => {
    const list = issues[id], lost = list.reduce((s, i) => s + i.pts, 0);
    const score = Math.max(0, 100 - Math.min(100, lost * 4));
    return { id, label, score, issues: list.sort((a, b) => ({ high: 0, medium: 1, low: 2, pass: 3 })[a.sev] - ({ high: 0, medium: 1, low: 2, pass: 3 })[b.sev]) };
  });
  const score = Math.round(plates.reduce((s, p) => s + p.score, 0) / plates.length);
  return json({ site: start.href, pages: pages.length, score, psi, plates, at: new Date().toISOString() });
};
