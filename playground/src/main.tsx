import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initAuraI18n } from 'aura-editor'
import 'aura-editor/styles.css'
import './index.css'
import App from './App'

initAuraI18n({ debug: false })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
