
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Ponto de entrada da aplicação APPG Saúde.
 * Configurado para máxima compatibilidade com deploys Netlify/Vercel.
 */
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Critical Error: Root element not found. Check index.html structure.");
}
