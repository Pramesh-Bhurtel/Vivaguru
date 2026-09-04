// VivaGuru service.js - Service Worker Registration & Lifecycle Controller
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Register sw.js
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[VivaGuru PWA] Service Worker active with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[VivaGuru PWA] Service Worker registration failed:', error);
        });
    });
  }
}

// Auto-run if imported directly
if (typeof window !== 'undefined') {
  registerServiceWorker();
}
