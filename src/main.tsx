import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from './components/ui/toaster'

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
