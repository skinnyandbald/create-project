# Claude 4 Best Practices - CLAUDE.md Additions

Add these sections to your project's CLAUDE.md file.

---

## Claude 4 Interaction Patterns

### Action vs. Suggestion Mode

Claude 4 follows instructions precisely. Be explicit about intent:

```
# Suggestions only (Claude will NOT edit):
"Can you suggest some changes to improve this function?"

# Take action (Claude WILL edit):
"Change this function to improve its performance."
"Make these edits to the authentication flow."
```

### Request Complete Implementations

Claude 4 won't "go above and beyond" unless asked:

```
# Less effective:
"Create an analytics dashboard"

# More effective:
"Create an analytics dashboard. Include as many relevant features
and interactions as possible. Go beyond the basics to create
a fully-featured implementation."
```

### Provide Context for Instructions

Explain WHY an instruction matters for better results:

```
# Less effective:
"NEVER use ellipses"

# More effective:
"Your response will be read aloud by text-to-speech,
so never use ellipses since TTS can't pronounce them."
```

---

## Agentic Behavior Guidelines

### Default to Action

By default, implement changes rather than only suggesting them. If the user's intent is unclear, infer the most useful action and proceed, using tools to discover missing details instead of guessing.

### Code Exploration Before Editing

ALWAYS read and understand relevant files before proposing code edits:
- Do not speculate about code you have not inspected
- If a specific file/path is referenced, open and inspect it first
- Be rigorous and persistent in searching code for key facts
- Review style, conventions, and abstractions before implementing

### Minimize Over-Engineering

Only make changes that are directly requested or clearly necessary. Keep solutions simple:
- Don't add features beyond what was asked
- Don't add error handling for scenarios that can't happen
- Don't create helpers/utilities for one-time operations
- Don't design for hypothetical future requirements
- Reuse existing abstractions; follow DRY principle

### Avoid Test-Focused Solutions

Write general-purpose solutions using standard tools:
- Do not hard-code values for specific test inputs
- Implement actual logic that solves the problem generally
- If tests are incorrect, inform the user rather than working around them

---

## Long-Horizon Task Management

### State Tracking Files

For complex, multi-step tasks, maintain structured state:

```json
// tests.json - Structured test tracking
{
  "tests": [
    {"id": 1, "name": "auth_flow", "status": "passing"},
    {"id": 2, "name": "user_mgmt", "status": "failing"}
  ],
  "passing": 150,
  "failing": 25
}
```

```text
// progress.txt - Freeform progress notes
Session 3 progress:
- Fixed authentication token validation
- Updated user model edge cases
- Next: investigate user_mgmt test failures
```

### Git for State Persistence

Use git commits as checkpoints:
- Commit working states before major changes
- Use commit messages to track progress
- Review git log to understand session history

### Context Window Management

Work efficiently within context limits:
- Plan work clearly for long tasks
- Complete components fully before moving on
- Don't artificially stop tasks early due to context concerns
- Save progress/state before context refreshes

---

## Output Formatting Control

### Reduce Markdown Overuse

For prose-focused responses, guide formatting explicitly:

```
Write in clear, flowing prose using complete paragraphs.
Use standard paragraph breaks for organization.
Reserve markdown for `inline code`, code blocks, and simple headings.
Avoid **bold**, *italics*, and bullet lists unless truly discrete items.
```

### Request Progress Updates

Claude 4 may skip verbal summaries after tool calls. If you want updates:

```
After completing a task involving tool use,
provide a quick summary of the work done.
```

---

## Parallel Tool Execution

Claude 4 excels at parallel operations. Maximize efficiency:

```
If calling multiple tools with no dependencies between them,
make all independent calls in parallel. Maximize use of
parallel tool calls where possible. However, if calls depend
on previous results, call them sequentially.
Never guess missing parameters.
```

---

## Research and Investigation

For complex research tasks:

1. **Define success criteria** - What constitutes a complete answer?
2. **Verify across sources** - Cross-reference information
3. **Track hypotheses** - Develop competing theories, note confidence levels
4. **Self-critique** - Regularly evaluate approach and findings
