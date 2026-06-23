'use strict';

CONFIG.file = null;
state.entries = [];
state.sha     = null;

// Override shared.js renderList -- sidebar is static categories, not dynamic entries
function renderList() {}
function selectItem(idx) {}

function onTokenChange() { loadTraitsData(); }

function updateButtons() {
  const t  = !!state.token;
  const tr = state.mode === 'traits';
  document.getElementById('btn-traits').style.display        = (t && !tr) ? '' : 'none';
  document.getElementById('btn-cancel-traits').style.display = tr         ? '' : 'none';
  document.getElementById('btn-save-traits').style.display   = (t && tr)  ? '' : 'none';
}

function showCategory(id) {
  document.querySelectorAll('.mat-section').forEach(s => { s.style.display = 'none'; });
  const sec = document.getElementById('mat-' + id);
  if (sec) sec.style.display = '';
  document.querySelectorAll('#item-list .list-item').forEach(item => {
    item.classList.toggle('list-item-active', item.dataset.target === id);
  });
  document.getElementById('search').value = '';
  filterMaterials('');
}

function filterMaterials(q) {
  q = q.toLowerCase().trim();
  const visible = document.querySelector('.mat-section:not([style*="display: none"])');
  if (!visible) return;
  visible.querySelectorAll('table tbody tr').forEach(row => {
    row.style.display = (q && !row.textContent.toLowerCase().includes(q)) ? 'none' : '';
  });
  visible.querySelectorAll('.spell-entry').forEach(entry => {
    entry.style.display = (q && !entry.textContent.toLowerCase().includes(q)) ? 'none' : '';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#item-list .list-item').forEach(item => {
    item.addEventListener('click', () => showCategory(item.dataset.target));
  });
  document.getElementById('search').addEventListener('input', e => {
    filterMaterials(e.target.value);
  });
  loadTraitsData();
  updateButtons();
});
