import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '../../css/shared.css'
import '../../css/materials.css'
import './App.css'
import App from './App.tsx'
import { materialsConfig } from './lib/materialsConfig'
import { CATEGORIES } from './lib/categories'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      section="materials"
      subtitle="Material Components"
      dataFile="data/materials.json"
      entryConfig={materialsConfig}
      categories={CATEGORIES}
    />
  </StrictMode>,
)
