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
- Use Zod for runtime validation

### Testing
- Unit tests: `npm run test` (Vitest)
- E2E tests: `npm run test:e2e` (Playwright)
- Run tests before committing

### Git Workflow
- Create feature branches from `main`
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Keep commits atomic and focused

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
