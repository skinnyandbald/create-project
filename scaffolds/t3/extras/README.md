# T3 Scaffold Extras

Optional configurations to enhance your T3 project.

## Linting Setup: Biome + Light ESLint

Modern linting approach using Biome for speed with targeted ESLint for Next.js-specific rules.

### Quick Setup (Next.js only)

```bash
# Install dependencies
npm install -D @biomejs/biome eslint @next/eslint-plugin-next

# Copy config files to project root
cp extras/biome.json ./biome.json
cp extras/eslint.config.mjs ./eslint.config.mjs
```

Add to `package.json`:

```json
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "lint:next": "eslint 2>&1 | { grep -v 'Definition for rule' || true; }",
    "format": "biome format --write ."
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json}": ["biome check --write --no-errors-on-unmatched"]
  }
}
```

### With JSDoc Enforcement

For projects that want documentation requirements:

```bash
# Additional dependencies
npm install -D eslint-plugin-jsdoc @typescript-eslint/parser

# Use the JSDoc-enhanced config instead
cp extras/jsdoc/eslint.config.mjs ./eslint.config.mjs
```

Add to `package.json`:

```json
{
  "scripts": {
    "lint:docs": "eslint --max-warnings 0 2>&1 | { grep -v 'Definition for rule' || true; }",
    "lint:docs:fix": "eslint --fix"
  }
}
```

## Tool Responsibilities

| Tool | Purpose |
|------|---------|
| **Biome** | Formatting, general linting, import organization |
| **ESLint (@next/eslint-plugin-next)** | Next.js Core Web Vitals, image optimization, App Router patterns |
| **ESLint (eslint-plugin-jsdoc)** | Documentation enforcement (optional) |

## Why This Setup?

1. **Speed**: Biome is 10-100x faster than ESLint for most rules
2. **Completeness**: ESLint handles Next.js-specific rules Biome doesn't support
3. **Flexibility**: JSDoc enforcement is opt-in
4. **Minimal Config**: Each tool does what it's best at

## lint-staged Integration

The `lint-staged` config runs Biome on pre-commit for fast feedback:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json}": ["biome check --write --no-errors-on-unmatched"]
  }
}
```

## CI Integration

```yaml
- name: Lint
  run: |
    npm run lint
    npm run lint:next
```

Or with docs enforcement:

```yaml
- name: Lint
  run: |
    npm run lint
    npm run lint:docs
```
