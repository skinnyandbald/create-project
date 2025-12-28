# P1 - Critical Security Issues

These issues must be fixed before the tool is used in production.

## 1. Command Injection via Project Name

**Location:** `bin/scaffold` - lines 124, 177, and throughout
**Severity:** CRITICAL
**Description:** Project names are passed directly to shell commands without sanitization. A malicious project name like `test; rm -rf /` could execute arbitrary commands.

**Fix:**
```bash
# Add input validation function
validate_project_name() {
    local name="$1"
    if [[ ! "$name" =~ ^[a-z0-9][a-z0-9-]*[a-z0-9]$ ]] && [[ ! "$name" =~ ^[a-z0-9]$ ]]; then
        print_error "Project name must be lowercase alphanumeric with hyphens only"
        print_error "Must start and end with a letter or number"
        exit 1
    fi
    if [[ ${#name} -gt 64 ]]; then
        print_error "Project name must be 64 characters or less"
        exit 1
    fi
}
```

Call this function early in `main()` after getting the project name.

---

## 2. Path Traversal Vulnerability

**Location:** `bin/scaffold` - lines 119, 172, 218
**Severity:** CRITICAL
**Description:** Project paths are constructed without validating that the final path is within `$PROJECT_DIR`. A name like `../../../etc` could write outside the intended directory.

**Fix:**
```bash
# After constructing project_path, validate it
validate_project_path() {
    local project_path="$1"
    local resolved_path

    # Resolve the path and check it starts with PROJECT_DIR
    resolved_path="$(cd "$(dirname "$project_path")" 2>/dev/null && pwd)/$(basename "$project_path")"

    if [[ "$resolved_path" != "$PROJECT_DIR/"* ]]; then
        print_error "Invalid project path - must be within $PROJECT_DIR"
        exit 1
    fi
}
```

---

## 3. Dangerous rm -rf in Upgrade Function

**Location:** `bin/scaffold` - line 269
**Severity:** CRITICAL
**Description:** `rm -rf "$project_path"` is called during upgrade without sufficient safeguards. Combined with path traversal, this could delete arbitrary directories.

**Fix:**
1. Add path validation before deletion
2. Check that the directory contains expected files (like `.claude/CLAUDE.md`)
3. Consider using `trash` or moving to a backup location instead of permanent deletion

```bash
# Before rm -rf
if [[ "$project_path" != "$PROJECT_DIR/"* ]]; then
    print_error "Safety check failed: refusing to delete directory outside PROJECT_DIR"
    exit 1
fi

if [[ ! -f "$project_path/.claude/CLAUDE.md" ]]; then
    print_error "Safety check failed: directory doesn't look like a scaffold project"
    exit 1
fi
```
