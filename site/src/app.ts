import { createElement } from '@asymmetric-effort/specifyjs';
import { Router, useRouter } from '@asymmetric-effort/specifyjs';
import { NavBar } from './components/nav-bar';
import { Footer } from './components/footer';
import { HomeScreen } from './screens/home';
import { ClassScreen } from './screens/class-view';
import { SkillScreen } from './screens/skill-view';
import { NotFoundScreen } from './screens/not-found';
import skillsData from './data/skills-data.json';

function AppContent() {
  const { pathname } = useRouter();

  // Route matching
  const segments = pathname.split('/').filter(Boolean);

  let content;
  if (segments.length === 0 || pathname === '/') {
    // Home page
    content = createElement(HomeScreen, { data: skillsData });
  } else if (segments.length === 1) {
    // Class page: /security, /development, etc.
    const className = segments[0];
    const classData = skillsData.classes.find((c: any) => c.name === className);
    if (classData) {
      content = createElement(ClassScreen, { classData, allData: skillsData });
    } else {
      content = createElement(NotFoundScreen, null);
    }
  } else {
    // Skill page: /security/pentest, /security/auditing/audit-deps, etc.
    // Try to find the skill by matching the path
    const fullPath = segments.join('/');
    let foundSkill = null;
    let foundClass = null;

    for (const cls of skillsData.classes) {
      for (const sub of cls.subclasses) {
        for (const skill of sub.skills) {
          if (skill.path === fullPath) {
            foundSkill = skill;
            foundClass = cls;
            break;
          }
        }
        if (foundSkill) break;
      }
      if (foundSkill) break;
    }

    if (foundSkill && foundClass) {
      content = createElement(SkillScreen, { skill: foundSkill, className: foundClass.name });
    } else {
      content = createElement(NotFoundScreen, null);
    }
  }

  return createElement('div', { className: 'app' },
    createElement('main', { className: 'main-content' }, content),
    createElement(Footer, null)
  );
}

export function App() {
  return createElement(Router, null,
    createElement(NavBar, null),
    createElement(AppContent, null)
  );
}
