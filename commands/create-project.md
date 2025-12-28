---
description: Create a new project with opinionated defaults, Claude Code setup, and DevOps configuration
---

# Create Project

You are helping the user create a new project. Guide them through the process conversationally.

## Available Project Types

1. **T3 (Next.js)** - Full-stack TypeScript with Next.js, tRPC, Prisma, Tailwind
   - Includes: UI kit (shadcn-style), testing (Vitest, Playwright), linting
   - Deploys to: Vercel

2. **Laravel** - PHP with Inertia.js and React
   - Includes: UI kit, testing (Pest, Dusk), linting (Pint, Larastan)
   - Deploys to: Laravel Cloud

3. **Discovery** - Requirements gathering mode (no stack yet)
   - For planning before you know what tech stack to use
   - Can be upgraded to T3 or Laravel later

## Your Task

1. **Understand what they're building** - Ask about their project idea
2. **Recommend a stack** - Based on their description, suggest the best fit
3. **Gather the project name** - Simple, lowercase, hyphenated
4. **Run the scaffold command** - Use the CLI tool

## Conversation Flow

Start by asking: "What are you building?"

Based on their answer:
- If it's a web app with complex frontend → recommend T3
- If it's a PHP/Laravel shop or simpler CRUD → recommend Laravel
- If they're unsure what to build → recommend Discovery

## Running the Scaffold

Once you know the project name and type, run:

```bash
~/code/create-project/bin/scaffold <project-name> --type=<t3|laravel|discovery>
```

The script will:
- Create the project in ~/code/<project-name>
- Install dependencies
- Set up Claude Code (CLAUDE.md, commands, MCP servers)
- Set up DevOps (CodeRabbit, GitHub workflows)
- Initialize git
- Optionally create a GitHub repo

## After Scaffolding

Let the user know:
- Where the project is: `cd ~/code/<project-name>`
- Key files: CLAUDE.md, .coderabbit.yaml
- Next steps based on stack

For T3: "Run `npm run dev` to start the development server"
For Laravel: "Run `php artisan serve` and `npm run dev`"
For Discovery: "Use `/requirements-start` to begin gathering requirements"

## Upgrading Discovery Projects

If the user has a Discovery project and wants to add a stack:

```bash
~/code/create-project/bin/scaffold <project-name> --upgrade
```

This preserves the requirements/ folder while adding the full stack.
