#!/usr/bin/env node

import { readdir, readFile, writeFile, rm, mkdir, cp, stat } from "node:fs/promises";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");
const DIST_DIR = join(REPO_ROOT, "dist");
const SKIP_DIRS = new Set(["node_modules", ".git", "site", ".claude"]);

async function walk(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const relFromRoot = relative(REPO_ROOT, join(dir, entry.name));
    const topLevel = relFromRoot.split("/")[0];
    if (SKIP_DIRS.has(topLevel) && dir === REPO_ROOT) continue;
    if (SKIP_DIRS.has(entry.name) && dir !== REPO_ROOT) continue;

    const fullPath = join(dir, entry.name);
    const skillFile = join(fullPath, "SKILL.md");
    try {
      await stat(skillFile);
      results.push(skillFile);
    } catch {
      // not a skill directory, recurse
    }
    const nested = await walk(fullPath);
    results.push(...nested);
  }
  return results;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { fields: {}, body: content };

  const raw = match[1];
  const body = match[2];
  const fields = {};

  for (const line of raw.split("\n")) {
    const m = line.match(/^(\w[\w_-]*)\s*:\s*(.+)$/);
    if (m) {
      let value = m[2].trim();
      // Parse array values like [a, b, c]
      if (value.startsWith("[") && value.endsWith("]")) {
        value = value
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim());
      }
      fields[m[1]] = value;
    }
  }

  return { fields, body, rawFrontmatter: raw };
}

function buildFrontmatter(originalRaw, extraFields) {
  const lines = originalRaw.split("\n");
  for (const [key, value] of Object.entries(extraFields)) {
    lines.push(`${key}: ${value}`);
  }
  return lines.join("\n");
}

async function main() {
  // Clean and create dist directory
  try {
    await rm(DIST_DIR, { recursive: true, force: true });
  } catch {
    // ignore
  }
  await mkdir(DIST_DIR, { recursive: true });

  // Find all SKILL.md files
  const skillFiles = await walk(REPO_ROOT);
  const seen = new Map(); // name -> source_path
  const index = [];

  for (const skillFile of skillFiles) {
    const content = await readFile(skillFile, "utf-8");
    const { fields, body, rawFrontmatter } = parseFrontmatter(content);

    if (!fields.name) {
      console.error(`WARNING: No name field in ${relative(REPO_ROOT, skillFile)}`);
      continue;
    }

    const skillDir = dirname(skillFile);
    const sourcePath = relative(REPO_ROOT, skillDir);
    const parts = sourcePath.split("/");
    const skillClass = parts[0] || "";
    const subclass = parts[1] || "";

    // Check for naming collisions
    if (seen.has(fields.name)) {
      console.error(
        `ERROR: Naming collision for "${fields.name}": ` +
          `"${seen.get(fields.name)}" and "${sourcePath}"`
      );
      process.exit(1);
    }
    seen.set(fields.name, sourcePath);

    // Build modified content with injected frontmatter fields
    const newFrontmatter = buildFrontmatter(rawFrontmatter, {
      source_path: sourcePath,
      class: skillClass,
      subclass: subclass,
    });
    const outputContent = `---\n${newFrontmatter}\n---\n${body}`;
    const outputFile = join(DIST_DIR, `${fields.name}.md`);
    await writeFile(outputFile, outputContent);

    // Collect metadata for index
    index.push({
      name: fields.name,
      description: fields.description || "",
      category: fields.category || "",
      tags: Array.isArray(fields.tags) ? fields.tags : [],
      source_path: sourcePath,
      class: skillClass,
      subclass: subclass,
    });
  }

  // Copy VERSION file
  const versionSrc = join(REPO_ROOT, "site", "public", "VERSION");
  try {
    await cp(versionSrc, join(DIST_DIR, "VERSION"));
  } catch (err) {
    console.error(`WARNING: Could not copy VERSION file: ${err.message}`);
  }

  // Generate skills.json index
  index.sort((a, b) => a.name.localeCompare(b.name));
  await writeFile(join(DIST_DIR, "skills.json"), JSON.stringify(index, null, 2) + "\n");

  console.log(`Flattened ${index.length} skills to dist/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
