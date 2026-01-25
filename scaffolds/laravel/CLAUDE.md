# {{PROJECT_NAME}} - Claude Code Instructions

## Tech Stack

- **Framework:** Laravel
- **Frontend:** Inertia.js + React
- **Language:** PHP 8.2+ / TypeScript
- **Styling:** Tailwind CSS
- **Database:** MySQL/PostgreSQL
- **Deployment:** Laravel Cloud

## Laravel AI Boost

This project uses Laravel AI Boost for enhanced AI assistance.
See: https://laravel.com/ai/boost

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
- Follow PSR-12 coding standards
- Use Laravel conventions and patterns
- Write tests for new functionality
- Use Form Requests for validation

### Testing
- Unit/Feature tests: `php artisan test` or `./vendor/bin/pest`
- Browser tests: `php artisan dusk`
- Run tests before committing

### Git Workflow
- Create feature branches from `main`
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Keep commits atomic and focused

## Project Structure

```
app/
├── Http/
│   ├── Controllers/    # Controllers
│   ├── Requests/       # Form validation
│   └── Middleware/     # HTTP middleware
├── Models/             # Eloquent models
├── Services/           # Business logic
└── Actions/            # Single-purpose actions

resources/
├── js/
│   ├── Components/     # React components
│   ├── Pages/          # Inertia pages
│   └── Layouts/        # Layout components
└── views/              # Blade templates (email, etc.)
```

## Commands

```bash
php artisan serve       # Start development server
npm run dev             # Start Vite dev server
php artisan test        # Run tests
./vendor/bin/pest       # Run Pest tests
./vendor/bin/pint       # Format code
./vendor/bin/phpstan    # Static analysis
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

Never commit secrets to the repository.
