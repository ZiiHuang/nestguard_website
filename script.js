// ====== 1) PUT YOUR PUBLISHED-TO-WEB CSV URL HERE ======
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_PjUqCiPI1Flsam7e2NrsXLCDLWxhBUKjyl-phYBZlCQ8OcHDozdxuKcBxotrMyb1G8hXiuihJtDb/pub?output=csv";

// ====== 2) Robust CSV parser that handles quoted commas and quotes ======
function parseCSVRobust(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const nxt = text[i + 1];

    if (inQuotes) {
      if (c === '"' && nxt === '"') { // escaped quote
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(cur);
        cur = "";
      } else if (c === '\r') {
        // ignore
      } else if (c === '\n') {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      } else {
        cur += c;
      }
    }
  }
  // last cell
  if (cur.length > 0 || text.endsWith(",")) {
    row.push(cur);
  }
  // last row
  if (row.length) rows.push(row);

  // map to objects with headers
  const [headers, ...data] = rows;
  return data.map(cols => {
    const o = {};
    headers.forEach((h, i) => (o[h.trim()] = (cols[i] ?? "").trim()));
    return o;
  });
}

// ====== 3) Card factory ======
function makePropertyCard(row) {
  const images = (row.images || "")
    .split("|")
    .map(s => s.trim())
    .filter(Boolean);

  const beds  = row.beds  ? `${row.beds} bed`   : "";
  const baths = row.baths ? `${row.baths} bath` : "";
  const sqft  = row.sqft  ? `${row.sqft} sqft`  : "";
  const details = [beds, baths, sqft].filter(Boolean).join(" · ");

  const article = document.createElement("article");
  article.className = "property_card";
  article.setAttribute("data-link", row.link || "");
  article.setAttribute("data-images", JSON.stringify(images));

  // ---- Carousel (with placeholder if no images) ----
  const carousel = document.createElement("div");
  carousel.className = "carousel";

  const prevBtn = document.createElement("button");
  prevBtn.className = "nav prev";
  prevBtn.setAttribute("aria-label", "Previous image");
  prevBtn.textContent = "‹";

  const imgEl = document.createElement("img");
  imgEl.className = "carousel_img";
  imgEl.alt = row.title || "Property photo";
  imgEl.src = images[0] || "images/placeholder.jpg"; // <-- add a placeholder image file

  const nextBtn = document.createElement("button");
  nextBtn.className = "nav next";
  nextBtn.setAttribute("aria-label", "Next image");
  nextBtn.textContent = "›";

  carousel.appendChild(prevBtn);
  carousel.appendChild(imgEl);
  carousel.appendChild(nextBtn);

  // Hide arrows if there are 0 or 1 images
  if (images.length <= 1) {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
  }

  // ---- Info ----
  const info = document.createElement("div");
  info.className = "prop_info";

  const h3 = document.createElement("h3");
  h3.textContent = row.title || "(No title)";

  const p1 = document.createElement("p");
  p1.textContent = details;

  const p2 = document.createElement("p");
  p2.className = "price";
  p2.textContent = row.price ? `$${row.price} / month` : "";

  info.appendChild(h3);
  info.appendChild(p1);
  info.appendChild(p2);

  article.appendChild(carousel);
  article.appendChild(info);

  // ---- Interactions (same behavior you had) ----
  let index = 0;
  function show(i) {
    if (!images.length) return;
    index = (i + images.length) % images.length;
    imgEl.src = images[index];
  }
  prevBtn.addEventListener("click", (e) => { e.stopPropagation(); show(index - 1); });
  nextBtn.addEventListener("click", (e) => { e.stopPropagation(); show(index + 1); });

  const link = row.link || "";
  article.addEventListener("click", (e) => {
    if (e.target.classList.contains("nav")) return;
    if (link) window.open(link, "_blank");
  });

  return article;
}

// ====== 4) Load & render ======
async function loadProperties() {
  console.log("Fetching:", SHEET_CSV_URL);

  const grid = document.getElementById("rentals_grid");
  if (!grid) return;

  try {
    const res = await fetch(SHEET_CSV_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csv = await res.text();
    const rows = parseCSVRobust(csv);

    // Expecting headers: id, active, title, beds, baths, sqft, price, link, images
    const activeRows = rows.filter(r => String(r.active || "").toLowerCase() === "true");

    grid.innerHTML = "";
    activeRows.forEach(row => grid.appendChild(makePropertyCard(row)));
  } catch (err) {
    console.error("Failed to load properties:", err);
    grid.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = "We couldn’t load the current rentals. Please try again later.";
    grid.appendChild(p);
  }
}

document.addEventListener("DOMContentLoaded", loadProperties);
