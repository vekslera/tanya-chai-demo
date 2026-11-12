import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import { App } from './App';
import { browserAdapters, createDeps } from './composition';

const deps = createDeps(browserAdapters());

/** The app's root; exported so a test can unmount it before its environment is torn down. */
export const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <App deps={deps} />
  </StrictMode>,
);
