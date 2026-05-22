import { escapeHtml } from '../util';

export function renderSkillView(skill: any, className: string): string {
  const classLabel = className.charAt(0).toUpperCase() + className.slice(1);

  const breadcrumbs = `<nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="#/" class="breadcrumb-link">Home</a>
    <span class="breadcrumb-sep"> / </span>
    <a href="#/${escapeHtml(className)}" class="breadcrumb-link">${escapeHtml(classLabel)}</a>
    <span class="breadcrumb-sep"> / </span>
    <span class="breadcrumb-current">${escapeHtml(skill.name)}</span>
  </nav>`;

  const tags = skill.tags.map((tag: string) =>
    `<span class="badge">${escapeHtml(tag)}</span>`
  ).join('');

  const examplesSection = skill.examples
    ? `<section class="skill-section">
        <h2>Examples</h2>
        <div>${skill.examples}</div>
      </section>`
    : '';

  return `<div class="skill-screen">
    ${breadcrumbs}
    <h1>${escapeHtml(skill.name)}</h1>
    <p class="skill-description">${escapeHtml(skill.description)}</p>
    <div class="skill-tags">${tags}</div>
    <div class="skill-content">
      <section class="skill-section">
        <h2>Purpose</h2>
        <div>${skill.purpose}</div>
      </section>
      <section class="skill-section">
        <h2>Prompt</h2>
        <div>${skill.prompt}</div>
      </section>
      ${examplesSection}
    </div>
  </div>`;
}
