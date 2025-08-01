import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Service worker registration removed for development

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);