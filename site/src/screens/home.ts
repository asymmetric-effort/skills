import { createElement } from '@asymmetric-effort/specifyjs';
import { useState, useCallback } from '@asymmetric-effort/specifyjs';
import { ClassCard } from '../components/class-card';

export function HomeScreen(props: { data: any }) {
  const [filter, setFilter] = useState('');

  const onFilter = useCallback((e: any) => {
    setFilter(e.target.value.toLowerCase());
  }, []);

  const classes = props.data.classes.filter((cls: any) =>
    !filter || cls.name.includes(filter) || cls.description.toLowerCase().includes(filter)
  );

  // Count total skills
  const totalSkills = props.data.totalSkills;

  return createElement('div', { className: 'home-screen' },
    createElement('section', { className: 'hero' },
      createElement('h1', null, 'Claude Code Skills'),
      createElement('p', { className: 'hero-subtitle' },
        'A centralized library of reusable skills for development, security, testing, DevOps, and more.'
      ),
      createElement('div', { className: 'hero-stats' },
        createElement('div', { className: 'stat' },
          createElement('span', { className: 'stat-value' }, String(totalSkills)),
          createElement('span', { className: 'stat-label' }, 'Skills')
        ),
        createElement('div', { className: 'stat' },
          createElement('span', { className: 'stat-value' }, String(props.data.classes.length)),
          createElement('span', { className: 'stat-label' }, 'Classes')
        )
      )
    ),
    createElement('section', { className: 'catalog' },
      createElement('input', {
        type: 'text',
        className: 'search-input',
        placeholder: 'Filter classes...',
        value: filter,
        onInput: onFilter,
      }),
      createElement('div', { className: 'cards-grid' },
        ...classes.map((cls: any) => {
          const skillCount = cls.subclasses.reduce((sum: number, sub: any) => sum + sub.skills.length, 0);
          return createElement(ClassCard, {
            key: cls.name,
            name: cls.name,
            description: cls.description,
            skillCount,
          });
        })
      )
    )
  );
}
