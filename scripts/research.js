/* ============================================================
   research.js — shared logic for research_*.html reference pages
   ============================================================
   Each page calls initResearchPage(config) with:
     dataUrl        — path to the JSON data file
     appTitle       — text for #app-title
     appSubtitle    — text for #app-subtitle
     idField        — unique id field on each item (default "id")
     nameField      — display name field (default "name")
     groupLabel     — label used for the table's group column header
     extraColumns   — array of {key, label, sortable} for table view,
                      beyond the shared Name/Group columns
     cardFields     — array of {key, label} shown in the card's meta row
     detailFields   — array of {key, label} shown in the detail stat grid
     detailBlocks   — array of {key, label, italic} for long-text blocks
   ============================================================ */

const TAG_GLYPH = { light: "\u2600", darkness: "\u263E", neutral: "\u25D1" };
const TAG_LABEL = { light: "Light", darkness: "Darkness", neutral: "Neutral" };

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function initResearchPage(config) {
  const state = {
    data: null,
    items: [],
    groupOrder: [],
    query: "",
    groupFilter: "all",
    tagFilter: "all",
    view: "cards",       // "cards" | "table"
    selectedId: null,
    sortKey: null,
    sortDir: "asc",
  };

  // ---- DOM refs ----
  const els = {
    appTitle: document.getElementById("app-title"),
    appSubtitle: document.getElementById("app-subtitle"),
    search: document.getElementById("search"),
    groupFilters: document.getElementById("group-filters"),
    tagFilters: document.getElementById("tag-filters"),
    itemList: document.getElementById("item-list"),
    clearRow: document.getElementById("clear-selection-row"),
    clearBtn: document.getElementById("btn-clear"),
    viewCardsBtn: document.getElementById("view-cards-btn"),
    viewTableBtn: document.getElementById("view-table-btn"),
    resultCount: document.getElementById("result-count"),
    content: document.getElementById("content"),
  };

  els.appTitle.textContent = config.appTitle;
  els.appSubtitle.textContent = config.appSubtitle;

  // ---- load data ----
  let doc;
  try {
    const res = await fetch(config.dataUrl);
    doc = await res.json();
  } catch (err) {
    els.content.innerHTML = `<div id="empty-state">Could not load ${escapeHtml(config.dataUrl)}. If you opened this file directly from disk, your browser may be blocking local fetch() requests — try serving this folder with a local web server instead.</div>`;
    return;
  }

  state.data = doc;
  state.items = doc.items || [];
  state.groupOrder = (doc.meta && doc.meta.groupOrder) || [];
  const idField = config.idField || "id";
  const nameField = config.nameField || "name";
  const groupField = (doc.meta && doc.meta.groupField) || "category";

  document.title = (doc.meta && doc.meta.title ? doc.meta.title + " — " : "") + (config.appSubtitle || "Research");

  // ---- build sidebar filter chips ----
  function buildGroupChips() {
    let html = `<button class="filter-chip active" data-group="all">All</button>`;
    state.groupOrder.forEach((g) => {
      html += `<button class="filter-chip" data-group="${escapeHtml(g)}">${escapeHtml(g)}</button>`;
    });
    els.groupFilters.innerHTML = html;
    els.groupFilters.querySelectorAll(".filter-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.groupFilter = btn.dataset.group;
        els.groupFilters.querySelectorAll(".filter-chip").forEach((b) => b.classList.toggle("active", b === btn));
        render();
      });
    });
  }

  function buildTagChips() {
    let html = `<button class="filter-chip active" data-tag="all">All</button>`;
    ["light", "darkness", "neutral"].forEach((t) => {
      html += `<button class="filter-chip tag-${t}" data-tag="${t}">${TAG_GLYPH[t]} ${TAG_LABEL[t]}</button>`;
    });
    els.tagFilters.innerHTML = html;
    els.tagFilters.querySelectorAll(".filter-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.tagFilter = btn.dataset.tag;
        els.tagFilters.querySelectorAll(".filter-chip").forEach((b) => b.classList.toggle("active", b === btn));
        render();
      });
    });
  }

  buildGroupChips();
  buildTagChips();

  // ---- search ----
  els.search.addEventListener("input", () => {
    state.query = els.search.value.trim().toLowerCase();
    render();
  });

  // ---- view toggle ----
  function setView(view) {
    state.view = view;
    els.viewCardsBtn.classList.toggle("active", view === "cards");
    els.viewTableBtn.classList.toggle("active", view === "table");
    render();
  }
  els.viewCardsBtn.addEventListener("click", () => setView("cards"));
  els.viewTableBtn.addEventListener("click", () => setView("table"));

  // ---- clear selection ----
  els.clearBtn.addEventListener("click", () => {
    state.selectedId = null;
    render();
  });

  // ---- filtering ----
  function filteredItems() {
    return state.items.filter((it) => {
      if (state.groupFilter !== "all" && it[groupField] !== state.groupFilter) return false;
      if (state.tagFilter !== "all" && it.tag !== state.tagFilter) return false;
      if (state.query) {
        const hay = Object.values(it).join(" ").toLowerCase();
        if (!hay.includes(state.query)) return false;
      }
      return true;
    });
  }

  // ---- sidebar list ----
  function renderList() {
    const items = filteredItems();
    if (items.length === 0) {
      els.itemList.innerHTML = `<div class="list-empty">No matches.</div>`;
      return;
    }
    els.itemList.innerHTML = items
      .map((it) => {
        const active = it[idField] === state.selectedId ? "list-item-active" : "";
        return `<button class="list-item ${active}" data-id="${escapeHtml(it[idField])}">
          <span class="list-item-name">${TAG_GLYPH[it.tag] || ""} ${escapeHtml(it[nameField])}</span>
          <span class="list-item-meta">${escapeHtml(it[groupField] || "")}</span>
        </button>`;
      })
      .join("");
    els.itemList.querySelectorAll(".list-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedId = btn.dataset.id;
        render();
      });
    });
  }

  // ---- detail view ----
  function renderDetail(item) {
    const tag = item.tag || "neutral";
    let statRows = "";
    (config.detailFields || []).forEach((f) => {
      const val = item[f.key];
      if (val === undefined) return;
      statRows += `<div class="detail-stat-row"><dt>${escapeHtml(f.label)}</dt><dd>${escapeHtml(val)}</dd></div>`;
    });

    let blocks = "";
    (config.detailBlocks || [{ key: "summary", label: "Summary" }, { key: "detail", label: "Detail" }, { key: "notes", label: "Notes", italic: true }])
      .forEach((b) => {
        const val = item[b.key];
        if (!val || val === "\u2014") return;
        blocks += `<div class="detail-block">
          <div class="detail-block-label">${escapeHtml(b.label)}</div>
          <div class="detail-block-body${b.italic ? " notes" : ""}">${escapeHtml(val)}</div>
        </div>`;
      });

    els.content.innerHTML = `
      <button class="detail-back-btn" id="detail-back">&larr; Back to results</button>
      <div class="detail-wrap">
        <div class="detail-card" style="--tag-color: var(--tag-${tag})">
          <div class="detail-top">
            <div class="detail-name">${escapeHtml(item[nameField])}</div>
            <div class="detail-glyph">${TAG_GLYPH[tag] || ""}</div>
          </div>
          <div class="detail-meta">${escapeHtml(item[groupField] || "")}${item.game ? " &middot; " + escapeHtml(item.game) : ""}</div>
          ${statRows ? `<div class="detail-stat-grid">${statRows}</div>` : ""}
          ${blocks}
        </div>
      </div>
    `;
    document.getElementById("detail-back").addEventListener("click", () => {
      state.selectedId = null;
      render();
    });
  }

  // ---- card grid (grouped) ----
  function renderCards(items) {
    const groups = {};
    state.groupOrder.forEach((g) => (groups[g] = []));
    items.forEach((it) => {
      const g = it[groupField] || "Other";
      if (!groups[g]) groups[g] = [];
      groups[g].push(it);
    });

    const activeGroups = Object.keys(groups).filter((g) => groups[g].length > 0);
    if (activeGroups.length === 0) {
      els.content.innerHTML = `<div id="empty-state">No entries match the current filters.</div>`;
      return;
    }

    let html = "";
    activeGroups.forEach((g) => {
      html += `<section class="group-section">
        <div class="group-heading">${escapeHtml(g)} <span class="group-count">${groups[g].length} entr${groups[g].length === 1 ? "y" : "ies"}</span></div>
        <div class="card-grid">`;
      groups[g].forEach((it) => {
        const tag = it.tag || "neutral";
        html += `<article class="ref-card" style="--tag-color: var(--tag-${tag})" data-id="${escapeHtml(it[idField])}">
          <div class="ref-card-top">
            <div class="ref-card-name">${escapeHtml(it[nameField])}</div>
            <div class="ref-card-glyph">${TAG_GLYPH[tag] || ""}</div>
          </div>
          <div class="ref-card-meta">${escapeHtml(it.level || it.origin || "")}</div>
          <div class="ref-card-summary">${escapeHtml(it.summary || it.effect || "")}</div>
          <div class="ref-card-row">${(config.cardFields || []).map((f) => it[f.key] ? `<span><b>${escapeHtml(f.label)}</b> ${escapeHtml(it[f.key])}</span>` : "").join("")}</div>
        </article>`;
      });
      html += `</div></section>`;
    });
    els.content.innerHTML = html;
    els.content.querySelectorAll(".ref-card").forEach((card) => {
      card.addEventListener("click", () => {
        state.selectedId = card.dataset.id;
        render();
      });
    });
  }

  // ---- table view ----
  function renderTable(items) {
    if (items.length === 0) {
      els.content.innerHTML = `<div id="empty-state">No entries match the current filters.</div>`;
      return;
    }

    const cols = [
      { key: nameField, label: "Name", sortable: true },
      { key: groupField, label: config.groupLabel || "Category", sortable: true },
      ...(config.extraColumns || []),
    ];

    let sorted = [...items];
    if (state.sortKey) {
      sorted.sort((a, b) => {
        const av = (a[state.sortKey] || "").toString().toLowerCase();
        const bv = (b[state.sortKey] || "").toString().toLowerCase();
        if (av < bv) return state.sortDir === "asc" ? -1 : 1;
        if (av > bv) return state.sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    let thead = "<tr>";
    cols.forEach((c) => {
      const sortable = c.sortable !== false;
      let cls = sortable ? "sortable" : "";
      if (sortable && state.sortKey === c.key) cls += state.sortDir === "asc" ? " sorted-asc" : " sorted-desc";
      thead += `<th class="${cls}" data-key="${sortable ? c.key : ""}">${escapeHtml(c.label)}${sortable ? '<span class="sort-arrow"></span>' : ""}</th>`;
    });
    thead += "</tr>";

    let tbody = "";
    sorted.forEach((it) => {
      const tag = it.tag || "neutral";
      tbody += `<tr data-id="${escapeHtml(it[idField])}">`;
      cols.forEach((c, i) => {
        if (i === 0) {
          tbody += `<td class="table-name"><span class="table-glyph" style="color: var(--tag-${tag})">${TAG_GLYPH[tag] || ""}</span>${escapeHtml(it[c.key])}</td>`;
        } else {
          tbody += `<td>${escapeHtml(it[c.key])}</td>`;
        }
      });
      tbody += "</tr>";
    });

    els.content.innerHTML = `<div class="table-wrap"><table class="ref-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;

    els.content.querySelectorAll("th.sortable").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.dataset.key;
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortKey = key;
          state.sortDir = "asc";
        }
        render();
      });
    });
    els.content.querySelectorAll("tbody tr").forEach((row) => {
      row.addEventListener("click", () => {
        state.selectedId = row.dataset.id;
        render();
      });
    });
  }

  function renderLegend() {
    const legend = document.createElement("div");
    legend.className = "legend-footer";
    legend.innerHTML = `
      <div class="legend-item"><span class="legend-dot" style="background: var(--tag-light)"></span>Light</div>
      <div class="legend-item"><span class="legend-dot" style="background: var(--tag-darkness)"></span>Darkness</div>
      <div class="legend-item"><span class="legend-dot" style="background: var(--tag-neutral)"></span>Neutral</div>
    `;
    els.content.appendChild(legend);
  }

  // ---- main render ----
  function render() {
    renderList();
    els.clearRow.style.display = state.selectedId ? "block" : "none";

    const items = filteredItems();
    els.resultCount.textContent = `${items.length} entr${items.length === 1 ? "y" : "ies"} shown`;

    const selected = state.selectedId ? state.items.find((it) => it[idField] === state.selectedId) : null;

    if (selected) {
      renderDetail(selected);
      return;
    }

    if (state.view === "cards") {
      renderCards(items);
    } else {
      renderTable(items);
    }
    renderLegend();
  }

  render();
}
