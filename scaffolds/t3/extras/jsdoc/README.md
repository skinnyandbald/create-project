# JSDoc Enforcement

Adds JSDoc documentation requirements to the Biome + ESLint setup.

## Setup

See [../README.md](../README.md) for full instructions.

```bash
npm install -D eslint eslint-plugin-jsdoc @typescript-eslint/parser @next/eslint-plugin-next
```

Copy `eslint.config.mjs` to your project root (replaces the base Next.js-only config).

## Severity Levels

| Location | Severity | Rationale |
|----------|----------|-----------|
| `src/app/api/**/*.ts` | **warn** | API routes should be documented |
| `src/lib/**/*.ts` | **warn** | Library code should be documented |
| `src/server/**/*.ts` | **warn** | Server code should be documented |
| `src/**/*.{ts,tsx}` | **warn** | Gradual adoption for other code |

## Example JSDoc

```typescript
/**
 * User management router.
 * Handles preferences, usage tracking, and account operations.
 */
export const userRouter = createTRPCRouter({
  /**
   * Get user preferences from database.
   * Returns null for new users who haven't set preferences.
   */
  getPreferences: publicProcedure
    .output(UserPreferencesSchema)
    .query(async ({ ctx }) => { /* ... */ }),
});

/**
 * Schema for user preferences output.
 */
const UserPreferencesSchema = z.object({
  newsletter_opted_in: z.boolean().nullable(),
});
```

## TypeScript Integration

JSDoc types are validated against TypeScript - no need for `@param` or `@returns` type annotations. Just write descriptions:

```typescript
/**
 * Calculate total price including tax.
 * Rounds to 2 decimal places.
 */
function calculateTotal(price: number, taxRate: number): number {
  return Math.round((price * (1 + taxRate)) * 100) / 100;
}
```
