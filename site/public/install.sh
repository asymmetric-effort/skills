#!/usr/bin/env sh
set -e

# Skills Installer — Asymmetric Effort
# Downloads and installs Claude Code skills from GitHub Releases.
#
# Usage:
#   curl -fsSL https://skills.asymmetric-effort.com/install.sh | sh
#   curl -fsSL https://skills.asymmetric-effort.com/install.sh | sh -s v0.0.24
#   ./install.sh [version]
#
# Environment variables:
#   SKILLS_VERSION  — version to install (default: latest)
#   SKILLS_DIR      — install directory (default: .claude/skills)

REPO="asymmetric-effort/skills"
VERSION="${1:-${SKILLS_VERSION:-latest}}"
INSTALL_DIR="${SKILLS_DIR:-.claude/skills}"

log() { printf '  %s\n' "$1"; }
err() { printf '  ERROR: %s\n' "$1" >&2; exit 1; }

# Check dependencies
command -v curl >/dev/null 2>&1 || err "curl is required but not installed"
command -v tar >/dev/null 2>&1 || err "tar is required but not installed"

# Resolve "latest" to an actual version tag
if [ "$VERSION" = "latest" ]; then
  VERSION=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
    | grep '"tag_name"' \
    | head -1 \
    | sed 's/.*"tag_name": *"\([^"]*\)".*/\1/')
  [ -n "$VERSION" ] || err "Could not determine latest version. Check https://github.com/${REPO}/releases"
fi

# Ensure version starts with 'v'
case "$VERSION" in
  v*) ;;
  *)  VERSION="v${VERSION}" ;;
esac

TARBALL_URL="https://github.com/${REPO}/releases/download/${VERSION}/skills.tar.gz"

log "Skills installer"
log "  Version:  ${VERSION}"
log "  Target:   ${INSTALL_DIR}/"
log ""

# Clean existing installation
if [ -d "$INSTALL_DIR" ]; then
  log "Removing existing installation..."
  rm -rf "$INSTALL_DIR"
fi

# Create target directory
mkdir -p "$INSTALL_DIR"

# Download and extract
log "Downloading ${TARBALL_URL}..."
HTTP_CODE=$(curl -fsSL -w "%{http_code}" -o /tmp/skills-$$.tar.gz "$TARBALL_URL" 2>/dev/null) || true

if [ "$HTTP_CODE" != "200" ] && [ ! -s /tmp/skills-$$.tar.gz ]; then
  rm -f /tmp/skills-$$.tar.gz
  err "Failed to download ${VERSION}. Check the version exists at https://github.com/${REPO}/releases"
fi

log "Extracting to ${INSTALL_DIR}/..."
tar xzf /tmp/skills-$$.tar.gz -C "$INSTALL_DIR"
rm -f /tmp/skills-$$.tar.gz

# Verify installation
SKILL_COUNT=$(find "$INSTALL_DIR" -name "SKILL.md" -type f 2>/dev/null | wc -l | tr -d ' ')
INSTALLED_VERSION=""
if [ -f "$INSTALL_DIR/VERSION" ]; then
  INSTALLED_VERSION=$(cat "$INSTALL_DIR/VERSION")
fi

if [ "$SKILL_COUNT" -eq 0 ]; then
  err "Installation failed — no skills found in ${INSTALL_DIR}/"
fi

log ""
log "Installed ${SKILL_COUNT} skills (v${INSTALLED_VERSION:-unknown})"
log ""
log "Add to .gitignore:"
log "  echo '.claude/skills/' >> .gitignore"
log ""
log "Add to Makefile:"
log "  SKILLS_VERSION := ${VERSION}"
log "  install-skills:"
log "  	curl -fsSL https://skills.asymmetric-effort.com/install.sh | sh -s \$(SKILLS_VERSION)"
log ""
log "Start Claude Code and type / to see available skills."
