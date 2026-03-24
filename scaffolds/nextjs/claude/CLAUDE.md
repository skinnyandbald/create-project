# {{PROJECT_NAME}} - Claude Code Instructions

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 6 (strict mode is default)
- **Styling:** Tailwind CSS v4 (CSS-first config)
- **API:** tRPC v11
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Auth:** Supabase Auth
- **Validation:** Zod 4
- **Linting/Formatting:** Biome 2
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
- Use Zod 4 for runtime validation (both input AND output schemas)
- Always read files before modifying them
- Follow Security Practices (see Best Practices section)

### Testing
- Unit tests: `pnpm test` (Vitest)
- E2E tests: `pnpm test:e2e` (Playwright)
- Run tests before committing

### Git Workflow
- Create feature branches from `main`
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Keep commits atomic and focused

## Best Practices

### Next.js 16 Patterns

#### Async APIs
All request-time APIs are async in Next.js 16. Always `await` them:
```typescript
// Cookies
const cookieStore = await cookies();
const token = cookieStore.get('token');

// Headers
const headersList = await headers();

// Params and searchParams in page/layout components
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
}
```

#### Route Proxying
Use `proxy.ts` (not `middleware.ts`) for route proxying:
```typescript
// proxy.ts
export function proxy(request: Request) {
  return { destination: new URL('/api/handler', request.url) };
}
```

#### Cache Components
Use the `'use cache'` directive for cacheable components:
```typescript
'use cache';

export default async function CachedComponent() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### Database Patterns (Supabase)

#### Client Creation
Use the appropriate Supabase client for the context:
```typescript
// Server Component / Server Action / Route Handler
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// Client Component
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

#### Authentication
Always use `getUser()` (not `getSession()`) for auth verification:
```typescript
// Server-side auth check
const supabase = await createClient();
const { data: { user }, error } = await supabase.auth.getUser();

if (!user) {
  redirect('/login');
}
```

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

### tRPC v11 Patterns

#### Procedure Definitions
Use `inputSchema` (not `.input()`) with Standard Schema (Zod 4):
```typescript
import { z } from 'zod';

getUserById: publicProcedure
  .inputSchema(z.object({
    id: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    // ...
  }),
```

#### Procedure Types
- Use `publicProcedure` for endpoints that handle both authenticated AND unauthenticated states
- Use `protectedProcedure` only when authentication is strictly required
- Don't use protectedProcedure for "optional auth" - it throws UNAUTHORIZED errors

#### Output Validation
- Always add `.outputSchema()` for runtime validation
- Define schemas at the top of router files
- Example:
  ```typescript
  const UserPreferencesSchema = z.object({
    newsletter_opted_in: z.boolean().nullable(),
  });

  getPreferences: publicProcedure
    .outputSchema(UserPreferencesSchema)
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

### Zod 4 Patterns

#### Top-Level Validators
Zod 4 provides top-level validator functions:
```typescript
// Zod 4 style
const EmailSchema = z.email();           // not z.string().email()
const UrlSchema = z.url();               // not z.string().url()
const UuidSchema = z.uuid();             // not z.string().uuid()
const Iso8601Schema = z.iso.datetime();  // not z.string().datetime()
```

#### Error Customization
Use `{ error: }` (not `{ message: }`) for custom error messages:
```typescript
const schema = z.object({
  name: z.string({ error: 'Name is required' }),
  age: z.number({ error: 'Age must be a number' }).min(0, { error: 'Age must be positive' }),
});
```

### Tailwind v4 Patterns

#### CSS-First Configuration
Tailwind v4 uses CSS-based config. No `tailwind.config.js` file:
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #10b981;
  --font-sans: 'YourFont', system-ui, sans-serif;
  --breakpoint-3xl: 1920px;
}
```

#### Custom Utilities
Define custom utilities in CSS, not in a JS config:
```css
@utility container-narrow {
  max-width: 48rem;
  margin-inline: auto;
  padding-inline: 1rem;
}
```

### TypeScript 6 Patterns

#### tsconfig.json
- Use explicit `types` array instead of relying on automatic type detection
- Do not use `baseUrl` for path resolution; use `paths` with relative prefixes
- Strict mode is enabled by default; no need to set `"strict": true`
```json
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node", "react", "react-dom"],
    "paths": {
      "@/*": ["./src/*"]
    },
    "jsx": "preserve",
    "noEmit": true,
    "isolatedModules": true,
    "incremental": true
  }
}
```

### Biome 2 Patterns

#### Configuration
Biome 2 uses `includes` (not `include`), `linter.domains`, and `assist.actions.source`:
```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "files": {
    "includes": ["src/**/*.ts", "src/**/*.tsx"]
  },
  "linter": {
    "domains": {
      "next": "all",
      "react": "all"
    }
  },
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

### React/Frontend Patterns

#### useEffect Dependencies
- Only include external values that should trigger the effect
- Don't include state variables that the effect modifies (causes infinite loops)
- Example:
  ```typescript
  // Bad - includes email which is set inside
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email, email]);

  // Good - only depends on external trigger
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
- Use `.inputSchema()` validation in all tRPC procedures
- Validate on server side; client-side validation is for UX only
- Example:
  ```typescript
  const CreateUserInputSchema = z.object({
    email: z.email(),
    name: z.string().min(1).max(100),
  });

  createUser: protectedProcedure
    .inputSchema(CreateUserInputSchema)
    .mutation(async ({ input, ctx }) => { /* ... */ })
  ```

#### Database Security
- Use Supabase client with RLS for all database operations
- Enable Row Level Security (RLS) policies on all tables
- Use `SECURITY DEFINER` functions for system operations that bypass RLS
- Never concatenate user input into raw SQL queries
- Example:
  ```typescript
  // Supabase client respects RLS automatically
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id);
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
- Validate user sessions with `supabase.auth.getUser()` in tRPC context
- Enforce authorization at API level with `protectedProcedure`
- Check user permissions for every protected operation
- Verify resource ownership before mutations
- Example pattern:
  ```typescript
  deletePost: protectedProcedure
    .inputSchema(z.object({ postId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Fetch resource
      const { data: post } = await ctx.supabase
        .from('posts')
        .select('author_id')
        .eq('id', input.postId)
        .single();

      // Verify ownership
      if (post?.author_id !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Perform mutation
      return ctx.supabase
        .from('posts')
        .delete()
        .eq('id', input.postId);
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
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
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
├── lib/
│   ├── supabase/     # Supabase client (server.ts, client.ts)
│   └── ...           # Other utility functions
├── server/           # tRPC routers and server code
└── styles/           # Global styles (globals.css with @theme)
```

## Commands

```bash
pnpm dev             # Start development server
pnpm build           # Build for production
pnpm test            # Run unit tests
pnpm test:e2e        # Run E2E tests
pnpm lint            # Lint code (Biome)
pnpm type-check      # TypeScript check
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

Never commit secrets to the repository.
