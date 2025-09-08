import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from './components/ui/toaster'
// Register the PWA service worker (vite-plugin-pwa) using dynamic import to satisfy TS
if (typeof window !== 'undefined') {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  }).catch(() => {
    // no-op: during dev without plugin or type resolution issues
  })
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <DataProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
        <Toaster />
      </DataProvider>
    </AuthProvider>
  </ThemeProvider>
);
