import { useEffect, useState } from 'react';
import { ghReadFile } from './lib/github';
import type { MaterialsData } from './types/materials';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; counts: Record<string, number> };

function App() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    ghReadFile<MaterialsData>('data/materials.json')
      .then((result) => {
        if (!result) {
          setState({ status: 'error', message: 'data/materials.json not found' });
          return;
        }
        const counts = Object.fromEntries(
          Object.entries(result.data).map(([category, entries]) => [category, entries.length]),
        );
        setState({ status: 'loaded', counts });
      })
      .catch((err: unknown) => {
        setState({ status: 'error', message: err instanceof Error ? err.message : String(err) });
      });
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Materials data layer smoke test</h1>
      {state.status === 'loading' && <p>Loading data/materials.json&hellip;</p>}
      {state.status === 'error' && <p style={{ color: 'crimson' }}>Error: {state.message}</p>}
      {state.status === 'loaded' && (
        <ul>
          {Object.entries(state.counts).map(([category, count]) => (
            <li key={category}>
              {category}: {count}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
