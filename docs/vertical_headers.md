# Vertical Section Headers -- Proposed Solution

## Current Structure

Each section is a single-column div with a horizontal heading bar followed by content:

```
div.section-effect
  div.result-heading "Effect"        ← full-width horizontal bar
  p.effect-entry                     ← content
  p.effect-entry

div.section-results
  div.result-heading "Skill Check"   ← full-width horizontal bar
  div.result-row (CS / S / F / CF)
  div.result-heading "Attack -- ranged"
  div.result-row (CS / S / F / CF)

div.section-action (Sustain)
  div.result-heading "Sustain"       ← full-width horizontal bar
  div.sd-view-row
  div.sd-view-row

div.section-action (Heightened)
  div.section-heading "Heightened"   ← full-width gold bar
  div.ht-view-row
```

---

## Proposed Structure

Each section becomes a two-child flex row:

```
div.section-effect  (display: flex; flex-direction: row)
  div.section-label  "EFFECT"        ← vertical label column (~22px wide)
  div.section-content                ← all current content (flex: 1)
    p.effect-entry
    p.effect-entry

div.section-results  (display: flex; flex-direction: row)
  div.section-label  "SKILL"         ← vertical label column
  div.section-content
    div.result-heading "Skill Check" ← sub-headings remain horizontal
    div.result-row (CS / S / F / CF)
    div.result-heading "Attack -- ranged"
    div.result-row (CS / S / F / CF)
```

The top-level horizontal heading bar is removed. The vertical label replaces it.
Sub-section headings (Critical Success, Success, etc.) remain as horizontal bars
inside `.section-content`.

---

## CSS Changes

### Section wrapper

```css
.section-effect,
.section-results,
.section-action,
.section-variants {
  display: flex;
  flex-direction: row;
  margin-bottom: 3px;
}
```

### Vertical label column

```css
.section-label {
  writing-mode: vertical-lr;
  transform: rotate(180deg);          /* renders text bottom-to-top */
  font-family: var(--font-ui);
  font-variant: small-caps;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 8px 4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--border);
}
```

### Style variants matching current heading types

Two heading styles are currently in use. The user confirmed "keep currently used
header text and background styles." These apply directly to `.section-label`:

```css
/* Sections currently using result-heading (dark bar, gold text):
   Effect, Sustain, Dismiss */
.section-label--result {
  background: #1a1a1a;
  color: var(--heading-fg);
  min-width: 22px;
}

/* Sections currently using section-heading (gold bar, dark text):
   Heightened, Components */
.section-label--heading {
  background: var(--heading-fg);
  color: var(--heading-bg);
  min-width: 22px;
}

/* Variants uses section-heading-major (same colors, larger) */
.section-label--major {
  background: var(--heading-fg);
  color: var(--heading-bg);
  font-size: 13px;
  min-width: 24px;
}
```

### Content column

```css
.section-content {
  flex: 1;
  overflow: hidden;    /* prevents horizontal bleed */
}
```

No changes to any child classes (`.result-heading`, `.sd-view-row`, `.ht-view-row`,
`.comp-view-row`, etc.). They fill the `.section-content` column naturally.

---

## JS Changes

Five render functions need updating. The pattern is identical in each:

**Before (current pattern):**
```javascript
const section = el('div', { class: 'section-effect' });
section.appendChild(el('div', { class: 'result-heading' }, 'Effect'));
// ... content appended directly to section
return section;
```

**After (new pattern):**
```javascript
const section = el('div', { class: 'section-effect' });
section.appendChild(el('div', { class: 'section-label section-label--result' }, 'Effect'));
const content = el('div', { class: 'section-content' });
// ... content appended to content instead of section
section.appendChild(content);
return section;
```

### Functions requiring change

| Function | Label text | Label style class |
|----------|-----------|-------------------|
| `renderEffect` | "Effect" | `section-label--result` |
| `renderResults` | TBD (see Open Questions) | `section-label--result` |
| `renderSustainDismiss` (×2) | "Sustain" / "Dismiss" | `section-label--result` |
| `renderActionSection` | title parameter (Heightened / Components) | `section-label--heading` |
| `renderVariants` | "Variants" | `section-label--major` |

`renderActionSection` already takes a `title` parameter -- the label text is already
available without any logic change.

---

## Open Questions

### 1. Results section label text

`section-results` can contain up to three sub-blocks: Skill Check, Attack, and Save.
The vertical label spans the full height of all three. Options:

| Option | Text | Notes |
|--------|------|-------|
| A | "Results" | Accurate but generic |
| B | "Skill" | Matches screenshot; loses Attack/Save identity |
| C | "Outcomes" | Neutral; doesn't favor one block |

The screenshot shows "Skill" -- if the intent is to keep parity with the screenshot,
Option B. If the label should represent the full section content, Option A or C.

### 2. Unified label style vs preserved dual styles

The two existing header styles (dark/gold vs gold/dark) are visually distinct and
create an inconsistency in the label column when different sections appear
side by side as you scroll. Options:

| Option | Behavior |
|--------|----------|
| A | Preserve existing styles as-is (dark for Effect/Sustain/Dismiss, gold for Heightened/Components/Variants) |
| B | Unify all labels to `section-label--result` style (dark bg, gold text) for visual consistency |
| C | Unify all labels to `section-label--heading` style (gold bg, dark text) for visual consistency |

Option B or C produces a consistent left edge. Option A preserves current semantic color coding.

---

## What Does Not Change

- All grid layouts (`sd-view-row`, `ht-view-row`, `comp-view-row`) -- unchanged, they fill `section-content` naturally
- All existing CSS classes -- no renames or removals
- All data / JSON schema -- purely a rendering change
- `foundation-card` font and base styles -- unchanged
- The horizontal sub-section bars (`result-heading` for CS/S/F/CF, `result-heading` for Skill Check heading) -- remain inside `section-content`
