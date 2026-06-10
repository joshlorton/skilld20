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

const ACTION_LENGTHS = [
  { value: 'reaction', label: '↺ Reaction' },
  { value: 'action',   label: 'Action'     },
  { value: 'round',    label: 'Round'      },
  { value: 'minute',   label: 'Minute'     },
  { value: 'hour',     label: 'Hour'       },
  { value: 'day',      label: 'Day'        },
  { value: 'week',     label: 'Week'       }
];

function parseLegacyAction(val) {
  if (val === null || val === undefined) return { count: '', length: 'action' };
  if (typeof val === 'object') return { count: val.count ?? '', length: val.length ?? 'action' };
  const s = String(val).trim();
  if (s === '' || s === '-') return { count: 0,  length: 'action' };
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
  if (typeof val === 'object') return false; // objects always have some action value
  return false;
}

function actionSym(val) {
  if (val === null || val === undefined || val === '') return '';
  if (typeof val === 'object' && val !== null) {
    const { count, length } = val;
    if (length === 'reaction') return '↺';
    if (length === 'action') {
      const n = parseInt(count, 10);
      if (isNaN(n) || n <= 0) return '◇';
      return '◆'.repeat(Math.min(n, 3));
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
  // Legacy string format
  const s = String(val).toUpperCase().trim();
  if (s === '' || s === '-') return '-';
  if (s === 'R')  return '↺';
  if (s === '0' || s === 'F') return '◇';
  const count = Math.min(parseInt(s, 10) || 1, 3);
  return '◆'.repeat(count);
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

  // Only reaction disables count
  const syncCount = () => {
    const off = lengthSel.value === 'reaction';
    countIn.disabled = off;
    countIn.style.opacity = off ? '0.3' : '1';
  };
  lengthSel.addEventListener('change', syncCount);
  syncCount();

  wrap.appendChild(countIn);
  wrap.appendChild(lengthSel);
  return wrap;
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

  // -- Left column: traits (row 1 + row 2) then spec sheet
  const left = el('div', { class: 'trait-col-left' });

  // Row 1: rarity + difficulty + general traits
  const traitsRow = el('div', { class: 'trait-row' });
  if (f.rarity)     traitsRow.appendChild(traitTag(f.rarity,
    `trait-rarity-${f.rarity.toLowerCase()}`));
  if (f.difficulty) traitsRow.appendChild(traitTag(f.difficulty,
    `trait-difficulty-${f.difficulty.toLowerCase().replace(/\s+/g, '-')}`));
  (f.traits || []).filter(Boolean).forEach(t => traitsRow.appendChild(traitTag(t, '')));
  left.appendChild(traitsRow);

  // Row 2: traditions + access
  const traditions = (f.traditions || []).filter(Boolean);
  const accessItems = (f.access    || []).filter(Boolean);
  if (traditions.length || accessItems.length) {
    const tradRow = el('div', { class: 'trait-row' });
    const tradKey = a => {
      const p = a.toLowerCase();
      if (p.startsWith('arcane'))    return 'arcane';
      if (p.startsWith('bloodline')) return 'bloodline';
      if (p.startsWith('divine'))    return 'divine';
      if (p.startsWith('bardic'))    return 'bardic';
      return 'pact';
    };
    const byTrad = {};
    accessItems.forEach(a => { const k = tradKey(a); (byTrad[k] = byTrad[k] || []).push(a); });
    traditions.forEach((t, i) => {
      if (i > 0) tradRow.appendChild(el('div', { class: 'trait-break' }));
      tradRow.appendChild(traitTag(t, `trait-tradition-${t.toLowerCase()}`));
      (byTrad[t.toLowerCase()] || []).forEach(a => {
        const ci = a.indexOf(': ');
        tradRow.appendChild(traitTag(ci >= 0 ? a.slice(ci + 2) : a, `trait-access-${tradKey(a)}`));
      });
    });
    const usedKeys = new Set(traditions.map(t => t.toLowerCase()));
    const orphans  = accessItems.filter(a => !usedKeys.has(tradKey(a)));
    if (orphans.length) {
      if (traditions.length) tradRow.appendChild(el('div', { class: 'trait-break' }));
      orphans.forEach(a => {
        const ci = a.indexOf(': ');
        tradRow.appendChild(traitTag(ci >= 0 ? a.slice(ci + 2) : a, `trait-access-${tradKey(a)}`));
      });
    }
    left.appendChild(tradRow);
  }

  // Spec sheet (cast, range, area, targets, duration)
  const specs = renderSpecs(f);
  if (specs.children.length) left.appendChild(specs);

  bar.appendChild(left);

  // -- Right column: image (always present; empty if no image)
  const right = el('div', { class: 'trait-col-right' });
  if (f.image) {
    right.appendChild(el('img', { class: 'trait-image', src: f.image, alt: '' }));
  }
  bar.appendChild(right);

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
  const hasActions   = !isNoAction(cast.actions);
  const hasComponent = cast.component && cast.component !== '';
  const hasTrigger   = cast.trigger   && cast.trigger   !== '';
  if (!hasActions && !hasComponent && !hasTrigger) return null;
  const row = el('div', { class: 'spec-row' });
  row.appendChild(el('b', { class: 'spec-label' }, 'Cast'));
  const val = el('span', { class: 'spec-value' });
  if (hasActions)   val.appendChild(el('span', { class: 'action-sym' }, actionSym(cast.actions)));
  if (hasComponent) val.appendChild(document.createTextNode(` ${spellComponent(cast.component)}`));
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
  section.appendChild(el('div', { class: 'result-col-heading' }, 'Effect'));
  const content = el('div', { class: 'result-col-content' });

  // Base entry
  content.appendChild(el('p', { class: 'effect-entry' }, f.effect.base));

  // Attack, Save, Damage (moved from spec sheet)
  if (f.attack?.type)
    content.appendChild(specRow('Attack', [f.attack.type, f.attack.modifier].filter(Boolean).join(' ')));
  if (f.save?.type)
    content.appendChild(specRow('Saving Throw', [f.save.type, f.save.modifier].filter(Boolean).join(' ')));
  if (f.damage?.dieNumber) {
    const d = f.damage;
    const mod = d.modifier ?? d.bonus;
    content.appendChild(specRow('Damage', `${d.dieNumber}d${d.dieSize}${mod ? `+${mod}` : ''} ${d.type || ''}`.trim()));
  }

  // Additional effect entries
  (f.effect.options || []).filter(Boolean).forEach(opt => {
    if (typeof opt === 'string') {
      content.appendChild(el('p', { class: 'effect-entry' }, opt));
    } else if (opt.text !== undefined) {
      // New format: {text, damage, attack, save}
      content.appendChild(el('p', { class: 'effect-entry' }, opt.text));
      if (opt.damage?.dieNumber) {
        const d = opt.damage;
        const mod = d.modifier ?? d.bonus;
        content.appendChild(specRow('Damage', `${d.dieNumber}d${d.dieSize}${mod ? `+${mod}` : ''} ${d.type || ''}`.trim()));
      }
      if (opt.attack?.type)
        content.appendChild(specRow('Attack', [opt.attack.type, opt.attack.modifier].filter(Boolean).join(' ')));
      if (opt.save?.type)
        content.appendChild(specRow('Saving Throw', [opt.save.type, opt.save.modifier].filter(Boolean).join(' ')));
    } else if (opt.option !== undefined || opt.effect !== undefined) {
      // Legacy {option, effect} format
      const p = el('p', { class: 'effect-entry' });
      if (opt.option) p.appendChild(el('b', {}, `${opt.option}: `));
      if (opt.effect) p.appendChild(document.createTextNode(opt.effect));
      content.appendChild(p);
    }
  });

  section.appendChild(content);
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
  const cols = [];

  // Helper: build one result column
  function buildCol(headingText, buildContent) {
    const col = el('div', { class: 'result-col' });
    col.appendChild(el('div', { class: 'result-col-heading' }, headingText));
    const content = el('div', { class: 'result-col-content' });
    buildContent(content);
    col.appendChild(content);
    return col;
  }

  // Helper: type row (row 1) -- two sub-cells
  function typeRow(leftLabel, leftVal, rightLabel, rightVal) {
    const row = el('div', { class: 'result-type-row row-odd' });
    [{ lbl: leftLabel, val: leftVal }, { lbl: rightLabel, val: rightVal }].forEach(({ lbl, val }) => {
      const cell = el('div', { class: 'result-subcell' });
      if (lbl) cell.appendChild(el('b',   { class: 'skill-label'  }, lbl));
      if (val) cell.appendChild(el('div', { class: 'result-value' }, val));
      row.appendChild(cell);
    });
    return row;
  }

  // Skill column
  const sk = f.skill;
  const hasSkillData = sk && (
    sk.primary?.some(Boolean) || sk.secondary?.some(Boolean) ||
    sk.cs?.some(Boolean) || sk.s || sk.f || sk.cf?.some(Boolean)
  );
  if (hasSkillData) {
    cols.push(buildCol('Skill Check', content => {
      const primDisplay = sk.primary?.some(Boolean) ? sk.primary.join(', ') : 'per Tradition';
      const secDisplay  = sk.secondary?.length ? sk.secondary.join(', ') : '';
      content.appendChild(typeRow('Primary', primDisplay, secDisplay ? 'Secondary' : '', secDisplay));
      const add = (lbl, val, cls) => { const r = resultRow(lbl, val, cls); if (r) content.appendChild(r); };
      add('Critical Success', sk.cs, 'row-cs');
      add('Success',          sk.s  || ['Expected effect.'],        'row-s');
      add('Failure',          sk.f  || ['Failed cast. No effect.'], 'row-sf');
      add('Critical Failure', sk.cf, 'row-cf');
    }));
  }

  // Attack column
  if (f.attack?.type && f.attack_results) {
    const ar = f.attack_results;
    cols.push(buildCol('Attack', content => {
      content.appendChild(typeRow('Type', f.attack.type, '', ''));
      const add = (lbl, val, cls) => { const r = resultRow(lbl, val, cls); if (r) content.appendChild(r); };
      add('Critical Success', ar.cs, 'row-cs');
      add('Success',          ar.s  || ['Normal damage.'],    'row-s');
      add('Failure',          ar.f  || ['Missed. No effect.'],'row-sf');
      add('Critical Failure', ar.cf, 'row-cf');
    }));
  }

  // Save column
  if (f.save?.type && f.save_results) {
    const sr = f.save_results;
    cols.push(buildCol('Save', content => {
      content.appendChild(typeRow('Type', f.save.type, '', ''));
      const add = (lbl, val, cls) => { const r = resultRow(lbl, val, cls); if (r) content.appendChild(r); };
      add('Critical Success', sr.cs, 'row-cs');
      add('Success',          sr.s,  'row-s');
      add('Failure',          sr.f,  'row-sf');
      add('Critical Failure', sr.cf, 'row-cf');
    }));
  }

  if (!cols.length) return null;
  const section = el('div', { class: 'section-results' });
  cols.forEach(c => section.appendChild(c));
  return section;
}

/* ============================================================
   RENDERING — ACTION ROWS
   ============================================================ */

function renderRowResults(results) {
  const div = el('div', { class: 'sv-results' });
  if (!results?.type) return div;
  const typeLabel = results.type === 'save'
    ? (results.saveType || '').toUpperCase()
    : `${(results.attackType || '').toUpperCase()} ATTACK`;
  div.appendChild(el('div', { class: 'sv-results-type' }, typeLabel));
  [
    { text: results.cs, label: 'CS', cls: 'row-cs' },
    { text: results.s,  label: 'S',  cls: 'row-s'  },
    { text: results.f,  label: 'F',  cls: 'row-sf' },
    { text: results.cf, label: 'CF', cls: 'row-cf' }
  ].forEach(({ text, label, cls }) => {
    if (!text) return;
    const entry = el('div', { class: `sv-results-entry ${cls}` });
    entry.appendChild(el('b', { class: 'sv-results-label' }, label));
    entry.appendChild(document.createTextNode(` ${text}`));
    div.appendChild(entry);
  });
  return div;
}

function actionRow(item, idx) {
  const row = el('div', { class: `ht-view-row ${idx % 2 === 0 ? 'row-odd' : 'row-even'}` });
  row.appendChild(el('span', { class: 'ht-vrnt' }, item.variant || ''));
  row.appendChild(el('b',    { class: 'ht-attr' }, item.attribute || ''));
  row.appendChild(el('span', { class: 'sv-sym'  },
    !isNoAction(item.actions) ? actionSym(item.actions) : ''));
  row.appendChild(el('span', { class: 'sv-comp' },
    item.component ? sdComponent(item.component) : ''));
  row.appendChild(el('span', { class: 'sv-effect' }, item.effect || ''));
  row.appendChild(renderRowResults(item.results));
  const m = Number(item.mana);
  row.appendChild(el('span', { class: 'sv-mana' },
    (item.mana !== undefined && item.mana !== null && item.mana !== '')
      ? (isNaN(m) ? String(item.mana) : (m >= 0 ? `+${m}` : `${m}`)) : ''));
  return row;
}

function componentRow(item, idx) {
  const row = el('div', { class: `comp-view-row ${idx % 2 === 0 ? 'row-odd' : 'row-even'}` });
  row.appendChild(el('span', { class: 'ht-vrnt'     }, item.variant   || ''));
  row.appendChild(el('b',    { class: 'ht-attr'     }, item.attribute  || ''));
  row.appendChild(el('span', { class: 'sv-sym'      }, !isNoAction(item.actions) ? actionSym(item.actions) : ''));
  row.appendChild(el('span', { class: 'sv-comp'     }, sdComponent(item.component)));
  row.appendChild(el('span', { class: 'sv-effect'   }, item.effect     || ''));
  row.appendChild(el('span', { class: 'sv-desc'     }, item.description || ''));
  row.appendChild(el('span', { class: 'comp-rarity' }, item.rarity     || ''));
  const price = item.price;
  row.appendChild(el('span', { class: 'comp-price'  },
    (price !== null && price !== undefined && price !== '') ? `${price} gp` : ''));
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
  const row = el('div', { class: `sd-view-row ${idx % 2 === 0 ? 'row-odd' : 'row-even'}` });
  row.appendChild(el('span', { class: 'ht-vrnt'   }, item.variant   || ''));
  row.appendChild(el('b',    { class: 'ht-attr'   }, item.attribute  || ''));
  row.appendChild(el('span', { class: 'sv-sym'    }, !isNoAction(item.actions) ? actionSym(item.actions) : ''));
  row.appendChild(el('span', { class: 'sv-comp'   }, sdComponent(item.component)));
  row.appendChild(el('span', { class: 'sv-effect' }, item.effect || ''));
  row.appendChild(renderRowResults(item.results));
  const m = Number(item.mana);
  row.appendChild(el('span', { class: 'sv-mana'   },
    (item.mana !== undefined && item.mana !== null && item.mana !== '')
      ? (isNaN(m) ? String(item.mana) : (m >= 0 ? `+${m}` : `${m}`)) : ''));
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

  const sections = [];

  if (sustainItems.length) {
    const sec = el('div', { class: 'section-sd' });
    sec.appendChild(el('div', { class: 'result-col-heading' }, 'Sustain'));
    const rows = el('div', { class: 'result-col-content' });
    sustainItems.forEach((s, i) => rows.appendChild(sustainRow(s, i)));
    sec.appendChild(rows);
    sections.push(sec);
  }
  if (dismissItems.length) {
    const sec = el('div', { class: 'section-sd' });
    sec.appendChild(el('div', { class: 'result-col-heading' }, 'Dismiss'));
    const rows = el('div', { class: 'result-col-content' });
    dismissItems.forEach((d, i) => rows.appendChild(sustainRow(d, i)));
    sec.appendChild(rows);
    sections.push(sec);
  }
  return sections;
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
    renderSustainDismiss(v).forEach(sec => block.appendChild(sec));

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

  // Effect
  const effect = renderEffect(f);
  if (effect) card.appendChild(effect);

  // Results
  const results = renderResults(f);
  if (results) card.appendChild(results);

  // Sustain / Dismiss (separate sections for margin between them)
  renderSustainDismiss(f).forEach(sec => card.appendChild(sec));

  // Heightened
  const ht = renderActionSection('Heightened', f.heightened, actionRow);
  if (ht) card.appendChild(ht);

  // Components (before Variants)
  const co = renderActionSection('Components', f.components, componentRow);
  if (co) card.appendChild(co);

  // Variants
  const vt = renderVariants(f);
  if (vt) card.appendChild(vt);

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
   EDITOR — ROW RESULTS (Sustain / Dismiss / Heightened)
   ============================================================ */

function buildRowResultsSection(results) {
  const wrap = el('div', { class: 'row-results-section' });

  const typeRow = el('div', { class: 'form-row' });
  const typeSel = el('select', { class: 'form-input form-select', 'data-field': 'results-type' });
  [{ v: '', l: '-- No Results' }, { v: 'save', l: 'Save' }, { v: 'attack', l: 'Attack' }]
    .forEach(({ v, l }) => {
      const o = el('option', { value: v }, l);
      if ((results?.type || '') === v) o.selected = true;
      typeSel.appendChild(o);
    });
  typeRow.appendChild(typeSel);

  const saveTypeSel = el('select', { class: 'form-input form-select', 'data-field': 'results-save-type' });
  saveTypeSel.appendChild(el('option', { value: '' }, ''));
  OPTS.saveType.forEach(({ value, label }) => {
    const o = el('option', { value }, label);
    if (results?.saveType === value) o.selected = true;
    saveTypeSel.appendChild(o);
  });
  typeRow.appendChild(saveTypeSel);

  const attackTypeSel = el('select', { class: 'form-input form-select', 'data-field': 'results-attack-type' });
  attackTypeSel.appendChild(el('option', { value: '' }, ''));
  OPTS.attackType.forEach(opt => {
    const v = typeof opt === 'object' ? opt.value : opt;
    const l = typeof opt === 'object' ? opt.label : opt;
    const o = el('option', { value: v }, l);
    if (results?.attackType === v) o.selected = true;
    attackTypeSel.appendChild(o);
  });
  typeRow.appendChild(attackTypeSel);
  wrap.appendChild(typeRow);

  const fields = el('div', { class: 'row-results-fields' });
  [['CS', 'cs'], ['S', 's'], ['F', 'f'], ['CF', 'cf']].forEach(([lbl, key]) => {
    const f = el('div', { class: 'form-field' });
    f.appendChild(el('label', {}, lbl));
    const ta = el('textarea', { class: 'form-input', rows: 1, 'data-field': `results-${key}` });
    ta.value = results?.[key] || '';
    f.appendChild(ta);
    fields.appendChild(f);
  });
  wrap.appendChild(fields);

  const sync = () => {
    const t = typeSel.value;
    saveTypeSel.style.display   = (t === 'save')   ? '' : 'none';
    attackTypeSel.style.display = (t === 'attack') ? '' : 'none';
    fields.style.display        = t ? '' : 'none';
  };
  typeSel.addEventListener('change', sync);
  sync();
  return wrap;
}

function collectRowResults(container) {
  const type = container.querySelector('[data-field="results-type"]')?.value || '';
  if (!type) return null;
  return {
    type,
    saveType   : container.querySelector('[data-field="results-save-type"]')?.value?.trim()   || '',
    attackType : container.querySelector('[data-field="results-attack-type"]')?.value?.trim() || '',
    cs : container.querySelector('[data-field="results-cs"]')?.value?.trim() || '',
    s  : container.querySelector('[data-field="results-s"]')?.value?.trim()  || '',
    f  : container.querySelector('[data-field="results-f"]')?.value?.trim()  || '',
    cf : container.querySelector('[data-field="results-cf"]')?.value?.trim() || ''
  };
}

/* ============================================================
   EDITOR — SUSTAIN / DISMISS BUILDER
   ============================================================ */

function buildSdRow(data) {
  data = data || {};
  const parsed = parseLegacyAction(data.actions);
  const row = el('div', { class: 'sd-row' });

  // Option
  const varIn = el('input', { class: 'form-input', type: 'text',
    placeholder: 'Option', 'data-field': 'variant' });
  varIn.value = data.variant || '';
  row.appendChild(varIn);

  // Attribute
  const attrSel = el('select', { class: 'form-input form-select', 'data-field': 'attribute' });
  attrSel.appendChild(el('option', { value: '' }, ''));
  HT_ATTRIBUTES.forEach(({ value, label }) => {
    const o = el('option', { value }, label);
    if (data.attribute === value) o.selected = true;
    attrSel.appendChild(o);
  });
  row.appendChild(attrSel);

  // Count field
  const countIn = el('input', { type: 'number', min: '0', max: '99',
    class: 'form-input', 'data-field': 'act-count' });
  if (parsed.count !== '' && parsed.count != null) countIn.value = String(parsed.count);
  row.appendChild(countIn);

  // Length select
  const lengthSel = el('select', { class: 'form-input form-select', 'data-field': 'act-length' });
  ACTION_LENGTHS.forEach(({ value, label }) => {
    const o = el('option', { value }, label);
    if (value === parsed.length) o.selected = true;
    lengthSel.appendChild(o);
  });
  const syncCount = () => {
    const off = lengthSel.value === 'reaction';
    countIn.disabled = off;
    countIn.style.opacity = off ? '0.3' : '1';
  };
  lengthSel.addEventListener('change', syncCount);
  syncCount();
  row.appendChild(lengthSel);

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

  const wrap = el('div', { class: 'sd-row-wrap' });
  wrap.appendChild(row);
  wrap.appendChild(buildRowResultsSection(data.results));
  return wrap;
}

function buildSdSection(title, containerId, initialData) {
  const wrap = el('div', { class: 'form-field form-field-wide' });

  const heading = el('div', { class: 'sd-heading' });
  heading.appendChild(el('span', {}, title));
  const addBtn = el('button', { class: 'sd-add-btn', type: 'button' }, '+');
  heading.appendChild(addBtn);
  wrap.appendChild(heading);

  const labels = el('div', { class: 'sd-labels' });
  ['Option', 'Attribute', 'Count', 'Length', 'Comp', 'Effect', 'Mana'].forEach(l =>
    labels.appendChild(el('span', { class: 'sd-label' }, l)));
  wrap.appendChild(labels);

  const container = el('div', { id: containerId });
  const rows = Array.isArray(initialData)
    ? initialData
    : (initialData && (initialData.effect || initialData.actions) ? [initialData] : []);
  if (rows.length) rows.forEach(r => container.appendChild(buildSdRow(r)));
  else container.appendChild(buildSdRow({}));
  wrap.appendChild(container);

  addBtn.addEventListener('click', () => container.appendChild(buildSdRow({})));
  return wrap;
}

function collectSdRows(containerId) {
  const wraps = document.querySelectorAll(`#${containerId} .sd-row-wrap`);
  return Array.from(wraps).map(wrap => {
    const get = f => wrap.querySelector(`[data-field="${f}"]`)?.value?.trim() || '';
    const m = get('mana');
    return {
      variant   : get('variant'),
      attribute : get('attribute'),
      actions   : collectAction(get('act-count'), get('act-length')),
      component : get('component'),
      effect    : get('effect'),
      mana      : m !== '' ? parseFloat(m) : 0,
      results   : collectRowResults(wrap)
    };
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

  // Count field
  const parsed = parseLegacyAction(data.actions);
  const countIn = el('input', { type: 'number', min: '0', max: '99',
    class: 'form-input', 'data-field': 'act-count' });
  if (parsed.count !== '' && parsed.count != null) countIn.value = String(parsed.count);
  row.appendChild(countIn);

  // Length select
  const lengthSel = el('select', { class: 'form-input form-select', 'data-field': 'act-length' });
  ACTION_LENGTHS.forEach(({ value, label }) => {
    const o = el('option', { value }, label);
    if (value === parsed.length) o.selected = true;
    lengthSel.appendChild(o);
  });
  const syncCount = () => {
    const off = lengthSel.value === 'reaction';
    countIn.disabled = off;
    countIn.style.opacity = off ? '0.3' : '1';
  };
  lengthSel.addEventListener('change', syncCount);
  syncCount();
  row.appendChild(lengthSel);

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

  const wrap = el('div', { class: 'ht-row-wrap' });
  wrap.appendChild(row);
  wrap.appendChild(buildRowResultsSection(data.results));
  return wrap;
}

function buildHtSection(initialData) {
  const wrap = el('div', { class: 'form-field form-field-wide' });

  const heading = el('div', { class: 'sd-heading' });
  heading.appendChild(el('span', {}, 'Heightened'));
  const addBtn = el('button', { class: 'sd-add-btn', type: 'button' }, '+');
  heading.appendChild(addBtn);
  wrap.appendChild(heading);

  const labels = el('div', { class: 'ht-labels' });
  ['Option', 'Attribute', 'Count', 'Length', 'Comp', 'Effect', 'Mana'].forEach(l =>
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
  const wraps = document.querySelectorAll('#heightened-rows .ht-row-wrap');
  return Array.from(wraps).map(wrap => {
    const get = f => wrap.querySelector(`[data-field="${f}"]`)?.value?.trim() || '';
    const m = get('mana');
    return {
      variant   : get('variant'),
      attribute : get('attribute'),
      actions   : collectAction(get('act-count'), get('act-length')),
      component : get('component'),
      effect    : get('effect'),
      mana      : m !== '' ? parseFloat(m) : 0,
      results   : collectRowResults(wrap)
    };
  }).filter(r => r.effect || r.attribute);
}

/* ============================================================
   EDITOR — COMPONENTS BUILDER
   ============================================================ */

function buildComponentRow(data) {
  data = data || {};
  const parsed = parseLegacyAction(data.actions);
  const wrap = el('div', { class: 'comp-editor-row' });

  const header = el('div', { class: 'effect-extra-header' });
  header.appendChild(el('span', { class: 'effect-extra-label' }, 'Component'));
  const removeBtn = el('button', { class: 'effect-row-remove', type: 'button' }, '\u00D7');
  removeBtn.addEventListener('click', () => wrap.remove());
  header.appendChild(removeBtn);
  wrap.appendChild(header);

  const lblRow = el('div', { class: 'comp-editor-labels' });
  ['Option', 'Attribute', 'Count', 'Length', 'Type', 'Rarity', 'Price'].forEach(l =>
    lblRow.appendChild(el('span', { class: 'sd-label' }, l)));
  wrap.appendChild(lblRow);

  const mainRow = el('div', { class: 'comp-editor-main' });

  const varIn = el('input', { class: 'form-input', type: 'text',
    placeholder: 'Option', 'data-field': 'variant' });
  varIn.value = data.variant || '';
  mainRow.appendChild(varIn);

  const attrSel = el('select', { class: 'form-input form-select', 'data-field': 'attribute' });
  attrSel.appendChild(el('option', { value: '' }, ''));
  HT_ATTRIBUTES.forEach(({ value, label }) => {
    const o = el('option', { value }, label);
    if (data.attribute === value) o.selected = true;
    attrSel.appendChild(o);
  });
  mainRow.appendChild(attrSel);

  const countIn = el('input', { type: 'number', min: '0', max: '99',
    class: 'form-input', 'data-field': 'act-count' });
  if (parsed.count !== '' && parsed.count != null) countIn.value = String(parsed.count);
  mainRow.appendChild(countIn);

  const lengthSel = el('select', { class: 'form-input form-select', 'data-field': 'act-length' });
  ACTION_LENGTHS.forEach(({ value, label }) => {
    const o = el('option', { value }, label);
    if (value === parsed.length) o.selected = true;
    lengthSel.appendChild(o);
  });
  const syncCount = () => {
    const off = lengthSel.value === 'reaction';
    countIn.disabled = off;
    countIn.style.opacity = off ? '0.3' : '1';
  };
  lengthSel.addEventListener('change', syncCount);
  syncCount();
  mainRow.appendChild(lengthSel);

  const typeIn = el('input', { class: 'form-input', type: 'text',
    placeholder: 'M V S F', 'data-field': 'component' });
  typeIn.value = data.component || '';
  mainRow.appendChild(typeIn);

  const raritySel = el('select', { class: 'form-input form-select', 'data-field': 'rarity' });
  raritySel.appendChild(el('option', { value: '' }, ''));
  ['Common', 'Uncommon', 'Rare', 'Unique'].forEach(r => {
    const o = el('option', { value: r.toLowerCase() }, r);
    if ((data.rarity || '').toLowerCase() === r.toLowerCase()) o.selected = true;
    raritySel.appendChild(o);
  });
  mainRow.appendChild(raritySel);

  const priceIn = el('input', { type: 'number', min: '0', step: '0.01',
    class: 'form-input', 'data-field': 'price' });
  if (data.price !== undefined && data.price !== null && data.price !== '')
    priceIn.value = String(data.price);
  mainRow.appendChild(priceIn);

  wrap.appendChild(mainRow);

  const efTa = el('textarea', { class: 'form-input', rows: 2,
    'data-field': 'effect', placeholder: 'Effect' });
  efTa.value = data.effect || '';
  wrap.appendChild(efTa);

  const descTa = el('textarea', { class: 'form-input', rows: 2,
    'data-field': 'description', placeholder: 'Description' });
  descTa.value = data.description || '';
  wrap.appendChild(descTa);

  return wrap;
}

function buildComponentsSection(f) {
  const wrap = el('div', { class: 'form-field form-field-wide' });
  const heading = el('div', { class: 'sd-heading' });
  heading.appendChild(el('span', {}, 'Components'));
  const addBtn = el('button', { class: 'sd-add-btn', type: 'button' }, '+');
  heading.appendChild(addBtn);
  wrap.appendChild(heading);
  const container = el('div', { id: 'component-rows' });
  (f.components || []).filter(Boolean).forEach(c => container.appendChild(buildComponentRow(c)));
  wrap.appendChild(container);
  addBtn.addEventListener('click', () => container.appendChild(buildComponentRow({})));
  return wrap;
}

function collectComponentRows() {
  const rows = document.querySelectorAll('#component-rows .comp-editor-row');
  return Array.from(rows).map(row => {
    const get = f => row.querySelector(`[data-field="${f}"]`)?.value?.trim() || '';
    const num = f => { const x = get(f); return x !== '' ? parseFloat(x) : null; };
    return {
      variant     : get('variant'),
      attribute   : get('attribute'),
      actions     : collectAction(get('act-count'), get('act-length')),
      component   : get('component'),
      effect      : get('effect'),
      description : get('description'),
      rarity      : get('rarity'),
      price       : num('price')
    };
  }).filter(r => r.effect || r.description || r.variant);
}

/* ============================================================
   EDITOR — EFFECT SECTION BUILDER
   ============================================================ */

function buildEffectRow(data) {
  data = data || {};
  const wrap = el('div', { class: 'effect-extra-row' });

  const header = el('div', { class: 'effect-extra-header' });
  header.appendChild(el('span', { class: 'effect-extra-label' }, 'Additional Effect'));
  const removeBtn = el('button', { class: 'effect-row-remove', type: 'button' }, '\u00D7');
  removeBtn.addEventListener('click', () => wrap.remove());
  header.appendChild(removeBtn);
  wrap.appendChild(header);

  // Text
  const ta = el('textarea', { class: 'form-input', rows: 2, 'data-field': 'text' });
  ta.value = data.text || data.effect || (typeof data === 'string' ? data : '') || '';
  wrap.appendChild(ta);

  // Helpers scoped to this row (cannot use outer edNum/edSelect as they set ids)
  function rowNum(label, field, val, min) {
    const f = el('div', { class: 'form-field' });
    f.appendChild(el('label', {}, label));
    const inp = el('input', { type: 'number', class: 'form-input', 'data-field': field });
    if (min !== undefined && min !== null) inp.min = String(min);
    if (val !== undefined && val !== null && val !== '') inp.value = String(val);
    f.appendChild(inp);
    return f;
  }
  function rowSel(label, field, val, options) {
    const f = el('div', { class: 'form-field' });
    f.appendChild(el('label', {}, label));
    const sel = el('select', { class: 'form-input form-select', 'data-field': field });
    sel.appendChild(el('option', { value: '' }, ''));
    options.forEach(opt => {
      const v = typeof opt === 'object' ? opt.value : opt;
      const l = typeof opt === 'object' ? opt.label : opt;
      const o = el('option', { value: String(v) }, l);
      if (String(v) === String(val)) o.selected = true;
      sel.appendChild(o);
    });
    f.appendChild(sel);
    return f;
  }

  const dmgRow = el('div', { class: 'form-row' });
  dmgRow.appendChild(rowNum('Die Count', 'dmg-count', data.damage?.dieNumber, 0));
  dmgRow.appendChild(rowSel('Die Size',  'dmg-size',  data.damage?.dieSize,   OPTS.dieSize));
  dmgRow.appendChild(rowNum('Modifier',  'dmg-mod',   data.damage?.modifier,  null));
  dmgRow.appendChild(rowSel('Type',      'dmg-type',  data.damage?.type,      OPTS.damageType));
  wrap.appendChild(dmgRow);

  const asRow = el('div', { class: 'form-row' });
  asRow.appendChild(rowSel('Attack Type',    'atk-type',  data.attack?.type,     OPTS.attackType));
  asRow.appendChild(rowNum('Attack Modifier','atk-mod',   data.attack?.modifier, null));
  asRow.appendChild(rowSel('Save Type',      'save-type', data.save?.type,       OPTS.saveType));
  asRow.appendChild(rowNum('Save Modifier',  'save-mod',  data.save?.modifier,   null));
  wrap.appendChild(asRow);

  return wrap;
}

function buildEffectSection(f) {
  const wrap = el('div', { class: 'form-field form-field-wide' });

  const heading = el('div', { class: 'sd-heading' });
  heading.appendChild(el('span', {}, 'Effect'));
  const addBtn = el('button', { class: 'sd-add-btn', type: 'button' }, '+');
  heading.appendChild(addBtn);
  wrap.appendChild(heading);

  // Base fields
  const baseWrap = el('div', { class: 'effect-base-wrap' });
  const baseTa = el('textarea', { id: 'ed-effect-base', class: 'form-input', rows: 3 });
  baseTa.value = f.effect?.base || '';
  baseWrap.appendChild(baseTa);

  const dmgRow = el('div', { class: 'form-row' });
  dmgRow.appendChild(edNum(  'Damage Die Count', 'ed-dmg-count',    f.damage?.dieNumber,               0));
  dmgRow.appendChild(edSelect('Damage Die Size', 'ed-dmg-size',     f.damage?.dieSize,   OPTS.dieSize));
  dmgRow.appendChild(edNum(  'Damage Modifier',  'ed-dmg-modifier', f.damage?.modifier ?? f.damage?.bonus, null));
  dmgRow.appendChild(edSelect('Damage Type',     'ed-dmg-type',     f.damage?.type,      OPTS.damageType));
  baseWrap.appendChild(dmgRow);

  const asRow = el('div', { class: 'form-row' });
  asRow.appendChild(edSelect('Attack Type',    'ed-atk-type',      f.attack?.type,     OPTS.attackType));
  asRow.appendChild(edNum(  'Attack Modifier', 'ed-atk-modifier',  f.attack?.modifier, null));
  asRow.appendChild(edSelect('Save Type',      'ed-save-type',     f.save?.type,       OPTS.saveType));
  asRow.appendChild(edNum(  'Save Modifier',   'ed-save-modifier', f.save?.modifier,   null));
  baseWrap.appendChild(asRow);

  wrap.appendChild(baseWrap);

  // Additional effects
  const container = el('div', { id: 'effect-options-rows' });
  (f.effect?.options || []).filter(Boolean).forEach(opt => container.appendChild(buildEffectRow(opt)));
  wrap.appendChild(container);

  addBtn.addEventListener('click', () => container.appendChild(buildEffectRow({})));
  return wrap;
}

function collectEffectOptions() {
  const rows = document.querySelectorAll('#effect-options-rows .effect-extra-row');
  return Array.from(rows).map(row => {
    const get = field => row.querySelector(`[data-field="${field}"]`)?.value?.trim() || '';
    const num = field => { const x = get(field); return x !== '' ? parseFloat(x) : 0; };
    return {
      text   : get('text'),
      damage : { dieNumber: num('dmg-count'), dieSize: num('dmg-size'), modifier: num('dmg-mod'), type: get('dmg-type') },
      attack : { type: get('atk-type'),  modifier: num('atk-mod')  },
      save   : { type: get('save-type'), modifier: num('save-mod') }
    };
  }).filter(r => r.text);
}

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
  damageType : ['acid', 'bludgeoning', 'cold', 'electricity', 'fire', 'force', 'lightning',
                'necrotic', 'negative', 'physical', 'piercing', 'poison', 'positive', 'profane',
                'psychic', 'radiant', 'sacred', 'slashing', 'sonic'],
  durLength  : [
    'instantaneous',
    'until the start of your next turn', 'until the end of your next turn',
    'rounds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years',
    'until dismissed', 'until triggered', 'permanent'
  ]
};

const TRAIT_GROUPS = [
  { label: 'Condition', items: ['curse', 'disease', 'haste', 'poison', 'reposition', 'slow', 'stun'] },
  { label: 'Elemental', items: ['air', 'earth', 'fire', 'metal', 'water', 'wood'] },
  { label: 'Energy',    items: ['acid', 'cold', 'electricity', 'fire', 'force', 'lightning',
                                'necrotic', 'negative', 'poison', 'positive', 'profane', 'psychic',
                                'radiant', 'sacred', 'sonic'] },
  { label: 'Mental',    items: ['charm', 'compulsion', 'emotion', 'fear', 'mental', 'sleep'] },
  { label: 'Sensory',   items: ['auditory', 'detection', 'olfactory', 'shroud', 'tactile', 'visual'] },
  { label: 'Other',     items: ['animation', 'creation', 'darkness', 'enhancement', 'healing', 'illusion',
                                'light', 'luck', 'necromancy', 'polymorph', 'reduction', 'resistance',
                                'summoning', 'utility', 'ward'] }
];

const TRADITION_GROUPS = [
  { label: 'Trained',   items: ['arcane', 'divine', 'bardic'] },
  { label: 'Untrained', items: ['bloodline', 'pact'] }
];

const ACCESS_GROUPS = [
  { label: 'Arcane School', items: [
    { value: 'arcane school: elemental: air',   label: 'elemental: air'   },
    { value: 'arcane school: elemental: earth', label: 'elemental: earth' },
    { value: 'arcane school: elemental: fire',  label: 'elemental: fire'  },
    { value: 'arcane school: elemental: water', label: 'elemental: water' }
  ]},
  { label: 'Bardic Tune', items: [
    { value: 'bardic tune: discovery',          label: 'discovery'  },
    { value: 'bardic tune: lull',               label: 'lull'       },
    { value: 'bardic tune: obscure',            label: 'obscure'    },
    { value: 'bardic tune: protection',         label: 'protection' }
  ]},
  { label: 'Bloodline', items: [
    { value: 'bloodline: draconic',             label: 'draconic'         },
    { value: 'bloodline: elemental: air',       label: 'elemental: air'   },
    { value: 'bloodline: elemental: earth',     label: 'elemental: earth' },
    { value: 'bloodline: elemental: fire',      label: 'elemental: fire'  },
    { value: 'bloodline: elemental: water',     label: 'elemental: water' },
    { value: 'bloodline: fey',                  label: 'fey'              },
    { value: 'bloodline: genie: air',           label: 'genie: air'       },
    { value: 'bloodline: genie: earth',         label: 'genie: earth'     },
    { value: 'bloodline: genie: fire',          label: 'genie: fire'      },
    { value: 'bloodline: genie: water',         label: 'genie: water'     },
    { value: 'bloodline: planar',               label: 'planar'           },
    { value: 'bloodline: shadow',               label: 'shadow'           },
    { value: 'bloodline: undead',               label: 'undead'           }
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
    { value: 'divine specialty: airwalker',              label: 'airwalker'              },
    { value: 'divine specialty: deathstalker',           label: 'deathstalker'           },
    { value: 'divine specialty: firemane',               label: 'firemane'               },
    { value: 'divine specialty: firewalker',             label: 'firewalker'             },
    { value: 'divine specialty: icepriestess/icepriest', label: 'icepriestess/icepriest' },
    { value: 'divine specialty: stormlady/stormlord',    label: 'stormlady/stormlord'    },
    { value: 'divine specialty: windwalker',             label: 'windwalker'             }
  ]},
  { label: 'Pact', items: [
    { value: 'pact: the fathomless', label: 'the fathomless' },
    { value: 'pact: genie: air',     label: 'genie: air'     },
    { value: 'pact: genie: earth',   label: 'genie: earth'   },
    { value: 'pact: genie: fire',    label: 'genie: fire'    },
    { value: 'pact: genie: water',   label: 'genie: water'   }
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

  // Image path (relative, e.g. assets/img/animate-dead.jpg)
  const imgWrap = el('div', { class: 'form-field' });
  imgWrap.appendChild(el('label', {}, 'Image path (assets/img/...)'));
  const imgPathIn = el('input', { type: 'text', class: 'form-input', id: 'ed-image-path',
    placeholder: 'assets/img/filename.jpg' });
  imgPathIn.value = f.image || '';
  imgWrap.appendChild(imgPathIn);
  form.appendChild(imgWrap);
  form.appendChild(edGroupedCheckboxes('Traits',      'ed-traits',     f.traits,     TRAIT_GROUPS,      'form-label-tag-traits'));
  form.appendChild(edGroupedCheckboxes('Traditions',  'ed-traditions', f.traditions, TRADITION_GROUPS,  'form-label-tag-traditions'));
  form.appendChild(edGroupedCheckboxes('Access',      'ed-access',     f.access,     ACCESS_GROUPS,     'form-label-tag-access'));

  // Cast
  form.appendChild(sec('Cast'));
  const castActWrap = el('div', { class: 'form-field' });
  castActWrap.appendChild(el('label', {}, 'Actions'));
  castActWrap.appendChild(buildActionPair(f.cast?.actions, 'ed-cast'));
  form.appendChild(edRow(
    castActWrap,
    edCheckboxes('Components', 'ed-cast-comp', f.cast?.component),
    edField('Trigger', 'ed-cast-trigger', f.cast?.trigger)
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

  // Effect (with + button for additional effects)
  form.appendChild(buildEffectSection(f));

  // Skill Check
  form.appendChild(sec('Skill Check'));
  const primaryVal = (f.skill?.primary || []).join(', ');
  const primaryField = edField('Primary (comma-separated)', 'ed-sk-primary', primaryVal);
  primaryField.querySelector('input').placeholder = 'per Tradition';
  form.appendChild(primaryField);
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

  form.appendChild(buildSdSection('Sustain', 'sustain-rows', f.sustain));
  form.appendChild(buildSdSection('Dismiss', 'dismiss-rows', f.dismiss));
  form.appendChild(buildHtSection(f.heightened));
  form.appendChild(buildComponentsSection(f));
  form.appendChild(sec('Variants'));
  form.appendChild(edJson('Variants (JSON array)', 'ed-variants', f.variants));

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
    image      : (document.getElementById('ed-image-path')?.value?.trim() || ''),
    traits     : checkboxArr('ed-traits'),
    traditions : checkboxArr('ed-traditions'),
    access     : checkboxArr('ed-access'),
    cast: {
      actions  : collectAction(
        document.getElementById('ed-cast-act-count')?.value?.trim() || '',
        document.getElementById('ed-cast-act-length')?.value?.trim() || 'none'
      ),
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
      options : collectEffectOptions()
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
    components : collectComponentRows()
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

  const sorted = filtered.slice().sort((a, b) => {
    const n1 = (a.name || '').toLowerCase();
    const n2 = (b.name || '').toLowerCase();
    return n1 < n2 ? -1 : n1 > n2 ? 1 : 0;
  });

  if (!sorted.length) {
    list.appendChild(el('div', { class: 'list-empty' },
      state.foundations.length ? 'No matches.' : 'No foundations yet.'));
    return;
  }

  sorted.forEach(f => {
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

  // Sidebar resize
  const SIDEBAR_MIN = 140;
  const SIDEBAR_MAX = 500;
  const SIDEBAR_KEY = 'skd20_sidebar_width';
  const root        = document.documentElement;

  const savedWidth = localStorage.getItem(SIDEBAR_KEY);
  if (savedWidth) root.style.setProperty('--sidebar-width', savedWidth + 'px');

  const handle = document.getElementById('sidebar-handle');

  // Firefox fires dragstart after mousedown even with preventDefault, intercepting mousemove.
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