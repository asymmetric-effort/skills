export function renderGettingStarted(): string {
  return `<div class="getting-started-screen">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="#/" class="breadcrumb-link">Home</a>
      <span class="breadcrumb-sep"> / </span>
      <span class="breadcrumb-current">Getting Started</span>
    </nav>

    <h1>Onboarding a New Project</h1>
    <p class="skill-description">Add shared Claude Code skills to any project in three steps.</p>

    <section class="skill-section">
      <h2>Prerequisites</h2>
      <ul>
        <li>Git with submodule support</li>
        <li><a href="https://claude.ai/claude-code">Claude Code</a> CLI, desktop app, web app, or IDE extension</li>
        <li>SSH access to <code>github.com:asymmetric-effort</code> (for private repos)</li>
      </ul>
    </section>

    <section class="skill-section">
      <h2>Step 1: Add the Submodule</h2>
      <p>From your project's root directory, add the <code>release</code> branch as a git submodule:</p>
      <pre><code>git submodule add -b release git@github.com:asymmetric-effort/skills.git .claude/skills
git commit -m "chore: add shared skills submodule"
git push</code></pre>
      <p>This clones the <strong>release branch</strong> (the published artifact) into <code>.claude/skills/</code>. Never reference the <code>main</code> branch directly &mdash; it contains the source tree, not the consumable format.</p>
    </section>

    <section class="skill-section">
      <h2>Step 2: Verify the Structure</h2>
      <p>After adding the submodule, you should see a directory per skill:</p>
      <pre><code>your-project/
  .claude/
    skills/
      commit/
        SKILL.md          &larr; Claude Code discovers this
      push-changes/
        SKILL.md
      pentest/
        SKILL.md
      review-pr/
        SKILL.md
      ...
      skills.json         &larr; Metadata index
      VERSION             &larr; Current version</code></pre>
      <p>Each skill is a directory containing a <code>SKILL.md</code> file. This is the exact format Claude Code expects for automatic slash-command discovery.</p>
    </section>

    <section class="skill-section">
      <h2>Step 3: Verify Claude Code Discovers the Skills</h2>
      <p>Start (or restart) Claude Code in your project directory. Type <code>/</code> and you should see the shared skills in the autocomplete menu. Try:</p>
      <pre><code>/push-changes
/commit
/pentest
/review-pr</code></pre>
      <p>Claude reads the <code>SKILL.md</code> file and follows the instructions within it.</p>
    </section>

    <section class="skill-section">
      <h2>Team Cloning</h2>
      <p>When team members clone your project, they need to initialize the submodule:</p>
      <pre><code># Option A: Clone with submodules in one step
git clone --recurse-submodules git@github.com:asymmetric-effort/your-project.git

# Option B: Initialize after cloning
git submodule init
git submodule update</code></pre>
    </section>

    <section class="skill-section">
      <h2>Keeping Skills Updated</h2>
      <p>Pull the latest published skills:</p>
      <pre><code>cd .claude/skills
git pull origin release
cd ../..
git add .claude/skills
git commit -m "chore: update skills to latest"</code></pre>
      <p>Or invoke <code>/upgrade-skills</code> from within Claude Code to automate this.</p>
    </section>

    <section class="skill-section">
      <h2>How It Works</h2>
      <table>
        <thead>
          <tr><th>Branch</th><th>Purpose</th><th>Contents</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>main</code></td>
            <td>Authoring &mdash; where skills are written</td>
            <td>Nested tree: <code>class/subclass/skill/SKILL.md</code></td>
          </tr>
          <tr>
            <td><code>release</code></td>
            <td>Consumption &mdash; what projects install</td>
            <td>Flat directories: <code>skill-name/SKILL.md</code></td>
          </tr>
        </tbody>
      </table>
      <p>A CI pipeline flattens the source tree and publishes to the <code>release</code> branch on every push to <code>main</code>. Consumer projects always reference <code>release</code>.</p>
    </section>

    <section class="skill-section">
      <h2>Troubleshooting</h2>

      <h3>Skills don't appear in Claude Code autocomplete</h3>
      <ol>
        <li><strong>Check the branch:</strong> Run <code>cd .claude/skills &amp;&amp; git branch -a</code>. You should see <code>origin/release</code>. If you're on <code>main</code>, re-add the submodule with <code>-b release</code>.</li>
        <li><strong>Check the structure:</strong> Run <code>ls .claude/skills/push-changes/</code>. You should see <code>SKILL.md</code>. If you see flat <code>.md</code> files instead of directories, pull the latest: <code>cd .claude/skills &amp;&amp; git pull origin release</code>.</li>
        <li><strong>Check the working directory:</strong> Claude Code discovers skills by walking up from your working directory. Start Claude Code from your project root (where <code>.claude/</code> lives).</li>
        <li><strong>Restart Claude Code:</strong> Skill discovery happens on session start. If you added the submodule during an active session, restart to trigger discovery.</li>
      </ol>

      <h3>Permission denied on submodule clone</h3>
      <p>Ensure SSH access: <code>ssh -T git@github.com</code></p>
      <p>For HTTPS instead of SSH:</p>
      <pre><code>git submodule set-url .claude/skills https://github.com/asymmetric-effort/skills.git
git submodule update --remote</code></pre>

      <h3>Submodule not initialized after clone</h3>
      <pre><code>git submodule init
git submodule update</code></pre>
    </section>

    <section class="skill-section">
      <h2>Requesting a New Skill</h2>
      <p><a href="https://github.com/asymmetric-effort/skills/issues/new">Open an issue</a> with the title:</p>
      <pre><code>Create reusable skill: &lt;name&gt; (&lt;short description&gt;)</code></pre>
      <p>Include a summary, scope, and acceptance criteria. Issues from authorized users are automatically resolved by Claude.</p>
    </section>
  </div>`;
}
