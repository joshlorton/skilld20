import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '../../css/shared.css'
import '../../css/materials.css'
import './App.css'
import App from './App.tsx'
import type { EntrySectionConfig } from './lib/entryConfig'
import { materialsConfig } from './lib/materialsConfig'
import { mineralsConfig } from './lib/mineralsConfig'
import { CATEGORIES } from './lib/categories'

// Gems get the new Mineral schema; every other category keeps the existing
// flat MaterialEntry schema. Cast to a common shape since App<T> needs one
// T per instantiation -- same pragmatic loosening already used for
// `state.data: Record<string, unknown>` at the App level.
function materialsEntryConfig(category: string): EntrySectionConfig<Record<string, unknown>> {
  return (category === 'gems' ? mineralsConfig : materialsConfig) as unknown as EntrySectionConfig<
    Record<string, unknown>
  >;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      section="materials"
      subtitle="Material Components"
      dataFile="data/materials.json"
      entryConfig={materialsEntryConfig}
      categories={CATEGORIES}
    />
  </StrictMode>,
)
