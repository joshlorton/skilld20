'use strict';

CONFIG.file = 'data/materials.json';
state.entries = [];
state.sha     = null;

// Materials-specific state
const mstate = {
  data:     null,   // full JSON object
  cat:      'gems', // current category key
  selIdx:   -1,     // selected entry index within current category
};

// Override shared generics -- sidebar is static, entries unused
function renderList() {}
function selectItem() {}

function onTokenChange() { loadData(); loadTraitsData(); }

// ── Column definitions per category ──────────────────────────

const COLS = {
  gems: [
    { key:'name',              label:'Name',             cls:'mat-name' },
    { key:'description',       label:'Description',      cls:'mat-cell flex-2 mat-desc' },
    { key:'magical_effect',    label:'Magical Effect',   cls:'mat-cell flex-3 mat-effect' },
    { key:'incorrect_belief',  label:'Incorrect Belief', cls:'mat-cell flex-2 mat-false' },
    { key:'notes',             label:'Notes',            cls:'mat-cell flex-1 mat-notes' },
    { key:'value',             label:'Value',            cls:'mat-value' },
  ],
  herbs: [
    { key:'name',         label:'Name',        cls:'mat-name' },
    { key:'description',  label:'Description', cls:'mat-cell flex-2 mat-desc' },
    { key:'effect',       label:'Effect',      cls:'mat-cell flex-3 mat-effect' },
    { key:'notes',        label:'Notes',       cls:'mat-cell flex-2 mat-notes' },
    { key:'cost',         label:'Cost',        cls:'mat-cost' },
  ],
  metals: [
    { key:'name',               label:'Name',              cls:'mat-name' },
    { key:'description',        label:'Description',       cls:'mat-cell flex-2 mat-desc' },
    { key:'type',               label:'Type',              cls:'mat-type' },
    { key:'magical_properties', label:'Magical Properties',cls:'mat-cell flex-3 mat-effect' },
    { key:'bonus',              label:'Bonus',             cls:'mat-bonus' },
    { key:'value_gp',           label:'Value',             cls:'mat-cost' },
    { key:'cost_factor',        label:'Cost ×',            cls:'mat-factor' },
    { key:'time_factor',        label:'Time ×',            cls:'mat-factor' },
    { key:'notes',              label:'Notes',             cls:'mat-cell flex-2 mat-notes' },
  ],
  treatments: [
    { key:'name',            label:'Name',            cls:'mat-name' },
    { key:'source_material', label:'Material',        cls:'mat-cell flex-1 mat-type' },
    { key:'effect',          label:'Effect',          cls:'mat-cell flex-3 mat-effect' },
    { key:'notes',           label:'Notes',           cls:'mat-cell flex-2 mat-notes' },
  ],
  stones: [
    { key:'name',        label:'Name',        cls:'mat-name' },
    { key:'description', label:'Description', cls:'mat-cell flex-3 mat-desc' },
    { key:'notes',       label:'Notes',       cls:'mat-cell flex-2 mat-notes' },
  ],
  woods: [
    { key:'name',                 label:'Name',            cls:'mat-name' },
    { key:'description',          label:'Description',     cls:'mat-cell flex-2 mat-desc' },
    { key:'location',             label:'Location',        cls:'mat-cell flex-1 mat-type' },
    { key:'item_properties',      label:'Item Properties', cls:'mat-cell flex-2 mat-effect' },
    { key:'component_properties', label:'Component Use',   cls:'mat-cell flex-2 mat-effect' },
    { key:'notes',                label:'Notes',           cls:'mat-cell flex-1 mat-notes' },
  ],
  enchanted: [
    { key:'name',        label:'Name',        cls:'mat-name' },
    { key:'description', label:'Description', cls:'mat-cell flex-3 mat-desc' },
    { key:'notes',       label:'Notes',       cls:'mat-cell flex-2 mat-notes' },
  ],
};

const SOURCE_LABELS = {
  volos:     "Volo\u2019s Guide to All Things Magical",
  merp:      "Treasures of Middle-earth",
  'merp-chart': "Treasures of Middle-earth \u2014 Properties Chart",
  wiz:       "Wizard Spells",
  priest:    "Priest Spells",
};

// ── Data load / save ──────────────────────────────────────────

async function loadData() {
  setStatus('Loading\u2026', 'load');
  try {
    if (state.token) {
      const result   = await ghReadFile(CONFIG.file);
      state.sha      = result.sha;
      mstate.data    = result.data;
    } else {
      const resp = await fetch('./' + CONFIG.file);
      if (resp.ok) mstate.data = await resp.json();
    }
    if (mstate.data) {
      setStatus('Loaded', 'ok');
      showCategory(mstate.cat);
    }
  } catch (err) {
    setStatus('Error: ' + err.message, 'error');
  }
  updateButtons();
}

async function saveData() {
  if (!state.token) { setStatus('No token set', 'error'); return false; }
  setStatus('Saving\u2026', 'load');
  try { return await attemptSave(false); }
  catch (err) { setStatus('Save error: ' + err.message, 'error'); return false; }
}

async function attemptSave(isRetry) {
  const ts  = new Date().toISOString().slice(0, 16).replace('T', ' ');
  try {
    const newSha = await ghWriteFile(CONFIG.file, state.sha, mstate.data,
                                     'Update materials [' + ts + ']');
    state.sha = newSha;
    setStatus('Saved to GitHub \u2713', 'ok');
    updateButtons();
    return true;
  } catch (err) {
    if (err.status === 409 && !isRetry) {
      setStatus('Conflict, refreshing\u2026', 'load');
      const r = await ghReadFile(CONFIG.file);
      if (r) state.sha = r.sha;
      return attemptSave(true);
    }
    throw err;
  }
}

// ── Buttons ───────────────────────────────────────────────────

function updateButtons() {
  const t  = !!state.token;
  const s  = mstate.selIdx >= 0;
  const ev = state.mode === 'view';
  const ed = state.mode === 'edit';
  const tr = state.mode === 'traits';

  document.getElementById('btn-new').style.display           = (t && !tr)             ? '' : 'none';
  document.getElementById('btn-edit').style.display          = (t && s && ev && !tr)  ? '' : 'none';
  document.getElementById('btn-cancel').style.display        = ed                     ? '' : 'none';
  document.getElementById('btn-save-gh').style.display       = (t && !tr)             ? '' : 'none';
  document.getElementById('btn-traits').style.display        = (t && !tr)             ? '' : 'none';
  document.getElementById('btn-cancel-traits').style.display = tr                     ? '' : 'none';
  document.getElementById('btn-save-traits').style.display   = (t && tr)              ? '' : 'none';
}

// ── Category viewer ───────────────────────────────────────────

function showCategory(catKey) {
  if (!mstate.data) return;
  mstate.cat   = catKey;
  mstate.selIdx = -1;
  state.mode   = 'view';

  document.querySelectorAll('#item-list .list-item').forEach(item =>
    item.classList.toggle('list-item-active', item.dataset.target === catKey));

  document.getElementById('search').value = '';
  showPanel('viewer', buildCategoryViewer(catKey));
  updateButtons();
}

function buildCategoryViewer(catKey) {
  const wrap = el('div', { class: 'mat-section' });
  wrap.appendChild(el('h2', { class: 'mat-category-title' },
    document.querySelector('[data-target="' + catKey + '"]')?.textContent || catKey));

  const entries = mstate.data[catKey] || [];

  if (catKey === 'spells') {
    buildSpellViewer(entries, wrap);
  } else {
    buildFlexViewer(catKey, entries, wrap);
  }
  return wrap;
}

function buildFlexViewer(catKey, entries, wrap) {
  const cols = COLS[catKey];
  if (!cols) return;

  // Group by source
  const groups = {};
  entries.forEach((e, i) => {
    const src = e.source || 'unknown';
    if (!groups[src]) groups[src] = [];
    groups[src].push({ entry: e, idx: i });
  });

  Object.entries(groups).forEach(([src, items]) => {
    wrap.appendChild(el('h3', { class: 'mat-subsource' }, SOURCE_LABELS[src] || src));

    const table = el('div', { class: 'mat-table' });

    // Header row
    const hdr = el('div', { class: 'mat-header-row' });
    cols.forEach(col => {
      hdr.appendChild(el('div', { class: col.cls || 'mat-cell' }, col.label));
    });
    table.appendChild(hdr);

    // Data rows
    items.forEach(({ entry, idx }) => {
      const row = buildRow(entry, cols, catKey, idx);
      table.appendChild(row);
    });

    wrap.appendChild(table);
  });
}

function buildRow(entry, cols, catKey, idx) {
  const row = el('div', { class: 'mat-row', 'data-idx': String(idx) });

  cols.forEach(col => {
    const cell = el('div', { class: col.cls || 'mat-cell' });
    if (col.key === 'name') {
      cell.appendChild(el('div', { class: 'mat-name-primary' }, entry.name || ''));
      if (entry.nicknames && entry.nicknames.length) {
        cell.appendChild(el('div', { class: 'mat-name-nicks' },
          '(' + entry.nicknames.join(', ') + ')'));
      }
    } else {
      cell.textContent = entry[col.key] || '';
    }
    row.appendChild(cell);
  });

  row.addEventListener('click', () => selectEntry(catKey, idx, row));
  return row;
}

function selectEntry(catKey, idx, rowEl) {
  document.querySelectorAll('.mat-row.is-selected, .spell-entry.is-selected')
    .forEach(r => r.classList.remove('is-selected'));
  if (rowEl) rowEl.classList.add('is-selected');
  mstate.selIdx = idx;
  mstate.cat    = catKey;
  updateButtons();
}

function buildSpellViewer(entries, wrap) {
  const groups = {};
  entries.forEach((e, i) => {
    const src = e.spell_class || 'Wizard';
    if (!groups[src]) groups[src] = [];
    groups[src].push({ entry: e, idx: i });
  });

  Object.entries(groups).forEach(([cls, items]) => {
    wrap.appendChild(el('h3', { class: 'mat-subsource' }, cls + ' Spells'));
    items.forEach(({ entry, idx }) => {
      const card = buildSpellCard(entry, idx);
      wrap.appendChild(card);
    });
  });
}

function buildSpellCard(sp, idx) {
  const card = el('div', { class: 'spell-entry', 'data-idx': String(idx) });
  const hdr  = el('div', { class: 'spell-header' });
  hdr.appendChild(el('span', { class: 'spell-name' }, sp.name || ''));
  hdr.appendChild(el('span', { class: 'spell-level' },
    (sp.level ? 'Level ' + sp.level : '') + (sp.school ? ' ' + sp.school : '')));
  card.appendChild(hdr);

  const stats = [sp.casting, sp.range, sp.duration, sp.save ? 'ST: ' + sp.save : '']
    .filter(Boolean).join(' \u2002|\u2002 ');
  if (stats) card.appendChild(el('div', { class: 'spell-stats' }, stats));
  if (sp.effect) card.appendChild(el('div', { class: 'spell-body' }, sp.effect));

  card.addEventListener('click', () => {
    document.querySelectorAll('.spell-entry.is-selected').forEach(c => c.classList.remove('is-selected'));
    card.classList.add('is-selected');
    mstate.selIdx = idx;
    mstate.cat    = 'spells';
    updateButtons();
  });
  return card;
}

// ── Entry editor ──────────────────────────────────────────────

function buildEntryEditor(catKey, idx) {
  const entries = mstate.data[catKey] || [];
  const entry   = entries[idx] || {};
  const isNew   = idx === -1;

  const form = el('div', { class: 'mat-editor editor-form' });
  form.appendChild(el('div', { class: 'mat-ed-name-primary' },
    isNew ? ('New ' + catKey.charAt(0).toUpperCase() + catKey.slice(1,-1)) : (entry.name || '')));

  // Name + nicknames
  form.appendChild(el('div', { class: 'editor-section-title' }, 'Identity'));
  const nameRow = el('div', { class: 'form-row' });
  const nameF = el('div', { class: 'form-field' });
  nameF.appendChild(el('label', {}, 'Name'));
  const nameIn = el('input', { class: 'form-input', id: 'ed-mat-name', type: 'text', value: entry.name || '' });
  nameF.appendChild(nameIn);
  nameRow.appendChild(nameF);

  const nicksF = el('div', { class: 'form-field' });
  nicksF.appendChild(el('label', {}, 'Nicknames (comma-separated)'));
  const nicksIn = el('input', { class: 'form-input', id: 'ed-mat-nicks', type: 'text',
    value: (entry.nicknames || []).join(', ') });
  nicksF.appendChild(nicksIn);
  nameRow.appendChild(nicksF);
  form.appendChild(nameRow);

  // Category-specific fields
  form.appendChild(el('div', { class: 'editor-section-title' }, 'Properties'));
  const FIELDS = getCategoryFields(catKey);
  FIELDS.forEach(({ key, label, multi }) => {
    const field = el('div', { class: 'form-field form-field-wide' });
    field.appendChild(el('label', {}, label));
    if (multi) {
      const ta = el('textarea', { class: 'form-input', id: 'ed-mat-' + key, rows: 3 });
      ta.value = entry[key] || '';
      field.appendChild(ta);
    } else {
      const inp = el('input', { class: 'form-input', id: 'ed-mat-' + key, type: 'text', value: entry[key] || '' });
      field.appendChild(inp);
    }
    form.appendChild(field);
  });

  // Source
  const srcRow = el('div', { class: 'form-row' });
  const srcF   = el('div', { class: 'form-field' });
  srcF.appendChild(el('label', {}, 'Source'));
  const srcIn = el('input', { class: 'form-input', id: 'ed-mat-source', type: 'text', value: entry.source || '' });
  srcF.appendChild(srcIn);
  srcRow.appendChild(srcF);
  form.appendChild(srcRow);

  // Save / delete buttons
  const btnRow = el('div', { class: 'form-row' });
  const saveBtn = el('button', { class: 'btn btn-primary', type: 'button' }, 'Save Entry');
  saveBtn.addEventListener('click', () => commitEdit(catKey, idx));
  btnRow.appendChild(saveBtn);

  if (!isNew) {
    const delBtn = el('button', { class: 'btn btn-danger', type: 'button', style: 'margin-left:16px' }, '\u00D7 Delete');
    delBtn.addEventListener('click', () => {
      if (!confirm('Delete "' + (entry.name || 'this entry') + '"?')) return;
      mstate.data[catKey].splice(idx, 1);
      mstate.selIdx = -1;
      state.mode = 'view';
      showCategory(catKey);
    });
    btnRow.appendChild(delBtn);
  }
  form.appendChild(btnRow);

  return form;
}

function getCategoryFields(catKey) {
  const all = {
    gems:       [
      { key:'description',      label:'Description',         multi:true },
      { key:'magical_effect',   label:'Magical Effect',      multi:true },
      { key:'incorrect_belief', label:'Incorrect Belief',    multi:false },
      { key:'value',            label:'Value',               multi:false },
      { key:'notes',            label:'Notes',               multi:false },
    ],
    herbs:      [
      { key:'description',  label:'Description',  multi:true },
      { key:'effect',       label:'Effect',       multi:true },
      { key:'cost',         label:'Cost',         multi:false },
      { key:'notes',        label:'Notes',        multi:false },
    ],
    metals:     [
      { key:'description',        label:'Description',        multi:true },
      { key:'type',               label:'Type',               multi:false },
      { key:'magical_properties', label:'Magical Properties', multi:true },
      { key:'bonus',              label:'Bonus',              multi:false },
      { key:'value_gp',           label:'Value (GP)',         multi:false },
      { key:'cost_factor',        label:'Cost Factor',        multi:false },
      { key:'time_factor',        label:'Time Factor',        multi:false },
      { key:'notes',              label:'Notes',              multi:false },
    ],
    treatments: [
      { key:'source_material',  label:'Source Material',  multi:false },
      { key:'effect',           label:'Effect',           multi:true },
      { key:'notes',            label:'Notes',            multi:false },
    ],
    stones:     [
      { key:'description',  label:'Description',  multi:true },
      { key:'notes',        label:'Notes',        multi:false },
    ],
    woods:      [
      { key:'description',          label:'Description',          multi:true },
      { key:'location',             label:'Location',             multi:false },
      { key:'item_properties',      label:'Item Properties',      multi:true },
      { key:'component_properties', label:'Component Properties', multi:true },
      { key:'notes',                label:'Notes',                multi:false },
    ],
    enchanted:  [
      { key:'description',  label:'Description',  multi:true },
      { key:'notes',        label:'Notes',        multi:false },
    ],
    spells:     [
      { key:'spell_class',  label:'Class',    multi:false },
      { key:'level',        label:'Level',    multi:false },
      { key:'school',       label:'School',   multi:false },
      { key:'casting',      label:'Casting',  multi:false },
      { key:'range',        label:'Range',    multi:false },
      { key:'duration',     label:'Duration', multi:false },
      { key:'save',         label:'Save',     multi:false },
      { key:'effect',       label:'Effect',   multi:true },
    ],
  };
  return all[catKey] || [];
}

function collectEdit(catKey) {
  const fields = getCategoryFields(catKey);
  const updated = {
    name:      document.getElementById('ed-mat-name')?.value.trim()  || '',
    nicknames: (document.getElementById('ed-mat-nicks')?.value || '')
               .split(',').map(s => s.trim()).filter(Boolean),
    source:    document.getElementById('ed-mat-source')?.value.trim() || '',
  };
  fields.forEach(({ key }) => {
    const el2 = document.getElementById('ed-mat-' + key);
    if (el2) updated[key] = el2.value.trim();
  });
  return updated;
}

function commitEdit(catKey, idx) {
  const updated = collectEdit(catKey);
  const entries = mstate.data[catKey] || [];
  if (idx === -1) {
    entries.push(updated);
    mstate.data[catKey] = entries;
  } else {
    mstate.data[catKey][idx] = { ...entries[idx], ...updated };
  }
  mstate.selIdx = -1;
  state.mode = 'view';
  showCategory(catKey);
  setStatus('Entry saved \u2014 click Save to GitHub to commit', '');
}

// ── Search ────────────────────────────────────────────────────

function filterMaterials(q) {
  q = q.toLowerCase().trim();
  document.querySelectorAll('.mat-row').forEach(r => {
    r.style.display = (q && !r.textContent.toLowerCase().includes(q)) ? 'none' : '';
  });
  document.querySelectorAll('.spell-entry').forEach(r => {
    r.style.display = (q && !r.textContent.toLowerCase().includes(q)) ? 'none' : '';
  });
  document.querySelectorAll('.mat-subsource').forEach(h => {
    // Hide subsource header if all rows beneath it are hidden
    let sib = h.nextElementSibling;
    let allHidden = true;
    while (sib && !sib.classList.contains('mat-subsource')) {
      if (sib.classList.contains('mat-table')) {
        const visible = sib.querySelectorAll('.mat-row:not([style*="display: none"])');
        if (visible.length) allHidden = false;
      } else if (sib.classList.contains('spell-entry') && sib.style.display !== 'none') {
        allHidden = false;
      }
      sib = sib.nextElementSibling;
    }
    h.style.display = (q && allHidden) ? 'none' : '';
  });
}

// ── Init ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#item-list .list-item').forEach(item => {
    item.addEventListener('click', () => showCategory(item.dataset.target));
  });

  document.getElementById('search').addEventListener('input', ev => {
    filterMaterials(ev.target.value);
  });

  document.getElementById('btn-new').addEventListener('click', () => {
    mstate.selIdx = -1;
    state.mode    = 'edit';
    showPanel('editor', buildEntryEditor(mstate.cat, -1));
    updateButtons();
  });

  document.getElementById('btn-edit').addEventListener('click', () => {
    state.mode = 'edit';
    showPanel('editor', buildEntryEditor(mstate.cat, mstate.selIdx));
    updateButtons();
  });

  document.getElementById('btn-cancel').addEventListener('click', () => {
    state.mode = 'view';
    showCategory(mstate.cat);
  });

  document.getElementById('btn-save-gh').addEventListener('click', () => saveData());

  loadData();
  loadTraitsData();
});