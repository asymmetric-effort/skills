import { createElement } from '@asymmetric-effort/specifyjs';
import { useState, useCallback } from '@asymmetric-effort/specifyjs';
import { useRouter } from '@asymmetric-effort/specifyjs';

const CLASSES = ['automation', 'data', 'development', 'devops', 'documentation', 'jokes', 'security', 'testing'];

export function NavBar() {
  const { pathname } = useRouter();
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
  );

  const toggleTheme = useCallback(() => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.setAttribute('data-theme-manual', 'true');
    setIsDark(!isDark);
  }, [isDark]);

  return createElement('nav', { className: 'nav-bar' },
    createElement('div', { className: 'nav-content' },
      createElement('a', { href: '#/', className: 'nav-brand' }, 'Skills'),
      createElement('div', { className: 'nav-links' },
        ...CLASSES.map(cls =>
          createElement('a', {
            href: `#/${cls}`,
            className: `nav-link${pathname === `/${cls}` || pathname.startsWith(`/${cls}/`) ? ' active' : ''}`,
          }, cls.charAt(0).toUpperCase() + cls.slice(1))
        )
      ),
      createElement('button', {
        className: 'theme-toggle',
        onClick: toggleTheme,
        title: isDark ? 'Switch to light mode' : 'Switch to dark mode',
        'aria-label': isDark ? 'Switch to light mode' : 'Switch to dark mode',
      }, isDark ? '\u2600' : '\u263E')
    )
  );
}
