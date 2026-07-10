import { useEffect, useState } from 'react';
import { getToken, setToken as persistToken, ghReadFile, saveWithConflictRetry } from './lib/github';
import type { SpellEntry } from './types/materials';
import type { TraitGroupsData } from './types/traits';
import type { EntrySectionConfig } from './lib/entryConfig';
import { SPELL_COLUMNS } from './lib/columns';
import { blankSpellEntry } from './lib/blankEntry';
import { deriveRitualCategories } from './lib/ritualsCategories';
import { EntryList } from './components/EntryList';
import { EntryDetail } from './components/EntryDetail';
import { SpellsTable } from './components/SpellsTable';
import { CategoryNav } from './components/CategoryNav';
import { TokenModal } from './components/TokenModal';
import { IconWand, IconIngot, IconBolt, IconBrain, IconHourglass, IconHammer, IconBook } from './components/navIcons';
import './App.css';

export type SectionName = 'materials' | 'rituals' | 'crafting';

interface AppProps<T> {
  section: SectionName;
  subtitle: string;
  dataFile: string;
  entryConfig: EntrySectionConfig<T>;
  /** Static category list; omit when categories are derived at runtime (Rituals). */
  categories?: { key: string; label: string }[];
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; data: Record<string, unknown>; sha: string | null };

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type DetailView = 'list' | 'detail';
type DetailMode = 'view' | 'edit';

const NAV_ITEMS: { href: string; section: SectionName | null; icon: React.ReactNode; label: string }[] = [
  { href: 'foundations.html', section: null, icon: <IconWand />, label: 'Foundations' },
  { href: 'feats.html', section: null, icon: <IconBolt />, label: 'Feats' },
  { href: 'skills.html', section: null, icon: <IconBrain />, label: 'Skills' },
  { href: 'materials.html', section: 'materials', icon: <IconIngot />, label: 'Materials' },
  { href: 'rituals.html', section: 'rituals', icon: <IconHourglass />, label: 'Rituals' },
  { href: 'crafting.html', section: 'crafting', icon: <IconHammer />, label: 'Crafting' },
  { href: 'rules.html', section: null, icon: <IconBook />, label: 'Rules' },
];

function App<T>({ section, subtitle, dataFile, entryConfig, categories: staticCategories }: AppProps<T>) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  // Data as of the last successful load/save -- what row-level Cancel reverts to.
  const [snapshot, setSnapshot] = useState<Record<string, unknown> | null>(null);
  const [ritualCategories, setRitualCategories] = useState<{ key: string; label: string }[]>([]);
  const categories = section === 'rituals' ? ritualCategories : (staticCategories ?? []);
  const [category, setCategory] = useState<string>('');
  const [token, setTokenState] = useState(() => getToken());
  const [modalOpen, setModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // List/detail view state (not used by the Spells table path).
  const [view, setView] = useState<DetailView>('list');
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [detailMode, setDetailMode] = useState<DetailMode>('view');

  useEffect(() => {
    if (!category && categories.length > 0) setCategory(categories[0].key);
  }, [categories, category]);

  useEffect(() => {
    setState({ status: 'loading' });
    ghReadFile<Record<string, unknown>>(dataFile)
      .then((result) => {
        if (!result) {
          setState({ status: 'error', message: `${dataFile} not found` });
          return;
        }
        setState({ status: 'loaded', data: result.data, sha: result.sha });
        setSnapshot(result.data);
      })
      .catch((err: unknown) => {
        setState({ status: 'error', message: err instanceof Error ? err.message : String(err) });
      });
  }, [token, dataFile]);

  // Rituals' category list is derived from trait-groups.json rather than hardcoded.
  useEffect(() => {
    if (section !== 'rituals') return;
    fetch('./data/trait-groups.json')
      .then((r) => r.json())
      .then((tg: TraitGroupsData) => setRitualCategories(deriveRitualCategories(tg)))
      .catch(() => setRitualCategories([]));
  }, [section]);

  const isSpellsCategory = section === 'materials' && category === 'spells';

  function handleSelectCategory(cat: string) {
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

  function categoryEntries(cat: string): T[] {
    if (state.status !== 'loaded') return [];
    return (state.data[cat] as T[] | undefined) ?? [];
  }

  function spellsEntries(): SpellEntry[] {
    if (state.status !== 'loaded') return [];
    return (state.data.spells as SpellEntry[] | undefined) ?? [];
  }

  function updateCategory(cat: string, updater: (arr: T[]) => T[]) {
    if (state.status !== 'loaded') return;
    setState({ ...state, data: { ...state.data, [cat]: updater(categoryEntries(cat)) } });
  }

  function updateSpells(updater: (arr: SpellEntry[]) => SpellEntry[]) {
    if (state.status !== 'loaded') return;
    setState({ ...state, data: { ...state.data, spells: updater(spellsEntries()) } });
  }

  async function handleSave() {
    if (state.status !== 'loaded' || !token) return;
    setSaveStatus('saving');
    try {
      const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const result = await saveWithConflictRetry(dataFile, state.sha, state.data, `Update ${subtitle} [${ts}]`);
      setState({ status: 'loaded', data: state.data, sha: result.sha });
      setSnapshot(state.data);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }

  /** Deletes an entry and immediately commits, matching the vanilla editor's auto-save-on-delete. */
  async function handleConfirmDelete(index: number) {
    if (state.status !== 'loaded' || !token) return;
    const newData = isSpellsCategory
      ? { ...state.data, spells: spellsEntries().filter((_, i) => i !== index) }
      : { ...state.data, [category]: categoryEntries(category).filter((_, i) => i !== index) };
    setState({ status: 'loaded', data: newData, sha: state.sha });
    setSaveStatus('saving');
    try {
      const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const result = await saveWithConflictRetry(
        dataFile,
        state.sha,
        newData,
        `Delete entry from ${subtitle} [${ts}]`,
      );
      setState({ status: 'loaded', data: newData, sha: result.sha });
      setSnapshot(newData);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }

  /** Reverts one entry's edits to the last-saved snapshot; removes it if it was never saved. */
  function handleCancelRow(index: number) {
    if (state.status !== 'loaded' || !snapshot) return;
    if (isSpellsCategory) {
      const original = (snapshot.spells as SpellEntry[] | undefined)?.[index];
      if (!original) {
        updateSpells((arr) => arr.filter((_, i) => i !== index));
      } else {
        updateSpells((arr) => arr.map((e, i) => (i === index ? original : e)));
      }
    } else {
      const original = (snapshot[category] as T[] | undefined)?.[index];
      if (!original) {
        updateCategory(category, (arr) => arr.filter((_, i) => i !== index));
      } else {
        updateCategory(category, (arr) => arr.map((e, i) => (i === index ? original : e)));
      }
    }
  }

  function handleAddEntry() {
    if (isSpellsCategory) {
      updateSpells((arr) => [...arr, blankSpellEntry()]);
      return;
    }
    if (state.status !== 'loaded' || !category) return;
    const newIndex = categoryEntries(category).length;
    updateCategory(category, (arr) => [...arr, entryConfig.blank()]);
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
  async function handleSaveDetail(draft: T) {
    if (state.status !== 'loaded' || !token || detailIndex === null) return;
    const newData = {
      ...state.data,
      [category]: categoryEntries(category).map((e, i) => (i === detailIndex ? draft : e)),
    };
    setState({ status: 'loaded', data: newData, sha: state.sha });
    setSaveStatus('saving');
    try {
      const ts = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const result = await saveWithConflictRetry(dataFile, state.sha, newData, `Update ${subtitle} [${ts}]`);
      setState({ status: 'loaded', data: newData, sha: result.sha });
      setSnapshot(newData);
      setSaveStatus('saved');
      handleBackToList();
    } catch {
      setSaveStatus('error');
    }
  }

  const editable = Boolean(token);
  const categoryLabel = categories.find((c) => c.key === category)?.label ?? '';
  const showCategoryTitle = !(!isSpellsCategory && view === 'detail');

  return (
    <div id="app">
      <header id="topbar">
        <div id="topbar-left">
          <a id="app-title" href="index.html">
            SKILLd20
          </a>
          <span id="app-subtitle">{subtitle}</span>
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
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={item.section === section ? 'nav-rail-item nav-link-active' : 'nav-rail-item'}
          >
            <span className="nav-rail-sym">{item.icon}</span>
            <span className="nav-rail-label">{item.label}</span>
          </a>
        ))}
      </nav>

      <div id="main">
        <aside id="sidebar">
          <CategoryNav categories={categories} active={category} onSelect={handleSelectCategory} />
        </aside>

        <main id="content">
          {state.status === 'loading' && <div id="empty-state">Loading…</div>}
          {state.status === 'error' && <div id="empty-state">{state.message}</div>}
          {state.status === 'loaded' && category && (
            <>
              {showCategoryTitle && (
                <div className="mat-category-title">
                  <span>{categoryLabel}</span>
                </div>
              )}
              {isSpellsCategory ? (
                <SpellsTable
                  key={category}
                  columns={SPELL_COLUMNS}
                  rows={spellsEntries()}
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
                <EntryDetail
                  config={entryConfig}
                  entry={categoryEntries(category)[detailIndex]}
                  mode={detailMode}
                  onEdit={handleEditDetail}
                  onSave={handleSaveDetail}
                  onCancel={handleCancelDetail}
                  onDelete={handleDeleteDetail}
                  onBack={handleBackToList}
                />
              ) : (
                <EntryList
                  key={category}
                  config={entryConfig}
                  rows={categoryEntries(category)}
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
