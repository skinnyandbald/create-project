# {{PROJECT_NAME}} - Claude Code Instructions

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **API:** tRPC
- **Database:** Prisma ORM
- **Auth:** NextAuth.js
- **Deployment:** Vercel

## Development Workflow

### Before Coding
1. Read relevant files before making changes
2. Understand existing patterns in the codebase
3. Plan your approach for non-trivial changes

### Coding Standards
- Use TypeScript strict mode - no `any` types
- Follow existing code patterns in the project
- Write tests for new functionality
- Use Zod for runtime validation (both input AND output schemas)
- Always read files before modifying them
- Never introduce security vulnerabilities (SQL injection, XSS, etc.)

### Testing
- Unit tests: `npm run test` (Vitest)
- E2E tests: `npm run test:e2e` (Playwright)
- Run tests before committing

### Git Workflow
- Create feature branches from `main`
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Keep commits atomic and focused

## Best Practices

### Database Patterns (Supabase/PostgreSQL)

#### Row Level Security (RLS)
- All tables should have RLS enabled for security
- Use `SECURITY DEFINER` functions to bypass RLS when needed for system operations
- Example: User preferences creation requires SECURITY DEFINER to avoid FK permission issues

#### UPSERT Pattern
- Prefer `UPSERT` (INSERT ... ON CONFLICT) over `UPDATE` when row might not exist
- Always initialize ALL fields with proper defaults when creating rows
- Example:
  ```sql
  INSERT INTO user_preferences (id, field1, field2, ...)
  VALUES (user_id, default1, default2, ...)
  ON CONFLICT (id) DO UPDATE SET field1 = EXCLUDED.field1;
  ```

#### Error Handling
- Always destructure `{ data, error }` from Supabase queries
- Handle missing rows gracefully (return null, don't throw)
- Log warnings for unexpected states, errors for actual failures
- Example:
  ```typescript
  const { data, error } = await supabase.from('table').select().single();
  if (error) {
    console.warn('Row not found, will be created on first action:', error);
    return { field: null };
  }
  ```

### tRPC Patterns

#### Procedure Types
- Use `publicProcedure` for endpoints that handle both authenticated AND unauthenticated states
- Use `protectedProcedure` only when authentication is strictly required
- Don't use protectedProcedure for "optional auth" - it throws UNAUTHORIZED errors

#### Output Validation
- Always add `.output()` schemas for runtime validation
- Define schemas at the top of router files
- Example:
  ```typescript
  const UserPreferencesSchema = z.object({
    newsletter_opted_in: z.boolean().nullable(),
  });

  getPreferences: publicProcedure
    .output(UserPreferencesSchema)
    .query(async ({ ctx }) => { /* ... */ })
  ```

#### Query Invalidation
- Await `invalidate()` calls when you need the refetch to complete before proceeding
- Use in mutation `onSuccess` handlers to ensure UI updates after data changes
- Example:
  ```typescript
  onSuccess: async () => {
    await utils.user.getPreferences.invalidate(); // Wait for refetch
    // Now preferences data is updated and UI will reflect changes
  }
  ```

### React/Frontend Patterns

#### useEffect Dependencies
- Only include external values that should trigger the effect
- Don't include state variables that the effect modifies (causes infinite loops)
- Example:
  ```typescript
  // ❌ Bad - includes email which is set inside
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email, email]);

  // ✅ Good - only depends on external trigger
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);
  ```

#### Modal State Management
- Use local state for session-only dismissal (doesn't persist)
- Store permanent decisions in database
- Example:
  ```typescript
  const [dismissed, setDismissed] = useState(false); // Session-only
  const showModal = needsDecision && !dismissed;
  onOpenChange={(open) => !open && setDismissed(true)} // Allow X button
  ```

### Error Handling & Logging

#### Client-Side Errors
- Use `onError` handlers in mutations to show user-friendly messages
- Suppress expected errors (like UNAUTHORIZED on public pages) with empty onError
- Always provide actionable error messages to users

#### Server-Side Errors
- Log warnings for expected states (missing rows that will be created)
- Log errors for actual failures (validation, permissions, network)
- Include context in logs for debugging
- Example:
  ```typescript
  if (error) {
    console.warn('User preferences not found, will be created:', error);
    return defaultValue;
  }
  ```

#### Error Messages
- Server errors: Technical details for debugging
- Client toasts: User-friendly actionable messages
- Never expose sensitive data in error messages

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utility functions
├── server/           # tRPC routers and server code
└── styles/           # Global styles
```

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Lint code
npm run type-check   # TypeScript check
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

Never commit secrets to the repository.
