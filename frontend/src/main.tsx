// main.tsx - FIXED VERSION
import React from 'react';
import ReactDOM from 'react-dom/client';
import Routes from './routes';
import './index.css';

const isDevelopment = import.meta.env.DEV;

if (isDevelopment) {
  window.__API_BASE_URL__ = 'http://localhost:5279';
  console.log('🚀 API Base URL:', window.__API_BASE_URL__);
  console.log(
    '📖 Swagger Documentation:',
    `${window.__API_BASE_URL__}/swagger/index.html`
  );
} else {
  window.__API_BASE_URL__ = 'https://your-production-api-domain.com';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Routes /> {/* ✅ No BrowserRouter needed! */}
  </React.StrictMode>
);

declare global {
  interface Window {
    __API_BASE_URL__: string;
  }
}
