# Phase 4.1: Rewrite CLI scaffold Function

> **Depends on:** All Phase 1, 2, and 3 tasks

**Goal:** Replace `scaffold_t3()` in `bin/scaffold` with `scaffold_nextjs()` that uses template-copy approach.

**Spec:** `docs/superpowers/specs/2026-03-24-scaffold-modernization-design.md` → "CLI Logic"

---

## Files to modify

| File | Action |
|------|--------|
| `bin/scaffold` | **Modify** — add `scaffold_nextjs()`, update type parsing, keep `scaffold_t3()` as wrapper |

---

## Steps

- [ ] **4.1.1** Read current `bin/scaffold` to understand the full structure (argument parsing, interactive menu, type routing)

- [ ] **4.1.2** Add `scaffold_nextjs()` function implementing the spec CLI Logic:

```bash
scaffold_nextjs() {
    local project_name="$1"
    local composable="${2:-false}"
    local TARGET_DIR="$PROJECT_DIR/$project_name"

    # Safety trap
    trap '[[ -n "${TARGET_DIR:-}" ]] && [[ "$TARGET_DIR" != "/" ]] && rm -rf "$TARGET_DIR"' ERR INT TERM

    # 1. Validate
    if [ -d "$TARGET_DIR" ]; then
        print_error "Directory $TARGET_DIR already exists"
        exit 1
    fi

    # 2. Copy template
    print_step "Creating Next.js project..."
    cp -r "$SCAFFOLDS_DIR/nextjs/template" "$TARGET_DIR"

    # 3. Composable overlay
    if [ "$composable" = "true" ]; then
        print_step "Applying composable variant (Better Auth + Drizzle + Neon)..."
        cp -r "$SCAFFOLDS_DIR/nextjs/composable/." "$TARGET_DIR/"
    fi

    # 4. Claude configs
    print_step "Setting up Claude Code..."
    mkdir -p "$TARGET_DIR/.claude"
    cp -r "$SCAFFOLDS_DIR/nextjs/claude/"* "$TARGET_DIR/.claude/"
    chmod +x "$TARGET_DIR/.claude/hooks/"*.sh 2>/dev/null || true

    # 5. DevOps
    print_step "Setting up DevOps..."
    cp "$SCAFFOLDS_DIR/nextjs/devops/vercel.json" "$TARGET_DIR/"
    cp "$SCAFFOLDS_DIR/nextjs/devops/coderabbit.yaml" "$TARGET_DIR/.coderabbit.yaml"
    mkdir -p "$TARGET_DIR/.github/workflows"
    cp "$SCAFFOLDS_DIR/nextjs/devops/PULL_REQUEST_TEMPLATE.md" "$TARGET_DIR/.github/"
    cp "$SCAFFOLDS_DIR/nextjs/devops/.github/workflows/"*.yml "$TARGET_DIR/.github/workflows/"

    # 6. String replace (allowlisted extensions only)
    print_step "Configuring project name..."
    find "$TARGET_DIR" -type f \( \
        -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o \
        -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o \
        -name "*.css" -o -name ".env.example" \
    \) -exec perl -pi -e "s/{{PROJECT_NAME}}/$project_name/g" {} +

    # 7. Install
    print_step "Installing dependencies with pnpm..."
    cd "$TARGET_DIR"
    pnpm install

    # 8. Git init
    init_git "$project_name"

    # 9. Success — remove trap
    trap - ERR INT TERM
    print_success "Next.js project created at $TARGET_DIR"
}
```

- [ ] **4.1.3** Update argument parsing to accept `--type=nextjs`, `--type=t3` (alias), and `--composable` flag

- [ ] **4.1.4** Update interactive menu — replace "T3 (Next.js + TypeScript)" with "Next.js (Supabase + tRPC + Tailwind)"

- [ ] **4.1.5** Make old `scaffold_t3()` call `scaffold_nextjs()`:
```bash
scaffold_t3() {
    scaffold_nextjs "$@"
}
```

- [ ] **4.1.6** Commit: `git add bin/scaffold && git commit -m "feat: rewrite CLI for template-copy Next.js scaffold"`
