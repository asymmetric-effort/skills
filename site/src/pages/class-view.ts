import { escapeHtml } from '../util';

export function renderClassView(classData: any): string {
  const label = classData.name.charAt(0).toUpperCase() + classData.name.slice(1);

  const breadcrumbs = `<nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="#/" class="breadcrumb-link">Home</a>
    <span class="breadcrumb-sep"> / </span>
    <span class="breadcrumb-current">${escapeHtml(label)}</span>
  </nav>`;

  const subclassSections = classData.subclasses.map((sub: any) => {
    const subLabel = sub.name.charAt(0).toUpperCase() + sub.name.slice(1).replace(/-/g, ' ');
    const skillCards = sub.skills.map((skill: any) => {
      const tags = skill.tags.slice(0, 5).map((tag: string) =>
        `<span class="badge">${escapeHtml(tag)}</span>`
      ).join('');
      return `<a href="#/${escapeHtml(skill.path)}" class="card skill-card" data-skill-name="${escapeHtml(skill.name)}" data-skill-desc="${escapeHtml(skill.description)}" data-skill-tags="${escapeHtml(skill.tags.join(','))}">
        <h3 class="card-title">${escapeHtml(skill.name)}</h3>
        <p class="card-description">${escapeHtml(skill.description)}</p>
        <div class="card-tags">${tags}</div>
      </a>`;
    }).join('\n');

    return `<section class="subclass-section" data-subclass="${escapeHtml(sub.name)}">
      <h2 class="subclass-title">${escapeHtml(subLabel)}</h2>
      <div class="cards-grid">${skillCards}</div>
    </section>`;
  }).join('\n');

  return `<div class="class-screen">
    ${breadcrumbs}
    <h1>${escapeHtml(label)}</h1>
    <p class="class-description">${escapeHtml(classData.description)}</p>
    <input type="text" class="search-input" id="class-search" placeholder="Filter skills in ${escapeHtml(classData.name)}..." />
    ${subclassSections}
  </div>`;
}

export function attachClassViewListeners(): void {
  const input = document.getElementById('class-search') as HTMLInputElement | null;
  if (!input) return;
  input.addEventListener('input', () => {
    const filter = input.value.toLowerCase();
    const sections = document.querySelectorAll('.subclass-section') as NodeListOf<HTMLElement>;
    sections.forEach(section => {
      const cards = section.querySelectorAll('.skill-card') as NodeListOf<HTMLElement>;
      let anyVisible = false;
      cards.forEach(card => {
        const name = card.getAttribute('data-skill-name') || '';
        const desc = card.getAttribute('data-skill-desc') || '';
        const tags = card.getAttribute('data-skill-tags') || '';
        const matches = !filter || name.includes(filter) || desc.toLowerCase().includes(filter) || tags.includes(filter);
        card.style.display = matches ? '' : 'none';
        if (matches) anyVisible = true;
      });
      section.style.display = anyVisible ? '' : 'none';
    });
  });
}
