import { useEffect, useState } from 'react';
import { getToken, setToken as persistToken, ghReadFile, saveWithConflictRetry } from './lib/github';
import type { MaterialEntry, MaterialsData, SpellEntry, MaterialCategory } from './types/materials';
import { MATERIAL_COLUMNS, SPELL_COLUMNS } from './lib/columns';
import { blankMaterialEntry, blankSpellEntry } from './lib/blankEntry';
import { CATEGORIES, type Category } from './lib/categories';
import { MaterialsTable } from './components/MaterialsTable';
import { CategoryNav } from './components/CategoryNav';
import { TokenModal } from './components/TokenModal';
import './App.css';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; data: MaterialsData; sha: string | null };

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function App() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  // Data as of the last successful load/save -- what row-level Cancel reverts to.
  const [snapshot, setSnapshot] = useState<MaterialsData | null>(null);
  const [category, setCategory] = useState<Category>('gems');
  const [token, setTokenState] = useState(() => getToken());
  const [modalOpen, setModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  useEffect(() => {
    setState({ status: 'loading' });
    ghReadFile<MaterialsData>('data/materials.json')
      .then((result) => {
        if (!result) {
          setState({ status: 'error', message: 'data/materials.json not found' });
          return;
        }
        setState({ status: 'loaded', data: result.data, sha: result.sha });
        setSnapshot(result.data);
      })
      .catch((err: unknown) => {
        setState({ status: 'error', message: err instanceof Error ? err.message : String(err) });
      });
  }, [token]);

  function handleSaveToken(newToken: string) {
    persistToken(newToken);
    setTokenState(newToken);
    setModalOpen(false);
  }

  function handleClearToken() {
    persistToken('');
    setTokenState('');
    setModalOpen(false);
  }

  async function handleSave() {
    if (state.status !== 'loaded' || !token) return;
    setSaveStatus('saving');
    try {
      const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const result = await saveWithConflictRetry(
        'data/materials.json',
        state.sha,
        state.data,
        `Update Materials [${ts}]`,
      );
      setState({ status: 'loaded', data: state.data, sha: result.sha });
      setSnapshot(state.data);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }

  /** Deletes a row and immediately commits, matching the vanilla editor's auto-save-on-delete. */
  async function handleConfirmDelete(index: number) {
    if (state.status !== 'loaded' || !token) return;
    const newData: MaterialsData =
      category === 'spells'
        ? { ...state.data, spells: state.data.spells.filter((_, i) => i !== index) }
        : { ...state.data, [category]: state.data[category].filter((_, i) => i !== index) };
    setState({ status: 'loaded', data: newData, sha: state.sha });
    setSaveStatus('saving');
    try {
      const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const result = await saveWithConflictRetry(
        'data/materials.json',
        state.sha,
        newData,
        `Delete entry from Materials [${ts}]`,
      );
      setState({ status: 'loaded', data: newData, sha: result.sha });
      setSnapshot(newData);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }

  /** Reverts one row's edits to the last-saved snapshot; removes it if it was never saved. */
  function handleCancelRow(index: number) {
    if (state.status !== 'loaded' || !snapshot) return;
    if (category === 'spells') {
      const original = snapshot.spells[index];
      if (!original) {
        updateSpells((arr) => arr.filter((_, i) => i !== index));
      } else {
        updateSpells((arr) => arr.map((e, i) => (i === index ? original : e)));
      }
    } else {
      const original = snapshot[category][index];
      if (!original) {
        updateMaterialCategory(category, (arr) => arr.filter((_, i) => i !== index));
      } else {
        updateMaterialCategory(category, (arr) => arr.map((e, i) => (i === index ? original : e)));
      }
    }
  }

  function updateMaterialCategory(
    cat: MaterialCategory,
    updater: (arr: MaterialEntry[]) => MaterialEntry[],
  ) {
    if (state.status !== 'loaded') return;
    setState({ ...state, data: { ...state.data, [cat]: updater(state.data[cat]) } });
  }

  function updateSpells(updater: (arr: SpellEntry[]) => SpellEntry[]) {
    if (state.status !== 'loaded') return;
    setState({ ...state, data: { ...state.data, spells: updater(state.data.spells) } });
  }

  function handleAddEntry() {
    if (category === 'spells') {
      updateSpells((arr) => [...arr, blankSpellEntry()]);
    } else {
      updateMaterialCategory(category, (arr) => [...arr, blankMaterialEntry()]);
    }
  }

  const editable = Boolean(token);
  const categoryLabel = CATEGORIES.find((c) => c.key === category)?.label ?? '';

  return (
    <div id="app">
      <header id="topbar">
        <div id="topbar-left">
          <a id="app-title" href="index.html">
            SKILLd20
          </a>
          <span id="app-subtitle">Material Components</span>
        </div>
        <div id="topbar-right">
          <span id="status-text">
            {state.status === 'loading' && 'Loading…'}
            {state.status === 'error' && state.message}
            {state.status === 'loaded' && saveStatus === 'saving' && 'Saving…'}
            {state.status === 'loaded' && saveStatus === 'saved' && 'Saved to GitHub ✓'}
            {state.status === 'loaded' && saveStatus === 'error' && 'Save error'}
            {state.status === 'loaded' && saveStatus === 'idle' && 'Loaded'}
          </span>
          <button
            id="btn-token"
            className="btn btn-icon"
            title="GitHub Token"
            onClick={() => setModalOpen(true)}
          >
            ⚙
          </button>
        </div>
      </header>

      <nav id="nav-rail">
        <a href="foundations.html" className="nav-rail-item">
          <span className="nav-rail-sym">◆</span>
          <span className="nav-rail-label">Foundations</span>
        </a>
        <a href="feats.html" className="nav-rail-item">
          <span className="nav-rail-sym">★</span>
          <span className="nav-rail-label">Feats</span>
        </a>
        <a href="skills.html" className="nav-rail-item">
          <span className="nav-rail-sym">◎</span>
          <span className="nav-rail-label">Skills</span>
        </a>
        <a href="materials.html" className="nav-rail-item nav-link-active">
          <span className="nav-rail-sym">✦</span>
          <span className="nav-rail-label">Materials</span>
        </a>
        <a href="rituals.html" className="nav-rail-item">
          <span className="nav-rail-sym">⊕</span>
          <span className="nav-rail-label">Rituals</span>
        </a>
        <a href="crafting.html" className="nav-rail-item">
          <span className="nav-rail-sym">⚒</span>
          <span className="nav-rail-label">Crafting</span>
        </a>
        <a href="rules.html" className="nav-rail-item">
          <span className="nav-rail-sym">≡</span>
          <span className="nav-rail-label">Rules</span>
        </a>
      </nav>

      <div id="main">
        <aside id="sidebar">
          <CategoryNav active={category} onSelect={setCategory} />
        </aside>

        <main id="content">
          {state.status === 'loading' && <div id="empty-state">Loading materials…</div>}
          {state.status === 'error' && <div id="empty-state">{state.message}</div>}
          {state.status === 'loaded' && (
            <>
              <div className="mat-category-title">
                <span>{categoryLabel}</span>
              </div>
              {category === 'spells' ? (
                <MaterialsTable
                  key={category}
                  columns={SPELL_COLUMNS}
                  rows={state.data.spells}
                  editable={editable}
                  onCellCommit={(index, patch) =>
                    updateSpells((arr) => arr.map((e, i) => (i === index ? { ...e, ...patch } : e)))
                  }
                  onSave={handleSave}
                  onCancelRow={handleCancelRow}
                  onConfirmDelete={handleConfirmDelete}
                  onAddEntry={handleAddEntry}
                />
              ) : (
                <MaterialsTable
                  key={category}
                  columns={MATERIAL_COLUMNS}
                  rows={state.data[category]}
                  editable={editable}
                  onCellCommit={(index, patch) =>
                    updateMaterialCategory(category, (arr) =>
                      arr.map((e, i) => (i === index ? { ...e, ...patch } : e)),
                    )
                  }
                  onSave={handleSave}
                  onCancelRow={handleCancelRow}
                  onConfirmDelete={handleConfirmDelete}
                  onAddEntry={handleAddEntry}
                />
              )}
            </>
          )}
        </main>
      </div>

      <TokenModal
        open={modalOpen}
        onSave={handleSaveToken}
        onClear={handleClearToken}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}

export default App;
