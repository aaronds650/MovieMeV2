import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Add error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Add error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);