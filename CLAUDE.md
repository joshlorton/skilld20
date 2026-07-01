# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SKILLd20 is a static site (GitHub Pages, served from `main` root, no build step) that doubles as a
browser-based CMS for a tabletop RPG's rules data. There is no bundler, package manager, or test suite —
just hand-written HTML/CSS/JS and hand-maintained JSON data files.

## Running / deploying

- No build step. Open any `.html` file directly or serve the repo root with any static file server.
- GitHub Pages deploys straight from `main` root on push — there is no CI step to trigger.
- `main` is the only branch in use. Don't create long-lived side branches for this project.
- `index.html` is a static landing page (no JS, no GitHub read/write) with a hero blurb and nav cards
  linking to each section. It intentionally does **not** include `scripts/shared.js` — that script's
  `DOMContentLoaded` handler assumes the full CMS chrome exists (`#search`, `#sidebar-handle`, token-modal
  buttons, traits buttons) and throws if any of those elements are missing. If the landing page ever needs
  interactivity, either add the missing chrome elements first or give it its own small script.

## Architecture: pages are data-driven CMS panels, not just static views

Each top-nav section (other than the `index.html` landing page) is one HTML page + one CSS file + one JS
file, all editing one JSON file in `data/`:

| Page | JS | CSS | Data file | Status |
|---|---|---|---|---|
| `foundations.html` | `scripts/foundations.js` | `css/foundations.css` | `data/foundations.json` | fully built |
| `materials.html` | `scripts/materials.js` | `css/materials.css` | `data/materials.json` | fully built |
| `feats.html`, `skills.html`, `rituals.html`, `rules.html`, `crafting.html` | matching `scripts/*.js` | matching `css/*.css` | `data/*.json` (don't yet exist) | stub only (~75-line boilerplate, loads gracefully to empty state) |

`css/foundations_legacy.css` is dead code left over from a prior version of `foundations.css` — don't
treat it as a reference when editing foundations styling.

### shared.js / shared.css

`scripts/shared.js` holds everything section-agnostic: DOM helpers (`el()`), the GitHub read/write layer,
status-bar messaging, action-length constants, and trait-group loading. Section scripts (`materials.js`,
`foundations.js`, etc.) define their own `CONFIG.file`, `state.entries`, `loadData()`/`saveData()`, and
rendering, then call the shared GitHub helpers. `css/shared.css` holds the app chrome (topbar, nav rail,
sidebar, modal, buttons); page-specific CSS files hold only that section's content/panel styling.

### Data edits go straight to GitHub, from the browser, with no server

This is the core mechanic to understand before touching any editing flow:

- Users enter a GitHub Personal Access Token (repo scope) via the token modal; it's stored in
  `localStorage` only, never committed.
- **Without a token**: pages fetch data files as plain static JSON (`./data/*.json`) — read-only viewer mode.
- **With a token**: pages call `ghReadFile()`/`ghWriteFile()` in `shared.js`, which hit the GitHub Contents
  API (`api.github.com/repos/joshlorton/skilld20/contents/<path>`) directly. Saving is a real commit to
  `main` — there is no draft/staging state, no PR step.
- `ghWriteFile()` surfaces 409 responses as a typed conflict; callers (see `attemptSave()` in each section
  script) re-fetch the current SHA and retry once before giving up.
- Because saves are live commits, be careful with any change to `attemptSave`/`ghWriteFile` call sites —
  a bug there writes bad data straight to the deployed JSON.

### `data/materials.json` and `data/foundations.json`

These are large (materials.json ~380KB, foundations.json ~90KB), hand-structured JSON keyed by category
(e.g. materials: `gems`, `herbs`, `metals`, `treatments`, `woods`, `enchanted`, `spells`). `data/trait-groups.json`
holds shared trait taxonomy (`general`/`traditions`/`access`) used across sections via `loadTraitsData()`
in `shared.js`.

### docs/materials research corpus

`docs/materials/*` (metals, minerals, plants, woods, creatures, plus a few standalone `.md` files) is
reference/lore material for in-game use — a research corpus, not a pipeline input. There is currently no
automated transcription from these docs into `data/materials.json`; edits to the JSON are made directly
through the app's editor UI (or by hand), not generated from these files.

## Known direction / debt

- A React rewrite is being considered for materials/foundations (filters, sorting, editing) to replace the
  current vanilla DOM-manipulation approach in `foundations.js`/`materials.js`. Don't invest in optimizing
  or restructuring the current vanilla JS/JSON shape unless asked — it may be superseded.
- No minification/bundling exists; given the likely rewrite, this is deliberately deprioritized rather than
  an oversight.
