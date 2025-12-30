# JSDoc Enforcement

Adds JSDoc documentation enforcement alongside Biome.

## Setup

```bash
npm install -D eslint eslint-plugin-jsdoc @typescript-eslint/parser
```

Copy `eslint.config.mjs` to your project root.

Add to `package.json`:

```json
{
  "scripts": {
    "lint:docs": "eslint --max-warnings 0",
    "lint:docs:fix": "eslint --fix"
  }
}
```

## How It Works

| Tool | Purpose |
|------|---------|
| Biome | Formatting, general linting, `useSingleJsDocAsterisk` |
| ESLint + eslint-plugin-jsdoc | Enforce documentation presence |
| TypeScript (`checkJs: true`) | Validate JSDoc types match code |

## Severity Levels

| Location | Severity | Rationale |
|----------|----------|-----------|
| `src/server/**/*.ts` | **error** | Server code must be documented |
| `src/app/api/**/*.ts` | **error** | API routes must be documented |
| `src/**/*.{ts,tsx}` | **warn** | Gradual adoption for other code |

## Example JSDoc

```typescript
/**
 * User management router.
 * Handles preferences, usage tracking, and account operations.
 * @module server/api/routers/user
 */

/**
 * Schema for user preferences.
 */
const UserPreferencesSchema = z.object({ ... });

/**
 * Router for user account operations.
 */
export const userRouter = createTRPCRouter({ ... });
```

## CI Integration

```yaml
- name: Docs Compliance
  run: npm run lint:docs
```
