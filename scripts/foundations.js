'use strict';

/* ============================================================
   CONFIG
   ============================================================ */

const CONFIG = {
  owner : 'joshlorton',
  repo  : 'skilld20',
  file  : 'data/foundations.json',
  api   : 'https://api.github.com'
};

/* ============================================================
   STATE
   ============================================================ */

const state = {
  foundations  : [],
  currentIndex : -1,
  sha          : null,
  token        : localStorage.getItem('skd20_token') || '',
  dirty        : false,
  mode         : 'view'   // 'view' | 'edit'
};

/* ============================================================
   UTILITIES
   ============================================================ */

function actionSym(n) {
  if (n === null || n === undefined || n === '') return '';
  const s = String(n).toUpperCase().trim();
  if (s === 'R')  return '↺';
  if (s === '0' || s === 'F') return '◇';
  const count = Math.min(parseInt(s, 10) || 1, 3);
  return '◆'.repeat(count);
}

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

function spellComponent(comp) {
  if (!comp) return '';
  const MAP = { v: 'Verbal', s: 'Somatic', m: 'Material', f: 'Focus' };
  return comp.toLowerCase().split(/[+|,\s]+/)
    .map(c => MAP[c.trim()] || c.trim())
    .filter(Boolean).join(', ');
}

function setStatus(msg, type) {
  const s = document.getElementById('status-text');
  s.textContent = msg;
  s.className   = type ? `status-${type}` : '';
}

/* ============================================================
   GITHUB API
   ============================================================ */

function ghHeaders() {
  const h = { 'Accept': 'application/vnd.github.v3+json' };
  if (state.token) h['Authorization'] = `token ${state.token}`;
  return h;
}

async function loadData() {
  setStatus('Loading…', 'load');
  try {
    if (state.token) {
      const resp = await fetch(
        `${CONFIG.api}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.file}`,
        { headers: ghHeaders() }
      );
      if (!resp.ok) throw new Error(`GitHub ${resp.status}: ${resp.statusText}`);
      const raw   = await resp.json();
      state.sha   = raw.sha;
      const text  = decodeURIComponent(escape(atob(raw.content.replace(/\n/g, ''))));
      const data  = JSON.parse(text);
      state.foundations = data.foundations || [];
      setStatus(`Loaded from GitHub (${state.foundations.length})`, 'ok');
    } else {
      const resp = await fetch(`./${CONFIG.file}`);
      if (!resp.ok) throw new Error(`Fetch ${resp.status}: ${resp.statusText}`);
      const data = await resp.json();
      state.foundations = data.foundations || [];
      setStatus('Viewer mode :: no token', '');
    }
  } catch (err) {
    setStatus(`Error: ${err.message}`, 'error');
    state.foundations = [];
  }
  renderList();
  updateButtons();
}

async function fetchCurrentSha() {
  const resp = await fetch(
    `${CONFIG.api}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.file}`,
    { headers: ghHeaders() }
  );
  if (!resp.ok) throw new Error(`GitHub ${resp.status}: ${resp.statusText}`);
  const raw = await resp.json();
  state.sha = raw.sha;
}

async function saveData() {
  if (!state.token) { setStatus('No token set', 'error'); return false; }
  setStatus('Saving\u2026', 'load');
  try {
    return await attemptSave(false);
  } catch (err) {
    setStatus(`Save error: ${err.message}`, 'error');
    return false;
  }
}

async function attemptSave(isRetry) {
  const json    = JSON.stringify({ foundations: state.foundations }, null, 2);
  const content = btoa(unescape(encodeURIComponent(json)));
  const ts      = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const body    = { message: `Update foundations [${ts}]`, content, sha: state.sha };
  const resp    = await fetch(
    `${CONFIG.api}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.file}`,
    { method: 'PUT', headers: { ...ghHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  if (resp.status === 409 && !isRetry) {
    setStatus('Conflict detected, refreshing\u2026', 'load');
    await fetchCurrentSha();
    return attemptSave(true);
  }
  if (!resp.ok) throw new Error(`GitHub ${resp.status}: ${resp.statusText}`);
  const result = await resp.json();
  state.sha    = result.content.sha;
  state.dirty  = false;
  setStatus('Saved to GitHub \u2713', 'ok');
  return true;
}

/* ============================================================
   RENDERING — TRAIT BAR
   ============================================================ */

function traitTag(text, cls) {
  const classes = ['trait-tag', cls].filter(Boolean).join(' ');
  return el('span', { class: classes }, text);
}

function renderTraitBar(f) {
  const bar = el('div', { class: 'trait-bar' });

  if (f.rarity) {
    bar.appendChild(traitTag(f.rarity,
      `trait-rarity-${f.rarity.toLowerCase()}`));
  }
  if (f.difficulty) {
    bar.appendChild(traitTag(f.difficulty,
      `trait-difficulty-${f.difficulty.toLowerCase().replace(/\s+/g, '-')}`));
  }
  (f.traits     || []).filter(Boolean).forEach(t =>
    bar.appendChild(traitTag(t, '')));
  (f.traditions || []).filter(Boolean).forEach(t =>
    bar.appendChild(traitTag(t, `trait-tradition-${t.toLowerCase()}`)));
  (f.access     || []).filter(Boolean).forEach(t => {
    const lower = t.toLowerCase();
    let key = 'pact';
    if      (lower.startsWith('arcane'))    key = 'arcane';
    else if (lower.startsWith('bloodline')) key = 'bloodline';
    else if (lower.startsWith('divine'))    key = 'divine';
    else if (lower.startsWith('bardic'))    key = 'bardic';
    // Strip category prefix for display ("arcane school: elemental: fire" → "elemental: fire")
    const colonIdx = t.indexOf(': ');
    const display  = colonIdx >= 0 ? t.slice(colonIdx + 2) : t;
    bar.appendChild(traitTag(display, `trait-access-${key}`));
  });

  return bar;
}

/* ============================================================
   RENDERING — SPEC SHEET
   ============================================================ */

function specRow(label, value) {
  if (!hasValue(value)) return null;
  const row = el('div', { class: 'spec-row' });
  row.appendChild(el('b', { class: 'spec-label' }, label));
  row.appendChild(el('span', { class: 'spec-value' }, String(value)));
  return row;
}

function specRowCast(f) {
  const cast = f.cast;
  if (!cast) return null;
  const row = el('div', { class: 'spec-row' });
  row.appendChild(el('b', { class: 'spec-label' }, 'Cast'));
  const val = el('span', { class: 'spec-value' });
  if (hasValue(cast.actions)) val.appendChild(el('span', { class: 'action-sym' }, actionSym(cast.actions)));
  if (cast.component) val.appendChild(document.createTextNode(` ${spellComponent(cast.component)}`));
  row.appendChild(val);
  return row;
}

function renderSpecs(f) {
  const sheet = el('div', { class: 'spec-sheet' });
  const add = r => r && sheet.appendChild(r);

  add(specRowCast(f));
  if (f.cast?.trigger) add(specRow('Trigger', f.cast.trigger));

  if (hasValue(f.range)) add(specRow('Range', f.range));

  if (f.area?.size || f.area?.shape) {
    const parts = [];
    if (f.area.size) parts.push(`${f.area.size}'`);
    if (f.area.shape) parts.push(f.area.shape);
    add(specRow('Area', parts.join('-')));
  }

  if (f.targets?.count || f.targets?.type) {
    add(specRow('Targets', [f.targets.count, f.targets.type].filter(Boolean).join(' ')));
  }

  if (hasValue(f.duration)) add(specRow('Duration', f.duration));

  return sheet;
}

/* ============================================================
   RENDERING — EFFECT
   ============================================================ */

function renderEffect(f) {
  if (!f.effect?.base) return null;
  const section = el('div', { class: 'section-effect' });
  section.appendChild(el('div', { class: 'result-heading' }, 'Effect'));
  section.appendChild(el('p', { class: 'effect-base' }, f.effect.base));

  const opts = (f.effect.options || []).filter(Boolean);
  if (opts.length) {
    const grid = el('div', { class: 'effect-options' });
    opts.forEach(opt => {
      const row = el('div', { class: 'effect-option-row' });
      if (typeof opt === 'object') {
        row.appendChild(el('b',    { class: 'effect-option-label' }, opt.option || ''));
        row.appendChild(el('span', {},                                opt.effect || ''));
      } else {
        row.appendChild(el('span', {}, ''));
        row.appendChild(el('span', {}, String(opt)));
      }
      grid.appendChild(row);
    });
    section.appendChild(grid);
  }

  // Attack, Save, Damage moved from spec sheet into effect section
  if (f.attack?.type) {
    section.appendChild(specRow('Attack', [f.attack.type, f.attack.modifier].filter(Boolean).join(' ')));
  }
  if (f.save?.type) {
    section.appendChild(specRow('Saving Throw', [f.save.type, f.save.modifier].filter(Boolean).join(' ')));
  }
  if (f.damage?.dieNumber) {
    const d = f.damage;
    const mod = d.modifier ?? d.bonus;
    section.appendChild(specRow('Damage', `${d.dieNumber}d${d.dieSize}${mod ? `+${mod}` : ''} ${d.type || ''}`.trim()));
  }

  return section;
}

/* ============================================================
   RENDERING — RESULT BLOCKS
   ============================================================ */

function resultRow(label, value, cls) {
  const resolved = Array.isArray(value) ? value : (value ? [value] : []);
  const clean    = resolved.filter(Boolean);
  if (!clean.length) return null;

  const row = el('div', { class: `result-row${cls ? ' ' + cls : ''}` });
  const labelClass = cls === 'skill-row' ? 'skill-label' : 'result-label';
  row.appendChild(el('b', { class: labelClass }, label));
  const val = el('div', { class: 'result-value' });
  if (clean.length === 1) {
    val.textContent = clean[0];
  } else {
    clean.forEach((line, i) => val.appendChild(el('div', {}, `(${i + 1}) ${line}`)));
  }
  row.appendChild(val);
  return row;
}

function renderResults(f) {
  const section = el('div', { class: 'section-results' });
  let any = false;

  // Skill
  const sk = f.skill;
  if (sk?.primary?.some(Boolean)) {
    const block = el('div', { class: 'result-block' });
    block.appendChild(el('div', { class: 'result-heading' }, 'Skill Check'));
    const addRow = (label, val, cls) => { const r = resultRow(label, val, cls); if (r) block.appendChild(r); };
    if (sk.primary?.length)   addRow('Primary',   sk.primary.join(', '),   'skill-row');
    if (sk.secondary?.length) addRow('Secondary', sk.secondary.join(', '), 'skill-row');
    addRow('Critical Success', sk.cs, 'row-cs');
    addRow('Success',          sk.s || ['Expected effect.'], 'row-s');
    addRow('Failure',          sk.f || ['Failed cast. No effect.'], 'row-sf');
    addRow('Critical Failure', sk.cf, 'row-cf');
    section.appendChild(block); any = true;
  }

  // Attack
  if (f.attack?.type && f.attack_results) {
    const ar = f.attack_results;
    const block = el('div', { class: 'result-block' });
    block.appendChild(el('div', { class: 'result-heading' }, `Attack -- ${f.attack.type}`));
    const addRow = (l, v, c) => { const r = resultRow(l, v, c); if (r) block.appendChild(r); };
    addRow('Critical Success', ar.cs, 'row-cs');
    addRow('Success',          ar.s || ['Normal damage.'], 'row-s');
    addRow('Failure',          ar.f || ['Missed. No effect.'], 'row-sf');
    addRow('Critical Failure', ar.cf, 'row-cf');
    section.appendChild(block); any = true;
  }

  // Save
  if (f.save?.type && f.save_results) {
    const sr = f.save_results;
    const block = el('div', { class: 'result-block' });
    block.appendChild(el('div', { class: 'result-heading' }, `Save -- ${f.save.type}`));
    const addRow = (l, v, c) => { const r = resultRow(l, v, c); if (r) block.appendChild(r); };
    addRow('Critical Success', sr.cs, 'row-cs');
    addRow('Success',          sr.s, 'row-s');
    addRow('Failure',          sr.f, 'row-sf');
    addRow('Critical Failure', sr.cf, 'row-cf');
    section.appendChild(block); any = true;
  }

  return any ? section : null;
}

/* ============================================================
   RENDERING — ACTION ROWS
   ============================================================ */

function actionRow(item, idx) {
  const row = el('div', { class: `action-row ${idx % 2 === 0 ? 'row-odd' : 'row-even'}` });
  if (item.attribute)   row.appendChild(el('b',    { class: 'action-attribute' }, item.attribute));
  if (item.variant)     row.appendChild(el('span', { class: 'action-variant'   }, item.variant));
  if (hasValue(item.actions)) row.appendChild(el('span', { class: 'action-sym' }, actionSym(item.actions)));
  if (item.component)   row.appendChild(el('span', { class: 'action-component' }, spellComponent(item.component)));
  if (item.effect)      row.appendChild(el('span', { class: 'action-effect'    }, item.effect));
  if (item.mana !== undefined && item.mana !== null && item.mana !== '') {
    const m = Number(item.mana);
    const label = isNaN(m) ? String(item.mana) : (m >= 0 ? `+${m}` : `${m}`);
    row.appendChild(el('span', { class: 'action-mana' }, label));
  }
  return row;
}

function componentRow(item, idx) {
  const row = el('div', { class: `action-row ${idx % 2 === 0 ? 'row-odd' : 'row-even'}` });
  if (item.attribute)   row.appendChild(el('b',    { class: 'action-attribute'   }, item.attribute));
  if (item.variant)     row.appendChild(el('span', { class: 'action-variant'     }, item.variant));
  if (hasValue(item.actions)) row.appendChild(el('span', { class: 'action-sym'   }, actionSym(item.actions)));
  if (item.component)   row.appendChild(el('span', { class: 'action-component'   }, spellComponent(item.component)));
  if (item.effect)      row.appendChild(el('span', { class: 'action-effect'      }, item.effect));
  if (item.description) row.appendChild(el('span', { class: 'action-description' }, item.description));
  if (item.price)       row.appendChild(el('span', { class: 'action-price'       }, `${item.price} gp`));
  return row;
}

function sdComponent(comp) {
  if (!comp) return '-';
  const MAP = { verbal: 'V', somatic: 'S', material: 'M', focus: 'F',
                v: 'V', s: 'S', m: 'M', f: 'F' };
  return comp.toLowerCase().split(/[+|,\s]+/)
    .map(c => MAP[c.trim()] || c.trim().charAt(0).toUpperCase())
    .filter(Boolean).join(' ');
}

function sustainRow(item, idx) {
  const row = el('div', { class: `action-row ${idx % 2 === 0 ? 'row-odd' : 'row-even'}` });
  if (item.variant)   row.appendChild(el('span', { class: 'action-variant'   }, item.variant));
  if (hasValue(item.actions)) row.appendChild(el('span', { class: 'action-sym' }, actionSym(item.actions)));
  row.appendChild(el('span', { class: 'action-component' }, sdComponent(item.component)));
  if (item.effect)    row.appendChild(el('span', { class: 'action-effect'    }, item.effect));
  if (item.mana !== undefined && item.mana !== null && item.mana !== '') {
    const m = Number(item.mana);
    const label = isNaN(m) ? String(item.mana) : (m >= 0 ? `+${m}` : `${m}`);
    row.appendChild(el('span', { class: 'action-mana' }, label));
  }
  return row;
}

function renderActionSection(title, items, rowFn) {
  if (!items?.length) return null;
  const active = items.filter(i => i && (i.effect || i.description || hasValue(i.actions)));
  if (!active.length) return null;
  const section = el('div', { class: 'section-action' });
  section.appendChild(el('div', { class: 'section-heading' }, title));
  active.forEach((item, i) => section.appendChild(rowFn(item, i)));
  return section;
}

function renderSustainDismiss(f) {
  const sustainItems = (f.sustain || []).filter(s => s?.effect);
  const dismissRaw   = f.dismiss;
  const dismissItems = Array.isArray(dismissRaw)
    ? dismissRaw.filter(d => d?.effect)
    : (dismissRaw?.effect ? [dismissRaw] : []);

  if (!sustainItems.length && !dismissItems.length) return null;

  const section = el('div', { class: 'section-action' });

  if (sustainItems.length) {
    section.appendChild(el('div', { class: 'result-heading' }, 'Sustain'));
    sustainItems.forEach((s, i) => section.appendChild(sustainRow(s, i)));
  }
  if (dismissItems.length) {
    section.appendChild(el('div', { class: 'result-heading' }, 'Dismiss'));
    dismissItems.forEach((d, i) => section.appendChild(sustainRow(d, i)));
  }
  return section;
}

/* ============================================================
   RENDERING — VARIANTS
   ============================================================ */

function renderVariants(f) {
  const variants = (f.variants || []).filter(v => v?.name);
  if (!variants.length) return null;

  const section = el('div', { class: 'section-variants' });
  section.appendChild(el('div', { class: 'section-heading-major' }, 'Variants'));

  variants.forEach(v => {
    const block = el('div', { class: 'variant-block' });

    // Heading
    const heading = el('div', { class: 'variant-heading' });
    heading.appendChild(el('span', { class: 'variant-name' }, v.name));
    if (v.mana) heading.appendChild(el('span', { class: 'variant-mana' }, `+${v.mana} mana`));
    block.appendChild(heading);

    // Traits (only if set)
    if (v.rarity || v.difficulty || v.traits?.length || v.traditions?.length || v.access?.length) {
      block.appendChild(renderTraitBar(v));
    }

    // Specs (only non-empty)
    const specs = renderSpecs(v);
    if (specs.children.length) block.appendChild(specs);

    // Effect
    const effect = renderEffect(v);
    if (effect) block.appendChild(effect);

    // Results
    const results = renderResults(v);
    if (results) block.appendChild(results);

    // Sustain/Dismiss
    const sd = renderSustainDismiss(v);
    if (sd) block.appendChild(sd);

    section.appendChild(block);
  });

  return section;
}

/* ============================================================
   RENDERING — FULL VIEWER
   ============================================================ */

function renderViewer(f) {
  const card = el('div', { class: 'foundation-card' });

  // Heading
  const heading = el('div', { class: 'foundation-heading' });
  heading.appendChild(el('span', { class: 'foundation-name' }, f.name || 'Unnamed'));
  if (f.mana !== undefined && f.mana !== '') {
    heading.appendChild(el('span', { class: 'foundation-mana' }, `Foundation ${f.mana}`));
  }
  card.appendChild(heading);

  // Trait bar
  card.appendChild(renderTraitBar(f));

  // Specs
  const specs = renderSpecs(f);
  if (specs.children.length) card.appendChild(specs);

  // Effect
  const effect = renderEffect(f);
  if (effect) card.appendChild(effect);

  // Results
  const results = renderResults(f);
  if (results) card.appendChild(results);

  // Sustain / Dismiss
  const sd = renderSustainDismiss(f);
  if (sd) card.appendChild(sd);

  // Heightened
  const ht = renderActionSection('Heightened', f.heightened, actionRow);
  if (ht) card.appendChild(ht);

  // Variants
  const vt = renderVariants(f);
  if (vt) card.appendChild(vt);

  // Components
  const co = renderActionSection('Components', f.components, componentRow);
  if (co) card.appendChild(co);

  return card;
}

/* ============================================================
   EDITOR — FIELD HELPERS
   ============================================================ */

function edField(label, id, value, type) {
  const wrap = el('div', { class: 'form-field' });
  wrap.appendChild(el('label', { for: id }, label));
  const input = el(type === 'textarea' ? 'textarea' : 'input', { id, class: 'form-input' });
  if (type !== 'textarea') input.type = type || 'text';
  input.value = (value !== null && value !== undefined) ? String(value) : '';
  if (type === 'textarea') input.rows = 3;
  wrap.appendChild(input);
  return wrap;
}

function edNum(label, id, value, min, step) {
  const wrap = el('div', { class: 'form-field' });
  wrap.appendChild(el('label', { for: id }, label));
  const input = el('input', { id, class: 'form-input', type: 'number' });
  if (min !== undefined && min !== null) input.min = String(min);
  if (step !== undefined) input.step = String(step);
  input.value = (value !== null && value !== undefined && value !== '') ? String(value) : '';
  wrap.appendChild(input);
  return wrap;
}

function edSelect(label, id, value, options) {
  const wrap = el('div', { class: 'form-field' });
  wrap.appendChild(el('label', { for: id }, label));
  const sel = el('select', { id, class: 'form-input form-select' });
  sel.appendChild(el('option', { value: '' }, ''));
  options.forEach(opt => {
    const v = typeof opt === 'object' ? opt.value : opt;
    const l = typeof opt === 'object' ? opt.label : opt;
    const o = el('option', { value: String(v) }, l);
    if (String(v) === String(value)) o.selected = true;
    sel.appendChild(o);
  });
  wrap.appendChild(sel);
  return wrap;
}

function edCheckboxes(label, groupId, currentValue) {
  const wrap  = el('div', { class: 'form-field' });
  wrap.appendChild(el('label', {}, label));
  const group = el('div', { class: 'checkbox-group', id: groupId });
  const cv    = (currentValue || '').toLowerCase();
  ['V', 'S', 'M', 'F'].forEach(comp => {
    const cbId  = `${groupId}-${comp}`;
    const cbWrap = el('label', { class: 'checkbox-label', for: cbId });
    const cb    = el('input', { type: 'checkbox', id: cbId, value: comp.toLowerCase() });
    if (cv.includes(comp.toLowerCase())) cb.checked = true;
    cbWrap.appendChild(cb);
    cbWrap.appendChild(document.createTextNode(comp));
    group.appendChild(cbWrap);
  });
  wrap.appendChild(group);
  return wrap;
}

function edGroupedCheckboxes(label, groupId, currentValues, groups, labelClass) {
  const cv   = new Set((currentValues || []).map(v => String(v).toLowerCase()));
  const wrap = el('div', { class: 'form-field form-field-wide' });
  const cls  = ['form-label-tag', labelClass].filter(Boolean).join(' ');
  wrap.appendChild(el('label', { class: cls }, label));
  const container = el('div', { class: 'checkbox-container', id: groupId });

  groups.forEach(group => {
    const section = el('div', { class: 'checkbox-section' });
    if (group.label) section.appendChild(el('span', { class: 'checkbox-section-label' }, group.label));
    const row = el('div', { class: 'checkbox-group checkbox-group-wrap' });
    group.items.forEach(item => {
      const val  = typeof item === 'object' ? item.value : item;
      const text = typeof item === 'object' ? item.label : item;
      const cbId = `${groupId}-${val.replace(/[\s/[\]]/g, '-')}`;
      const lbl  = el('label', { class: 'checkbox-label', for: cbId });
      const cb   = el('input', { type: 'checkbox', id: cbId, value: val });
      if (cv.has(val.toLowerCase())) cb.checked = true;
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(text));
      row.appendChild(lbl);
    });
    section.appendChild(row);
    container.appendChild(section);
  });

  wrap.appendChild(container);
  return wrap;
}

function edJson(label, id, value) {
  const wrap = el('div', { class: 'form-field' });
  wrap.appendChild(el('label', { for: id }, label));
  const ta = el('textarea', { id, class: 'form-input form-json', rows: 5 });
  const hasContent = Array.isArray(value) ? value.length : (value && Object.keys(value).length);
  ta.value = hasContent ? JSON.stringify(value, null, 2) : '';
  wrap.appendChild(ta);
  return wrap;
}

function edRow(...fields) {
  const r = el('div', { class: 'form-row' });
  fields.forEach(f => r.appendChild(f));
  return r;
}

/* ============================================================
   EDITOR — SUSTAIN / DISMISS BUILDER
   ============================================================ */

function buildSdRow(data) {
  data = data || {};
  const row = el('div', { class: 'sd-row' });

  const actSel = el('select', { class: 'form-input form-select', 'data-field': 'actions' });
  [{ v: '', l: '' }, { v: 'F', l: '\u25C7' }, { v: '1', l: '\u25C6' },
   { v: '2', l: '\u25C6\u25C6' }, { v: '3', l: '\u25C6\u25C6\u25C6' }, { v: 'R', l: '\u21BA' }]
    .forEach(({ v, l }) => {
      const o = el('option', { value: v }, l);
      if (String(data.actions) === v) o.selected = true;
      actSel.appendChild(o);
    });
  row.appendChild(actSel);

  const compIn = el('input', { class: 'form-input', type: 'text',
    placeholder: 'V S M F', 'data-field': 'component' });
  compIn.value = data.component || '';
  row.appendChild(compIn);

  const efTa = el('textarea', { class: 'form-input', rows: 2, 'data-field': 'effect' });
  efTa.value = data.effect || '';
  row.appendChild(efTa);

  const manaIn = el('input', { class: 'form-input', type: 'number', 'data-field': 'mana' });
  if (data.mana !== undefined && data.mana !== '') manaIn.value = String(data.mana);
  row.appendChild(manaIn);

  return row;
}

function buildSdSection(title, containerId, initialData) {
  const col = el('div', { class: 'form-results-col' });

  const heading = el('div', { class: 'sd-heading' });
  heading.appendChild(el('span', {}, title));
  const addBtn = el('button', { class: 'sd-add-btn', type: 'button' }, '+');
  heading.appendChild(addBtn);
  col.appendChild(heading);

  const labels = el('div', { class: 'sd-labels' });
  ['Actions', 'Component', 'Effect', 'Mana'].forEach(l =>
    labels.appendChild(el('span', { class: 'sd-label' }, l)));
  col.appendChild(labels);

  const container = el('div', { id: containerId });
  const rows = Array.isArray(initialData)
    ? initialData
    : (initialData && (initialData.effect || initialData.actions) ? [initialData] : []);
  if (rows.length) rows.forEach(r => container.appendChild(buildSdRow(r)));
  else container.appendChild(buildSdRow({}));
  col.appendChild(container);

  addBtn.addEventListener('click', () => container.appendChild(buildSdRow({})));
  return col;
}

function collectSdRows(containerId) {
  const rows = document.querySelectorAll(`#${containerId} .sd-row`);
  return Array.from(rows).map(row => {
    const get = f => row.querySelector(`[data-field="${f}"]`)?.value?.trim() || '';
    const m = get('mana');
    return { actions: get('actions'), component: get('component'),
             effect: get('effect'), mana: m !== '' ? parseFloat(m) : 0 };
  }).filter(r => r.effect);
}

const HT_ATTRIBUTES = [
  { value: 'range',      label: 'Range'      },
  { value: 'area size',  label: 'Area Size'  },
  { value: 'area shape', label: 'Area Shape' },
  { value: 'targets',    label: 'Targets'    },
  { value: 'duration',   label: 'Duration'   },
  { value: 'effect',     label: 'Effect'     },
  { value: 'damage',     label: 'Damage'     }
];

function buildHtRow(data) {
  data = data || {};
  const row = el('div', { class: 'ht-row' });

  const varIn = el('input', { class: 'form-input', type: 'text',
    placeholder: 'Variant', 'data-field': 'variant' });
  varIn.value = data.variant || '';
  row.appendChild(varIn);

  const attrSel = el('select', { class: 'form-input form-select', 'data-field': 'attribute' });
  attrSel.appendChild(el('option', { value: '' }, ''));
  HT_ATTRIBUTES.forEach(({ value, label }) => {
    const o = el('option', { value }, label);
    if (data.attribute === value) o.selected = true;
    attrSel.appendChild(o);
  });
  row.appendChild(attrSel);

  const actSel = el('select', { class: 'form-input form-select', 'data-field': 'actions' });
  [{ v: '', l: '' }, { v: 'F', l: '\u25C7' }, { v: '1', l: '\u25C6' },
   { v: '2', l: '\u25C6\u25C6' }, { v: '3', l: '\u25C6\u25C6\u25C6' }, { v: 'R', l: '\u21BA' }]
    .forEach(({ v, l }) => {
      const o = el('option', { value: v }, l);
      if (String(data.actions) === v) o.selected = true;
      actSel.appendChild(o);
    });
  row.appendChild(actSel);

  const compIn = el('input', { class: 'form-input', type: 'text',
    placeholder: 'V S M F', 'data-field': 'component' });
  compIn.value = data.component || '';
  row.appendChild(compIn);

  const efTa = el('textarea', { class: 'form-input', rows: 2, 'data-field': 'effect' });
  efTa.value = data.effect || '';
  row.appendChild(efTa);

  const manaIn = el('input', { class: 'form-input', type: 'number', min: '0', 'data-field': 'mana' });
  if (data.mana !== undefined && data.mana !== '') manaIn.value = String(data.mana);
  row.appendChild(manaIn);

  return row;
}

function buildHtSection(initialData) {
  const wrap = el('div', { class: 'form-field form-field-wide' });

  const heading = el('div', { class: 'sd-heading' });
  heading.appendChild(el('span', {}, 'Heightened'));
  const addBtn = el('button', { class: 'sd-add-btn', type: 'button' }, '+');
  heading.appendChild(addBtn);
  wrap.appendChild(heading);

  const labels = el('div', { class: 'ht-labels' });
  ['Option', 'Attribute', 'Act', 'Comp', 'Effect', 'Mana'].forEach(l =>
    labels.appendChild(el('span', { class: 'sd-label' }, l)));
  wrap.appendChild(labels);

  const container = el('div', { id: 'heightened-rows' });
  const rows = Array.isArray(initialData) ? initialData : [];
  if (rows.length) rows.forEach(r => container.appendChild(buildHtRow(r)));
  else container.appendChild(buildHtRow({}));
  wrap.appendChild(container);

  addBtn.addEventListener('click', () => container.appendChild(buildHtRow({})));
  return wrap;
}

function collectHeightenedRows() {
  const rows = document.querySelectorAll('#heightened-rows .ht-row');
  return Array.from(rows).map(row => {
    const get = f => row.querySelector(`[data-field="${f}"]`)?.value?.trim() || '';
    const m = get('mana');
    return {
      variant   : get('variant'),
      attribute : get('attribute'),
      actions   : get('actions'),
      component : get('component'),
      effect    : get('effect'),
      mana      : m !== '' ? parseFloat(m) : 0
    };
  }).filter(r => r.effect || r.attribute);
}

/* ============================================================
   EDITOR — BUILD FORM
   ============================================================ */

const OPTS = {
  rarity     : [
    { value: 'common',   label: 'Common'   },
    { value: 'uncommon', label: 'Uncommon' },
    { value: 'rare',     label: 'Rare'     },
    { value: 'unique',   label: 'Unique'   }
  ],
  difficulty : [
    { value: 'easy',             label: 'Easy' },
    { value: 'average',          label: 'Average' },
    { value: 'hard',             label: 'Hard' },
    { value: 'very hard',        label: 'Very Hard' },
    { value: 'incredibly hard',  label: 'Incredibly Hard' }
  ],
  actions    : [
    { value: 'F', label: '\u25C7  Free' },
    { value: '1', label: '\u25C6  1 action' },
    { value: '2', label: '\u25C6\u25C6  2 actions' },
    { value: '3', label: '\u25C6\u25C6\u25C6  3 actions' },
    { value: 'R', label: '\u21BA  Reaction' }
  ],
  areaShape  : ['cone', 'cube', 'cylinder', 'burst', 'line', 'emanation', 'sphere', 'wall'],
  attackType : ['ranged', 'melee'],
  saveType   : [
    { value: 'strength',     label: 'Strength'     },
    { value: 'agility',      label: 'Agility'      },
    { value: 'dexterity',    label: 'Dexterity'    },
    { value: 'constitution', label: 'Constitution' },
    { value: 'perception',   label: 'Perception'   },
    { value: 'intelligence', label: 'Intelligence' },
    { value: 'wisdom',       label: 'Wisdom'       },
    { value: 'charisma',     label: 'Charisma'     }
  ],
  dieSize    : [
    { value: 3,  label: 'd3'  }, { value: 4,  label: 'd4'  },
    { value: 6,  label: 'd6'  }, { value: 8,  label: 'd8'  },
    { value: 10, label: 'd10' }, { value: 12, label: 'd12' }
  ],
  damageType : ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
                'necrotic', 'physical', 'piercing', 'poison', 'psychic',
                'radiant', 'slashing', 'sonic'],
  durLength  : [
    'instantaneous',
    'until the start of your next turn',
    'until the end of your next turn',
    'rounds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years',
    'until dismissed', 'until triggered', 'permanent'
  ]
};

const TRAIT_GROUPS = [
  { label: 'Energy',    items: ['acid', 'cold', 'fire', 'force', 'lightning',
                                'necrotic', 'physical', 'poison', 'psychic', 'radiant', 'sonic'] },
  { label: 'Mental',    items: ['charm', 'compulsion', 'emotion', 'fear', 'mental', 'sleep'] },
  { label: 'Sensory',   items: ['auditory', 'olfactory', 'tactile', 'visual'] },
  { label: 'Detection', items: ['detection', 'shrouded'] },
  { label: 'Other',     items: ['creation', 'healing', 'illusion', 'summoning', 'utility', 'ward'] }
];

const TRADITION_GROUPS = [
  { label: 'Trained',   items: ['arcane', 'divine', 'bardic'] },
  { label: 'Untrained', items: ['bloodline', 'pact'] }
];

const ACCESS_GROUPS = [
  { label: 'Arcane School', items: [
    { value: 'arcane school: elemental: air',   label: 'elemental: air'   },
    { value: 'arcane school: elemental: earth',  label: 'elemental: earth' },
    { value: 'arcane school: elemental: fire',   label: 'elemental: fire'  },
    { value: 'arcane school: elemental: water',  label: 'elemental: water' }
  ]},
  { label: 'Bloodline', items: [
    { value: 'bloodline: elemental: air',    label: 'elemental: air'   },
    { value: 'bloodline: elemental: earth',   label: 'elemental: earth' },
    { value: 'bloodline: elemental: fire',    label: 'elemental: fire'  },
    { value: 'bloodline: elemental: water',   label: 'elemental: water' },
    { value: 'bloodline: genie: air',         label: 'genie: air'       },
    { value: 'bloodline: genie: earth',        label: 'genie: earth'     },
    { value: 'bloodline: genie: fire',         label: 'genie: fire'      },
    { value: 'bloodline: genie: water',        label: 'genie: water'     }
  ]},
  { label: 'Divine Domain', items: [
    { value: 'divine domain: elemental: air',   label: 'elemental: air'   },
    { value: 'divine domain: elemental: earth',  label: 'elemental: earth' },
    { value: 'divine domain: elemental: fire',   label: 'elemental: fire'  },
    { value: 'divine domain: elemental: water',  label: 'elemental: water' }
  ]},
  { label: 'Divine Specialty', items: [
    { value: 'divine specialty: firemane',               label: 'firemane'               },
    { value: 'divine specialty: firewalker',              label: 'firewalker'             },
    { value: 'divine specialty: icepriestess/icepriest',  label: 'icepriestess/icepriest' },
    { value: 'divine specialty: stormlady/stormlord',     label: 'stormlady/stormlord'    },
    { value: 'divine specialty: windwalker',              label: 'windwalker'             }
  ]},
  { label: 'Pact', items: [
    { value: 'pact: the fathomless', label: 'the fathomless' },
    { value: 'pact: genie: air',      label: 'genie: air'     },
    { value: 'pact: genie: earth',     label: 'genie: earth'   },
    { value: 'pact: genie: fire',      label: 'genie: fire'    },
    { value: 'pact: genie: water',     label: 'genie: water'   }
  ]}
];

function parseDuration(dur) {
  if (!dur) return { count: '', length: '' };
  const m = String(dur).match(/^(\d+)\s+(.+)$/);
  return m ? { count: m[1], length: m[2] } : { count: '', length: dur };
}

function parseRange(range) {
  if (!range && range !== 0) return '';
  const n = parseInt(String(range), 10);
  return isNaN(n) ? '' : n;
}

function buildEditor(f) {
  const form = el('div', { class: 'editor-form' });
  const sec  = t => el('div', { class: 'editor-section-title' }, t);
  const dur  = parseDuration(f.duration);

  // Foundation (was Identity)
  form.appendChild(sec('Foundation'));
  form.appendChild(edRow(
    edField('Name',       'ed-name',       f.name),
    edNum(  'Mana',       'ed-mana',       f.mana, 0),
    edSelect('Rarity',    'ed-rarity',     f.rarity,     OPTS.rarity),
    edSelect('Difficulty','ed-difficulty', f.difficulty, OPTS.difficulty)
  ));
  form.appendChild(edGroupedCheckboxes('Traits',      'ed-traits',     f.traits,     TRAIT_GROUPS,      'form-label-tag-traits'));
  form.appendChild(edGroupedCheckboxes('Traditions',  'ed-traditions', f.traditions, TRADITION_GROUPS,  'form-label-tag-traditions'));
  form.appendChild(edGroupedCheckboxes('Access',      'ed-access',     f.access,     ACCESS_GROUPS,     'form-label-tag-access'));

  // Cast
  form.appendChild(sec('Cast'));
  form.appendChild(edRow(
    edSelect('Actions',    'ed-cast-actions',  String(f.cast?.actions ?? ''), OPTS.actions),
    edCheckboxes('Components', 'ed-cast-comp', f.cast?.component),
    edField('Trigger',     'ed-cast-trigger',  f.cast?.trigger)
  ));

  // Range & Area
  form.appendChild(sec('Range & Area'));
  form.appendChild(edRow(
    edNum(  'Range (ft)',    'ed-range',       parseRange(f.range), 0, 5),
    edNum(  'Area Size (ft)','ed-area-size',   f.area?.size,        0, 5),
    edSelect('Area Shape',   'ed-area-shape',  f.area?.shape, OPTS.areaShape)
  ));
  form.appendChild(edRow(
    edNum(  'Targets Count', 'ed-targets-count', f.targets?.count, 0),
    edField('Targets Type',  'ed-targets-type',  f.targets?.type)
  ));

  // Duration
  form.appendChild(sec('Duration'));
  form.appendChild(edRow(
    edNum(   'Count',  'ed-dur-count',  dur.count,  0),
    edSelect('Length', 'ed-dur-length', dur.length, OPTS.durLength)
  ));

  // Effect (includes Damage and Attack & Save)
  form.appendChild(sec('Effect'));
  form.appendChild(edField('Base Effect', 'ed-effect-base', f.effect?.base, 'textarea'));
  form.appendChild(edRow(
    edNum(  'Damage Die Count', 'ed-dmg-count',    f.damage?.dieNumber, 0),
    edSelect('Damage Die Size', 'ed-dmg-size',     f.damage?.dieSize,   OPTS.dieSize),
    edNum(  'Damage Modifier',  'ed-dmg-modifier', f.damage?.modifier ?? f.damage?.bonus, null),
    edSelect('Damage Type',     'ed-dmg-type',     f.damage?.type,      OPTS.damageType)
  ));
  form.appendChild(edRow(
    edSelect('Attack Type',    'ed-atk-type',      f.attack?.type,     OPTS.attackType),
    edNum(  'Attack Modifier', 'ed-atk-modifier',  f.attack?.modifier, null),
    edSelect('Save Type',      'ed-save-type',     f.save?.type,       OPTS.saveType),
    edNum(  'Save Modifier',   'ed-save-modifier', f.save?.modifier,   null)
  ));
  form.appendChild(edJson('Options (JSON array)', 'ed-effect-options', f.effect?.options));

  // Skill Check
  form.appendChild(sec('Skill Check'));
  form.appendChild(edField('Primary (comma-separated)',   'ed-sk-primary',   (f.skill?.primary   || []).join(', ')));
  form.appendChild(edField('Secondary (comma-separated)', 'ed-sk-secondary', (f.skill?.secondary || []).join(', ')));
  form.appendChild(edField('Critical Success (one per line)', 'ed-sk-cs', (f.skill?.cs || []).join('\n'), 'textarea'));
  form.appendChild(edField('Success',          'ed-sk-s',  f.skill?.s,  'textarea'));
  form.appendChild(edField('Failure',          'ed-sk-f',  f.skill?.f,  'textarea'));
  form.appendChild(edField('Critical Failure (one per line)', 'ed-sk-cf', (f.skill?.cf || []).join('\n'), 'textarea'));

  // Attack Results and Save Results -- side by side
  const resultsRow = el('div', { class: 'form-results-row' });

  const attackCol = el('div', { class: 'form-results-col' });
  attackCol.appendChild(sec('Attack Results'));
  attackCol.appendChild(edField('Critical Success', 'ed-ar-cs', f.attack_results?.cs, 'textarea'));
  attackCol.appendChild(edField('Success',          'ed-ar-s',  f.attack_results?.s,  'textarea'));
  attackCol.appendChild(edField('Failure',          'ed-ar-f',  f.attack_results?.f,  'textarea'));
  attackCol.appendChild(edField('Critical Failure', 'ed-ar-cf', f.attack_results?.cf, 'textarea'));

  const saveCol = el('div', { class: 'form-results-col' });
  saveCol.appendChild(sec('Save Results'));
  saveCol.appendChild(edField('Critical Success', 'ed-sr-cs', f.save_results?.cs, 'textarea'));
  saveCol.appendChild(edField('Success',          'ed-sr-s',  f.save_results?.s,  'textarea'));
  saveCol.appendChild(edField('Failure',          'ed-sr-f',  f.save_results?.f,  'textarea'));
  saveCol.appendChild(edField('Critical Failure', 'ed-sr-cf', f.save_results?.cf, 'textarea'));

  resultsRow.appendChild(attackCol);
  resultsRow.appendChild(saveCol);
  form.appendChild(resultsRow);

  // JSON sections
  // Sustain & Dismiss — structured 2-column form
  const sdRow = el('div', { class: 'form-results-row' });
  sdRow.appendChild(buildSdSection('Sustain', 'sustain-rows', f.sustain));
  sdRow.appendChild(buildSdSection('Dismiss', 'dismiss-rows', f.dismiss));
  form.appendChild(sdRow);
  form.appendChild(buildHtSection(f.heightened));
  form.appendChild(sec('Variants'));
  form.appendChild(edJson('Variants (JSON array)', 'ed-variants', f.variants));
  form.appendChild(sec('Components'));
  form.appendChild(edJson('Components (JSON array)', 'ed-components', f.components));

  if (state.currentIndex >= 0 && state.token) {
    form.appendChild(el('button', { class: 'btn btn-danger btn-delete', id: 'btn-delete' },
      `Delete "${f.name || 'this foundation'}"`));
  }

  return form;
}

/* ============================================================
   EDITOR — COLLECT FORM VALUES
   ============================================================ */

function collectEditor() {
  function v(id)     { return document.getElementById(id)?.value?.trim() || ''; }
  function num(id)   { const x = v(id); return x !== '' ? parseFloat(x) : 0; }
  function arr(id)   { return v(id).split(',').map(s => s.trim()).filter(Boolean); }
  function lines(id) { return v(id).split('\n').map(s => s.trim()).filter(Boolean); }
  function json(id, fallback) {
    const raw = v(id);
    if (!raw) return fallback;
    try { return JSON.parse(raw); }
    catch (e) { throw new Error(`Invalid JSON in "${id}": ${e.message}`); }
  }
  function checkboxes(groupId) {
    return Array.from(document.querySelectorAll(`#${groupId} input:checked`))
      .map(b => b.value).join('+');
  }
  function checkboxArr(groupId) {
    return Array.from(document.querySelectorAll(`#${groupId} input:checked`))
      .map(b => b.value);
  }

  const durCount  = v('ed-dur-count');
  const durLength = v('ed-dur-length');
  const rangeNum  = v('ed-range');

  return {
    name       : v('ed-name'),
    mana       : num('ed-mana'),
    rarity     : v('ed-rarity'),
    difficulty : v('ed-difficulty'),
    traits     : checkboxArr('ed-traits'),
    traditions : checkboxArr('ed-traditions'),
    access     : checkboxArr('ed-access'),
    cast: {
      actions   : v('ed-cast-actions'),
      component : checkboxes('ed-cast-comp'),
      trigger   : v('ed-cast-trigger')
    },
    range   : rangeNum !== '' ? `${rangeNum}'` : '',
    area    : { size: num('ed-area-size'), shape: v('ed-area-shape') },
    targets : { count: num('ed-targets-count'), type: v('ed-targets-type') },
    attack  : { type: v('ed-atk-type'),  modifier: num('ed-atk-modifier')  },
    save    : { type: v('ed-save-type'), modifier: num('ed-save-modifier') },
    duration : durCount && durLength ? `${durCount} ${durLength}` : durLength,
    damage: {
      dieNumber : num('ed-dmg-count'),
      dieSize   : num('ed-dmg-size'),
      modifier  : num('ed-dmg-modifier'),
      type      : v('ed-dmg-type')
    },
    effect: {
      base    : v('ed-effect-base'),
      options : []
    },
    skill: {
      primary   : arr('ed-sk-primary'),
      secondary : arr('ed-sk-secondary'),
      cs        : lines('ed-sk-cs'),
      s         : v('ed-sk-s'),
      f         : v('ed-sk-f'),
      cf        : lines('ed-sk-cf')
    },
    attack_results : { cs: v('ed-ar-cs'), s: v('ed-ar-s'), f: v('ed-ar-f'), cf: v('ed-ar-cf') },
    save_results   : { cs: v('ed-sr-cs'), s: v('ed-sr-s'), f: v('ed-sr-f'), cf: v('ed-sr-cf') },
    sustain    : collectSdRows('sustain-rows'),
    dismiss    : collectSdRows('dismiss-rows'),
    heightened : collectHeightenedRows(),
    variants   : json('ed-variants',   []),
    components : json('ed-components', [])
  };
}

/* ============================================================
   LIST
   ============================================================ */

function renderList() {
  const list   = document.getElementById('foundation-list');
  const search = document.getElementById('search').value.toLowerCase();
  list.innerHTML = '';

  const filtered = state.foundations.filter(f =>
    !search || (f.name || '').toLowerCase().includes(search)
  );

  if (!filtered.length) {
    list.appendChild(el('div', { class: 'list-empty' },
      state.foundations.length ? 'No matches.' : 'No foundations yet.'));
    return;
  }

  filtered.forEach(f => {
    const idx  = state.foundations.indexOf(f);
    const item = el('div', {
      class: `list-item${idx === state.currentIndex ? ' list-item-active' : ''}`,
      'data-index': idx
    }, f.name || '(unnamed)');
    item.addEventListener('click', () => selectFoundation(idx));
    list.appendChild(item);
  });
}

/* ============================================================
   NAVIGATION
   ============================================================ */

function selectFoundation(idx) {
  state.currentIndex = idx;
  state.mode         = 'view';
  renderList();
  showPanel('viewer', renderViewer(state.foundations[idx]));
  updateButtons();
}

function showPanel(which, content) {
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('viewer').style.display      = which === 'viewer' ? '' : 'none';
  document.getElementById('editor').style.display      = which === 'editor' ? '' : 'none';

  const panel = document.getElementById(which);
  panel.innerHTML = '';
  panel.appendChild(content);

  if (which === 'editor') {
    const deleteBtn = document.getElementById('btn-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        const name = state.foundations[state.currentIndex]?.name || 'this foundation';
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        state.foundations.splice(state.currentIndex, 1);
        state.currentIndex = -1;
        state.dirty        = true;
        state.mode         = 'view';
        renderList();
        document.getElementById('empty-state').style.display = '';
        document.getElementById('editor').style.display      = 'none';
        updateButtons();
      });
    }
  }
}

/* ============================================================
   BUTTONS
   ============================================================ */

function updateButtons() {
  const t  = !!state.token;
  const s  = state.currentIndex >= 0;
  const ev = state.mode === 'view';
  const ed = state.mode === 'edit';

  document.getElementById('btn-new').style.display     = t                  ? '' : 'none';
  document.getElementById('btn-edit').style.display    = (t && s && ev)     ? '' : 'none';
  document.getElementById('btn-cancel').style.display  = ed                 ? '' : 'none';
  document.getElementById('btn-save-gh').style.display = (t && (state.dirty || ed)) ? '' : 'none';
}

/* ============================================================
   MODAL
   ============================================================ */

function openModal()  { document.getElementById('modal-overlay').style.display = 'flex'; document.getElementById('token-input').value = state.token; }
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }

/* ============================================================
   INIT & EVENTS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     Wire up all event listeners immediately -- before any
     async work -- so a failed fetch can never block buttons.
     ---------------------------------------------------------- */

  // Search
  document.getElementById('search').addEventListener('input', renderList);

  // Token button -- must work even before data loads
  document.getElementById('btn-token').addEventListener('click', openModal);

  document.getElementById('btn-token-save').addEventListener('click', () => {
    const t = document.getElementById('token-input').value.trim();
    state.token = t;
    if (t) localStorage.setItem('skd20_token', t);
    else   localStorage.removeItem('skd20_token');
    closeModal();
    loadData();
  });

  document.getElementById('btn-token-clear').addEventListener('click', () => {
    state.token = '';
    localStorage.removeItem('skd20_token');
    closeModal();
    loadData();
  });

  document.getElementById('btn-token-cancel').addEventListener('click', closeModal);

  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'modal-overlay') closeModal();
  });

  // New Foundation
  document.getElementById('btn-new').addEventListener('click', () => {
    const f = { name: 'New Foundation', mana: 0 };
    state.foundations.push(f);
    state.currentIndex = state.foundations.length - 1;
    state.mode  = 'edit';
    state.dirty = true;
    renderList();
    showPanel('editor', buildEditor(f));
    updateButtons();
  });

  // Edit
  document.getElementById('btn-edit').addEventListener('click', () => {
    if (state.currentIndex < 0) return;
    state.mode = 'edit';
    showPanel('editor', buildEditor(state.foundations[state.currentIndex]));
    updateButtons();
  });

  // Cancel
  document.getElementById('btn-cancel').addEventListener('click', () => {
    state.mode = 'view';
    if (state.currentIndex >= 0) {
      showPanel('viewer', renderViewer(state.foundations[state.currentIndex]));
    } else {
      document.getElementById('empty-state').style.display = '';
      document.getElementById('editor').style.display      = 'none';
    }
    renderList();
    updateButtons();
  });

  // Save to GitHub
  document.getElementById('btn-save-gh').addEventListener('click', async () => {
    if (state.mode === 'edit') {
      try {
        const updated = collectEditor();
        state.foundations[state.currentIndex] = updated;
      } catch (e) {
        setStatus(e.message, 'error');
        return;
      }
    }
    const ok = await saveData();
    if (ok) {
      state.mode = 'view';
      renderList();
      if (state.currentIndex >= 0) {
        showPanel('viewer', renderViewer(state.foundations[state.currentIndex]));
      }
      updateButtons();
    }
  });

  /* ----------------------------------------------------------
     Now load data -- errors here no longer affect buttons.
     ---------------------------------------------------------- */
  loadData();

});
