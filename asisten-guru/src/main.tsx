import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ToastProvider } from './components/Toast';
import './index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Elemen #root tidak ditemukan di index.html');
}

createRoot(container).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
