'use strict';

CONFIG.file = 'data/rules.json';
state.entries = [];
state.sha     = null;

async function loadData() {
  state.entries = [];
  try {
    const result = await ghReadFile(CONFIG.file);
    if (result) {
      state.sha     = result.sha;
      state.entries = result.data.rules || [];
      setStatus(`Loaded (${state.entries.length})`, 'ok');
    }
  } catch (err) { /* no data file yet */ }
  renderList();
  updateButtons();
}

async function saveData() {
  if (!state.token) { setStatus('No token set', 'error'); return false; }
  setStatus('Saving\u2026', 'load');
  try { return await attemptSave(false); }
  catch (err) { setStatus(`Save error: ${err.message}`, 'error'); return false; }
}

async function attemptSave(isRetry) {
  const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
  try {
    const newSha = await ghWriteFile(
      CONFIG.file, state.sha,
      { rules: state.entries },
      `Update Rules [${ts}]`
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

function onTokenChange() { loadData(); }

function selectItem(idx) {
  state.currentIndex = idx;
  renderList();
}

function updateButtons() {
  const t  = !!state.token;
  const s  = state.currentIndex >= 0;
  const ev = state.mode === 'view';
  const tr = state.mode === 'traits';
  document.getElementById('btn-new').style.display           = (t && !tr)             ? '' : 'none';
  document.getElementById('btn-edit').style.display          = (t && s && ev && !tr)   ? '' : 'none';
  document.getElementById('btn-cancel').style.display        = state.mode === 'edit'   ? '' : 'none';
  document.getElementById('btn-save-gh').style.display       = (t && !tr)             ? '' : 'none';
  document.getElementById('btn-traits').style.display        = (t && !tr)             ? '' : 'none';
  document.getElementById('btn-cancel-traits').style.display = tr                      ? '' : 'none';
  document.getElementById('btn-save-traits').style.display   = (t && tr)              ? '' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  loadTraitsData();
});
