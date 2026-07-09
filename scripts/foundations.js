'use strict';

/* ============================================================
   FOUNDATIONS -- foundations.js
   Foundation-specific code. Requires shared.js.
   ============================================================ */

/* Extend shared CONFIG with this section's data file path */
CONFIG.file = 'data/foundations.json';

/* Extend shared state with Foundation-specific fields */
state.entries = [];
state.sha     = null;

/* ============================================================
   FOUNDATION-SPECIFIC UTILITIES
   ============================================================ */

function spellComponent(comp) {
  if (!comp) return '';
  const MAP = { v: 'Verbal', s: 'Somatic', m: 'Material', f: 'Focus' };
  return comp.toLowerCase().split(/[+|,\s]+/)
    .map(c => MAP[c.trim()] || c.trim())
    .filter(Boolean).join(', ');
}

/* ============================================================
   GITHUB -- FOUNDATION DATA (data/foundations.json)
   ============================================================ */

async function loadData() {
  setStatus('Loading\u2026', 'load');
  state.entries = [];
  try {
    const result = await ghReadFile(CONFIG.file);
    if (result) {
      state.sha     = result.sha;
      state.entries = result.data.foundations || [];
      setStatus(`Loaded (${state.entries.length})`, 'ok');
    } else {
      setStatus('Viewer mode -- no token', '');
    }
  } catch (err) {
    setStatus(`Error: ${err.message}`, 'error');
  }
  renderList();
  updateButtons();
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
  const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
  try {
    const newSha = await ghWriteFile(
      CONFIG.file, state.sha,
      { foundations: state.entries },
      `Update foundations [${ts}]`
    );
    state.sha   = newSha;
    state.dirty = false;
    setStatus('Saved to GitHub \u2713', 'ok');
    updateButtons();
    return true;
  } catch (err) {
    if (err.status === 409 && !isRetry) {
      setStatus('Conflict detected, refreshing\u2026', 'load');
      const r = await ghReadFile(CONFIG.file);
      if (r) state.sha = r.sha;
      return attemptSave(true);
    }
    throw err;
  }
}


/* ============================================================
   RENDERING — TRAIT BAR
   ============================================================ */

function traitTag(text, cls) {
  const classes = ['trait-tag', cls].filter(Boolean).join(' ');
  return el('span', { class: classes }, text);
}

function renderBase(f) {
  const base = el('div', { class: 'section-base' });

  // -- Left column: traits (row 1 + row 2) then base-specs
  const left = el('div', { class: 'base-col-left' });

  // Row 1: rarity + difficulty + general traits
  const traitsRow = el('div', { class: 'trait-row' });
  if (f.rarity)     traitsRow.appendChild(traitTag(f.rarity,
    `trait-rarity-${f.rarity.toLowerCase().replace(/\s+/g, '-')}`));
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

  // Base specs (cast, range, area, targets, duration)
  const specs = renderSpecs(f);
  if (specs) left.appendChild(specs);

  // Effect section (3rd row in left column)
  const effectSec = renderEffect(f);
  if (effectSec) left.appendChild(effectSec);

  base.appendChild(left);

  // -- Right column: image (always present; empty if no image)
  const right = el('div', { class: 'base-col-right' });
  if (f.image) {
    right.appendChild(el('img', { class: 'base-image', src: f.image, alt: '' }));
  }
  base.appendChild(right);

  return base;
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
  const content = el('div', { class: 'section-col-content' });
  const add = r => r && content.appendChild(r);

  add(specRowCast(f));
  if (f.cast?.trigger) add(specRow('Trigger', f.cast.trigger));
  if (hasValue(f.range)) add(specRow('Range', f.range));
  if (f.area?.size || f.area?.shape || f.area?.type) {
    const parts = [];
    if (f.area.size) parts.push(`${f.area.size}'`);
    if (f.area.shape) parts.push(f.area.shape);
    if (f.area.type)  parts.push(f.area.type);
    add(specRow('Area', parts.join(' ')));
  }
  if (f.targets?.count || f.targets?.type) {
    add(specRow('Targets', [f.targets.count, f.targets.type].filter(Boolean).join(' ')));
  }
  if (hasValue(f.duration)) add(specRow('Duration', f.duration));

  if (!content.children.length) return null;
  const section = el('div', { class: 'base-specs' });
  section.appendChild(el('div', { class: 'section-col-heading' }, 'Base'));
  section.appendChild(content);
  return section;
}

/* ============================================================
   RENDERING — EFFECT
   ============================================================ */

function renderEffect(f) {
  // Build unified opts list: fold legacy base + foundation-level fields into first opt
  const allOpts = [];
  if (f.effect?.base) {
    allOpts.push({ text: f.effect.base, note: f.note||'',
                   damage: f.damage, attack: f.attack, save: f.save });
  }
  (f.effect?.options || []).filter(Boolean).forEach(opt => allOpts.push(opt));
  if (!allOpts.length && !f.note && !f.attack?.type && !f.save?.type && !f.damage?.dieNumber) return null;

  const section = el('div', { class: 'base-effect' });
  section.appendChild(el('div', { class: 'section-col-heading' }, 'Effect'));
  const content = el('div', { class: 'section-col-content' });

  // Effect options -- all wrapped in effect-option-block
  const multiOpts = allOpts.length > 1;
  allOpts.forEach((opt, oi) => {
    if (typeof opt === 'string') opt = { text: opt };
    const isOnly  = !multiOpts;
    const hasTitle = !!opt.title;
    const rowCls  = !isOnly ? (oi % 2 === 0 ? ' row-odd' : ' row-even') : '';
    const block   = el('div', { class: `effect-option-block${rowCls}` });

    if (hasTitle) block.appendChild(el('div', { class: 'effect-opt-title option-name' }, opt.title));

    const inner = el('div', { class: 'effect-opt-content' });
    if (opt.text) inner.appendChild(el('p', { class: 'effect-entry' }, opt.text));
    if (opt.note?.trim()) {
      const nd = el('div', { class: 'effect-note row-cf' });
      nd.appendChild(el('b', { class: 'result-label' }, 'NOTE: '));
      nd.appendChild(document.createTextNode(opt.note.trim()));
      inner.appendChild(nd);
    }
    if (opt.damage?.dieNumber) {
      const d = opt.damage; const mod = d.modifier ?? d.bonus;
      inner.appendChild(specRow('Damage', `${d.dieNumber}d${d.dieSize}${mod ? `+${mod}` : ''} ${d.type || ''}`.trim()));
    }
    if (opt.attack?.type)
      inner.appendChild(specRow('Attack', [opt.attack.type, opt.attack.modifier].filter(Boolean).join(' ')));
    if (opt.save?.type)
      inner.appendChild(specRow('Saving Throw', [opt.save.type, opt.save.modifier].filter(Boolean).join(' ')));
    // Legacy {option, effect} format
    if (!opt.text && opt.effect) {
      const p = el('p', { class: 'effect-entry' });
      if (opt.option) p.appendChild(el('b', {}, `${opt.option}: `));
      p.appendChild(document.createTextNode(opt.effect));
      inner.appendChild(p);
    }
    block.appendChild(inner);
    content.appendChild(block);
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
    col.appendChild(el('div', { class: 'section-col-heading' }, headingText));
    const content = el('div', { class: 'section-col-content' });
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
  const div = el('div', { class: 'option-results' });
  if (!results?.type) return div;
  const typeLabel = results.type === 'save'
    ? (results.saveType || '').toUpperCase()
    : `${(results.attackType || '').toUpperCase()} ATTACK`;
  div.appendChild(el('div', { class: 'option-results-type' }, typeLabel));
  [
    { text: results.cs, label: 'CS', cls: 'row-cs' },
    { text: results.s,  label: 'S',  cls: 'row-s'  },
    { text: results.f,  label: 'F',  cls: 'row-sf' },
    { text: results.cf, label: 'CF', cls: 'row-cf' }
  ].forEach(({ text, label, cls }) => {
    if (!text) return;
    const entry = el('div', { class: `option-results-entry ${cls}` });
    entry.appendChild(el('b', { class: 'option-results-label' }, label));
    entry.appendChild(document.createTextNode(` ${text}`));
    div.appendChild(entry);
  });
  return div;
}

function actionRow(item, idx) {
  const row = el('div', { class: `option-row ${idx % 2 === 0 ? 'row-odd' : 'row-even'}` });
  row.appendChild(el('span', { class: 'option-name' }, item.name || ''));
  row.appendChild(el('b',    { class: 'option-spec' }, item.attribute || ''));
  row.appendChild(el('span', { class: 'option-duration'  },
    !isNoAction(item.actions) ? actionSym(item.actions) : ''));
  row.appendChild(el('span', { class: 'option-component' },
    item.component ? sdComponent(item.component) : ''));
  row.appendChild(el('span', { class: 'option-effect' }, item.effect || ''));
  row.appendChild(renderRowResults(item.results));
  const m = Number(item.mana);
  row.appendChild(el('span', { class: 'option-mana' },
    (item.mana !== undefined && item.mana !== null && item.mana !== '')
      ? (isNaN(m) ? String(item.mana) : (m >= 0 ? `+${m}` : `${m}`)) : ''));
  return row;
}

function componentRow(item, idx) {
  const row = el('div', { class: `component-row ${idx % 2 === 0 ? 'row-odd' : 'row-even'}` });
  row.appendChild(el('span', { class: 'option-name'    }, item.name   || ''));
  row.appendChild(el('b',    { class: 'option-spec'    }, item.attribute  || ''));
  row.appendChild(el('span', { class: 'option-duration'  }, !isNoAction(item.actions) ? actionSym(item.actions) : ''));
  row.appendChild(el('span', { class: 'option-component' }, sdComponent(item.component)));
  row.appendChild(el('span', { class: 'option-effect'  }, item.effect     || ''));
  row.appendChild(el('span', { class: 'component-desc' }, item.description || ''));
  const _rv = (item.rarity || '').toLowerCase().replace(/\s+/g, '-');
  row.appendChild(el('span', { class: `component-rarity${_rv ? ` component-rarity-${_rv}` : ''}` }, item.rarity || ''));
  const price = item.price;
  row.appendChild(el('span', { class: 'component-price'  },
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
  const row = el('div', { class: `option-row ${idx % 2 === 0 ? 'row-odd' : 'row-even'}` });
  row.appendChild(el('span', { class: 'option-name'   }, item.name   || ''));
  row.appendChild(el('b',    { class: 'option-spec'   }, item.attribute  || ''));
  row.appendChild(el('span', { class: 'option-duration' }, !isNoAction(item.actions) ? actionSym(item.actions) : ''));
  row.appendChild(el('span', { class: 'option-component' }, sdComponent(item.component)));
  row.appendChild(el('span', { class: 'option-effect' }, item.effect || ''));
  row.appendChild(renderRowResults(item.results));
  const m = Number(item.mana);
  row.appendChild(el('span', { class: 'option-mana'   },
    (item.mana !== undefined && item.mana !== null && item.mana !== '')
      ? (isNaN(m) ? String(item.mana) : (m >= 0 ? `+${m}` : `${m}`)) : ''));
  return row;
}

function renderActionSection(title, items, rowFn) {
  if (!items?.length) return null;
  const active = items.filter(i => i && (i.effect || i.description || hasValue(i.actions)));
  if (!active.length) return null;
  const section = el('details', { class: 'section-options', open: true });
  section.appendChild(el('summary', { class: 'section-heading' }, title));
  const body = el('div', { class: 'section-options-body' });
  body.appendChild(el('div', { class: 'section-col-heading' }, title));
  const content = el('div', { class: 'section-col-content' });
  active.forEach((item, i) => content.appendChild(rowFn(item, i)));
  body.appendChild(content);
  section.appendChild(body);
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
    const sec = el('details', { class: 'section-options', open: true });
    sec.appendChild(el('summary', { class: 'section-heading' }, 'Sustain'));
    const body = el('div', { class: 'section-options-body' });
    body.appendChild(el('div', { class: 'section-col-heading' }, 'Sustain'));
    const rows = el('div', { class: 'section-col-content' });
    sustainItems.forEach((s, i) => rows.appendChild(sustainRow(s, i)));
    body.appendChild(rows);
    sec.appendChild(body);
    sections.push(sec);
  }
  if (dismissItems.length) {
    const sec = el('details', { class: 'section-options', open: true });
    sec.appendChild(el('summary', { class: 'section-heading' }, 'Dismiss'));
    const body = el('div', { class: 'section-options-body' });
    body.appendChild(el('div', { class: 'section-col-heading' }, 'Dismiss'));
    const rows = el('div', { class: 'section-col-content' });
    dismissItems.forEach((d, i) => rows.appendChild(sustainRow(d, i)));
    body.appendChild(rows);
    sec.appendChild(body);
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

    // Base section (always; includes specs, effect, image)
    block.appendChild(renderBase(v));

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
  const card = el('div', { class: 'entry-card' });

  // Heading
  const heading = el('div', { class: 'entry-heading' });
  heading.appendChild(el('span', { class: 'foundation-name' }, f.name || 'Unnamed'));
  if (f.mana !== undefined && f.mana !== '') {
    heading.appendChild(el('span', { class: 'entry-cost' }, `Foundation ${f.mana}`));
  }
  card.appendChild(heading);

  // Base section
  card.appendChild(renderBase(f));

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

const SD_HT_LABELS = ['Option', 'Attribute', 'Count', 'Length', 'Comp', 'Effect', 'Mana'];

function buildAttributeSelect(value) {
  const sel = el('select', { class: 'form-input form-select', 'data-field': 'attribute' });
  sel.appendChild(el('option', { value: '' }, ''));
  HT_ATTRIBUTES.forEach(({ value: v, label }) => {
    const o = el('option', { value: v }, label);
    if (value === v) o.selected = true;
    sel.appendChild(o);
  });
  return sel;
}

/* ============================================================
   EDITOR — SUSTAIN / DISMISS BUILDER
   ============================================================ */

function buildSdRow(data) {
  data = data || {};
  const parsed = parseLegacyAction(data.actions);
  const wrap = el('div', { class: 'option-row-wrap' });

  const header = el('div', { class: 'option-header' });
  const headerLabels = el('div', { class: 'option-labels' });
  SD_HT_LABELS.forEach(l =>
    headerLabels.appendChild(el('span', { class: 'option-label' }, l)));
  header.appendChild(headerLabels);
  const removeBtn = el('button', { class: 'effect-row-remove', type: 'button' }, '\u00D7');
  removeBtn.addEventListener('click', () => wrap.remove());
  header.appendChild(removeBtn);
  wrap.appendChild(header);

  const row = el('div', { class: 'option-fields' });

  // Option
  const varIn = el('input', { class: 'form-input', type: 'text',
    placeholder: 'Option', 'data-field': 'name' });
  varIn.value = data.name || '';
  row.appendChild(varIn);

  row.appendChild(buildAttributeSelect(data.attribute));

  const { countIn, lengthSel } = buildCountLengthPair(parsed);
  row.appendChild(countIn);
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
  clampManaInput(manaIn);
  row.appendChild(manaIn);

  wrap.appendChild(row);
  wrap.appendChild(buildRowResultsSection(data.results));
  return wrap;
}

function buildSdSection(title, containerId, initialData) {
  const wrap = el('div', { class: 'form-field form-field-wide' });

  const heading = el('div', { class: 'options-heading' });
  heading.appendChild(el('span', {}, title));
  const addBtn = el('button', { class: 'options-add-btn', type: 'button' }, '+');
  heading.appendChild(addBtn);
  wrap.appendChild(heading);

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
  const wraps = document.querySelectorAll(`#${containerId} .option-row-wrap`);
  return Array.from(wraps).map(wrap => {
    const get = f => wrap.querySelector(`[data-field="${f}"]`)?.value?.trim() || '';
    const m = get('mana');
    return {
      name      : get('name'),
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
  { value: 'cast',       label: 'Cast'       },
  { value: 'range',      label: 'Range'      },
  { value: 'area size',  label: 'Area Size'  },
  { value: 'area shape', label: 'Area Shape' },
  { value: 'targets',    label: 'Targets'    },
  { value: 'duration',   label: 'Duration'   },
  { value: 'effect',     label: 'Effect'     },
  { value: 'damage',     label: 'Damage'     },
  { value: 'attack',     label: 'Attack'     },
  { value: 'save',       label: 'Save'       },
  { value: 'sustain',    label: 'Sustain'    },
  { value: 'dismiss',    label: 'Dismiss'    }
];

function buildHtRow(data) {
  data = data || {};
  const wrap = el('div', { class: 'option-row-wrap' });

  const header = el('div', { class: 'option-header' });
  const headerLabels = el('div', { class: 'option-labels' });
  SD_HT_LABELS.forEach(l =>
    headerLabels.appendChild(el('span', { class: 'option-label' }, l)));
  header.appendChild(headerLabels);
  const removeBtn = el('button', { class: 'effect-row-remove', type: 'button' }, '\u00D7');
  removeBtn.addEventListener('click', () => wrap.remove());
  header.appendChild(removeBtn);
  wrap.appendChild(header);

  const row = el('div', { class: 'option-fields' });

  const varIn = el('input', { class: 'form-input', type: 'text',
    placeholder: 'Option', 'data-field': 'name' });
  varIn.value = data.name || '';
  row.appendChild(varIn);

  const attrSel = buildAttributeSelect(data.attribute);
  row.appendChild(attrSel);

  const parsed = parseLegacyAction(data.actions);
  const { countIn, lengthSel } = buildCountLengthPair(parsed);
  row.appendChild(countIn);
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
  clampManaInput(manaIn);
  row.appendChild(manaIn);

  wrap.appendChild(row);
  wrap.appendChild(buildRowResultsSection(data.results));
  return wrap;
}

function buildHtSection(initialData) {
  const wrap = el('div', { class: 'form-field form-field-wide' });

  const heading = el('div', { class: 'options-heading' });
  heading.appendChild(el('span', {}, 'Heightened'));
  const addBtn = el('button', { class: 'options-add-btn', type: 'button' }, '+');
  heading.appendChild(addBtn);
  wrap.appendChild(heading);

  const container = el('div', { id: 'heightened-rows' });
  const rows = Array.isArray(initialData) ? initialData : [];
  if (rows.length) rows.forEach(r => container.appendChild(buildHtRow(r)));
  else container.appendChild(buildHtRow({}));
  wrap.appendChild(container);

  addBtn.addEventListener('click', () => container.appendChild(buildHtRow({})));
  return wrap;
}

function collectHeightenedRows() {
  const wraps = document.querySelectorAll('#heightened-rows .option-row-wrap');
  return Array.from(wraps).map(wrap => {
    const get = f => wrap.querySelector(`[data-field="${f}"]`)?.value?.trim() || '';
    const m = get('mana');
    return {
      name      : get('name'),
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

  const lblRow = el('div', { class: 'comp-editor-labels' });
  ['Component', 'Attribute', 'Count', 'Length', 'Type', 'Rarity', 'Price'].forEach(l =>
    lblRow.appendChild(el('span', { class: 'option-label' }, l)));
  const removeBtn = el('button', { class: 'effect-row-remove', type: 'button' }, '\u00D7');
  removeBtn.addEventListener('click', () => wrap.remove());
  lblRow.appendChild(removeBtn);
  wrap.appendChild(lblRow);

  const mainRow = el('div', { class: 'comp-editor-main' });

  const varIn = el('input', { class: 'form-input', type: 'text',
    placeholder: 'Option', 'data-field': 'name' });
  varIn.value = data.name || '';
  mainRow.appendChild(varIn);

  const attrSel = buildAttributeSelect(data.attribute);
  mainRow.appendChild(attrSel);

  const { countIn, lengthSel } = buildCountLengthPair(parsed);
  mainRow.appendChild(countIn);
  mainRow.appendChild(lengthSel);

  const typeIn = el('input', { class: 'form-input', type: 'text',
    placeholder: 'M V S F', 'data-field': 'component' });
  typeIn.value = data.component || '';
  mainRow.appendChild(typeIn);

  const raritySel = el('select', { class: 'form-input form-select', 'data-field': 'rarity' });
  raritySel.appendChild(el('option', { value: '' }, ''));
  OPTS.rarity.forEach(({ value, label }) => {
    const o = el('option', { value }, label);
    if ((data.rarity || '').toLowerCase() === value) o.selected = true;
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
  const heading = el('div', { class: 'options-heading' });
  heading.appendChild(el('span', {}, 'Components'));
  const addBtn = el('button', { class: 'options-add-btn', type: 'button' }, '+');
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
      name        : get('name'),
      attribute   : get('attribute'),
      actions     : collectAction(get('act-count'), get('act-length')),
      component   : get('component'),
      effect      : get('effect'),
      description : get('description'),
      rarity      : get('rarity'),
      price       : num('price')
    };
  }).filter(r => r.effect || r.description || r.name);
}

function dfNum(label, field, val, min) {
  const wrap = el('div', { class: 'form-field' });
  wrap.appendChild(el('label', {}, label));
  const inp = el('input', { type: 'number', class: 'form-input', 'data-field': field });
  if (min !== undefined && min !== null) inp.min = String(min);
  if (val !== undefined && val !== null && val !== '') inp.value = String(val);
  wrap.appendChild(inp);
  return wrap;
}

function dfSel(label, field, val, options) {
  const wrap = el('div', { class: 'form-field' });
  wrap.appendChild(el('label', {}, label));
  const sel = el('select', { class: 'form-input form-select', 'data-field': field });
  sel.appendChild(el('option', { value: '' }, ''));
  options.forEach(opt => {
    const v = typeof opt === 'object' ? opt.value : opt;
    const l = typeof opt === 'object' ? opt.label : opt;
    const o = el('option', { value: String(v) }, l);
    if (String(v) === String(val)) o.selected = true;
    sel.appendChild(o);
  });
  wrap.appendChild(sel);
  return wrap;
}

/* ============================================================
   EDITOR — EFFECT SECTION BUILDER
   ============================================================ */

function buildEffectRow(data) {
  data = data || {};
  const wrap = el('div', { class: 'effect-extra-row' });

  // Single row: Effect Name (80px) | Description (flex) | Notes (flex) | [×]
  const mainRow = el('div', { class: 'effect-row-main' });

  const nameIn = el('input', { class: 'form-input', type: 'text',
    placeholder: 'Effect Name', 'data-field': 'title' });
  nameIn.value = data.title || '';
  mainRow.appendChild(nameIn);

  const descTa = el('textarea', { class: 'form-input effect-desc', placeholder: 'Effect Description',
    'data-field': 'text' });
  descTa.value = data.text || data.effect || (typeof data === 'string' ? data : '') || '';
  mainRow.appendChild(descTa);

  const noteTa = el('textarea', { class: 'form-input effect-note-ta', placeholder: 'Effect Notes',
    'data-field': 'note' });
  noteTa.value = data.note || '';
  mainRow.appendChild(noteTa);

  const removeBtn = el('button', { class: 'effect-row-remove', type: 'button' }, '\u00D7');
  removeBtn.addEventListener('click', () => wrap.remove());
  mainRow.appendChild(removeBtn);

  wrap.appendChild(mainRow);

  const dmgRow = el('div', { class: 'form-row' });
  dmgRow.appendChild(dfNum('Damage Die Count', 'dmg-count', data.damage?.dieNumber, 0));
  dmgRow.appendChild(dfSel('Damage Die Size',  'dmg-size',  data.damage?.dieSize,   OPTS.dieSize));
  dmgRow.appendChild(dfNum('Damage Modifier',  'dmg-mod',   data.damage?.modifier,  null));
  dmgRow.appendChild(dfSel('Damage Type',      'dmg-type',  data.damage?.type,      OPTS.damageType));
  wrap.appendChild(dmgRow);

  const asRow = el('div', { class: 'form-row' });
  asRow.appendChild(dfSel('Attack Type',    'atk-type',  data.attack?.type,     OPTS.attackType));
  asRow.appendChild(dfNum('Attack Modifier','atk-mod',   data.attack?.modifier, null));
  asRow.appendChild(dfSel('Save Type',      'save-type', data.save?.type,       OPTS.saveType));
  asRow.appendChild(dfNum('Save Modifier',  'save-mod',  data.save?.modifier,   null));
  wrap.appendChild(asRow);

  return wrap;
}

function buildEffectSection(f) {
  const wrap = el('div', { class: 'form-field form-field-wide' });

  const heading = el('div', { class: 'options-heading' });
  heading.appendChild(el('span', {}, 'Effect'));
  const addBtn = el('button', { class: 'options-add-btn', type: 'button' }, '+');
  heading.appendChild(addBtn);
  wrap.appendChild(heading);

  const container = el('div', { id: 'effect-options-rows' });
  wrap.appendChild(container);

  // Migration: fold legacy foundation-level note/damage/attack/save into first option
  const initOpts = [];
  if (f.effect?.base) {
    initOpts.push({
      text:   f.effect.base,
      title:  '',
      note:   f.note   || '',
      damage: f.damage || {},
      attack: f.attack || {},
      save:   f.save   || {}
    });
  }
  (f.effect?.options || []).filter(Boolean).forEach(opt => initOpts.push(opt));
  if (!initOpts.length) initOpts.push({});
  initOpts.forEach(opt => container.appendChild(buildEffectRow(opt)));

  addBtn.addEventListener('click', () => container.appendChild(buildEffectRow({})));
  return wrap;
}

function collectEffectOptions() {
  const rows = document.querySelectorAll('#effect-options-rows .effect-extra-row');
  return Array.from(rows).map(row => {
    const get = field => row.querySelector(`[data-field="${field}"]`)?.value?.trim() || '';
    const num = field => { const x = get(field); return x !== '' ? parseFloat(x) : 0; };
    return {
      title  : get('title'),
      text   : get('text'),
      note   : get('note'),
      damage : { dieNumber: num('dmg-count'), dieSize: num('dmg-size'), modifier: num('dmg-mod'), type: get('dmg-type') },
      attack : { type: get('atk-type'),  modifier: num('atk-mod')  },
      save   : { type: get('save-type'), modifier: num('save-mod') }
    };
  }).filter(r => r.text || r.title);
}

const OPTS = {
  rarity     : [
    { value: 'abundant',        label: 'Abundant'       },
    { value: 'common',          label: 'Common'         },
    { value: 'uncommon',        label: 'Uncommon'       },
    { value: 'rare',            label: 'Rare'           },
    { value: 'very rare',       label: 'Very Rare'      },
    { value: 'extremely rare',  label: 'Extremely Rare' },
    { value: 'unique',          label: 'Unique'         }
  ],
  difficulty : [
    { value: 'routine',         label: 'Routine'        },
    { value: 'easy',            label: 'Easy'           },
    { value: 'average',         label: 'Average'        },
    { value: 'hard',            label: 'Hard'           },
    { value: 'very hard',       label: 'Very Hard'      },
    { value: 'extremely hard',  label: 'Extremely Hard' },
    { value: 'monumental',      label: 'Monumental'     }
  ],
  areaShape  : ['cone', 'cube', 'cylinder', 'line', 'sphere', 'wall'],
  areaType   : ['burst', 'emanation', 'cloud'],
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



function parseDuration(dur) {
  if (!dur) return { count: '', length: '', custom: '' };
  if (typeof dur === 'object' && dur !== null)
    return { count: dur.count || '', length: dur.length || '', custom: dur.custom || '' };
  const m = String(dur).match(/^(\d+)\s+(.+)$/);
  if (m) return { count: m[1], length: m[2], custom: '' };
  return { count: '', length: '', custom: String(dur) };
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
  form.appendChild(edGroupedCheckboxes('Traits',      'ed-traits',     f.traits,     state.traits.general,     'form-label-tag-traits'));
  form.appendChild(edGroupedCheckboxes('Traditions',  'ed-traditions', f.traditions, state.traits.traditions, 'form-label-tag-traditions'));
  form.appendChild(edGroupedCheckboxes('Access',      'ed-access',     f.access,     state.traits.access,     'form-label-tag-access'));

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
    edNum(  'Area Size (ft)','ed-area-size',   f.area?.size,         0, 5),
    edSelect('Area Shape',   'ed-area-shape',  f.area?.shape,  OPTS.areaShape),
    edSelect('Area Type',    'ed-area-type',   f.area?.type,   OPTS.areaType)
  ));
  form.appendChild(edRow(
    edNum(  'Targets Count', 'ed-targets-count', f.targets?.count, 0),
    edField('Targets Type',  'ed-targets-type',  f.targets?.type)
  ));

  // Duration
  form.appendChild(sec('Duration'));
  form.appendChild(edRow(
    edNum(   'Count',       'ed-dur-count',   dur.count,   0),
    edSelect('Length',      'ed-dur-length',  dur.length,  OPTS.durLength),
    edField( 'Custom Length','ed-dur-custom',  dur.custom)
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

  // ── Editor action buttons ──────────────────────────────────
  const btnRow = el('div', { class: 'editor-btn-row' });
  const fname  = f.name || 'this foundation';

  // Save
  const saveBtn = el('button', { class: 'btn btn-save-action', type: 'button' },
    `Save \u201c${fname}\u201d`);
  saveBtn.addEventListener('click', async () => {
    try {
      const updated = collectEditor();
      state.entries[state.currentIndex] = updated;
    } catch (e) { setStatus(e.message, 'error'); return; }
    const ok = await saveData();
    if (ok) {
      state.mode = 'view';
      renderList();
      showPanel('viewer', renderViewer(state.entries[state.currentIndex]));
      updateButtons();
    }
  });
  btnRow.appendChild(saveBtn);

  // Cancel
  const cancelBtn = el('button', { class: 'btn btn-cancel-action', type: 'button' }, 'Cancel');
  cancelBtn.addEventListener('click', () => {
    state.mode = 'view';
    renderList();
    if (state.currentIndex >= 0) {
      showPanel('viewer', renderViewer(state.entries[state.currentIndex]));
    } else {
      document.getElementById('empty-state').style.display = '';
      document.querySelectorAll('.panel').forEach(p => { p.style.display = 'none'; });
    }
    updateButtons();
  });
  btnRow.appendChild(cancelBtn);

  // Delete (existing entries only)
  if (state.currentIndex >= 0 && state.token) {
    const deleteBtn = el('button', { class: 'btn btn-danger', type: 'button' },
      `Delete \u201c${fname}\u201d`);
    deleteBtn.addEventListener('click', () => {
      const name = state.entries[state.currentIndex]?.name || 'this foundation';
      openDeleteModal(
        name,
        async () => {
          try {
            const updated = collectEditor();
            state.entries[state.currentIndex] = updated;
          } catch (e) { setStatus(e.message, 'error'); return; }
          const ok = await saveData();
          if (ok) {
            state.mode = 'view';
            renderList();
            showPanel('viewer', renderViewer(state.entries[state.currentIndex]));
            updateButtons();
          }
        },
        () => {},
        async () => {
          state.entries.splice(state.currentIndex, 1);
          state.currentIndex = -1;
          state.mode         = 'view';
          renderList();
          document.getElementById('empty-state').style.display = '';
          document.querySelectorAll('.panel').forEach(p => { p.style.display = 'none'; });
          updateButtons();
          await saveData();
        }
      );
    });
    btnRow.appendChild(deleteBtn);
  }

  form.appendChild(btnRow);
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
  const durCustom = v('ed-dur-custom');
  const rangeNum  = v('ed-range');

  return {
    name       : v('ed-name'),
    mana       : num('ed-mana'),
    rarity     : v('ed-rarity'),
    difficulty : v('ed-difficulty'),
    image      : v('ed-image-path'),
    note       : '',
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
    area    : { size: num('ed-area-size'), shape: v('ed-area-shape'), type: v('ed-area-type') },
    targets : { count: num('ed-targets-count'), type: v('ed-targets-type') },
    duration : durCustom || (durCount && durLength ? `${durCount} ${durLength}` : durLength),
    ...(()=>{ const _o=collectEffectOptions(); const _f=_o[0]||{}; return {
      effect : { options: _o },
      note   : '',
      damage : { dieNumber:_f.damage?.dieNumber||0, dieSize:_f.damage?.dieSize||0,
                 modifier:_f.damage?.modifier||0, type:_f.damage?.type||'' },
      attack : { type:_f.attack?.type||'', modifier:_f.attack?.modifier||0 },
      save   : { type:_f.save?.type||'',   modifier:_f.save?.modifier||0   }
    }; })(),
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
   NAVIGATION
   ============================================================ */

function selectItem(idx) {
  state.currentIndex = idx;
  state.mode         = 'view';
  renderList();
  showPanel('viewer', renderViewer(state.entries[idx]));
  updateButtons();
}

/* ============================================================
   BUTTONS
   ============================================================ */

function updateButtons() {
  const t  = !!state.token;
  const s  = state.currentIndex >= 0;
  const ev = state.mode === 'view';
  const ed = state.mode === 'edit';
  const tr = state.mode === 'traits';

  document.getElementById('btn-new').style.display           = (t && !tr)             ? '' : 'none';
  document.getElementById('btn-edit').style.display          = (t && s && ev && !tr)  ? '' : 'none';
  document.getElementById('btn-traits').style.display        = (t && !tr)             ? '' : 'none';
  document.getElementById('btn-cancel-traits').style.display = tr                     ? '' : 'none';
  document.getElementById('btn-save-traits').style.display   = (t && tr)              ? '' : 'none';
}

/* ============================================================
   INIT & EVENTS  (Foundation-specific)
   Shared listeners (search, sidebar, token modal) are in shared.js.
   ============================================================ */

/* Called by shared.js token modal after token is saved or cleared */
function onTokenChange() {
  loadData();
  loadTraitsData();
}

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     Wire up Foundation buttons immediately -- before any
     async work -- so a failed fetch can never block buttons.
     ---------------------------------------------------------- */

  // New Foundation
  document.getElementById('btn-new').addEventListener('click', () => {
    const f = { name: 'New Foundation', mana: 0 };
    state.entries.push(f);
    state.currentIndex = state.entries.length - 1;
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
    showPanel('editor', buildEditor(state.entries[state.currentIndex]));
    updateButtons();
  });

  /* ----------------------------------------------------------
     Load data -- errors here no longer affect buttons.
     ---------------------------------------------------------- */
  loadData();
  loadTraitsData();

});
