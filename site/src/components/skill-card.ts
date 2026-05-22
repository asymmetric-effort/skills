import { createElement } from '@asymmetric-effort/specifyjs';

export function SkillCard(props: { name: string; description: string; tags: string[]; path: string }) {
  return createElement('a', {
    href: `#/${props.path}`,
    className: 'card skill-card',
  },
    createElement('h3', { className: 'card-title' }, props.name),
    createElement('p', { className: 'card-description' }, props.description),
    createElement('div', { className: 'card-tags' },
      ...props.tags.slice(0, 5).map(tag =>
        createElement('span', { className: 'badge' }, tag)
      )
    )
  );
}
