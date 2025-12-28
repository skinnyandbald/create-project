# P3 - Architecture Improvements

These are non-urgent improvements for code quality.

## 1. Unused Configuration Files

**Location:** `scaffolds/*/defaults.json`, `scaffolds/config.json`
**Description:** These files are defined in the plan but never used by the scaffold script.

**Options:**
1. Remove unused files if not needed
2. Implement configuration loading to use these files
3. Document their intended purpose if for future use

---

## 2. Code Duplication Between Scaffold Functions

**Location:** `bin/scaffold` - `scaffold_t3()`, `scaffold_laravel()`
**Description:** Both functions have similar patterns for:
- Creating directories
- Copying Claude setup files
- Setting up DevOps
- Running sed substitutions

**Recommendation:**
Extract common functionality into helper functions:
```bash
setup_claude() {
    local project_path="$1"
    local stack="$2"

    mkdir -p "$project_path/.claude/commands"
    cp "$SCAFFOLDS_DIR/$stack/CLAUDE.md" "$project_path/CLAUDE.md"
    # ... etc
}

setup_devops() {
    local project_path="$1"
    local stack="$2"

    mkdir -p "$project_path/.github/workflows"
    cp "$SCAFFOLDS_DIR/$stack/devops/coderabbit.yaml" "$project_path/.coderabbit.yaml"
    # ... etc
}
```

---

## 3. Error Handling Gaps

**Location:** `bin/scaffold` - throughout
**Description:** Several commands could fail silently:
- `npx create-t3-app` failure
- `composer create-project` failure
- `npm install` failure
- `gh repo create` failure

**Recommendation:**
Add explicit error checking after critical commands:
```bash
npx create-t3-app@latest "$project_name" ... || {
    print_error "Failed to create T3 project"
    exit 1
}
```

---

## 4. Discovery Project CLAUDE.md Location

**Location:** `bin/scaffold` - `scaffold_discovery()` lines 226-230
**Description:** Discovery projects put CLAUDE.md in `.claude/CLAUDE.md` with a symlink at root, while T3/Laravel put it directly at root. This inconsistency could cause confusion.

**Recommendation:**
Standardize on one approach:
- Either all projects have CLAUDE.md at root (simpler)
- Or all projects have it in .claude/ with symlink (more organized)

---

## 5. Missing cleanup on failure

**Location:** `bin/scaffold` - scaffold functions
**Description:** If scaffolding fails partway through, a partial project directory is left behind.

**Recommendation:**
Add trap for cleanup:
```bash
cleanup() {
    if [[ -n "$CLEANUP_PATH" ]] && [[ -d "$CLEANUP_PATH" ]]; then
        rm -rf "$CLEANUP_PATH"
    fi
}
trap cleanup EXIT

# Set CLEANUP_PATH at start of scaffolding
# Unset it on success
```
