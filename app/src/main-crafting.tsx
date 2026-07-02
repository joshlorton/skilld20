import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '../../css/shared.css'
import '../../css/materials.css'
import './App.css'
import App from './App.tsx'
import { craftingConfig } from './lib/craftingConfig'
import { CRAFTING_CATEGORY_ITEMS } from './lib/craftingCategories'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      section="crafting"
      subtitle="Crafting"
      dataFile="data/crafting.json"
      entryConfig={craftingConfig}
      categories={CRAFTING_CATEGORY_ITEMS}
    />
  </StrictMode>,
)
