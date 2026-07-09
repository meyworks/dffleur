(function () {
  const SHEET_BASE = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTB4bIAWk0Bfn3sf8bkSZJMykqjJ0B_lu_d_0Ys0t3ZUCmkRVH4bSkHOTRbu_938q5lgAmF4EqKDSa/pub";
  const SHEETS = {
    offers: { name: "Offers", gid: "1626770873" },
    categories: { name: "MenuCategories", gid: "1954761004" },
    menu: { name: "MenuItems", gid: "884715003" },
    contact: { name: "Contact", gid: "1353808229" }
  };

  const fallback = {
    offers: [
      { Title: "Grand Opening", Description: "Our grand opening was announced for April 12th. Visit DF FLEUR for a premium cafe and restaurant experience.", Type: "News", StartDate: "2026-04-12", Status: "Active" },
      { Title: "Something Brewing", Description: "DF FLEUR introduces a new spot with good vibes, coffee, food, and a refined dining mood.", Type: "News", Status: "Active" },
      { Title: "A New Dining Experience Begins", Description: "A premium restaurant and cafe concept built around warm hospitality, comfort, and elegant food presentation.", Type: "News", Status: "Active" },
      { Title: "Coffee Mood", Description: "Every cup tells a story. Enjoy the DF FLEUR coffee atmosphere with premium hot and cold beverages.", Type: "Offer", Status: "Active" }
    ],
    categories: ["Beverages", "Breakfast", "Cold Drinks", "Desserts", "Hot Drinks", "Main Courses", "Offers", "Oriental", "Pasta", "Salads", "Sandwiches", "Soups"],
    menu: [
      { Category: "Soups", Name: "Cream of Chicken Soup", Description: "Creamy chicken soup served with a toasted bread slice.", Price: "100", Status: "Available" },
      { Category: "Salads", Name: "Greek Salad", Description: "Fresh lettuce, feta cheese, olives, onion, tomato, and herbs.", Price: "150", Status: "Available" },
      { Category: "Main Courses", Name: "Sizzling Beef", Description: "A sizzling beef platter served with vegetables and fries.", Price: "200", Status: "Available" },
      { Category: "Sandwiches", Name: "Chicken Burger", Description: "Crispy chicken burger served with fries.", Price: "250", Status: "Available" },
      { Category: "Pasta", Name: "Creamy Alfredo Pasta", Description: "Oven-baked creamy Alfredo pasta.", Status: "Available" },
      { Category: "Pasta", Name: "Pasta Bechamel", Description: "Classic baked pasta with bechamel sauce.", Status: "Available" },
      { Category: "Oriental", Name: "Oriental Casseroles", Description: "Baked oriental casserole served hot in clay pot style.", Status: "Available" },
      { Category: "Oriental", Name: "Stuffed Grape Leaves", Description: "Stuffed grape leaves with a rich house-style sauce.", Status: "Available" },
      { Category: "Beverages", Name: "Sophisticated Coffee Mood", Description: "Premium coffee beverage served in DF FLEUR style.", Status: "Available" },
      { Category: "Beverages", Name: "Oreo Crunch Milkshake", Description: "Creamy Oreo milkshake topped with whipped cream and cookies.", Status: "Available" },
      { Category: "Beverages", Name: "Chocolate Frappe", Description: "Luxury chocolate drink served with whipped cream.", Status: "Available" }
    ],
    contact: {
      Name: "DF Fleur Restaurant & Cafe",
      WhatsApp: "201040009755",
      Phone: "01040009755",
      Address: "24 Mohamed Farid Street, El Nozha / Heliopolis, Cairo",
      OpeningHours: "Daily 9:30 AM to 2:00 AM",
      MapUrl: "https://maps.app.goo.gl/7VynE7MCGKN9WkDS9",
      FacebookUrl: "https://www.facebook.com/Df.FLEUR.Cafe/",
      InstagramUrl: "https://www.instagram.com/df.fleur.cafe/"
    }
  };

  const page = document.body.dataset.page;
  const imageFallback = "assets/images/main.jpg";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    initNav();
    if (page === "home") renderHome();
    if (page === "news") renderOffersPage();
    if (page === "contact") renderContactPage();
    if (page === "menu") renderMenuPage();
  }

  function initNav() {
    const header = document.querySelector("[data-header]");
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");

    window.addEventListener("scroll", () => {
      header && header.classList.toggle("scrolled", window.scrollY > 24);
    });

    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  async function loadSheet(key) {
    const sheet = SHEETS[key];
    const endpoints = [
      `${SHEET_BASE}?output=csv&gid=${sheet.gid}`,
      `${SHEET_BASE}?single=true&output=csv&gid=${sheet.gid}`,
      `${SHEET_BASE}?output=csv&sheet=${encodeURIComponent(sheet.name)}`
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) continue;
        const text = await response.text();
        const rows = parseCsv(text).filter((row) => Object.values(row).some(Boolean));
        if (rows.length) return { rows, live: true };
      } catch (error) {
        console.warn(`DF FLEUR sheet load failed for ${key}`, error);
      }
    }
    return { rows: Array.isArray(fallback[key]) ? fallback[key] : [fallback[key]], live: false };
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];

      if (char === '"' && quoted && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        row.push(cell);
        cell = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") index += 1;
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    if (cell || row.length) {
      row.push(cell);
      rows.push(row);
    }

    const headers = (rows.shift() || []).map((header) => clean(header));
    return rows.map((cells) => headers.reduce((item, header, index) => {
      item[header] = clean(cells[index] || "");
      return item;
    }, {}));
  }

  function clean(value) {
    return String(value || "").trim();
  }

  function field(item, names) {
    const keys = Array.isArray(names) ? names : [names];
    const found = keys.find((key) => item[key] !== undefined && item[key] !== "");
    return found ? item[found] : "";
  }

  function isActive(item, statusNames, activeWords) {
    const status = field(item, statusNames).toLowerCase();
    return !status || activeWords.some((word) => status.includes(word));
  }

  async function renderHome() {
    const holder = document.querySelector("[data-home-offers]");
    if (!holder) return;
    const { rows } = await loadSheet("offers");
    holder.innerHTML = rows.filter((item) => isActive(item, ["Status"], ["active"]))
      .slice(0, 3)
      .map((item) => `
        <a class="preview-item" href="news.html">
          <strong>${escapeHtml(field(item, ["Title", "Name"]))}</strong>
          <p>${escapeHtml(field(item, ["Description", "Details"]))}</p>
        </a>
      `).join("");
  }

  async function renderOffersPage() {
    const list = document.querySelector("[data-offers-list]");
    const status = document.querySelector('[data-status="offers"]');
    const filterRow = document.querySelector("[data-offer-filters]");
    if (!list) return;

    const loaded = await loadSheet("offers");
    const offers = loaded.rows.filter((item) => isActive(item, ["Status"], ["active"]));
    let filter = "all";

    function paint() {
      const visible = offers.filter((item) => filter === "all" || field(item, ["Type"]).toLowerCase() === filter);
      list.innerHTML = visible.map(newsCard).join("");
      if (status) status.textContent = loaded.live ? "Live from Google Sheet" : "Showing fallback content until Google Sheet is reachable";
    }

    filterRow && filterRow.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      filter = button.dataset.filter;
      filterRow.querySelectorAll(".chip").forEach((chip) => chip.classList.toggle("active", chip === button));
      paint();
    });

    paint();
  }

  function newsCard(item) {
    const type = field(item, ["Type"]) || "News";
    const image = field(item, ["ImageUrl", "Image"]) || imageFallback;
    const date = field(item, ["StartDate", "Date"]);
    return `
      <article class="news-card">
        <img src="${escapeAttribute(image)}" alt="${escapeAttribute(field(item, ["Title", "Name"]) || "DF FLEUR update")}" onerror="this.src='${imageFallback}'">
        <div class="news-card-body">
          <span class="badge">${escapeHtml(type)}</span>
          <h2>${escapeHtml(field(item, ["Title", "Name"]))}</h2>
          <p>${escapeHtml(field(item, ["Description", "Details"]))}</p>
          ${date ? `<p>${escapeHtml(date)}</p>` : ""}
        </div>
      </article>
    `;
  }

  async function renderContactPage() {
    const card = document.querySelector("[data-contact-card]");
    if (!card) return;
    const { rows, live } = await loadSheet("contact");
    const contact = rows[0] || fallback.contact;
    const phone = field(contact, ["Phone"]);
    const whatsapp = field(contact, ["WhatsApp"]);
    const map = field(contact, ["MapUrl"]);
    const facebook = field(contact, ["FacebookUrl"]);
    const instagram = field(contact, ["InstagramUrl"]);

    card.innerHTML = `
      <p class="eyebrow">${live ? "Live from Google Sheet" : "Fallback contact"}</p>
      <h2>${escapeHtml(field(contact, ["Name"]) || "DF FLEUR")}</h2>
      <div class="contact-list">
        <div><strong>Address</strong>${escapeHtml(field(contact, ["Address"]))}</div>
        <div><strong>Opening hours</strong>${escapeHtml(field(contact, ["OpeningHours", "Hours"]))}</div>
        <div><strong>Phone</strong>${escapeHtml(phone)}</div>
        <div><strong>WhatsApp</strong>${escapeHtml(whatsapp)}</div>
      </div>
      <div class="contact-actions">
        ${phone ? `<a class="button primary" href="tel:${escapeAttribute(phone)}">Call</a>` : ""}
        ${whatsapp ? `<a class="button ghost" href="https://wa.me/${escapeAttribute(whatsapp)}" target="_blank" rel="noreferrer">WhatsApp</a>` : ""}
        ${map ? `<a class="button ghost" href="${escapeAttribute(map)}" target="_blank" rel="noreferrer">Map</a>` : ""}
        ${facebook ? `<a class="button ghost" href="${escapeAttribute(facebook)}" target="_blank" rel="noreferrer">Facebook</a>` : ""}
        ${instagram ? `<a class="button ghost" href="${escapeAttribute(instagram)}" target="_blank" rel="noreferrer">Instagram</a>` : ""}
      </div>
    `;
  }

  async function renderMenuPage() {
    const book = document.querySelector("[data-book]");
    const tabs = document.querySelector("[data-category-tabs]");
    const status = document.querySelector('[data-status="menu"]');
    if (!book || !tabs) return;

    const [menuLoad, categoryLoad] = await Promise.all([loadSheet("menu"), loadSheet("categories")]);
    const items = menuLoad.rows.filter((item) => isActive(item, ["Status"], ["available", "active"]));
    const sheetCategories = categoryLoad.rows.map((item) => field(item, ["Categories", "Category", "Name"])).filter(Boolean);
    const itemCategories = [...new Set(items.map((item) => field(item, ["Category"])).filter(Boolean))];
    const categories = [...new Set([...sheetCategories, ...itemCategories])].filter((category) => items.some((item) => field(item, ["Category"]) === category));
    let current = 0;

    tabs.innerHTML = categories.map((category, index) => `<button class="chip${index === 0 ? " active" : ""}" type="button" data-page-index="${index}">${escapeHtml(category)}</button>`).join("");
    book.innerHTML = categories.map((category, index) => menuPage(category, items.filter((item) => field(item, ["Category"]) === category), index)).join("");
    if (status) status.textContent = menuLoad.live ? "Live from Google Sheet" : "Showing fallback menu until Google Sheet is reachable";

    function update(next) {
      current = Math.max(0, Math.min(categories.length - 1, next));
      book.querySelectorAll(".menu-page").forEach((pageEl, index) => {
        pageEl.classList.toggle("is-before", index < current);
        pageEl.classList.toggle("is-current", index === current);
        pageEl.classList.toggle("is-after", index > current);
      });
      tabs.querySelectorAll(".chip").forEach((chip, index) => chip.classList.toggle("active", index === current));
    }

    document.querySelector("[data-prev-page]")?.addEventListener("click", () => update(current - 1));
    document.querySelector("[data-next-page]")?.addEventListener("click", () => update(current + 1));
    tabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-page-index]");
      if (button) update(Number(button.dataset.pageIndex));
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") update(current + 1);
      if (event.key === "ArrowLeft") update(current - 1);
    });

    let startX = 0;
    book.addEventListener("touchstart", (event) => { startX = event.touches[0].clientX; }, { passive: true });
    book.addEventListener("touchend", (event) => {
      const delta = event.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 45) update(current + (delta < 0 ? 1 : -1));
    });

    update(0);
  }

  function menuPage(category, items, index) {
    return `
      <article class="menu-page ${index === 0 ? "is-current" : "is-after"}">
        <div class="menu-cover">
          <img src="assets/images/logo.jpg" alt="DF FLEUR logo">
          <h2>${escapeHtml(category)}</h2>
          <p>Selected DF FLEUR signatures presented as a refined menu page.</p>
        </div>
        <div class="menu-list">
          ${items.map((item) => `
            <div class="menu-item">
              <div>
                <h3>${escapeHtml(field(item, ["Name", "Title"]))}</h3>
                <p>${escapeHtml(field(item, ["Description", "Details"]))}</p>
              </div>
              <span class="price">${formatPrice(field(item, ["Price"]))}</span>
            </div>
          `).join("")}
        </div>
      </article>
    `;
  }

  function formatPrice(price) {
    if (!price) return "Ask";
    const number = Number(String(price).replace(/[^\d.]/g, ""));
    return Number.isFinite(number) ? `${number.toLocaleString()} EGP` : escapeHtml(price);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }
})();
