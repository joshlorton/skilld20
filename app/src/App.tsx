import { useEffect, useState } from 'react';
import { getToken, setToken as persistToken, ghReadFile, saveWithConflictRetry } from './lib/github';
import type { MaterialEntry, MaterialsData, SpellEntry, MaterialCategory } from './types/materials';
import { SPELL_COLUMNS } from './lib/columns';
import { blankMaterialEntry, blankSpellEntry } from './lib/blankEntry';
import { CATEGORIES, type Category } from './lib/categories';
import { MaterialsList } from './components/MaterialsList';
import { MaterialDetail } from './components/MaterialDetail';
import { SpellsTable } from './components/SpellsTable';
import { CategoryNav } from './components/CategoryNav';
import { TokenModal } from './components/TokenModal';
import { IconWand, IconIngot, IconBolt, IconBrain, IconHourglass, IconHammer, IconBook } from './components/navIcons';
import './App.css';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; data: MaterialsData; sha: string | null };

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type DetailView = 'list' | 'detail';
type DetailMode = 'view' | 'edit';

function App() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  // Data as of the last successful load/save -- what row-level Cancel reverts to.
  const [snapshot, setSnapshot] = useState<MaterialsData | null>(null);
  const [category, setCategory] = useState<Category>('gems');
  const [token, setTokenState] = useState(() => getToken());
  const [modalOpen, setModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Materials-only list/detail view state.
  const [view, setView] = useState<DetailView>('list');
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [detailMode, setDetailMode] = useState<DetailMode>('view');

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

  function handleSelectCategory(cat: Category) {
    setCategory(cat);
    setView('list');
    setDetailIndex(null);
  }

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
      return;
    }
    if (state.status !== 'loaded') return;
    const newIndex = state.data[category].length;
    updateMaterialCategory(category, (arr) => [...arr, blankMaterialEntry()]);
    setDetailIndex(newIndex);
    setDetailMode('edit');
    setView('detail');
  }

  function handleOpenDetail(index: number) {
    setDetailIndex(index);
    setDetailMode('view');
    setView('detail');
  }

  function handleBackToList() {
    setView('list');
    setDetailIndex(null);
  }

  function handleEditDetail() {
    setDetailMode('edit');
  }

  function handleCancelDetail() {
    if (detailIndex !== null) handleCancelRow(detailIndex);
    handleBackToList();
  }

  async function handleDeleteDetail() {
    if (detailIndex === null) return;
    await handleConfirmDelete(detailIndex);
    handleBackToList();
  }

  /** Save from the detail page: merges the draft entry in, then persists exactly like handleConfirmDelete. */
  async function handleSaveDetail(draft: MaterialEntry) {
    if (state.status !== 'loaded' || !token || detailIndex === null || category === 'spells') return;
    const newData: MaterialsData = {
      ...state.data,
      [category]: state.data[category].map((e, i) => (i === detailIndex ? draft : e)),
    };
    setState({ status: 'loaded', data: newData, sha: state.sha });
    setSaveStatus('saving');
    try {
      const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const result = await saveWithConflictRetry(
        'data/materials.json',
        state.sha,
        newData,
        `Update Materials [${ts}]`,
      );
      setState({ status: 'loaded', data: newData, sha: result.sha });
      setSnapshot(newData);
      setSaveStatus('saved');
      handleBackToList();
    } catch {
      setSaveStatus('error');
    }
  }

  const editable = Boolean(token);
  const categoryLabel = CATEGORIES.find((c) => c.key === category)?.label ?? '';
  const showCategoryTitle = !(category !== 'spells' && view === 'detail');

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
          <span className="nav-rail-sym"><IconWand /></span>
          <span className="nav-rail-label">Foundations</span>
        </a>
        <a href="feats.html" className="nav-rail-item">
          <span className="nav-rail-sym"><IconBolt /></span>
          <span className="nav-rail-label">Feats</span>
        </a>
        <a href="skills.html" className="nav-rail-item">
          <span className="nav-rail-sym"><IconBrain /></span>
          <span className="nav-rail-label">Skills</span>
        </a>
        <a href="materials.html" className="nav-rail-item nav-link-active">
          <span className="nav-rail-sym"><IconIngot /></span>
          <span className="nav-rail-label">Materials</span>
        </a>
        <a href="rituals.html" className="nav-rail-item">
          <span className="nav-rail-sym"><IconHourglass /></span>
          <span className="nav-rail-label">Rituals</span>
        </a>
        <a href="crafting.html" className="nav-rail-item">
          <span className="nav-rail-sym"><IconHammer /></span>
          <span className="nav-rail-label">Crafting</span>
        </a>
        <a href="rules.html" className="nav-rail-item">
          <span className="nav-rail-sym"><IconBook /></span>
          <span className="nav-rail-label">Rules</span>
        </a>
      </nav>

      <div id="main">
        <aside id="sidebar">
          <CategoryNav active={category} onSelect={handleSelectCategory} />
        </aside>

        <main id="content">
          {state.status === 'loading' && <div id="empty-state">Loading materials…</div>}
          {state.status === 'error' && <div id="empty-state">{state.message}</div>}
          {state.status === 'loaded' && (
            <>
              {showCategoryTitle && (
                <div className="mat-category-title">
                  <span>{categoryLabel}</span>
                </div>
              )}
              {category === 'spells' ? (
                <SpellsTable
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
              ) : view === 'detail' && detailIndex !== null ? (
                <MaterialDetail
                  entry={state.data[category][detailIndex]}
                  mode={detailMode}
                  onEdit={handleEditDetail}
                  onSave={handleSaveDetail}
                  onCancel={handleCancelDetail}
                  onDelete={handleDeleteDetail}
                  onBack={handleBackToList}
                />
              ) : (
                <MaterialsList
                  key={category}
                  rows={state.data[category]}
                  editable={editable}
                  onRowDoubleClick={handleOpenDetail}
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
