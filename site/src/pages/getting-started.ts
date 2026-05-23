export function renderGettingStarted(): string {
  return `<div class="getting-started-screen">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="#/" class="breadcrumb-link">Home</a>
      <span class="breadcrumb-sep"> / </span>
      <span class="breadcrumb-current">Getting Started</span>
    </nav>

    <h1>Onboarding a New Project</h1>
    <p class="skill-description">Add shared Claude Code skills to any project using the install script.</p>

    <section class="skill-section">
      <h2>Prerequisites</h2>
      <ul>
        <li>Git</li>
        <li><a href="https://claude.ai/claude-code">Claude Code</a> CLI, desktop app, web app, or IDE extension</li>
        <li><code>curl</code> and <code>tar</code> (included on most systems)</li>
      </ul>
    </section>

    <section class="skill-section">
      <h2>Step 1: Install Skills</h2>
      <p>From your project's root directory, run the install script:</p>
      <pre><code># One-liner: download and install the latest skills release
curl -fsSL https://raw.githubusercontent.com/asymmetric-effort/skills/main/install.sh | bash</code></pre>
      <p>Or, if your project has a Makefile with the recommended target (see <a href="#makefile-integration">Makefile Integration</a> below):</p>
      <pre><code>make install-skills</code></pre>
      <p>This downloads the latest release tarball from GitHub Releases and extracts it into <code>.claude/skills/</code>. No submodules required.</p>
    </section>

    <section class="skill-section">
      <h2>Step 2: Verify the Structure</h2>
      <p>After running the install script, you should see a directory per skill:</p>
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
      <h2>Step 4: CI Setup</h2>
      <p>Install skills as part of your CI pipeline so they are available during automated Claude Code sessions. Add a step to your GitHub Actions workflow:</p>
      <pre><code>jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Claude Code skills
        run: curl -fsSL https://raw.githubusercontent.com/asymmetric-effort/skills/main/install.sh | bash

      # ... rest of your pipeline</code></pre>
      <p>To pin a specific version in CI, set the <code>SKILLS_VERSION</code> environment variable:</p>
      <pre><code>      - name: Install Claude Code skills
        run: curl -fsSL https://raw.githubusercontent.com/asymmetric-effort/skills/main/install.sh | bash
        env:
          SKILLS_VERSION: v0.0.42</code></pre>
    </section>

    <section class="skill-section">
      <h2>Step 5: Keeping Skills Updated</h2>
      <p>To update to the latest skills release, simply re-run the install script:</p>
      <pre><code># Re-run the install script to get the latest release
curl -fsSL https://raw.githubusercontent.com/asymmetric-effort/skills/main/install.sh | bash</code></pre>
      <p>Or use the Makefile target:</p>
      <pre><code>make install-skills</code></pre>
      <p>Since <code>.claude/skills/</code> is gitignored (see <a href="#gitignore-note">.gitignore note</a> below), there is no commit needed &mdash; each developer and CI run fetches skills independently.</p>
      <p>You can also invoke <code>/upgrade-skills</code> from within Claude Code to automate this.</p>
    </section>

    <section class="skill-section">
      <h2>How It Works</h2>
      <p>Skills are published as release tarballs on GitHub Releases. The <code>install.sh</code> script downloads the appropriate tarball and extracts it into your project.</p>
      <table>
        <thead>
          <tr><th>Branch</th><th>Purpose</th><th>Contents</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>main</code></td>
            <td>Authoring &mdash; where skills are written</td>
            <td>Nested tree: <code>class/subclass/skill/SKILL.md</code>, plus <code>install.sh</code></td>
          </tr>
          <tr>
            <td><code>release</code></td>
            <td>Release artifacts &mdash; tarballs attached to tags</td>
            <td>Flat directories: <code>skill-name/SKILL.md</code>, packaged as tarballs</td>
          </tr>
        </tbody>
      </table>
      <p>A CI pipeline flattens the source tree, creates a release tarball, and publishes it to GitHub Releases on every push to <code>main</code>. The <code>install.sh</code> script fetches the latest (or pinned) release and extracts it to <code>.claude/skills/</code>.</p>
    </section>

    <section class="skill-section" id="makefile-integration">
      <h2>Makefile Integration</h2>
      <p>Add this target to your project's <code>Makefile</code> so team members can install skills with a single command:</p>
      <pre><code>SKILLS_VERSION ?= latest

.PHONY: install-skills
install-skills:
\t@echo "Installing Claude Code skills..."
\tSKILLS_VERSION=$(SKILLS_VERSION) curl -fsSL \\
\t  https://raw.githubusercontent.com/asymmetric-effort/skills/main/install.sh | bash
\t@echo "Skills installed to .claude/skills/"</code></pre>
      <p>Usage:</p>
      <pre><code># Install latest
make install-skills

# Install a specific version
make install-skills SKILLS_VERSION=v0.0.42</code></pre>
    </section>

    <section class="skill-section" id="gitignore-note">
      <h2>.gitignore</h2>
      <p>Since skills are installed artifacts (not source code), add them to your <code>.gitignore</code>:</p>
      <pre><code># Installed Claude Code skills (fetched via install.sh)
.claude/skills/</code></pre>
      <p>This keeps your repository clean and avoids committing downloaded artifacts. Each developer and CI run fetches skills independently via the install script.</p>
    </section>

    <section class="skill-section">
      <h2>Environment Variables</h2>
      <p>The install script respects the following environment variables:</p>
      <table>
        <thead>
          <tr><th>Variable</th><th>Default</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>SKILLS_VERSION</code></td>
            <td><code>latest</code></td>
            <td>The release version to install (e.g., <code>v0.0.42</code>). Set to <code>latest</code> to fetch the most recent release.</td>
          </tr>
          <tr>
            <td><code>SKILLS_DIR</code></td>
            <td><code>.claude/skills</code></td>
            <td>The directory where skills are extracted. Override this to install skills to a custom location.</td>
          </tr>
        </tbody>
      </table>
      <p>Example:</p>
      <pre><code># Install a specific version to a custom directory
SKILLS_VERSION=v0.0.42 SKILLS_DIR=./my-skills curl -fsSL \\
  https://raw.githubusercontent.com/asymmetric-effort/skills/main/install.sh | bash</code></pre>
    </section>

    <section class="skill-section">
      <h2>Troubleshooting</h2>

      <h3>Skills don't appear in Claude Code autocomplete</h3>
      <ol>
        <li><strong>Check the structure:</strong> Run <code>ls .claude/skills/push-changes/</code>. You should see <code>SKILL.md</code>. If the directory is missing or empty, re-run the install script.</li>
        <li><strong>Check the working directory:</strong> Claude Code discovers skills by walking up from your working directory. Start Claude Code from your project root (where <code>.claude/</code> lives).</li>
        <li><strong>Restart Claude Code:</strong> Skill discovery happens on session start. If you installed skills during an active session, restart to trigger discovery.</li>
      </ol>

      <h3>Install script fails to download</h3>
      <ol>
        <li><strong>Check network access:</strong> Ensure you can reach <code>github.com</code>: <code>curl -I https://github.com</code></li>
        <li><strong>Check the version:</strong> If you pinned <code>SKILLS_VERSION</code>, verify the tag exists: <code>gh release view &lt;version&gt; --repo asymmetric-effort/skills</code></li>
        <li><strong>Permissions:</strong> Ensure you have write access to the target directory (<code>.claude/skills/</code> by default).</li>
      </ol>

      <h3>Install script extracts wrong structure</h3>
      <p>If you see flat <code>.md</code> files instead of directories, you may have an outdated release. Update to the latest:</p>
      <pre><code>rm -rf .claude/skills
curl -fsSL https://raw.githubusercontent.com/asymmetric-effort/skills/main/install.sh | bash</code></pre>

      <h3>Stale skills after update</h3>
      <p>The install script removes the existing <code>.claude/skills/</code> directory before extracting. If skills appear stale, delete the directory manually and re-run:</p>
      <pre><code>rm -rf .claude/skills
make install-skills</code></pre>
    </section>

    <section class="skill-section">
      <h2>Requesting a New Skill</h2>
      <p><a href="https://github.com/asymmetric-effort/skills/issues/new">Open an issue</a> with the title:</p>
      <pre><code>Create reusable skill: &lt;name&gt; (&lt;short description&gt;)</code></pre>
      <p>Include a summary, scope, and acceptance criteria. Issues from authorized users are automatically resolved by Claude.</p>
    </section>
  </div>`;
}
