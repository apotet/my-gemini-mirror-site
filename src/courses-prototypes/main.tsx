import React from 'react';
import { createRoot } from 'react-dom/client';
import './courses.css';
import { PrototypeShowcaseApp } from './PrototypeShowcaseApp';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <PrototypeShowcaseApp />
    </React.StrictMode>
  );
}
