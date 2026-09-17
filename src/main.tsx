import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <App />
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)

/* fade out the pre-React logo splash once the app has mounted */
requestAnimationFrame(() => {
  const s = document.getElementById('boot-splash');
  if (!s) return;
  s.style.opacity = '0';
  setTimeout(() => s.remove(), 450);
});
