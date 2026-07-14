import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GmaoProvider } from './context/GmaoContext.tsx'
import { Analytics } from '@vercel/analytics/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GmaoProvider>
      <App />
      <Analytics />
    </GmaoProvider>
  </StrictMode>,
)

