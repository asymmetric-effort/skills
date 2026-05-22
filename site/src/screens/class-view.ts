import { createElement } from '@asymmetric-effort/specifyjs';
import { useState, useCallback } from '@asymmetric-effort/specifyjs';
import { Breadcrumbs } from '../components/breadcrumbs';
import { SkillCard } from '../components/skill-card';

export function ClassScreen(props: { classData: any; allData: any }) {
  const [filter, setFilter] = useState('');
  const cls = props.classData;

  const onFilter = useCallback((e: any) => {
    setFilter(e.target.value.toLowerCase());
  }, []);

  return createElement('div', { className: 'class-screen' },
    createElement(Breadcrumbs, {
      items: [
        { label: 'Home', href: '#/' },
        { label: cls.name.charAt(0).toUpperCase() + cls.name.slice(1) },
      ],
    }),
    createElement('h1', null, cls.name.charAt(0).toUpperCase() + cls.name.slice(1)),
    createElement('p', { className: 'class-description' }, cls.description),
    createElement('input', {
      type: 'text',
      className: 'search-input',
      placeholder: `Filter skills in ${cls.name}...`,
      value: filter,
      onInput: onFilter,
    }),
    ...cls.subclasses.map((sub: any) => {
      const filteredSkills = sub.skills.filter((s: any) =>
        !filter || s.name.includes(filter) || s.description.toLowerCase().includes(filter) ||
        s.tags.some((t: string) => t.includes(filter))
      );
      if (filteredSkills.length === 0) return null;
      return createElement('section', { className: 'subclass-section', key: sub.name },
        createElement('h2', { className: 'subclass-title' }, sub.name.charAt(0).toUpperCase() + sub.name.slice(1).replace(/-/g, ' ')),
        createElement('div', { className: 'cards-grid' },
          ...filteredSkills.map((skill: any) =>
            createElement(SkillCard, {
              key: skill.name,
              name: skill.name,
              description: skill.description,
              tags: skill.tags,
              path: skill.path,
            })
          )
        )
      );
    }).filter(Boolean)
  );
}
