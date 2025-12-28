# {{PROJECT_NAME}} - Discovery Phase

This is a **discovery project** - we're gathering requirements before choosing a tech stack.

## Available Commands

Use these commands to gather and document requirements:

```bash
/requirements-start <description>  # Begin gathering requirements for a feature
/requirements-status               # Check progress and continue
/requirements-current              # View active requirement details
/requirements-list                 # List all requirements
/requirements-end                  # Finalize current requirement
/remind                            # Remind AI to follow the process
```

## Workflow

1. **Start**: `/requirements-start add user authentication`
2. **Answer**: 5 yes/no discovery questions
3. **Review**: AI analyzes and asks 5 expert questions
4. **Document**: Requirements spec generated in `requirements/`

## Graduating to a Stack

Once requirements are clear, upgrade this project to a full stack:

```bash
# From ~/code/
scaffold {{PROJECT_NAME}} --upgrade

# Choose T3 (Next.js) or Laravel
# Requirements folder is preserved
```

## Project Structure

```
{{PROJECT_NAME}}/
├── .claude/
│   ├── commands/         # Requirements gathering commands
│   └── CLAUDE.md         # This file
└── requirements/         # Generated requirements docs
    ├── .current-requirement
    └── YYYY-MM-DD-HHMM-name/
        ├── metadata.json
        ├── 00-initial-request.md
        ├── 01-discovery-questions.md
        └── ...
```
