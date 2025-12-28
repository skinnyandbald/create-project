# P4 - Nice-to-Have Enhancements

Lower priority improvements for future consideration.

## 1. Platform Compatibility

**Description:** The script currently uses macOS-specific features:
- `sed -i ''` syntax
- Relies on specific CLI tools being installed

**Recommendation:**
- Add platform detection and adjust commands accordingly
- Add prerequisite checks at script start
- Document required dependencies in README

---

## 2. Naming Inconsistencies

**Description:** Minor naming variations between stacks:
- T3 uses `vercel.json`, Laravel has no equivalent
- Some files use `.yaml`, others use `.yml`

**Recommendation:**
Standardize file extensions and naming conventions.

---

## 3. Missing Extras Implementation

**Description:** The plan mentions optional extras (Clerk, Stripe, Loops.so, Sentry, Google Analytics) but these aren't implemented in the scaffold script.

**Options:**
1. Implement extras selection and setup
2. Remove from plan if not needed
3. Document as future enhancement

---

## 4. Verbose Mode

**Description:** Add a `--verbose` flag for debugging scaffold issues.

```bash
VERBOSE=false

# In argument parsing
--verbose)
    VERBOSE=true
    shift
    ;;

# Usage
if $VERBOSE; then
    print_step "Running: npm install ..."
fi
```

---

## 5. Dry Run Mode

**Description:** Add a `--dry-run` flag to preview what would be created without making changes.

```bash
DRY_RUN=false

# In scaffold functions
if $DRY_RUN; then
    print_step "[DRY RUN] Would create: $project_path"
    return
fi
```

---

## 6. Template Validation

**Description:** Add a command to validate that all template files exist and are properly formatted.

```bash
scaffold --validate  # Check all templates are present and valid
```
