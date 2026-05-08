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
      setStatus('Viewer mode — no token', '');
    }
  } catch (err) {
    setStatus(`Error: ${err.message}`, 'error');
    state.foundations = [];
  }
  renderList();
  updateButtons();
}

async function saveData() {
  if (!state.token) { setStatus('No token set', 'error'); return false; }
  setStatus('Saving…', 'load');
  try {
    const json    = JSON.stringify({ foundations: state.foundations }, null, 2);
    const content = btoa(unescape(encodeURIComponent(json)));
    const ts      = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const body    = { message: `Update foundations [${ts}]`, content, sha: state.sha };
    const resp    = await fetch(
      `${CONFIG.api}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.file}`,
      { method: 'PUT', headers: { ...ghHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    if (!resp.ok) throw new Error(`GitHub ${resp.status}: ${resp.statusText}`);
    const result = await resp.json();
    state.sha    = result.content.sha;
    state.dirty  = false;
    setStatus('Saved to GitHub ✓', 'ok');
    return true;
  } catch (err) {
    setStatus(`Save error: ${err.message}`, 'error');
    return false;
  }
}

/* ============================================================
   RENDERING — TRAIT BAR
   ============================================================ */

const RARITY_BG = {
  common   : '#1a1a1a',
  uncommon : '#7a3510',
  rare     : '#160b65',
  unique   : '#54116d'
};
const DIFFICULTY_BG = {
  untrained : '#006030',
  trained   : '#1a1a1a',
  expert    : '#7a3510',
  master    : '#160b65',
  legendary : '#54116d'
};

function traitTag(text, bg) {
  return el('span', { class: 'trait-tag', style: `background:${bg || '#5D0000'}` }, text);
}

function renderTraitBar(f) {
  const bar = el('div', { class: 'trait-bar' });
  if (f.rarity)     bar.appendChild(traitTag(f.rarity,     RARITY_BG[f.rarity.toLowerCase()]     || '#5D0000'));
  if (f.difficulty) bar.appendChild(traitTag(f.difficulty, DIFFICULTY_BG[f.difficulty.toLowerCase()] || '#5D0000'));
  (f.traits      || []).filter(Boolean).forEach(t => bar.appendChild(traitTag(t, '#5D0000')));
  (f.traditions  || []).filter(Boolean).forEach(t => bar.appendChild(traitTag(t, '#0d3a5e')));
  (f.access      || []).filter(Boolean).forEach(t => bar.appendChild(traitTag(t, '#1a3d2a')));
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
  if (cast.component) val.appendChild(document.createTextNode(` ${cast.component}`));
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

  if (f.attack?.type) {
    add(specRow('Attack', [f.attack.type, f.attack.modifier].filter(Boolean).join(' ')));
  }

  if (f.save?.type) {
    add(specRow('Saving Throw', [f.save.type, f.save.modifier].filter(Boolean).join(' ')));
  }

  if (hasValue(f.duration)) add(specRow('Duration', f.duration));

  if (f.damage?.dieNumber) {
    const d = f.damage;
    const dmg = `${d.dieNumber}d${d.dieSize}${d.bonus ? `+${d.bonus}` : ''} ${d.type || ''}`.trim();
    add(specRow('Damage', dmg));
  }

  return sheet;
}

/* ============================================================
   RENDERING — EFFECT
   ============================================================ */

function renderEffect(f) {
  if (!f.effect?.base) return null;
  const section = el('div', { class: 'section-effect' });
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
  row.appendChild(el('b', { class: 'result-label' }, label));
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
    if (sk.primary?.length)   addRow('Primary',          sk.primary.join(', '), '');
    if (sk.secondary?.length) addRow('Secondary',        sk.secondary.join(', '), '');
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
    block.appendChild(el('div', { class: 'result-heading' }, `Attack — ${f.attack.type}`));
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
    block.appendChild(el('div', { class: 'result-heading' }, `Save — ${f.save.type}`));
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
  if (item.variant)     row.appendChild(el('span', { class: 'action-variant'   }, `[${item.variant}]`));
  if (hasValue(item.actions)) row.appendChild(el('span', { class: 'action-sym' }, actionSym(item.actions)));
  if (item.component)   row.appendChild(el('span', { class: 'action-component' }, item.component));
  if (item.effect)      row.appendChild(el('span', { class: 'action-effect'    }, item.effect));
  // mana: show +N, -N, or 0
  if (item.mana !== undefined && item.mana !== null && item.mana !== '') {
    const m = Number(item.mana);
    const label = isNaN(m) ? String(item.mana) : (m > 0 ? `+${m}` : `${m}`);
    row.appendChild(el('span', { class: 'action-mana' }, `[${label}]`));
  }
  return row;
}

function componentRow(item, idx) {
  const row = el('div', { class: `action-row ${idx % 2 === 0 ? 'row-odd' : 'row-even'}` });
  if (item.attribute)   row.appendChild(el('b',    { class: 'action-attribute'   }, item.attribute));
  if (item.variant)     row.appendChild(el('span', { class: 'action-variant'     }, `[${item.variant}]`));
  if (hasValue(item.actions)) row.appendChild(el('span', { class: 'action-sym'   }, actionSym(item.actions)));
  if (item.component)   row.appendChild(el('span', { class: 'action-component'   }, item.component));
  if (item.effect)      row.appendChild(el('span', { class: 'action-effect'      }, item.effect));
  if (item.description) row.appendChild(el('span', { class: 'action-description' }, item.description));
  if (item.price)       row.appendChild(el('span', { class: 'action-price'       }, `${item.price} gp`));
  return row;
}

function sustainRow(item, idx) {
  const row = el('div', { class: `action-row ${idx % 2 === 0 ? 'row-odd' : 'row-even'}` });
  if (item.variant)  row.appendChild(el('span', { class: 'action-variant' }, `[${item.variant}]`));
  if (hasValue(item.actions)) row.appendChild(el('span', { class: 'action-sym' }, actionSym(item.actions)));
  if (item.component) row.appendChild(el('span', { class: 'action-component' }, item.component));
  if (item.effect)    row.appendChild(el('span', { class: 'action-effect' }, item.effect));
  if (item.mana) {
    const m = Number(item.mana);
    const label = isNaN(m) ? String(item.mana) : (m > 0 ? `+${m}` : `${m}`);
    row.appendChild(el('span', { class: 'action-mana' }, `[${label}]`));
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
  const hasSustain = f.sustain?.some(s => s?.effect);
  const hasDismiss = f.dismiss && (hasValue(f.dismiss.actions) || f.dismiss.effect);
  if (!hasSustain && !hasDismiss) return null;

  const section = el('div', { class: 'section-action' });
  section.appendChild(el('div', { class: 'section-heading' }, 'Duration'));

  if (hasSustain) {
    section.appendChild(el('div', { class: 'action-sub-heading' }, 'Sustain'));
    f.sustain.filter(s => s?.effect).forEach((s, i) => section.appendChild(sustainRow(s, i)));
  }
  if (hasDismiss) {
    section.appendChild(el('div', { class: 'action-sub-heading' }, 'Dismiss'));
    section.appendChild(sustainRow(f.dismiss, 0));
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
    heading.appendChild(el('span', { class: 'foundation-mana' }, `Foundation [${f.mana}]`));
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
   EDITOR — BUILD FORM
   ============================================================ */

function buildEditor(f) {
  const form = el('div', { class: 'editor-form' });

  function secTitle(t) { return el('div', { class: 'editor-section-title' }, t); }

  function field(label, id, value, type) {
    const wrap  = el('div', { class: 'form-field' });
    const lbl   = el('label', { for: id }, label);
    const input = el(type === 'textarea' ? 'textarea' : 'input', { id, class: 'form-input' });
    if (type !== 'textarea') input.type = type || 'text';
    input.value = (value !== null && value !== undefined) ? String(value) : '';
    if (type === 'textarea') input.rows = 3;
    wrap.appendChild(lbl); wrap.appendChild(input);
    return wrap;
  }

  function jsonField(label, id, value) {
    const wrap = el('div', { class: 'form-field' });
    wrap.appendChild(el('label', { for: id }, label));
    const ta = el('textarea', { id, class: 'form-input form-json', rows: 5 });
    ta.value = (value && (Array.isArray(value) ? value.length : Object.keys(value).length))
      ? JSON.stringify(value, null, 2) : '';
    wrap.appendChild(ta);
    return wrap;
  }

  function row(...fields) {
    const r = el('div', { class: 'form-row' });
    fields.forEach(f => r.appendChild(f));
    return r;
  }

  // Identity
  form.appendChild(secTitle('Identity'));
  form.appendChild(row(
    field('Name',       'ed-name',       f.name),
    field('Mana',       'ed-mana',       f.mana,       'number'),
    field('Rarity',     'ed-rarity',     f.rarity),
    field('Difficulty', 'ed-difficulty', f.difficulty)
  ));
  form.appendChild(field('Traits (comma-separated)',     'ed-traits',      (f.traits     || []).join(', ')));
  form.appendChild(field('Traditions (comma-separated)', 'ed-traditions',  (f.traditions || []).join(', ')));
  form.appendChild(field('Access (comma-separated)',     'ed-access',      (f.access     || []).join(', ')));

  // Cast
  form.appendChild(secTitle('Cast'));
  form.appendChild(row(
    field('Actions',   'ed-cast-actions',   f.cast?.actions),
    field('Component', 'ed-cast-component', f.cast?.component),
    field('Trigger',   'ed-cast-trigger',   f.cast?.trigger)
  ));

  // Range & Area
  form.appendChild(secTitle('Range & Area'));
  form.appendChild(row(
    field('Range',      'ed-range',       f.range),
    field('Area Size',  'ed-area-size',   f.area?.size,  'number'),
    field('Area Shape', 'ed-area-shape',  f.area?.shape)
  ));
  form.appendChild(row(
    field('Targets Count', 'ed-targets-count', f.targets?.count, 'number'),
    field('Targets Type',  'ed-targets-type',  f.targets?.type)
  ));

  // Attack & Save
  form.appendChild(secTitle('Attack & Save'));
  form.appendChild(row(
    field('Attack Type',     'ed-atk-type',     f.attack?.type),
    field('Attack Modifier', 'ed-atk-modifier', f.attack?.modifier),
    field('Save Type',       'ed-save-type',    f.save?.type),
    field('Save Modifier',   'ed-save-modifier',f.save?.modifier)
  ));

  // Damage
  form.appendChild(secTitle('Damage'));
  form.appendChild(row(
    field('Die Count', 'ed-dmg-count', f.damage?.dieNumber, 'number'),
    field('Die Size',  'ed-dmg-size',  f.damage?.dieSize,   'number'),
    field('Bonus',     'ed-dmg-bonus', f.damage?.bonus,     'number'),
    field('Type',      'ed-dmg-type',  f.damage?.type)
  ));

  // Duration
  form.appendChild(secTitle('Duration'));
  form.appendChild(field('Duration', 'ed-duration', f.duration));

  // Effect
  form.appendChild(secTitle('Effect'));
  form.appendChild(field('Base Effect', 'ed-effect-base', f.effect?.base, 'textarea'));
  form.appendChild(jsonField('Options (JSON array)', 'ed-effect-options', f.effect?.options));

  // Skill Check
  form.appendChild(secTitle('Skill Check'));
  form.appendChild(field('Primary (comma-separated)',   'ed-sk-primary',   (f.skill?.primary   || []).join(', ')));
  form.appendChild(field('Secondary (comma-separated)', 'ed-sk-secondary', (f.skill?.secondary || []).join(', ')));
  form.appendChild(field('Critical Success (one per line)', 'ed-sk-cs', (f.skill?.cs || []).join('\n'), 'textarea'));
  form.appendChild(field('Success',          'ed-sk-s',  f.skill?.s,                 'textarea'));
  form.appendChild(field('Failure',          'ed-sk-f',  f.skill?.f,                 'textarea'));
  form.appendChild(field('Critical Failure (one per line)', 'ed-sk-cf', (f.skill?.cf || []).join('\n'), 'textarea'));

  // Attack Results
  form.appendChild(secTitle('Attack Results'));
  form.appendChild(row(
    field('Critical Success', 'ed-ar-cs', f.attack_results?.cs, 'textarea'),
    field('Success',          'ed-ar-s',  f.attack_results?.s,  'textarea')
  ));
  form.appendChild(row(
    field('Failure',          'ed-ar-f',  f.attack_results?.f,  'textarea'),
    field('Critical Failure', 'ed-ar-cf', f.attack_results?.cf, 'textarea')
  ));

  // Save Results
  form.appendChild(secTitle('Save Results'));
  form.appendChild(row(
    field('Critical Success', 'ed-sr-cs', f.save_results?.cs, 'textarea'),
    field('Success',          'ed-sr-s',  f.save_results?.s,  'textarea')
  ));
  form.appendChild(row(
    field('Failure',          'ed-sr-f',  f.save_results?.f,  'textarea'),
    field('Critical Failure', 'ed-sr-cf', f.save_results?.cf, 'textarea')
  ));

  // Sustain / Dismiss / Heightened / Variants / Components — JSON fields
  form.appendChild(secTitle('Sustain'));
  form.appendChild(jsonField('Sustain entries (JSON array)', 'ed-sustain', f.sustain));

  form.appendChild(secTitle('Dismiss'));
  form.appendChild(jsonField('Dismiss (JSON object)', 'ed-dismiss', f.dismiss));

  form.appendChild(secTitle('Heightened'));
  form.appendChild(jsonField('Heightened entries (JSON array)', 'ed-heightened', f.heightened));

  form.appendChild(secTitle('Variants'));
  form.appendChild(jsonField('Variants (JSON array)', 'ed-variants', f.variants));

  form.appendChild(secTitle('Components'));
  form.appendChild(jsonField('Components (JSON array)', 'ed-components', f.components));

  // Delete (editor mode, existing foundation)
  if (state.currentIndex >= 0 && state.token) {
    const btn = el('button', { class: 'btn btn-danger btn-delete', id: 'btn-delete' },
      `Delete "${f.name || 'this foundation'}"`);
    form.appendChild(btn);
  }

  return form;
}

/* ============================================================
   EDITOR — COLLECT FORM VALUES
   ============================================================ */

function collectEditor() {
  function v(id)       { return document.getElementById(id)?.value?.trim() || ''; }
  function num(id)     { const x = v(id); return x !== '' ? parseFloat(x) : 0; }
  function arr(id)     { return v(id).split(',').map(s => s.trim()).filter(Boolean); }
  function lines(id)   { return v(id).split('\n').map(s => s.trim()).filter(Boolean); }
  function json(id, fallback) {
    const raw = v(id);
    if (!raw) return fallback;
    try { return JSON.parse(raw); }
    catch (e) { throw new Error(`Invalid JSON in "${id}": ${e.message}`); }
  }

  return {
    name       : v('ed-name'),
    mana       : num('ed-mana'),
    rarity     : v('ed-rarity'),
    difficulty : v('ed-difficulty'),
    traits     : arr('ed-traits'),
    traditions : arr('ed-traditions'),
    access     : arr('ed-access'),
    cast: {
      actions   : v('ed-cast-actions'),
      component : v('ed-cast-component'),
      trigger   : v('ed-cast-trigger')
    },
    range   : v('ed-range'),
    area    : { size: num('ed-area-size'), shape: v('ed-area-shape') },
    targets : { count: num('ed-targets-count'), type: v('ed-targets-type') },
    attack  : { type: v('ed-atk-type'), modifier: v('ed-atk-modifier') },
    save    : { type: v('ed-save-type'), modifier: v('ed-save-modifier') },
    duration : v('ed-duration'),
    damage: {
      dieNumber : num('ed-dmg-count'),
      dieSize   : num('ed-dmg-size'),
      bonus     : num('ed-dmg-bonus'),
      type      : v('ed-dmg-type')
    },
    effect: {
      base    : v('ed-effect-base'),
      options : json('ed-effect-options', [])
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
    sustain    : json('ed-sustain',    []),
    dismiss    : json('ed-dismiss',    {}),
    heightened : json('ed-heightened', []),
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
