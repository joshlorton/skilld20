import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '../../css/shared.css'
import '../../css/materials.css'
import './App.css'
import App from './App.tsx'
import { ritualsConfig } from './lib/ritualsConfig'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      section="rituals"
      subtitle="Rituals"
      dataFile="data/rituals.json"
      entryConfig={ritualsConfig}
    />
  </StrictMode>,
)
