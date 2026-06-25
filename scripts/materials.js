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
    { key:'name',                 label:'Name',                 cls:'mat-name' },
    { key:'physical_description', label:'Physical Description', cls:'mat-cell flex-2 mat-desc' },
    { key:'location',             label:'Location',             cls:'mat-cell flex-1 mat-desc' },
    { key:'use',                  label:'Use',                  cls:'mat-cell flex-2 mat-desc' },
    { key:'effect',               label:'Effect',               cls:'mat-cell flex-2 mat-effect' },
    { key:'traits',               label:'Traits',               cls:'mat-cell flex-1 mat-notes' },
    { key:'legacy_use',           label:'Legacy Use',           cls:'mat-cell flex-2 mat-notes' },
    { key:'legacy_effect',        label:'Legacy Effect',        cls:'mat-cell flex-2 mat-notes' },
    { key:'legacy_belief',        label:'Legacy Belief',        cls:'mat-cell flex-1 mat-false' },
    { key:'legacy_notes',         label:'Legacy Notes',         cls:'mat-cell flex-1 mat-notes', hasSource:true },
  ],
  herbs: [
    { key:'name',                 label:'Name',                 cls:'mat-name' },
    { key:'physical_description', label:'Physical Description', cls:'mat-cell flex-2 mat-desc' },
    { key:'location',             label:'Location',             cls:'mat-cell flex-1 mat-desc' },
    { key:'use',                  label:'Use',                  cls:'mat-cell flex-2 mat-desc' },
    { key:'effect',               label:'Effect',               cls:'mat-cell flex-2 mat-effect' },
    { key:'traits',               label:'Traits',               cls:'mat-cell flex-1 mat-notes' },
    { key:'legacy_use',           label:'Legacy Use',           cls:'mat-cell flex-2 mat-notes' },
    { key:'legacy_effect',        label:'Legacy Effect',        cls:'mat-cell flex-2 mat-notes' },
    { key:'legacy_cost',          label:'Legacy Cost',          cls:'mat-cost' },
    { key:'legacy_notes',         label:'Legacy Notes',         cls:'mat-cell flex-1 mat-notes', hasSource:true },
  ],
  metals: [
    { key:'name',                 label:'Name',                 cls:'mat-name' },
    { key:'physical_description', label:'Physical Description', cls:'mat-cell flex-2 mat-desc' },
    { key:'location',             label:'Location',             cls:'mat-cell flex-1 mat-desc' },
    { key:'use',                  label:'Use',                  cls:'mat-cell flex-2 mat-desc' },
    { key:'effect',               label:'Effect',               cls:'mat-cell flex-2 mat-effect' },
    { key:'traits',               label:'Traits',               cls:'mat-cell flex-1 mat-notes' },
    { key:'legacy_effect',        label:'Legacy Effect',        cls:'mat-cell flex-2 mat-notes' },
    { key:'legacy_bonus',         label:'Legacy Bonus',         cls:'mat-bonus' },
    { key:'legacy_value',         label:'Legacy Value',         cls:'mat-cost' },
    { key:'legacy_cost_factor',   label:'Legacy Cost ×',   cls:'mat-factor' },
    { key:'legacy_time_factor',   label:'Legacy Time ×',   cls:'mat-factor' },
    { key:'legacy_notes',         label:'Legacy Notes',         cls:'mat-cell flex-1 mat-notes', hasSource:true },
  ],
  treatments: [
    { key:'name',                 label:'Name',                 cls:'mat-name' },
    { key:'physical_description', label:'Physical Description', cls:'mat-cell flex-2 mat-desc' },
    { key:'location',             label:'Location',             cls:'mat-cell flex-1 mat-desc' },
    { key:'use',                  label:'Use',                  cls:'mat-cell flex-2 mat-desc' },
    { key:'effect',               label:'Effect',               cls:'mat-cell flex-2 mat-effect' },
    { key:'traits',               label:'Traits',               cls:'mat-cell flex-1 mat-notes' },
    { key:'legacy_use',           label:'Legacy Use',           cls:'mat-cell flex-2 mat-notes' },
    { key:'legacy_effect',        label:'Legacy Effect',        cls:'mat-cell flex-2 mat-notes' },
    { key:'legacy_notes',         label:'Legacy Notes',         cls:'mat-cell flex-1 mat-notes', hasSource:true },
  ],
  stones: [
    { key:'name',                 label:'Name',                 cls:'mat-name' },
    { key:'physical_description', label:'Physical Description', cls:'mat-cell flex-3 mat-desc' },
    { key:'location',             label:'Location',             cls:'mat-cell flex-1 mat-desc' },
    { key:'use',                  label:'Use',                  cls:'mat-cell flex-2 mat-desc' },
    { key:'effect',               label:'Effect',               cls:'mat-cell flex-2 mat-effect' },
    { key:'traits',               label:'Traits',               cls:'mat-cell flex-1 mat-notes' },
    { key:'legacy_notes',         label:'Legacy Notes',         cls:'mat-cell flex-1 mat-notes', hasSource:true },
  ],
  woods: [
    { key:'name',                 label:'Name',                 cls:'mat-name' },
    { key:'physical_description', label:'Physical Description', cls:'mat-cell flex-2 mat-desc' },
    { key:'location',             label:'Location',             cls:'mat-cell flex-1 mat-desc' },
    { key:'use',                  label:'Use',                  cls:'mat-cell flex-2 mat-desc' },
    { key:'effect',               label:'Effect',               cls:'mat-cell flex-2 mat-effect' },
    { key:'traits',               label:'Traits',               cls:'mat-cell flex-1 mat-notes' },
    { key:'legacy_use',           label:'Legacy Use',           cls:'mat-cell flex-2 mat-notes' },
    { key:'legacy_effect',        label:'Legacy Effect',        cls:'mat-cell flex-2 mat-notes' },
    { key:'legacy_notes',         label:'Legacy Notes',         cls:'mat-cell flex-1 mat-notes', hasSource:true },
  ],
  enchanted: [
    { key:'name',                 label:'Name',                 cls:'mat-name' },
    { key:'physical_description', label:'Physical Description', cls:'mat-cell flex-3 mat-desc' },
    { key:'location',             label:'Location',             cls:'mat-cell flex-1 mat-desc' },
    { key:'use',                  label:'Use',                  cls:'mat-cell flex-2 mat-desc' },
    { key:'effect',               label:'Effect',               cls:'mat-cell flex-2 mat-effect' },
    { key:'traits',               label:'Traits',               cls:'mat-cell flex-1 mat-notes' },
    { key:'legacy_notes',         label:'Legacy Notes',         cls:'mat-cell flex-1 mat-notes', hasSource:true },
  ],
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
    state.sha   = newSha;
    state.dirty = false;
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
  document.getElementById('btn-save-gh').style.display       = (t && state.dirty && !tr)   ? '' : 'none';
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

  const table = el('div', { class: 'mat-table' });

  // Header row
  const hdr = el('div', { class: 'mat-header-row' });
  cols.forEach(col => {
    hdr.appendChild(el('div', { class: col.cls || 'mat-cell' }, col.label));
  });
  table.appendChild(hdr);

  // Data rows (no source grouping -- source embedded in legacy_notes column)
  entries.forEach((entry, idx) => {
    table.appendChild(buildRow(entry, cols, catKey, idx));
  });

  wrap.appendChild(table);
}

function buildRow(entry, cols, catKey, idx) {
  const row = el('div', { class: 'mat-row', 'data-idx': String(idx) });

  cols.forEach(col => {
    const cell = el('div', { class: col.cls || 'mat-cell' });

    if (col.key === 'name') {
      // Row 1: official name
      cell.appendChild(el('div', { class: 'mat-name-primary' }, entry.name || ''));
      // Row 2: AKA nicknames
      if (entry.nicknames && entry.nicknames.length) {
        cell.appendChild(el('div', { class: 'mat-name-aka' },
          'AKA: ' + entry.nicknames.join(', ')));
      }
      // Row 3: type (orange)
      if (entry.type) {
        cell.appendChild(el('div', { class: 'mat-name-type' }, entry.type));
      }
    } else if (col.hasSource) {
      // Legacy Notes with Source sub-row
      const notes = entry.legacy_notes || '';
      const src   = entry.source || '';
      if (notes) cell.appendChild(el('div', { class: 'mat-notes-text' }, notes));
      if (src)   cell.appendChild(el('div', { class: 'mat-name-aka' }, 'Source: ' + src));
    } else if (col.key === 'traits') {
      const ts = Array.isArray(entry.traits) ? entry.traits : [];
      cell.textContent = ts.join(', ');
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
  FIELDS.forEach(({ key, label, multi, chip }) => {
    const field = el('div', { class: 'form-field form-field-wide' });
    field.appendChild(el('label', {}, label));
    if (chip) {
      const chipInput = buildTraitChipInput(entry[key] || []);
      field.appendChild(chipInput);
    } else if (multi) {
      const ta = el('textarea', { class: 'form-input', id: 'ed-mat-' + key, rows: 3 });
      ta.value = Array.isArray(entry[key]) ? entry[key].join(', ') : (entry[key] || '');
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
  const saveBtn = el('button', { class: 'btn btn-save-action', type: 'button' },
    `Save \u201c${entry.name || 'entry'}\u201d`);
  saveBtn.addEventListener('click', () => commitEdit(catKey, idx));
  btnRow.appendChild(saveBtn);

  if (!isNew) {
    const cancelBtn = el('button', { class: 'btn btn-cancel-action', type: 'button' }, 'Cancel');
    cancelBtn.addEventListener('click', () => {
      mstate.selIdx = -1;
      state.mode    = 'view';
      showCategory(mstate.cat);
      updateButtons();
    });
    btnRow.appendChild(cancelBtn);

    const delBtn = el('button', { class: 'btn btn-danger', type: 'button' },
      `Delete \u201c${entry.name || 'entry'}\u201d`);
    delBtn.addEventListener('click', () => {
      const name = entry.name || 'this entry';
      openDeleteModal(
        name,
        // Save: commit current edits to local JSON then save to GitHub
        async () => {
          commitEdit(catKey, idx);
          await saveData();
        },
        // Cancel: return to editor
        () => {},
        // Delete: remove entry and auto-save
        async () => {
          mstate.data[catKey].splice(idx, 1);
          mstate.selIdx = -1;
          state.mode    = 'view';
          showCategory(catKey);
          updateButtons();
          await saveData();
        }
      );
    });
    btnRow.appendChild(delBtn);
  }
  form.appendChild(btnRow);

  return form;
}

function buildTraitChipInput(currentTraits) {
  const wrap     = el('div', { class: 'trait-chip-wrap', id: 'trait-chip-input' });
  const chips    = el('div', { class: 'trait-chips' });
  const input    = el('input', { class: 'trait-chip-search form-input', type:'text',
                                 placeholder: 'Add trait…', autocomplete:'off' });
  const dropdown = el('div', { class: 'trait-chip-dropdown' });

  let selected = [...(Array.isArray(currentTraits) ? currentTraits : [])];

  function traitLabel(item) {
    return typeof item === 'object' ? (item.label || item.value) : item;
  }

  function renderChips() {
    chips.innerHTML = '';
    selected.forEach(t => {
      const chip = el('div', { class: 'trait-chip' });
      chip.appendChild(el('span', {}, t));
      const x = el('button', { class: 'trait-chip-x', type:'button' }, '×');
      x.addEventListener('click', () => {
        selected = selected.filter(s => s !== t);
        renderChips();
      });
      chip.appendChild(x);
      chips.appendChild(chip);
    });
  }

  function renderDropdown(q) {
    dropdown.innerHTML = '';
    dropdown.style.display = 'none';
    if (!state.traits) return;
    q = q.toLowerCase().trim();
    let any = false;
    ['general','traditions','access'].forEach(cat => {
      (state.traits[cat] || []).forEach(group => {
        const opts = (group.items || []).filter(item => {
          const lbl = traitLabel(item);
          return !selected.includes(lbl) && (!q || lbl.toLowerCase().includes(q));
        });
        if (!opts.length) return;
        any = true;
        const g = el('div', { class: 'trait-chip-group' });
        g.appendChild(el('div', { class: 'trait-chip-group-label' }, group.label || cat));
        opts.forEach(item => {
          const lbl = traitLabel(item);
          const opt = el('div', { class: 'trait-chip-option' }, lbl);
          opt.addEventListener('mousedown', e => {
            e.preventDefault();
            if (!selected.includes(lbl)) selected.push(lbl);
            input.value = '';
            renderChips();
            renderDropdown('');
          });
          g.appendChild(opt);
        });
        dropdown.appendChild(g);
      });
    });
    if (any) dropdown.style.display = '';
  }

  input.addEventListener('input', () => renderDropdown(input.value));
  input.addEventListener('focus', () => renderDropdown(input.value));
  input.addEventListener('blur',  () => { setTimeout(() => { dropdown.style.display='none'; }, 150); });

  renderChips();
  wrap.appendChild(chips);
  wrap.appendChild(input);
  wrap.appendChild(dropdown);
  wrap._getTraits = () => [...selected];
  return wrap;
}

function getCategoryFields(catKey) {
  const SHARED_NEW = [
    { key:'physical_description', label:'Physical Description', multi:true  },
    { key:'location',             label:'Location',             multi:false },
    { key:'use',                  label:'Use',                  multi:true  },
    { key:'effect',               label:'Effect',               multi:true  },
    { key:'traits',               label:'Traits',               multi:false, chip:true },
  ];
  const SHARED_LEGACY_NOTES = { key:'legacy_notes', label:'Legacy Notes', multi:true  };

  const extra = {
    gems:       [
      { key:'legacy_use',    label:'Legacy Use',    multi:true  },
      { key:'legacy_effect', label:'Legacy Effect', multi:true  },
      { key:'legacy_belief', label:'Legacy Belief', multi:false },
    ],
    herbs:      [
      { key:'legacy_use',    label:'Legacy Use',    multi:true  },
      { key:'legacy_effect', label:'Legacy Effect', multi:true  },
      { key:'legacy_cost',   label:'Legacy Cost',   multi:false },
    ],
    metals:     [
      { key:'legacy_effect',      label:'Legacy Effect',    multi:true  },
      { key:'legacy_bonus',       label:'Legacy Bonus',     multi:false },
      { key:'legacy_value',       label:'Legacy Value',     multi:false },
      { key:'legacy_cost_factor', label:'Legacy Cost ×', multi:false },
      { key:'legacy_time_factor', label:'Legacy Time ×', multi:false },
    ],
    treatments: [
      { key:'legacy_use',    label:'Legacy Use',    multi:true  },
      { key:'legacy_effect', label:'Legacy Effect', multi:true  },
    ],
    stones:     [],
    woods:      [
      { key:'legacy_use',    label:'Legacy Use',    multi:true  },
      { key:'legacy_effect', label:'Legacy Effect', multi:true  },
    ],
    enchanted:  [],
    spells:     [
      { key:'spell_class', label:'Class',    multi:false },
      { key:'level',       label:'Level',    multi:false },
      { key:'school',      label:'School',   multi:false },
      { key:'casting',     label:'Casting',  multi:false },
      { key:'range',       label:'Range',    multi:false },
      { key:'duration',    label:'Duration', multi:false },
      { key:'save',        label:'Save',     multi:false },
      { key:'effect',      label:'Effect',   multi:true  },
    ],
  };

  if (catKey === 'spells') return extra.spells;
  return [...SHARED_NEW, ...(extra[catKey] || []), SHARED_LEGACY_NOTES];
}

function collectEdit(catKey) {
  const fields = getCategoryFields(catKey);
  const updated = {
    name:      document.getElementById('ed-mat-name')?.value.trim()  || '',
    nicknames: (document.getElementById('ed-mat-nicks')?.value || '')
               .split(',').map(s => s.trim()).filter(Boolean),
    source:    document.getElementById('ed-mat-source')?.value.trim() || '',
  };
  fields.forEach(({ key, chip }) => {
    if (chip) {
      const chipWrap = document.getElementById('trait-chip-input');
      updated[key] = chipWrap ? chipWrap._getTraits() : [];
    } else {
      const el2 = document.getElementById('ed-mat-' + key);
      if (el2) updated[key] = el2.value.trim();
    }
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
  state.mode  = 'view';
  state.dirty = true;
  showCategory(catKey);
  setStatus('Entry saved \u2014 click Save to GitHub to commit', '');
  updateButtons();
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


  document.getElementById('btn-save-gh').addEventListener('click', () => saveData());

  loadData();
  loadTraitsData();
});
