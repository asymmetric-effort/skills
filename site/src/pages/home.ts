import { escapeHtml } from '../util';

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

export function renderHome(data: any): string {
  const totalSkills = data.totalSkills;
  const classes = data.classes;

  const classCards = classes.map((cls: any) => {
    const skillCount = cls.subclasses.reduce((sum: number, sub: any) => sum + sub.skills.length, 0);
    const color = CLASS_COLORS[cls.name] || '#3b82f6';
    const label = cls.name.charAt(0).toUpperCase() + cls.name.slice(1);
    return `<a href="#/${escapeHtml(cls.name)}" class="card class-card" style="border-left: 4px solid ${color}" data-class-name="${escapeHtml(cls.name)}" data-class-desc="${escapeHtml(cls.description)}">
      <h3 class="card-title">${escapeHtml(label)}</h3>
      <p class="card-description">${escapeHtml(cls.description)}</p>
      <span class="badge">${skillCount} skill${skillCount !== 1 ? 's' : ''}</span>
    </a>`;
  }).join('\n');

  return `<div class="home-screen">
    <section class="hero">
      <h1>Claude Code Skills</h1>
      <p class="hero-subtitle">A centralized library of reusable skills for development, security, testing, DevOps, and more.</p>
      <div class="hero-stats">
        <div class="stat">
          <span class="stat-value">${totalSkills}</span>
          <span class="stat-label">Skills</span>
        </div>
        <div class="stat">
          <span class="stat-value">${classes.length}</span>
          <span class="stat-label">Classes</span>
        </div>
      </div>
    </section>
    <section class="catalog">
      <input type="text" class="search-input" id="home-search" placeholder="Filter classes..." />
      <div class="cards-grid" id="home-cards-grid">
        ${classCards}
      </div>
    </section>
  </div>`;
}

export function attachHomeListeners(): void {
  const input = document.getElementById('home-search') as HTMLInputElement | null;
  if (!input) return;
  input.addEventListener('input', () => {
    const filter = input.value.toLowerCase();
    const cards = document.querySelectorAll('#home-cards-grid .class-card') as NodeListOf<HTMLElement>;
    cards.forEach(card => {
      const name = card.getAttribute('data-class-name') || '';
      const desc = card.getAttribute('data-class-desc') || '';
      const matches = !filter || name.includes(filter) || desc.toLowerCase().includes(filter);
      card.style.display = matches ? '' : 'none';
    });
  });
}
