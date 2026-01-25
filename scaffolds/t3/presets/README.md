# Claude 4 Presets

Configurable prompt presets based on Anthropic's official Claude 4 best practices documentation.

## Available Presets

| Preset | Use Case | Key Features |
|--------|----------|--------------|
| `coding-agent.md` | General coding projects | Parallel tools, investigate before answering, avoid over-engineering, default to action |
| `frontend-design.md` | UI/UX focused projects | Aesthetic guidelines, avoid "AI slop", creative typography/colors/motion |
| `research-analysis.md` | Research & analysis tasks | Conservative action mode, structured research, prose output (minimal markdown) |
| `long-horizon-agent.md` | Complex multi-session tasks | Context management, state tracking, test preservation |

## How to Use

### Option 1: Copy entire preset

Copy the directives from your chosen preset directly into your project's `CLAUDE.md`:

```bash
# View preset content
cat scaffolds/t3/presets/coding-agent.md

# Append to your CLAUDE.md
cat scaffolds/t3/presets/coding-agent.md >> your-project/CLAUDE.md
```

### Option 2: Mix and match

Pick individual directives from `extras/claude-4-prompts.md` to create a custom configuration.

### Option 3: Use during project creation

The `setup.sh` script can be extended to ask which preset to use:

```bash
# In setup.sh, after project name:
echo "Select preset:"
echo "1) coding-agent (default)"
echo "2) frontend-design"
echo "3) research-analysis"
echo "4) long-horizon-agent"
read -p "Choice [1]: " preset_choice
```

## Core Directives (All Presets)

These are included in all presets:

1. **`<use_parallel_tool_calls>`** - Maximize efficiency with parallel operations
2. **`<investigate_before_answering>`** - Prevent hallucinations, read code first

## Preset-Specific Directives

### Coding Agent
- `<avoid_over_engineering>` - Keep solutions minimal
- `<general_purpose_solutions>` - Don't hard-code for tests
- `<default_to_action>` - Implement rather than suggest
- `<cleanup>` - Remove temporary files

### Frontend Design
- `<frontend_aesthetics>` - Distinctive UI, avoid "AI slop"
- `<default_to_action>` - Implement rather than suggest

### Research Analysis
- `<do_not_act_before_instructions>` - Research first, act later
- `<complex_research>` - Structured hypothesis tracking
- `<avoid_excessive_markdown_and_bullet_points>` - Prose output

### Long-Horizon Agent
- `<context_management>` - Handle context limits gracefully
- `<efficient_context_usage>` - Plan for long tasks
- `<state_tracking>` - Use structured files + git
- `<test_preservation>` - Never remove tests

## Source

All directives are from: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices
