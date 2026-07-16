(function () {
  const SHEET_BASE =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTB4bIAWk0Bfn3sf8bkSZJMykqjJ0B_lu_d_0Ys0t3ZUCmkRVH4bSkHOTRbu_938q5lgAmF4EqKDSa/pub";

  const SHEETS = {
    offers: { name: "Offers", gid: "1626770873" },
    categories: { name: "MenuCategories", gid: "1954761004" },
    menu: { name: "MenuItems", gid: "884715003" },
    contact: { name: "Contact", gid: "1353808229" }
  };

  const fallback = {
    offers: [
      {
        Title: "Grand Opening",
        Description:
          "Our grand opening was announced for April 12th. Visit DF FLEUR for a premium cafe and restaurant experience.",
        Type: "News",
        StartDate: "2026-04-12",
        Status: "Active"
      },
      {
        Title: "Something Brewing",
        Description:
          "DF FLEUR introduces a new spot with good vibes, coffee, food, and a refined dining mood.",
        Type: "News",
        Status: "Active"
      },
      {
        Title: "A New Dining Experience Begins",
        Description:
          "A premium restaurant and cafe concept built around warm hospitality, comfort, and elegant food presentation.",
        Type: "News",
        Status: "Active"
      },
      {
        Title: "Coffee Mood",
        Description:
          "Every cup tells a story. Enjoy the DF FLEUR coffee atmosphere with premium hot and cold beverages.",
        Type: "Offer",
        Status: "Active"
      }
    ],

    categories: [
      "Beverages",
      "Breakfast",
      "Cold Drinks",
      "Desserts",
      "Hot Drinks",
      "Main Courses",
      "Offers",
      "Oriental",
      "Pasta",
      "Salads",
      "Sandwiches",
      "Soups"
    ],

    menu: [
      {
        Category: "Soups",
        Name: "Cream of Chicken Soup",
        Description:
          "Creamy chicken soup served with a toasted bread slice.",
        Price: "100",
        Status: "Available"
      },
      {
        Category: "Salads",
        Name: "Greek Salad",
        Description:
          "Fresh lettuce, feta cheese, olives, onion, tomato, and herbs.",
        Price: "150",
        Status: "Available"
      },
      {
        Category: "Main Courses",
        Name: "Sizzling Beef",
        Description:
          "A sizzling beef platter served with vegetables and fries.",
        Price: "200",
        Status: "Available"
      },
      {
        Category: "Sandwiches",
        Name: "Chicken Burger",
        Description: "Crispy chicken burger served with fries.",
        Price: "250",
        Status: "Available"
      }
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
      if (header) {
        header.classList.toggle("scrolled", window.scrollY > 24);
      }
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
        const response = await fetch(endpoint, {
          cache: "no-store"
        });

        if (!response.ok) {
          continue;
        }

        const text = await response.text();

        const rows = parseCsv(text).filter((row) =>
          Object.values(row).some(Boolean)
        );

        if (rows.length) {
          return {
            rows,
            live: true
          };
        }
      } catch (error) {
        console.warn(`DF FLEUR sheet load failed for ${key}`, error);
      }
    }

    return {
      rows: Array.isArray(fallback[key])
        ? fallback[key]
        : [fallback[key]],
      live: false
    };
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
      } else if (
        (char === "\n" || char === "\r") &&
        !quoted
      ) {
        if (char === "\r" && next === "\n") {
          index += 1;
        }

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

    const headers = (rows.shift() || []).map((header) =>
      clean(header).replace(/^\uFEFF/, "")
    );

    return rows.map((cells) =>
      headers.reduce((item, header, index) => {
        item[header] = clean(cells[index] || "");
        return item;
      }, {})
    );
  }

  function clean(value) {
    return String(value || "").trim();
  }

  function field(item, names) {
    const keys = Array.isArray(names) ? names : [names];

    for (const requestedKey of keys) {
      const normalizedRequested = String(requestedKey)
        .replace(/\s+/g, "")
        .toLowerCase();

      const actualKey = Object.keys(item).find((key) => {
        const normalizedActual = String(key)
          .replace(/^\uFEFF/, "")
          .replace(/\s+/g, "")
          .toLowerCase();

        return normalizedActual === normalizedRequested;
      });

      if (
        actualKey &&
        item[actualKey] !== undefined &&
        clean(item[actualKey]) !== ""
      ) {
        return item[actualKey];
      }
    }

    return "";
  }

  function isActive(item, statusNames, activeWords) {
    const status = field(item, statusNames).toLowerCase();

    return (
      !status ||
      activeWords.some((word) => status.includes(word))
    );
  }

  async function renderHome() {
    const holder = document.querySelector("[data-home-offers]");

    if (!holder) {
      return;
    }

    const { rows } = await loadSheet("offers");

    holder.innerHTML = rows
      .filter((item) =>
        isActive(item, ["Status"], ["active"])
      )
      .slice(0, 3)
      .map(
        (item) => `
          <a class="preview-item" href="news.html">
            <strong>
              ${escapeHtml(field(item, ["Title", "Name"]))}
            </strong>

            <p>
              ${escapeHtml(
                field(item, ["Description", "Details"])
              )}
            </p>
          </a>
        `
      )
      .join("");
  }

  async function renderOffersPage() {
    const list = document.querySelector("[data-offers-list]");
    const status = document.querySelector(
      '[data-status="offers"]'
    );
    const filterRow = document.querySelector(
      "[data-offer-filters]"
    );

    if (!list) {
      return;
    }

    const loaded = await loadSheet("offers");

    const offers = loaded.rows.filter((item) =>
      isActive(item, ["Status"], ["active"])
    );

    let filter = "all";

    function paint() {
      const visible = offers.filter((item) => {
        return (
          filter === "all" ||
          field(item, ["Type"]).toLowerCase() === filter
        );
      });

      list.innerHTML = visible.map(newsCard).join("");

      if (status) {
        status.textContent = "";
      }
    }

    if (filterRow) {
      filterRow.addEventListener("click", (event) => {
        const button = event.target.closest("[data-filter]");

        if (!button) {
          return;
        }

        filter = button.dataset.filter;

        filterRow
          .querySelectorAll(".chip")
          .forEach((chip) => {
            chip.classList.toggle(
              "active",
              chip === button
            );
          });

        paint();
      });
    }

    paint();
  }

  function newsCard(item) {
    const type = field(item, ["Type"]) || "News";

    const image = normalizeImageUrl(
      field(item, [
        "ImageUrl",
        "ImageURL",
        "Image Url",
        "Image Link",
        "PhotoUrl",
        "Photo",
        "Image"
      ])
    );

    const date = field(item, ["StartDate", "Date"]);
    const title = field(item, ["Title", "Name"]);

    return `
      <article class="news-card">
        <img
          src="${escapeAttribute(image)}"
          alt="${escapeAttribute(
            title || "DF FLEUR update"
          )}"
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
          onerror="this.onerror=null; this.src='${imageFallback}'"
        >

        <div class="news-card-body">
          <span class="badge">
            ${escapeHtml(type)}
          </span>

          <h2>
            ${escapeHtml(title)}
          </h2>

          <p>
            ${escapeHtml(
              field(item, ["Description", "Details"])
            )}
          </p>

          ${
            date
              ? `<p>${escapeHtml(date)}</p>`
              : ""
          }
        </div>
      </article>
    `;
  }

  async function renderContactPage() {
    const card = document.querySelector(
      "[data-contact-card]"
    );

    if (!card) {
      return;
    }

    const { rows } = await loadSheet("contact");
    const contact = rows[0] || fallback.contact;

    const phone = field(contact, ["Phone"]);
    const whatsapp = field(contact, ["WhatsApp"]);
    const map = field(contact, ["MapUrl"]);
    const facebook = field(contact, ["FacebookUrl"]);
    const instagram = field(contact, ["InstagramUrl"]);

    card.dataset.whatsapp = whatsapp;

    card.innerHTML = `
      <h2>
        ${escapeHtml(
          field(contact, ["Name"]) || "DF FLEUR"
        )}
      </h2>

      <div class="contact-list">
        <div>
          <strong>Address</strong>
          ${escapeHtml(field(contact, ["Address"]))}
        </div>

        <div>
          <strong>Opening hours</strong>
          ${escapeHtml(
            field(contact, ["OpeningHours", "Hours"])
          )}
        </div>

        <div>
          <strong>Phone</strong>
          ${escapeHtml(phone)}
        </div>

        <div>
          <strong>WhatsApp</strong>
          ${escapeHtml(whatsapp)}
        </div>
      </div>

      <div class="contact-actions">
        ${
          phone
            ? `
              <a
                class="button primary"
                href="tel:${escapeAttribute(phone)}"
              >
                Call
              </a>
            `
            : ""
        }

        ${
          whatsapp
            ? `
              <a
                class="button ghost"
                href="https://wa.me/${escapeAttribute(
                  normalizePhone(whatsapp)
                )}"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            `
            : ""
        }

        ${
          map
            ? `
              <a
                class="button ghost"
                href="${escapeAttribute(map)}"
                target="_blank"
                rel="noreferrer"
              >
                Map
              </a>
            `
            : ""
        }

        ${
          facebook
            ? `
              <a
                class="button ghost"
                href="${escapeAttribute(facebook)}"
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
            `
            : ""
        }

        ${
          instagram
            ? `
              <a
                class="button ghost"
                href="${escapeAttribute(instagram)}"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            `
            : ""
        }
      </div>
    `;

    initWhatsAppReservation(whatsapp);
  }

  function initWhatsAppReservation(whatsapp) {
    const form = document.querySelector(".reservation-form");

    if (!form) {
      return;
    }

    form.removeAttribute("action");
    form.removeAttribute("method");
    form.removeAttribute("enctype");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const whatsappNumber = normalizePhone(whatsapp);

      if (!whatsappNumber) {
        alert(
          "WhatsApp number is not available. Please try again shortly."
        );
        return;
      }

      const formData = new FormData(form);

      const name = clean(formData.get("name"));
      const phone = clean(formData.get("phone"));
      const date = clean(formData.get("date"));
      const message = clean(formData.get("message"));

      const reservationMessage = [
        "Hello DF FLEUR,",
        "",
        "I would like to make a reservation.",
        "",
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Date: ${date}`,
        message ? `Message: ${message}` : "",
        "",
        "Please confirm availability. Thank you."
      ]
        .filter(Boolean)
        .join("\n");

      const whatsappUrl =
        `https://wa.me/${whatsappNumber}` +
        `?text=${encodeURIComponent(reservationMessage)}`;

      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
      );
    });
  }

  async function renderMenuPage() {
    const book = document.querySelector("[data-book]");
    const tabs = document.querySelector(
      "[data-category-tabs]"
    );
    const status = document.querySelector(
      '[data-status="menu"]'
    );

    if (!book || !tabs) {
      return;
    }

    addMenuImageStyles();

    const [menuLoad, categoryLoad] = await Promise.all([
      loadSheet("menu"),
      loadSheet("categories")
    ]);

    console.log("Loaded menu data:", menuLoad.rows);

    const items = menuLoad.rows.filter((item) =>
      isActive(
        item,
        ["Status"],
        ["available", "active"]
      )
    );

    const sheetCategories = categoryLoad.rows
      .map((item) =>
        field(item, [
          "Categories",
          "Category",
          "Name"
        ])
      )
      .filter(Boolean);

    const itemCategories = [
      ...new Set(
        items
          .map((item) => field(item, ["Category"]))
          .filter(Boolean)
      )
    ];

    const categories = [
      ...new Set([
        ...sheetCategories,
        ...itemCategories
      ])
    ].filter((category) =>
      items.some(
        (item) =>
          field(item, ["Category"]) === category
      )
    );

    let current = 0;

    tabs.innerHTML = categories
      .map(
        (category, index) => `
          <button
            class="chip${index === 0 ? " active" : ""}"
            type="button"
            data-page-index="${index}"
          >
            ${escapeHtml(category)}
          </button>
        `
      )
      .join("");

    book.innerHTML = categories
      .map((category, index) =>
        menuPage(
          category,
          items.filter(
            (item) =>
              field(item, ["Category"]) === category
          ),
          index
        )
      )
      .join("");

    if (status) {
      status.textContent = "";
      status.style.display = "none";
    }

    function update(next) {
      current = Math.max(
        0,
        Math.min(categories.length - 1, next)
      );

      book
        .querySelectorAll(".menu-page")
        .forEach((pageElement, index) => {
          pageElement.classList.toggle(
            "is-before",
            index < current
          );

          pageElement.classList.toggle(
            "is-current",
            index === current
          );

          pageElement.classList.toggle(
            "is-after",
            index > current
          );
        });

      tabs
        .querySelectorAll(".chip")
        .forEach((chip, index) => {
          chip.classList.toggle(
            "active",
            index === current
          );
        });
    }

    document
      .querySelector("[data-prev-page]")
      ?.addEventListener("click", () => {
        update(current - 1);
      });

    document
      .querySelector("[data-next-page]")
      ?.addEventListener("click", () => {
        update(current + 1);
      });

    tabs.addEventListener("click", (event) => {
      const button = event.target.closest(
        "[data-page-index]"
      );

      if (button) {
        update(Number(button.dataset.pageIndex));
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        update(current + 1);
      }

      if (event.key === "ArrowLeft") {
        update(current - 1);
      }
    });

    let startX = 0;

    book.addEventListener(
      "touchstart",
      (event) => {
        startX = event.touches[0].clientX;
      },
      {
        passive: true
      }
    );

    book.addEventListener("touchend", (event) => {
      const delta =
        event.changedTouches[0].clientX - startX;

      if (Math.abs(delta) > 45) {
        update(current + (delta < 0 ? 1 : -1));
      }
    });

    update(0);
  }

  function addMenuImageStyles() {
    if (
      document.getElementById(
        "df-fleur-menu-image-styles"
      )
    ) {
      return;
    }

    const style = document.createElement("style");

    style.id = "df-fleur-menu-image-styles";

    style.textContent = `
      .menu-item {
        display: grid !important;
        grid-template-columns: 110px minmax(0, 1fr) auto !important;
        gap: 18px !important;
        align-items: center !important;
      }

      .menu-item-image {
        display: block !important;
        width: 110px !important;
        height: 110px !important;
        max-width: none !important;
        object-fit: cover !important;
        border-radius: 14px !important;
        background: #eeeeee !important;
      }

      .menu-item-content {
        min-width: 0;
      }

      @media (max-width: 640px) {
        .menu-item {
          grid-template-columns: 78px minmax(0, 1fr) !important;
          gap: 12px !important;
        }

        .menu-item-image {
          width: 78px !important;
          height: 78px !important;
        }

        .menu-item .price {
          grid-column: 2;
          justify-self: start;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function normalizeImageUrl(url) {
    let value = clean(url);

    if (!value) {
      return imageFallback;
    }

    const imageFormula = value.match(
      /^=IMAGE\(\s*["']([^"']+)["']/i
    );

    if (imageFormula) {
      value = imageFormula[1];
    }

    value = value
      .replace(/&amp;/g, "&")
      .replace(/^["']|["']$/g, "")
      .trim();

    const drivePatterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/i,
      /\/d\/([a-zA-Z0-9_-]+)/i,
      /[?&]id=([a-zA-Z0-9_-]+)/i,
      /open\?id=([a-zA-Z0-9_-]+)/i
    ];

    let driveId = "";

    for (const pattern of drivePatterns) {
      const match = value.match(pattern);

      if (match) {
        driveId = match[1];
        break;
      }
    }

    if (driveId) {
      return (
        `https://lh3.googleusercontent.com/d/` +
        `${driveId}=w1200`
      );
    }

    if (
      /^https?:\/\//i.test(value) ||
      /^data:image\//i.test(value)
    ) {
      return value;
    }

    console.warn(
      "Unsupported or relative menu image path:",
      value
    );

    return imageFallback;
  }

  function menuPage(category, items, index) {
    return `
      <article
        class="menu-page ${
          index === 0 ? "is-current" : "is-after"
        }"
      >
        <div class="menu-cover">
          <img
            src="assets/images/logo.jpg"
            alt="DF FLEUR logo"
          >

          <h2>
            ${escapeHtml(category)}
          </h2>

          <p>
            Selected DF FLEUR signatures presented
            as a refined menu page.
          </p>
        </div>

        <div class="menu-list">
          ${items
            .map((item) => {
              const itemName = field(item, [
                "Name",
                "Title"
              ]);

              const originalImageValue = field(item, [
                "ImageUrl",
                "ImageURL",
                "Image Url",
                "Image Link",
                "PhotoUrl",
                "Photo",
                "Image"
              ]);

              const itemImage =
                normalizeImageUrl(originalImageValue);

              console.log(
                "Menu item image:",
                itemName,
                originalImageValue,
                itemImage
              );

              return `
                <div class="menu-item">
                  <img
                    class="menu-item-image"
                    src="${escapeAttribute(itemImage)}"
                    alt="${escapeAttribute(
                      itemName ||
                        "DF FLEUR menu item"
                    )}"
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                    onerror="
                      console.warn(
                        'Menu image failed:',
                        this.src
                      );
                      this.onerror = null;
                      this.src = '${imageFallback}';
                    "
                  >

                  <div class="menu-item-content">
                    <h3>
                      ${escapeHtml(itemName)}
                    </h3>

                    <p>
                      ${escapeHtml(
                        field(item, [
                          "Description",
                          "Details"
                        ])
                      )}
                    </p>
                  </div>

                  <span class="price">
                    ${formatPrice(
                      field(item, ["Price"])
                    )}
                  </span>
                </div>
              `;
            })
            .join("")}
        </div>
      </article>
    `;
  }

  function normalizePhone(phone) {
    let value = String(phone || "").replace(/\D/g, "");

    if (value.startsWith("00")) {
      value = value.substring(2);
    }

    if (value.startsWith("0")) {
      value = `20${value.substring(1)}`;
    }

    return value;
  }

  function formatPrice(price) {
    if (!price) {
      return "Ask";
    }

    const number = Number(
      String(price).replace(/[^\d.]/g, "")
    );

    return Number.isFinite(number)
      ? `${number.toLocaleString()} EGP`
      : escapeHtml(price);
  }

  function escapeHtml(value) {
    return String(value || "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        })[char]
    );
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(
      /`/g,
      "&#096;"
    );
  }
})();
