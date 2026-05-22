import skillsData from './data/skills-data.json';
import { renderHome, attachHomeListeners } from './pages/home';
import { renderClassView, attachClassViewListeners } from './pages/class-view';
import { renderSkillView } from './pages/skill-view';
import { renderNotFound } from './pages/not-found';
import { renderGettingStarted } from './pages/getting-started';
import { escapeHtml } from './util';

declare const __APP_VERSION__: string;

const CLASSES = skillsData.classes.map((c: any) => c.name);

function getPath(): string {
  const hash = window.location.hash;
  if (!hash || hash === '#' || hash === '#/') return '/';
  return hash.startsWith('#') ? hash.slice(1) : hash;
}

function renderNav(currentPath: string): string {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const links = CLASSES.map(cls => {
    const active = currentPath === `/${cls}` || currentPath.startsWith(`/${cls}/`);
    const label = cls.charAt(0).toUpperCase() + cls.slice(1);
    return `<a href="#/${escapeHtml(cls)}" class="nav-link${active ? ' active' : ''}">${escapeHtml(label)}</a>`;
  }).join('');

  return `<nav class="nav-bar">
    <div class="nav-content">
      <a href="#/" class="nav-brand">Skills</a>
      <div class="nav-links"><a href="#/getting-started" class="nav-link${currentPath === '/getting-started' ? ' active' : ''}">Getting Started</a>${links}</div>
      <button class="theme-toggle" id="theme-toggle" title="${isDark ? 'Switch to light mode' : 'Switch to dark mode'}" aria-label="${isDark ? 'Switch to light mode' : 'Switch to dark mode'}">${isDark ? '\u2600' : '\u263E'}</button>
    </div>
  </nav>`;
}

function renderFooter(): string {
  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : skillsData.version;
  return `<footer class="site-footer">
    <div class="footer-content">
      <span>v${escapeHtml(version)}</span>
      <span class="footer-sep"> &middot; </span>
      <a href="https://github.com/asymmetric-effort/skills" target="_blank" rel="noopener">GitHub</a>
      <span class="footer-sep"> &middot; </span>
      <span>&copy; ${new Date().getFullYear()} </span>
      <a href="https://asymmetric-effort.com" target="_blank" rel="noopener">Asymmetric Effort, LLC</a>
    </div>
  </footer>`;
}

function render(): void {
  const path = getPath();
  const segments = path.split('/').filter(Boolean);

  let content: string;
  let afterRender: (() => void) | null = null;

  if (segments.length === 0) {
    content = renderHome(skillsData);
    afterRender = attachHomeListeners;
  } else if (segments.length === 1 && segments[0] === 'getting-started') {
    content = renderGettingStarted();
  } else if (segments.length === 1) {
    const className = segments[0];
    const classData = skillsData.classes.find((c: any) => c.name === className);
    if (classData) {
      content = renderClassView(classData);
      afterRender = attachClassViewListeners;
    } else {
      content = renderNotFound();
    }
  } else {
    const fullPath = segments.join('/');
    let foundSkill = null;
    let foundClass = null;

    for (const cls of skillsData.classes) {
      for (const sub of cls.subclasses) {
        for (const skill of sub.skills) {
          if (skill.path === fullPath) {
            foundSkill = skill;
            foundClass = cls;
            break;
          }
        }
        if (foundSkill) break;
      }
      if (foundSkill) break;
    }

    if (foundSkill && foundClass) {
      content = renderSkillView(foundSkill, foundClass.name);
    } else {
      content = renderNotFound();
    }
  }

  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div class="app">
      ${renderNav(path)}
      <main class="main-content">${content}</main>
      ${renderFooter()}
    </div>`;
  }

  // Attach event listeners after rendering
  if (afterRender) afterRender();
  attachThemeToggle();
}

function attachThemeToggle(): void {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.setAttribute('data-theme-manual', 'true');
    render();
  });
}

// Dark mode detection before first render
if (typeof window !== 'undefined') {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (document.documentElement.getAttribute('data-theme-manual') !== 'true') {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      render();
    }
  });
}

window.addEventListener('hashchange', render);
render();
