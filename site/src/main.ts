import { createElement } from '@asymmetric-effort/specifyjs';
import { createRoot } from '@asymmetric-effort/specifyjs/dom';
import { App } from './app';
import './styles.css';

// Dark mode detection before first render
if (typeof window !== 'undefined') {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (document.documentElement.getAttribute('data-theme-manual') !== 'true') {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}

const root = createRoot(document.getElementById('root')!);
root.render(createElement(App, null));
