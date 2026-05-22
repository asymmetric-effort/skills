#!/usr/bin/env node

/**
 * generate-data.mjs
 *
 * Build-time script that reads all SKILL.md files from the repo,
 * parses their frontmatter and content sections, and outputs a
 * consolidated JSON file for the documentation site.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_DIR = resolve(__dirname, '..');
const REPO_ROOT = resolve(SITE_DIR, '..');
const OUTPUT_PATH = join(SITE_DIR, 'src', 'data', 'skills-data.json');

// Directories to skip when walking the repo
const SKIP_DIRS = new Set(['node_modules', '.git', 'site', '.claude', '.github']);

// ---------------------------------------------------------------------------
// File walking
// ---------------------------------------------------------------------------

function walkDir(dir, results = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      // Skip at top-level only for known non-skill dirs
      const relToRoot = relative(REPO_ROOT, full);
      const topLevel = relToRoot.split('/')[0];
      if (relToRoot === topLevel && SKIP_DIRS.has(topLevel)) continue;
      walkDir(full, results);
    } else if (entry === 'SKILL.md') {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// YAML frontmatter parser (minimal, no deps)
// ---------------------------------------------------------------------------

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result = {};

  for (const line of yaml.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let value = trimmed.slice(colonIdx + 1).trim();

    // Handle inline arrays: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else {
      // Strip surrounding quotes
      value = value.replace(/^["']|["']$/g, '');
    }

    result[key] = value;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Section extraction
// ---------------------------------------------------------------------------

function extractSections(content) {
  // Remove frontmatter
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');

  const sections = {};
  const parts = body.split(/^## /m);

  for (const part of parts) {
    if (!part.trim()) continue;
    const newlineIdx = part.indexOf('\n');
    if (newlineIdx === -1) continue;
    const heading = part.slice(0, newlineIdx).trim();
    const text = part.slice(newlineIdx + 1).trim();
    sections[heading.toLowerCase()] = text;
  }

  return {
    purpose: sections['purpose'] || '',
    prompt: sections['prompt'] || '',
    examples: sections['examples'] || '',
  };
}

// ---------------------------------------------------------------------------
// Markdown to HTML converter
// ---------------------------------------------------------------------------

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function markdownToHtml(md) {
  if (!md) return '';

  const lines = md.split('\n');
  const output = [];
  let inCodeBlock = false;
  let codeBlockContent = [];
  let inUl = false;
  let inOl = false;
  let inTable = false;
  let tableRows = [];

  function closeList() {
    if (inUl) {
      output.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      output.push('</ol>');
      inOl = false;
    }
  }

  function closeTable() {
    if (inTable && tableRows.length > 0) {
      output.push('<table>');
      for (let i = 0; i < tableRows.length; i++) {
        // Skip separator rows (e.g., |---|---|)
        if (/^\|[\s\-:|]+\|$/.test(tableRows[i].trim())) continue;
        const tag = i === 0 ? 'th' : 'td';
        const cells = tableRows[i]
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());
        output.push('<tr>' + cells.map((c) => `<${tag}>${inlineFormat(escapeHtml(c))}</${tag}>`).join('') + '</tr>');
      }
      output.push('</table>');
      tableRows = [];
      inTable = false;
    }
  }

  function inlineFormat(text) {
    // Bold: **text**
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* (but not inside bold)
    text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Inline code: `code`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    return text;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        closeList();
        closeTable();
        inCodeBlock = true;
        codeBlockContent = [];
      } else {
        output.push('<pre><code>' + escapeHtml(codeBlockContent.join('\n')) + '</code></pre>');
        inCodeBlock = false;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Table rows
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      closeList();
      if (!inTable) inTable = true;
      tableRows.push(line.trim());
      continue;
    } else if (inTable) {
      closeTable();
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      output.push(`<h${level}>${inlineFormat(escapeHtml(headingMatch[2]))}</h${level}>`);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (ulMatch) {
      closeTable();
      if (inOl) {
        output.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        output.push('<ul>');
        inUl = true;
      }
      output.push(`<li>${inlineFormat(escapeHtml(ulMatch[2]))}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (olMatch) {
      closeTable();
      if (inUl) {
        output.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        output.push('<ol>');
        inOl = true;
      }
      output.push(`<li>${inlineFormat(escapeHtml(olMatch[2]))}</li>`);
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      closeList();
      closeTable();
      continue;
    }

    // Regular paragraph text
    closeList();
    closeTable();
    output.push(`<p>${inlineFormat(escapeHtml(line))}</p>`);
  }

  // Close any remaining open elements
  closeList();
  closeTable();
  if (inCodeBlock) {
    output.push('<pre><code>' + escapeHtml(codeBlockContent.join('\n')) + '</code></pre>');
  }

  return output.join('\n');
}

// ---------------------------------------------------------------------------
// Class description from README.md
// ---------------------------------------------------------------------------

function getClassDescription(classDir) {
  const readmePath = join(classDir, 'README.md');
  if (!existsSync(readmePath)) return '';

  const content = readFileSync(readmePath, 'utf-8');
  // Grab the first non-heading, non-empty line as the description
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    // Return the first paragraph line
    return trimmed;
  }
  return '';
}

// ---------------------------------------------------------------------------
// Version
// ---------------------------------------------------------------------------

function getVersion() {
  const candidates = [
    join(SITE_DIR, 'public', 'VERSION'),
    join(REPO_ROOT, 'public', 'VERSION'),
    join(REPO_ROOT, 'VERSION'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      return readFileSync(p, 'utf-8').trim();
    }
  }
  return '0.0.0';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const skillFiles = walkDir(REPO_ROOT);

  // Map: className -> subclassName -> Skill[]
  const classMap = new Map();

  for (const filePath of skillFiles) {
    const content = readFileSync(filePath, 'utf-8');
    const frontmatter = parseFrontmatter(content);
    const sections = extractSections(content);

    // Determine path relative to repo root (directory containing SKILL.md)
    const skillDir = dirname(filePath);
    const relPath = relative(REPO_ROOT, skillDir);
    const parts = relPath.split('/');

    // parts[0] = class, parts[1] = subclass (or skill if only 2 levels)
    const className = parts[0];
    let subclassName;
    let skillName;

    if (parts.length >= 3) {
      // class/subclass/skill or class/subclass/deeper/.../skill
      subclassName = parts[1];
      skillName = parts[parts.length - 1];
    } else if (parts.length === 2) {
      // class/skillOrSubclass — the dir is both subclass and skill
      subclassName = parts[1];
      skillName = parts[1];
    } else {
      // Directly in a class dir (unlikely but handle it)
      subclassName = 'general';
      skillName = parts[0];
    }

    const skill = {
      name: frontmatter.name || skillName,
      description: frontmatter.description || '',
      category: frontmatter.category || className,
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      path: relPath,
      purpose: markdownToHtml(sections.purpose),
      prompt: markdownToHtml(sections.prompt),
      examples: markdownToHtml(sections.examples),
    };

    if (!classMap.has(className)) {
      classMap.set(className, new Map());
    }
    const subMap = classMap.get(className);
    if (!subMap.has(subclassName)) {
      subMap.set(subclassName, []);
    }
    subMap.get(subclassName).push(skill);
  }

  // Build sorted output structure
  const sortedClassNames = [...classMap.keys()].sort();
  const classes = [];
  let totalSkills = 0;

  for (const className of sortedClassNames) {
    const subMap = classMap.get(className);
    const classDir = join(REPO_ROOT, className);
    const description = getClassDescription(classDir);

    const sortedSubNames = [...subMap.keys()].sort();
    const subclasses = [];

    for (const subName of sortedSubNames) {
      const skills = subMap.get(subName).sort((a, b) => a.name.localeCompare(b.name));
      totalSkills += skills.length;
      subclasses.push({
        name: subName,
        skills,
      });
    }

    classes.push({
      name: className,
      description,
      subclasses,
    });
  }

  const version = getVersion();
  const data = {
    version,
    generatedAt: new Date().toISOString(),
    classes,
    totalSkills,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`Generated data for ${totalSkills} skills across ${classes.length} classes`);
}

main();
