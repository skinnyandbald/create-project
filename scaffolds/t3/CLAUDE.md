# {{PROJECT_NAME}} - Claude Code Instructions

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **API:** tRPC
- **Database:** {{DATABASE}} (e.g., Supabase, PlanetScale)
- **ORM:** Prisma
- **Auth:** {{AUTH_PROVIDER}} (e.g., NextAuth.js, Supabase Auth, Clerk)
- **Deployment:** Vercel

## Claude 4 Behavior Directives

<use_parallel_tool_calls>
If you intend to call multiple tools and there are no dependencies between the tool calls, make all of the independent tool calls in parallel. Prioritize calling tools simultaneously whenever the actions can be done in parallel rather than sequentially. For example, when reading 3 files, run 3 tool calls in parallel to read all 3 files into context at the same time. Maximize use of parallel tool calls where possible to increase speed and efficiency. However, if some tool calls depend on previous calls to inform dependent values like the parameters, do NOT call these tools in parallel and instead call them sequentially. Never use placeholders or guess missing parameters in tool calls.
</use_parallel_tool_calls>

<investigate_before_answering>
Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer - give grounded and hallucination-free answers.
</investigate_before_answering>

<avoid_over_engineering>
Avoid over-engineering. Only make changes that are directly requested or clearly necessary. Keep solutions simple and focused.

Don't add features, refactor code, or make "improvements" beyond what was asked. A bug fix doesn't need surrounding code cleaned up. A simple feature doesn't need extra configurability.

Don't add error handling, fallbacks, or validation for scenarios that can't happen. Trust internal code and framework guarantees. Only validate at system boundaries (user input, external APIs). Don't use backwards-compatibility shims when you can just change the code.

Don't create helpers, utilities, or abstractions for one-time operations. Don't design for hypothetical future requirements. The right amount of complexity is the minimum needed for the current task. Reuse existing abstractions where possible and follow the DRY principle.
</avoid_over_engineering>

<general_purpose_solutions>
Write high-quality, general-purpose solutions using standard tools. Do not create helper scripts or workarounds. Implement solutions that work correctly for all valid inputs, not just test cases. Do not hard-code values for specific test inputs - implement actual logic that solves the problem generally.

Focus on understanding problem requirements and implementing correct algorithms. Tests verify correctness, not define solutions. If a task is unreasonable or tests are incorrect, inform the user rather than working around them.
</general_purpose_solutions>

<cleanup>
If you create any temporary new files, scripts, or helper files for iteration, clean up these files by removing them at the end of the task.
</cleanup>

<default_to_action>
By default, implement changes rather than only suggesting them. If the user's intent is unclear, infer the most useful likely action and proceed, using tools to discover any missing details instead of guessing. Try to infer the user's intent about whether a tool call (e.g., file edit or read) is intended or not, and act accordingly.
</default_to_action>

<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight.

Focus on:
- Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.
- Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.
- Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.
- Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics.
</frontend_aesthetics>

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
- Follow Security Practices (see Best Practices section)

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

### Security Practices

#### Input Validation
- Define Zod schemas for ALL user inputs at API boundaries
- Use `.input()` validation in all tRPC procedures
- Validate on server side; client-side validation is for UX only
- Example:
  ```typescript
  const CreateUserInputSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1).max(100),
  });

  createUser: protectedProcedure
    .input(CreateUserInputSchema)
    .mutation(async ({ input, ctx }) => { /* ... */ })
  ```

#### Database Security
- Use Prisma's query builder for all database operations (automatic parameterization)
- If using Supabase: Enable Row Level Security (RLS) policies
- If using Supabase: Use `SECURITY DEFINER` functions for system operations that bypass RLS
- Never concatenate user input into raw SQL queries
- Example:
  ```typescript
  // Prisma automatically parameterizes queries
  await prisma.user.findMany({
    where: { email: userEmail }
  });
  ```

#### Output Encoding
- Render user content using React's JSX (automatic escaping)
- Use `encodeURIComponent()` for user data in URL parameters
- Example:
  ```typescript
  // React automatically escapes user input
  <div>{userInput}</div>
  <p>{post.content}</p>

  // URL encoding
  <Link href={`/search?q=${encodeURIComponent(searchQuery)}`}>
  ```

#### Authentication & Authorization
- Validate user sessions in tRPC context (specific method depends on auth provider)
- Enforce authorization at API level with `protectedProcedure`
- Check user permissions for every protected operation
- Verify resource ownership before mutations
- Example pattern:
  ```typescript
  deletePost: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Fetch resource
      const post = await ctx.db.post.findUnique({
        where: { id: input.postId }
      });

      // Verify ownership (ctx.user comes from auth provider)
      if (post.authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Perform mutation
      return ctx.db.post.delete({ where: { id: input.postId } });
    })
  ```

#### Environment Variables & Secrets
- Store secrets in `.env.local` for development (gitignored)
- Validate required environment variables at startup using Zod
- Use Vercel environment variables for production
- Example:
  ```typescript
  // env.ts
  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),
  });

  export const env = envSchema.parse(process.env);
  ```

#### Security Review Process
- Run `security-sentinel` agent before merging PRs with user input handling
- Run `data-integrity-guardian` agent for database changes
- Use security review agents especially when:
  - Handling user-generated content
  - Processing file uploads
  - Constructing dynamic queries
  - Implementing authentication/authorization
  - Modifying payment or sensitive data flows

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
