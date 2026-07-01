import { useEffect, useState } from 'react';
import { ghReadFile } from './lib/github';
import type { MaterialsData } from './types/materials';
import { MATERIAL_COLUMNS, SPELL_COLUMNS } from './lib/columns';
import { MaterialsTable } from './components/MaterialsTable';
import { CategoryNav, type Category } from './components/CategoryNav';
import './App.css';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; data: MaterialsData };

function App() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [category, setCategory] = useState<Category>('gems');

  useEffect(() => {
    ghReadFile<MaterialsData>('data/materials.json')
      .then((result) => {
        if (!result) {
          setState({ status: 'error', message: 'data/materials.json not found' });
          return;
        }
        setState({ status: 'loaded', data: result.data });
      })
      .catch((err: unknown) => {
        setState({ status: 'error', message: err instanceof Error ? err.message : String(err) });
      });
  }, []);

  return (
    <div id="app">
      <header id="topbar">
        <div id="topbar-left">
          <a id="app-title" href="index.html">SKILLd20</a>
          <span id="app-subtitle">Material Components</span>
        </div>
        <div id="topbar-right">
          <span id="status-text">
            {state.status === 'loading' && 'Loading…'}
            {state.status === 'error' && state.message}
            {state.status === 'loaded' && 'Loaded'}
          </span>
        </div>
      </header>

      <nav id="nav-rail">
        <a href="foundations.html" className="nav-rail-item"><span className="nav-rail-sym">◆</span><span className="nav-rail-label">Foundations</span></a>
        <a href="feats.html" className="nav-rail-item"><span className="nav-rail-sym">★</span><span className="nav-rail-label">Feats</span></a>
        <a href="skills.html" className="nav-rail-item"><span className="nav-rail-sym">◎</span><span className="nav-rail-label">Skills</span></a>
        <a href="materials.html" className="nav-rail-item nav-link-active"><span className="nav-rail-sym">✦</span><span className="nav-rail-label">Materials</span></a>
        <a href="rituals.html" className="nav-rail-item"><span className="nav-rail-sym">⊕</span><span className="nav-rail-label">Rituals</span></a>
        <a href="crafting.html" className="nav-rail-item"><span className="nav-rail-sym">⚒</span><span className="nav-rail-label">Crafting</span></a>
        <a href="rules.html" className="nav-rail-item"><span className="nav-rail-sym">≡</span><span className="nav-rail-label">Rules</span></a>
      </nav>

      <div id="main">
        <aside id="sidebar">
          <CategoryNav active={category} onSelect={setCategory} />
        </aside>

        <main id="content">
          {state.status === 'loading' && <div id="empty-state">Loading materials…</div>}
          {state.status === 'error' && <div id="empty-state">{state.message}</div>}
          {state.status === 'loaded' &&
            (category === 'spells' ? (
              <MaterialsTable key={category} columns={SPELL_COLUMNS} rows={state.data.spells} />
            ) : (
              <MaterialsTable key={category} columns={MATERIAL_COLUMNS} rows={state.data[category]} />
            ))}
        </main>
      </div>
    </div>
  );
}

export default App;
