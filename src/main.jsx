import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      if (import.meta.env.DEV) {
        // O modo de desenvolvimento não deve usar o cache do PWA.
        // Remove Service Workers antigos que possam estar presos no celular.
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map((registration) => registration.unregister())
        );

        const cacheKeys = await caches.keys();
        await Promise.all(
          cacheKeys
            .filter((key) => key.startsWith('caderno-de-campo-'))
            .map((key) => caches.delete(key))
        );

        console.log('🧹 Service Worker/cache de desenvolvimento limpos.');
        return;
      }

      await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado com sucesso.');
    } catch (error) {
      console.error('Erro ao configurar o Service Worker:', error);
    }
  });
}
