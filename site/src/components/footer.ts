import { createElement } from '@asymmetric-effort/specifyjs';
import skillsData from '../data/skills-data.json';

export function Footer() {
  return createElement('footer', { className: 'site-footer' },
    createElement('div', { className: 'footer-content' },
      createElement('span', null, `v${skillsData.version}`),
      createElement('span', { className: 'footer-sep' }, ' · '),
      createElement('a', { href: 'https://github.com/asymmetric-effort/skills', target: '_blank', rel: 'noopener' }, 'GitHub'),
      createElement('span', { className: 'footer-sep' }, ' · '),
      createElement('span', null, `© ${new Date().getFullYear()} `),
      createElement('a', { href: 'https://asymmetric-effort.com', target: '_blank', rel: 'noopener' }, 'Asymmetric Effort, LLC')
    )
  );
}
