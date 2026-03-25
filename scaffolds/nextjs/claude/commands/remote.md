---
name: remote
description: Offload a task to run autonomously on Claude web
arguments:
  - name: task
    description: The task to run remotely
    required: true
---

# Remote Task Execution

You are being asked to spawn a remote Claude session to handle a task autonomously.

**Task:** $ARGUMENTS.task

## Instructions

1. Run the following command to spawn the remote session:

```bash
claude --remote "$ARGUMENTS.task" --allowedTools "Read,Edit,Write,Bash(npm:*),Bash(git:*),Bash(pnpm:*),Bash(bun:*)"
```

2. Confirm to the user that the task has been offloaded

3. Remind them they can:
   - Check progress with `/tasks`
   - Teleport back with `/tp` or `--teleport`

## Notes

- The remote session will run with pre-approved permissions for read, edit, write, and common dev commands
- It runs on Anthropic's infrastructure in an isolated VM
- The session will work on the current branch
