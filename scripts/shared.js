'use strict';

/* ============================================================
   CONFIG  (shared fields; each section adds its own file path)
   ============================================================ */

const CONFIG = {
  owner      : 'joshlorton',
  repo       : 'skilld20',
  groupsFile : 'data/trait-groups.json',
  api        : 'https://api.github.com'
};

/* ============================================================
   STATE  (shared fields; each section adds its own entries/sha)
   ============================================================ */

const state = {
  token        : localStorage.getItem('skd20_token') || '',
  currentIndex : -1,
  dirty        : false,
  mode         : 'view',   // 'view' | 'edit' | 'traits' | section-defined modes
  traits       : { general: [], traditions: [], access: [] },
  traitsSha    : null
};

/* ============================================================
   CORE DOM HELPER
   ============================================================ */

function el(tag, attrs, ...children) {
  const e = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if      (k === 'class') e.className = v;
      else if (k === 'style') e.style.cssText = v;
      else e.setAttribute(k, v);
    }
  }
  for (const c of children) {
    if      (c === null || c === undefined) continue;
    else if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  }
  return e;
}

function hasValue(v) {
  if (v === null || v === undefined || v === '' || v === 0) return false;
  if (Array.isArray(v)) return v.some(hasValue);
  return true;
}

/* ============================================================
   STATUS + GITHUB HEADERS
   ============================================================ */

function setStatus(msg, type) {
  const s = document.getElementById('status-text');
  s.textContent = msg;
  s.className   = type ? `status-${type}` : '';
}

function ghHeaders() {
  const h = { 'Accept': 'application/vnd.github.v3+json' };
  if (state.token) h['Authorization'] = `token ${state.token}`;
  return h;
}

/* ============================================================
   GITHUB FILE I/O  (generic -- used by all sections)
   ============================================================ */

/**
 * Load a JSON file from the repo.
 * With token: uses the GitHub API (supports private repos).
 * Without token: plain static fetch (viewer mode).
 * Returns { data, sha } on success, or null on failure.
 */
async function ghReadFile(path) {
  if (state.token) {
    const resp = await fetch(
      `${CONFIG.api}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
      { headers: ghHeaders() }
    );
    if (!resp.ok) return null;
    const raw  = await resp.json();
    const b64  = atob(raw.content.replace(/\n/g, ''));
    const text = new TextDecoder().decode(Uint8Array.from(b64, c => c.charCodeAt(0)));
    return { data: JSON.parse(text), sha: raw.sha };
  } else {
    const resp = await fetch(`./${path}`);
    if (!resp.ok) return null;
    return { data: await resp.json(), sha: null };
  }
}

/**
 * Write a JSON payload to the repo via the GitHub API.
 * Returns the new SHA on success, or throws.
 * Throws with .status === 409 on conflict so callers can retry.
 */
async function ghWriteFile(path, sha, data, message) {
  const json    = JSON.stringify(data, null, 2);
  const enc     = new TextEncoder().encode(json);
  let   bin     = ''; enc.forEach(b => bin += String.fromCharCode(b));
  const content = btoa(bin);
  const resp    = await fetch(
    `${CONFIG.api}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
    { method: 'PUT',
      headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, content, sha }) }
  );
  if (resp.status === 409) {
    const e = new Error(`GitHub 409: Conflict`);
    e.status = 409;
    throw e;
  }
  if (!resp.ok) throw new Error(`GitHub ${resp.status}: ${resp.statusText}`);
  return (await resp.json()).content.sha;
}

/* ============================================================
   ACTION HELPERS  (actions apply to all game sections)
   ============================================================ */

const ACTION_LENGTHS = [
  { value: 'reaction', label: '\u21BA Reaction' },
  { value: 'action',   label: 'Action'          },
  { value: 'round',    label: 'Round'            },
  { value: 'minute',   label: 'Minute'           },
  { value: 'hour',     label: 'Hour'             },
  { value: 'day',      label: 'Day'              },
  { value: 'week',     label: 'Week'             }
];

function parseLegacyAction(val) {
  if (val === null || val === undefined) return { count: '', length: 'action' };
  if (typeof val === 'object') return { count: val.count ?? '', length: val.length ?? 'action' };
  const s = String(val).trim();
  if (s === '' || s === '-') return { count: 0, length: 'action' };
  if (s === 'F' || s === '0') return { count: 0, length: 'action' };
  if (s === 'R') return { count: '', length: 'reaction' };
  const n = parseInt(s, 10);
  if (!isNaN(n)) return { count: n, length: 'action' };
  return { count: '', length: 'action' };
}

function collectAction(count, length) {
  if (length === 'reaction') return { count: null, length: 'reaction' };
  const c = parseInt(count, 10);
  return { count: isNaN(c) ? 1 : c, length: length || 'action' };
}

function isNoAction(val) {
  if (val === null || val === undefined || val === '' || val === '-') return true;
  if (typeof val === 'object') return false;
  return false;
}

function actionSym(val) {
  if (val === null || val === undefined || val === '') return '';
  if (typeof val === 'object' && val !== null) {
    const { count, length } = val;
    if (length === 'reaction') return '\u21BA';
    if (length === 'action') {
      const n = parseInt(count, 10);
      if (isNaN(n) || n <= 0) return '\u25C7';
      return '\u25C6'.repeat(Math.min(n, 3));
    }
    const n = parseInt(count, 10);
    const c = isNaN(n) ? 1 : n;
    if (length === 'round')  return c === 1 ? '1 rnd'  : `${c} rnds`;
    if (length === 'minute') return `${c} min`;
    if (length === 'hour')   return `${c} hr`;
    if (length === 'day')    return `${c} day`;
    if (length === 'week')   return `${c} wk`;
    return String(val);
  }
  const s = String(val).toUpperCase().trim();
  if (s === '' || s === '-') return '-';
  if (s === 'R')  return '\u21BA';
  if (s === '0' || s === 'F') return '\u25C7';
  const count = Math.min(parseInt(s, 10) || 1, 3);
  return '\u25C6'.repeat(count);
}

/* ============================================================
   FORM HELPERS  (shared across editor row builders)
   ============================================================ */

function syncCountToLength(countIn, lengthSel) {
  const off = lengthSel.value === 'reaction';
  countIn.disabled    = off;
  countIn.style.opacity = off ? '0.3' : '1';
}

function clampManaInput(manaIn) {
  manaIn.addEventListener('blur', () => {
    const v = parseFloat(manaIn.value);
    if (!isNaN(v) && v < 0) manaIn.value = '0';
  });
}

function buildActionPair(actVal, idPrefix) {
  const parsed = parseLegacyAction(actVal);
  const wrap   = el('div', { class: 'action-pair' });

  const cAttrs = { type: 'number', min: '0', max: '99', class: 'form-input action-count-inp' };
  if (idPrefix) cAttrs.id = `${idPrefix}-act-count`; else cAttrs['data-field'] = 'act-count';
  const countIn = el('input', cAttrs);
  if (parsed.count !== '' && parsed.count != null) countIn.value = String(parsed.count);

  const lAttrs = { class: 'form-input form-select action-length-sel' };
  if (idPrefix) lAttrs.id = `${idPrefix}-act-length`; else lAttrs['data-field'] = 'act-length';
  const lengthSel = el('select', lAttrs);
  ACTION_LENGTHS.forEach(({ value, label }) => {
    const o = el('option', { value }, label);
    if (value === parsed.length) o.selected = true;
    lengthSel.appendChild(o);
  });

  const syncCount = () => syncCountToLength(countIn, lengthSel);
  lengthSel.addEventListener('change', syncCount);
  syncCount();

  wrap.appendChild(countIn);
  wrap.appendChild(lengthSel);
  return wrap;
}

function buildCountLengthPair(parsed) {
  const countIn = el('input', { type: 'number', min: '0', max: '99',
    class: 'form-input', 'data-field': 'act-count' });
  if (parsed.count !== '' && parsed.count != null) countIn.value = String(parsed.count);

  const lengthSel = el('select', { class: 'form-input form-select', 'data-field': 'act-length' });
  ACTION_LENGTHS.forEach(({ value, label }) => {
    const o = el('option', { value }, label);
    if (value === parsed.length) o.selected = true;
    lengthSel.appendChild(o);
  });

  const syncCount = () => syncCountToLength(countIn, lengthSel);
  lengthSel.addEventListener('change', syncCount);
  syncCount();
  return { countIn, lengthSel };
}

/* ============================================================
   MODAL
   ============================================================ */

function openModal() {
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById('token-input').value = state.token;
}
function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

/* ============================================================
   DELETE CONFIRMATION MODAL
   ============================================================ */

const _delCbs = { save: null, cancel: null, del: null };

function openDeleteModal(name, onSave, onCancel, onDelete) {
  _delCbs.save   = onSave;
  _delCbs.cancel = onCancel;
  _delCbs.del    = onDelete;
  document.getElementById('delete-modal-title').textContent = `Delete \u201c${name}\u201d?`;
  document.getElementById('btn-del-save').textContent   = `Save \u201c${name}\u201d`;
  document.getElementById('btn-del-delete').textContent = `Delete \u201c${name}\u201d`;
  document.getElementById('delete-overlay').classList.add('is-open');
}

function closeDeleteModal() {
  document.getElementById('delete-overlay').classList.remove('is-open');
}

/* ============================================================
   TRAIT GROUP SORTING
   ============================================================ */

function groupItemLabel(item) {
  return String(typeof item === 'object' ? item.label : item).toLowerCase();
}

function sortGroupItems(items) {
  return [...(items || [])].sort((a, b) =>
    groupItemLabel(a).localeCompare(groupItemLabel(b)));
}

function sortGroups(groups) {
  return [...(groups || [])]
    .map(g => ({ label: g.label, items: sortGroupItems(g.items) }))
    .sort((a, b) =>
      String(a.label || '').toLowerCase().localeCompare(String(b.label || '').toLowerCase()));
}

/* ============================================================
   TRAITS DATA  -- GitHub API (data/trait-groups.json)
   ============================================================ */

/* Fallback used if trait-groups.json cannot be fetched on first run */
const DEFAULT_TRAITS_DATA = {
  general: [
    { label: 'Condition', items: ['curse', 'disease', 'haste', 'poison', 'reposition', 'slow', 'stun'] },
    { label: 'Elemental', items: ['air', 'earth', 'fire', 'metal', 'water', 'wood'] },
    { label: 'Energy',    items: ['acid', 'cold', 'electricity', 'fire', 'force', 'lightning',
                                  'necrotic', 'negative', 'poison', 'positive', 'profane', 'psychic',
                                  'radiant', 'sacred', 'sonic'] },
    { label: 'Mental',    items: ['charm', 'compulsion', 'emotion', 'fear', 'mental', 'sleep'] },
    { label: 'Other',     items: ['animation', 'creation', 'darkness', 'enhancement', 'healing', 'illusion',
                                  'light', 'luck', 'necromancy', 'polymorph', 'reduction', 'resistance',
                                  'summoning', 'utility', 'ward'] },
    { label: 'Sensory',   items: ['auditory', 'detection', 'olfactory', 'shroud', 'tactile', 'visual'] }
  ],
  traditions: [
    { label: 'Trained',   items: ['arcane', 'bardic', 'divine'] },
    { label: 'Untrained', items: ['bloodline', 'pact'] }
  ],
  access: [
    { label: 'Arcane School', items: [
      { value: 'arcane school: elemental: air',   label: 'elemental: air'   },
      { value: 'arcane school: elemental: earth', label: 'elemental: earth' },
      { value: 'arcane school: elemental: fire',  label: 'elemental: fire'  },
      { value: 'arcane school: elemental: water', label: 'elemental: water' }
    ]},
    { label: 'Bardic Tune', items: [
      { value: 'bardic tune: discovery',  label: 'discovery'  },
      { value: 'bardic tune: lull',       label: 'lull'       },
      { value: 'bardic tune: obscure',    label: 'obscure'    },
      { value: 'bardic tune: protection', label: 'protection' }
    ]},
    { label: 'Bloodline', items: [
      { value: 'bloodline: draconic',          label: 'draconic'          },
      { value: 'bloodline: elemental: air',    label: 'elemental: air'    },
      { value: 'bloodline: elemental: earth',  label: 'elemental: earth'  },
      { value: 'bloodline: elemental: fire',   label: 'elemental: fire'   },
      { value: 'bloodline: elemental: water',  label: 'elemental: water'  },
      { value: 'bloodline: fey',               label: 'fey'               },
      { value: 'bloodline: genie: air',        label: 'genie: air'        },
      { value: 'bloodline: genie: earth',      label: 'genie: earth'      },
      { value: 'bloodline: genie: fire',       label: 'genie: fire'       },
      { value: 'bloodline: genie: water',      label: 'genie: water'      },
      { value: 'bloodline: planar',            label: 'planar'            },
      { value: 'bloodline: shadow',            label: 'shadow'            },
      { value: 'bloodline: undead',            label: 'undead'            }
    ]},
    { label: 'Divine Domain', items: [
      { value: 'divine domain: animal',           label: 'animal'           },
      { value: 'divine domain: artifice',         label: 'artifice'         },
      { value: 'divine domain: athletics',        label: 'athletics'        },
      { value: 'divine domain: chaos',            label: 'chaos'            },
      { value: 'divine domain: death',            label: 'death'            },
      { value: 'divine domain: decay',            label: 'decay'            },
      { value: 'divine domain: destruction',      label: 'destruction'      },
      { value: 'divine domain: elemental: air',   label: 'elemental: air'   },
      { value: 'divine domain: elemental: earth', label: 'elemental: earth' },
      { value: 'divine domain: elemental: fire',  label: 'elemental: fire'  },
      { value: 'divine domain: elemental: water', label: 'elemental: water' },
      { value: 'divine domain: fate',             label: 'fate'             },
      { value: 'divine domain: justice',          label: 'justice'          },
      { value: 'divine domain: knowledge',        label: 'knowledge'        },
      { value: 'divine domain: luck',             label: 'luck'             },
      { value: 'divine domain: magic',            label: 'magic'            },
      { value: 'divine domain: moon',             label: 'moon'             },
      { value: 'divine domain: order',            label: 'order'            },
      { value: 'divine domain: plant',            label: 'plant'            },
      { value: 'divine domain: protection',       label: 'protection'       },
      { value: 'divine domain: renewal',          label: 'renewal'          },
      { value: 'divine domain: repose',           label: 'repose'           },
      { value: 'divine domain: season: autumn',   label: 'season: autumn'   },
      { value: 'divine domain: season: spring',   label: 'season: spring'   },
      { value: 'divine domain: season: summer',   label: 'season: summer'   },
      { value: 'divine domain: season: winter',   label: 'season: winter'   },
      { value: 'divine domain: sun',              label: 'sun'              },
      { value: 'divine domain: time',             label: 'time'             },
      { value: 'divine domain: travel',           label: 'travel'           },
      { value: 'divine domain: undeath',          label: 'undeath'          },
      { value: 'divine domain: war',              label: 'war'              }
    ]},
    { label: 'Divine Specialty', items: [
      { value: 'divine specialty: airwalker',                label: 'airwalker'                },
      { value: 'divine specialty: deathstalker',             label: 'deathstalker'             },
      { value: 'divine specialty: firemane',                 label: 'firemane'                 },
      { value: 'divine specialty: firewalker',               label: 'firewalker'               },
      { value: 'divine specialty: icepriestess/icepriest',   label: 'icepriestess/icepriest'   },
      { value: 'divine specialty: stormlady/stormlord',      label: 'stormlady/stormlord'      },
      { value: 'divine specialty: windwalker',               label: 'windwalker'               }
    ]},
    { label: 'Pact', items: [
      { value: 'pact: genie: air',     label: 'genie: air'     },
      { value: 'pact: genie: earth',   label: 'genie: earth'   },
      { value: 'pact: genie: fire',    label: 'genie: fire'    },
      { value: 'pact: genie: water',   label: 'genie: water'   },
      { value: 'pact: the fathomless', label: 'the fathomless' }
    ]}
  ]
};

function applyTraitsData(data) {
  state.traits.general    = sortGroups(data?.general);
  state.traits.traditions = sortGroups(data?.traditions);
  state.traits.access     = sortGroups(data?.access);
}

async function loadTraitsData() {
  try {
    const result = await ghReadFile(CONFIG.groupsFile);
    if (result) {
      state.traitsSha = result.sha;
      applyTraitsData(result.data);
      return;
    }
  } catch (err) { /* fall through to defaults */ }
  applyTraitsData(DEFAULT_TRAITS_DATA);
}

async function saveTraitsData() {
  if (!state.token) { setStatus('No token set', 'error'); return false; }
  setStatus('Saving traits\u2026', 'load');
  try {
    return await attemptSaveTraits(false);
  } catch (err) {
    setStatus(`Save error: ${err.message}`, 'error');
    return false;
  }
}

async function attemptSaveTraits(isRetry) {
  const payload = {
    general    : sortGroups(state.traits.general),
    traditions : sortGroups(state.traits.traditions),
    access     : sortGroups(state.traits.access)
  };
  const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
  try {
    state.traitsSha = await ghWriteFile(
      CONFIG.groupsFile, state.traitsSha, payload, `Update trait groups [${ts}]`);
    setStatus('Traits saved to GitHub \u2713', 'ok');
    return true;
  } catch (err) {
    if (err.status === 409 && !isRetry) {
      setStatus('Conflict detected, refreshing traits\u2026', 'load');
      const r = await ghReadFile(CONFIG.groupsFile);
      if (r) state.traitsSha = r.sha;
      return attemptSaveTraits(true);
    }
    throw err;
  }
}

/* ============================================================
   APP SHELL -- shared across all section pages
   ============================================================ */

/**
 * Show a panel by ID, hiding all other .panel elements.
 * If content is provided it replaces the panel's children.
 * Sections add class="panel" to each of their content panels.
 */
function showPanel(which, content) {
  document.getElementById('empty-state').style.display = 'none';
  document.querySelectorAll('.panel').forEach(p => {
    p.style.display = p.id === which ? '' : 'none';
  });
  if (which && content) {
    const panel = document.getElementById(which);
    if (panel) { panel.innerHTML = ''; panel.appendChild(content); }
  }
}

/**
 * Render the sidebar item list from state.entries.
 * Sections must define: selectItem(idx)
 */
function renderList() {
  const list   = document.getElementById('item-list');
  const search = document.getElementById('search').value.toLowerCase();
  list.innerHTML = '';

  const filtered = state.entries.filter(f =>
    !search || (f.name || '').toLowerCase().includes(search)
  );

  const sorted = filtered.slice().sort((a, b) => {
    const n1 = (a.name || '').toLowerCase();
    const n2 = (b.name || '').toLowerCase();
    return n1 < n2 ? -1 : n1 > n2 ? 1 : 0;
  });

  if (!sorted.length) {
    list.appendChild(el('div', { class: 'list-empty' },
      state.entries.length ? 'No matches.' : 'No entries yet.'));
    return;
  }

  sorted.forEach(f => {
    const idx  = state.entries.indexOf(f);
    const item = el('div', {
      class: `list-item${idx === state.currentIndex ? ' list-item-active' : ''}`,
      'data-index': idx
    }, f.name || '(unnamed)');
    item.addEventListener('click', () => selectItem(idx));
    list.appendChild(item);
  });
}

/* ============================================================
   TRAITS MANAGER UI
   ============================================================ */

const TRAITS_CATEGORIES = [
  { key: 'general',    label: 'General'    },
  { key: 'traditions', label: 'Traditions' },
  { key: 'access',     label: 'Access'     }
];

function collectTraitsPanel() {
  const result = { general: [], traditions: [], access: [] };
  TRAITS_CATEGORIES.forEach(({ key }) => {
    const boxes = document.querySelectorAll(
      `#traits-content .group-list[data-category="${key}"] .group-box`);
    result[key] = Array.from(boxes).map(box => {
      const label = box.querySelector('.group-label-input').value.trim();
      const items = Array.from(box.querySelectorAll('.group-item-chip')).map(chip => {
        if (key === 'access') return { value: chip.dataset.value, label: chip.dataset.label };
        return chip.dataset.label;
      });
      return { label, items };
    });
  });
  return result;
}

function refreshTraitsPanel(data) {
  const sorted = {
    general    : sortGroups(data.general),
    traditions : sortGroups(data.traditions),
    access     : sortGroups(data.access)
  };
  renderTraitsPanel(sorted, document.getElementById('traits-content'));
}

function buildGroupBox(catKey, group, gi) {
  const box = el('div', { class: 'group-box' });

  const header  = el('div', { class: 'group-box-header' });
  const labelIn = el('input', { class: 'form-input group-label-input', type: 'text',
    value: group.label || '' });
  header.appendChild(labelIn);

  const removeGroupBtn = el('button', { class: 'effect-row-remove', type: 'button' }, '\u00D7');
  removeGroupBtn.addEventListener('click', () => {
    if (!confirm(`Remove group "${group.label}" and all its items?`)) return;
    const fresh = collectTraitsPanel();
    fresh[catKey].splice(gi, 1);
    refreshTraitsPanel(fresh);
  });
  header.appendChild(removeGroupBtn);
  box.appendChild(header);

  labelIn.addEventListener('blur', () => refreshTraitsPanel(collectTraitsPanel()));
  labelIn.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); labelIn.blur(); }
  });

  const itemsWrap = el('div', { class: 'group-items' });
  (group.items || []).forEach(item => {
    const isObj = typeof item === 'object';
    const val   = isObj ? item.value : item;
    const lbl   = isObj ? item.label : item;
    const chip  = el('span', { class: 'group-item-chip', 'data-value': val, 'data-label': lbl }, lbl);
    const xBtn  = el('button', { class: 'group-item-remove', type: 'button' }, '\u00D7');
    xBtn.addEventListener('click', () => {
      const fresh = collectTraitsPanel();
      fresh[catKey][gi].items = fresh[catKey][gi].items.filter(it => {
        const v = typeof it === 'object' ? it.value : it;
        return v !== val;
      });
      refreshTraitsPanel(fresh);
    });
    chip.appendChild(xBtn);
    itemsWrap.appendChild(chip);
  });
  box.appendChild(itemsWrap);

  const addRow = el('div', { class: 'group-item-add' });
  const addIn  = el('input', { class: 'form-input', type: 'text', placeholder: 'Add item\u2026' });
  const addBtn = el('button', { class: 'btn btn-secondary', type: 'button' }, '+');
  const doAdd  = () => {
    const text = addIn.value.trim();
    if (!text) return;
    const fresh = collectTraitsPanel();
    const g     = fresh[catKey][gi];
    if (catKey === 'access') {
      g.items.push({ value: `${(g.label || '').toLowerCase()}: ${text}`, label: text });
    } else {
      g.items.push(text);
    }
    refreshTraitsPanel(fresh);
    addIn.value = '';
  };
  addBtn.addEventListener('click', doAdd);
  addIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doAdd(); } });
  addRow.appendChild(addIn);
  addRow.appendChild(addBtn);
  box.appendChild(addRow);

  return box;
}

function renderTraitsPanel(data, container) {
  container.innerHTML = '';
  TRAITS_CATEGORIES.forEach(({ key, label }) => {
    container.appendChild(el('div', { class: 'editor-section-title' }, label));

    const list = el('div', { class: 'group-list', 'data-category': key });
    (data[key] || []).forEach((group, gi) => list.appendChild(buildGroupBox(key, group, gi)));
    container.appendChild(list);

    const addGroupBtn = el('button',
      { class: 'btn btn-secondary group-add-btn', type: 'button' }, '+ Add Group');
    addGroupBtn.addEventListener('click', () => {
      const fresh = collectTraitsPanel();
      fresh[key].push({ label: 'New Group', items: [] });
      refreshTraitsPanel(fresh);
    });
    container.appendChild(addGroupBtn);
  });
}

function buildTraitsManagerPanel() {
  const wrap    = el('div', { class: 'editor-form' });
  const content = el('div', { id: 'traits-content' });
  wrap.appendChild(content);
  renderTraitsPanel({
    general    : sortGroups(state.traits.general),
    traditions : sortGroups(state.traits.traditions),
    access     : sortGroups(state.traits.access)
  }, content);
  return wrap;
}

/* ============================================================
   INIT -- shared event listeners only
   Sections add their own DOMContentLoaded listener for
   section-specific buttons and data loading.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Active nav link -- matches current filename; handles trailing-slash roots
  const page = window.location.pathname.replace(/\/$/, '/index.html').split('/').pop() || 'index.html';
  document.querySelectorAll('#nav-rail .nav-rail-item').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('nav-link-active');
  });

  // Search
  document.getElementById('search').addEventListener('input', renderList);

  // Sidebar resize
  const SIDEBAR_MIN = 140;
  const SIDEBAR_MAX = 500;
  const SIDEBAR_KEY = 'skd20_sidebar_width';
  const root        = document.documentElement;

  const savedWidth = localStorage.getItem(SIDEBAR_KEY);
  if (savedWidth) root.style.setProperty('--sidebar-width', savedWidth + 'px');

  const handle = document.getElementById('sidebar-handle');
  handle.addEventListener('dragstart', e => e.preventDefault());
  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    document.body.style.userSelect = 'none';
    document.body.style.cursor     = 'col-resize';
    const onMove = mv => {
      mv.preventDefault();
      const w = Math.min(Math.max(mv.clientX, SIDEBAR_MIN), SIDEBAR_MAX);
      root.style.setProperty('--sidebar-width', w + 'px');
    };
    const onUp = mv => {
      document.body.style.userSelect = '';
      document.body.style.cursor     = '';
      const w = Math.min(Math.max(mv.clientX, SIDEBAR_MIN), SIDEBAR_MAX);
      localStorage.setItem(SIDEBAR_KEY, w);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  });

  // Token modal
  document.getElementById('btn-token').addEventListener('click', openModal);

  document.getElementById('btn-token-save').addEventListener('click', () => {
    const t = document.getElementById('token-input').value.trim();
    state.token = t;
    if (t) localStorage.setItem('skd20_token', t);
    else   localStorage.removeItem('skd20_token');
    closeModal();
    if (typeof onTokenChange === 'function') onTokenChange();
  });

  document.getElementById('btn-token-clear').addEventListener('click', () => {
    state.token = '';
    localStorage.removeItem('skd20_token');
    closeModal();
    if (typeof onTokenChange === 'function') onTokenChange();
  });

  document.getElementById('btn-token-cancel').addEventListener('click', closeModal);

  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'modal-overlay') closeModal();
  });

  // Inject delete confirmation modal into body
  const delOverlay = document.createElement('div');
  delOverlay.id = 'delete-overlay';
  delOverlay.innerHTML =
    '<div id="delete-modal">' +
    '<h3 id="delete-modal-title">Delete?</h3>' +
    '<p>This action cannot be undone.</p>' +
    '<div id="delete-modal-buttons">' +
    '<button id="btn-del-save"   class="btn btn-save-action"></button>' +
    '<button id="btn-del-cancel" class="btn btn-cancel-action">Cancel</button>' +
    '<button id="btn-del-delete" class="btn btn-delete-action"></button>' +
    '</div></div>';
  document.body.appendChild(delOverlay);

  document.getElementById('btn-del-save').addEventListener('click', () => {
    closeDeleteModal(); if (_delCbs.save)   _delCbs.save();
  });
  document.getElementById('btn-del-cancel').addEventListener('click', () => {
    closeDeleteModal(); if (_delCbs.cancel) _delCbs.cancel();
  });
  document.getElementById('btn-del-delete').addEventListener('click', () => {
    closeDeleteModal(); if (_delCbs.del)    _delCbs.del();
  });

  delOverlay.addEventListener('click', e => {
    if (e.target.id === 'delete-overlay') closeDeleteModal();
  });

});
