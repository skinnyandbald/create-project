# Phase 4.2: End-to-End Verification

> **Depends on:** Phase 4.1

**Goal:** Scaffold a real project, verify it compiles, builds, and runs. Fix any issues.

**Spec:** `docs/superpowers/specs/2026-03-24-scaffold-modernization-design.md` → "Verification Plan"

---

## Steps

- [ ] **4.2.1** Scaffold test project:
```bash
cd /tmp && scaffold test-nextjs-verify --type=nextjs
```

- [ ] **4.2.2** Verify file tree — spot-check key files exist:
```bash
ls /tmp/test-nextjs-verify/{proxy.ts,next.config.ts,tsconfig.json,biome.json,package.json,.gitignore,.env.example}
ls /tmp/test-nextjs-verify/src/app/{layout.tsx,page.tsx,globals.css}
ls /tmp/test-nextjs-verify/src/server/trpc/{init.ts,router.ts}
ls /tmp/test-nextjs-verify/src/lib/supabase/{server.ts,browser.ts}
ls /tmp/test-nextjs-verify/.claude/{CLAUDE.md,settings.json}
```

- [ ] **4.2.3** Verify no placeholders remain:
```bash
grep -r '{{PROJECT_NAME}}' /tmp/test-nextjs-verify/ && echo "FAIL: placeholders remain" || echo "OK: no placeholders"
```

- [ ] **4.2.4** Install:
```bash
cd /tmp/test-nextjs-verify && pnpm install
```

- [ ] **4.2.5** Typecheck:
```bash
pnpm typecheck
```

- [ ] **4.2.6** Lint:
```bash
pnpm lint
```

- [ ] **4.2.7** Run tests:
```bash
pnpm test
```

- [ ] **4.2.8** Build:
```bash
pnpm build
```

- [ ] **4.2.9** Dev server + browser verify:
```bash
pnpm dev &
DEV_PID=$!
sleep 5
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
agent-browser screenshot --annotate
agent-browser snapshot -i
agent-browser close
kill $DEV_PID 2>/dev/null
pkill -P $DEV_PID 2>/dev/null || true
```

- [ ] **4.2.10** Fix any issues found, re-run failing steps, commit fixes

- [ ] **4.2.11** Clean up: `rm -rf /tmp/test-nextjs-verify`
