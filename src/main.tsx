import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './visual-editor.generated.css';

if (import.meta.env.DEV) {
  import('./visual-editor-runtime').then(({ startVisualEditor }) => {
    startVisualEditor(49160);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
