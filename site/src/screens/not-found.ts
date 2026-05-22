import { createElement } from '@asymmetric-effort/specifyjs';

export function NotFoundScreen() {
  return createElement('div', { className: 'not-found-screen' },
    createElement('h1', null, 'Page Not Found'),
    createElement('p', null, 'The skill or class you are looking for does not exist.'),
    createElement('a', { href: '#/', className: 'back-link' }, 'Back to Home')
  );
}
