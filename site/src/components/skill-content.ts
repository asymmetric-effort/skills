import { createElement } from '@asymmetric-effort/specifyjs';

export function SkillContent(props: { purpose: string; prompt: string; examples: string }) {
  return createElement('div', { className: 'skill-content' },
    createElement('section', { className: 'skill-section' },
      createElement('h2', null, 'Purpose'),
      createElement('div', { dangerouslySetInnerHTML: { __html: props.purpose } })
    ),
    createElement('section', { className: 'skill-section' },
      createElement('h2', null, 'Prompt'),
      createElement('div', { dangerouslySetInnerHTML: { __html: props.prompt } })
    ),
    props.examples ? createElement('section', { className: 'skill-section' },
      createElement('h2', null, 'Examples'),
      createElement('div', { dangerouslySetInnerHTML: { __html: props.examples } })
    ) : null
  );
}
