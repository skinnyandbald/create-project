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
