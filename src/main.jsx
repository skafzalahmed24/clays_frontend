import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import './styles/index.css'
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext.jsx';
import App from './App.jsx'

import { store } from './store';
import { injectStore } from './api/client';

// Inject store into axios client to avoid circular dependencies
injectStore(store);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <ToastProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </ToastProvider>
    </HelmetProvider>
  </StrictMode>,
)
