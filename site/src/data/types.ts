export interface Skill {
  name: string;
  description: string;
  category: string;
  tags: string[];
  path: string;
  purpose: string;
  prompt: string;
  examples: string;
}

export interface Subclass {
  name: string;
  skills: Skill[];
}

export interface SkillClass {
  name: string;
  description: string;
  subclasses: Subclass[];
}

export interface SkillsData {
  version: string;
  generatedAt: string;
  classes: SkillClass[];
  totalSkills: number;
}
