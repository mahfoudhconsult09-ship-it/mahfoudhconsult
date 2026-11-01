/*
  Renders real client quotes and sales-proof screenshots from /data/testimonials.json.
  Markup:
    <section id="proof-section" hidden>
      <div id="testimonial-list"></div>
      <div id="proof-gallery"></div>
    </section>
  If both lists are empty the section stays hidden.

  testimonials item: { "quote": "...", "name": "...", "store": "...", "url": "https://..." }
  proof_images item: { "src": "/assets/proof/proof-1.png", "alt": "what the screenshot shows" }
*/
(function () {
  "use strict";

  var section = document.getElementById("proof-section");
  if (!section) return;
  var listEl = document.getElementById("testimonial-list");
  var galleryEl = document.getElementById("proof-gallery");

  fetch(section.getAttribute("data-src") || "/data/testimonials.json")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var quotes = (data && data.testimonials) || [];
      var images = (data && data.proof_images) || [];
      var lim = parseInt(section.getAttribute("data-limit"), 10);
      if (lim) quotes = quotes.slice(0, lim);
      if (!quotes.length && !images.length) return;

      quotes.forEach(function (t) {
        if (!t.quote) return;
        var fig = document.createElement("figure");
        fig.className = "testimonial";
        var bq = document.createElement("blockquote");
        bq.textContent = t.quote;
        var cap = document.createElement("figcaption");
        cap.textContent = [t.name, t.store].filter(Boolean).join(", ");
        fig.appendChild(bq);
        fig.appendChild(cap);
        listEl.appendChild(fig);
      });

      images.forEach(function (p) {
        if (!p.src) return;
        var a = document.createElement("a");
        a.href = p.src;
        a.target = "_blank";
        a.rel = "noopener";
        var img = document.createElement("img");
        img.src = p.src;
        img.alt = p.alt || "Client result screenshot";
        img.loading = "lazy";
        a.appendChild(img);
        galleryEl.appendChild(a);
      });

      if (images.length && data.proof_note) {
        var note = document.createElement("p");
        note.className = "proof-note";
        note.textContent = data.proof_note;
        galleryEl.parentNode.insertBefore(note, galleryEl.nextSibling);
      }

      section.hidden = false;
    })
    .catch(function () {});
})();
