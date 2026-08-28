import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Global error protection against non-critical browser noise
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason || '');
    if (
      reasonStr.includes('WebSocket') ||
      reasonStr.includes('vite') ||
      reasonStr.includes('aborted') ||
      reasonStr.includes('no-speech') ||
      reasonStr.includes('failed to connect')
    ) {
      event.preventDefault();
      console.warn('Silenced transient window unhandled rejection:', reasonStr);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = String(event.message || '');
    if (
      msg.includes('Cannot set property fetch') ||
      msg.includes('only a getter') ||
      msg.includes('WebSocket') ||
      msg.includes('vite')
    ) {
      event.preventDefault();
      console.warn('Silenced window getter property error:', msg);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
