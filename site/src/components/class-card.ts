import { createElement } from '@asymmetric-effort/specifyjs';

const CLASS_COLORS: Record<string, string> = {
  automation: '#f59e0b',
  data: '#10b981',
  development: '#3b82f6',
  devops: '#8b5cf6',
  documentation: '#06b6d4',
  jokes: '#f43f5e',
  security: '#ef4444',
  testing: '#22c55e',
};

export function ClassCard(props: { name: string; description: string; skillCount: number }) {
  const color = CLASS_COLORS[props.name] || '#3b82f6';
  return createElement('a', {
    href: `#/${props.name}`,
    className: 'card class-card',
    style: { borderLeftColor: color, borderLeftWidth: '4px', borderLeftStyle: 'solid' },
  },
    createElement('h3', { className: 'card-title' }, props.name.charAt(0).toUpperCase() + props.name.slice(1)),
    createElement('p', { className: 'card-description' }, props.description),
    createElement('span', { className: 'badge' }, `${props.skillCount} skill${props.skillCount !== 1 ? 's' : ''}`)
  );
}
