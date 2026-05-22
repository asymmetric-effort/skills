import { createElement } from '@asymmetric-effort/specifyjs';
import { Breadcrumbs } from '../components/breadcrumbs';
import { SkillContent } from '../components/skill-content';

export function SkillScreen(props: { skill: any; className: string }) {
  const { skill, className } = props;
  const classLabel = className.charAt(0).toUpperCase() + className.slice(1);

  return createElement('div', { className: 'skill-screen' },
    createElement(Breadcrumbs, {
      items: [
        { label: 'Home', href: '#/' },
        { label: classLabel, href: `#/${className}` },
        { label: skill.name },
      ],
    }),
    createElement('h1', null, skill.name),
    createElement('p', { className: 'skill-description' }, skill.description),
    createElement('div', { className: 'skill-tags' },
      ...skill.tags.map((tag: string) =>
        createElement('span', { className: 'badge', key: tag }, tag)
      )
    ),
    createElement(SkillContent, {
      purpose: skill.purpose,
      prompt: skill.prompt,
      examples: skill.examples,
    })
  );
}
