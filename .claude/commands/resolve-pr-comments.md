---
description: "[v2] Resolve PR comments with mandatory verification gate"
---

# Resolve PR Comments (v2 - With Verification Gate)

> **VERSION CHECK:** If you see this header, you are running v2 with the verification gate. If you don't see "v2" in the title, you're running the wrong command file.

---

## ⛔ STOP - READ THIS FIRST

**Multiple bots (CodeRabbit, Gemini Code Assist, etc.) use DIFFERENT formats. You MUST recognize and parse ALL of them:**

### CodeRabbit Format
| Look For | Emoji | Action |
|----------|-------|--------|
| "Actionable comments posted: N" | — | You need N items total |
| "Outside diff range comments (N)" | ⚠️ | Expand `<details>`, extract N items |
| "Nitpick comments (N)" | 🧹 | Expand `<details>`, extract N items |
| "Suggested implementation" | 🔒 | Contains code diff to apply |
| "📝 Walkthrough" | 📝 | Summary only, usually non-actionable |
| "Committable suggestion" | ‼️ | Contains ready-to-apply code block |

### Gemini Code Assist Format (CRITICAL - DIFFERENT FORMAT!)

| Look For | Priority | Action |
|----------|----------|--------|
| `![high](...high-priority.svg)` | 🔴 blocking | Fix immediately - critical issue |
| `![medium](...medium-priority.svg)` | 🟡 suggestion | Address unless conflicts |
| `![low](...low-priority.svg)` | 🟢 nitpick | Minor improvement, fix automatically |

**IMPORTANT:** Gemini does NOT provide a count summary. You must manually count all inline comments from `gemini-code-assist[bot]` author.

### Claude Bot Format (CRITICAL - DISCUSSION COMMENT, NOT INLINE!)
Claude posts a **single discussion comment** containing MULTIPLE numbered items. You MUST parse this entire body:

| Section Header | Priority | Action |
|----------------|----------|--------|
| `## 🔴 Critical Issues` | blocking | Fix immediately |
| `## ⚠️ Important Issues` | suggestion | Should address |
| `## 💡 Suggestions` | nitpick | Nice to have |
| `## 📋 Checklist` | mixed | Check each ⚠️ item |

**CRITICAL:** Claude's review is ONE comment with MANY numbered items inside (e.g., "### 1.", "### 2."). Each numbered item is a SEPARATE actionable issue. Do NOT treat the entire comment as one item!

**How to find Claude's review:**
```bash
gh api repos/$OWNER/$REPO/issues/$PR_NUM/comments --jq '.[] | select(.user.login == "claude[bot]")'
```

**FAILURE MODE:** If you skip these sections, you will miss comments. The human will have to re-run the command. This wastes time.

**MANDATORY:** After discovery, you MUST print a numbered enumeration of ALL found items (see Step 4b below). Do not proceed to classification until you've done this.

---

You are tasked with systematically discovering and resolving ALL comments, feedback, CI failures, and issues in a pull request. This includes review comments, inline code comments, general discussion comments, CI errors, and nitpicks.

**CRITICAL: This command includes a MANDATORY verification gate. You CANNOT commit or push until every comment has an explicit, documented resolution. NO EXCEPTIONS.**

## Resolution Tracking

As you work through comments, maintain a mental tracking record for each:

**Resolution Categories:**
| Category | Signals | Your Action |
|----------|---------|-------------|
| `blocking` | "must", "critical", "required", "bug", "security" | Fix immediately |
| `suggestion` | "consider", "suggest", "recommend", "should" | Fix unless conflicts |
| `nitpick` | "nit", "typo", "minor", "style" | Fix automatically |
| `question` | Ends with "?", asks for clarification | Ask human for direction |
| `non_actionable` | "LGTM", "looks good", "thanks", "approved" | Auto-acknowledge |

**Resolution Types (required for each comment):**
| Type | When Used | Evidence Required |
|------|-----------|-------------------|
| `code_fix` | Comment addressed by code change | What changed + file:line reference |
| `wont_fix` | Intentionally not addressing | One-line reason explaining why |
| `disagree` | Technical disagreement with feedback | One-line reasoning with supporting evidence |

**IMPORTANT:** Bot comments and nitpicks should be fixed automatically. Only ask the human when there's a genuine question or uncertainty.

## Phase 1: Discovery - Comprehensive Issue Retrieval

### Step 1: Identify the PR

```bash
# Get current branch's PR
gh pr view --json number,url,title,state 2>/dev/null

# If no PR on current branch, list recent PRs
gh pr list --limit 10 --json number,title,headRefName,author
```

If arguments provided like `$ARGUMENTS`, use that as the PR number or context.

### Step 2: Check CI Status and Failures

**CRITICAL: Check for CI failures FIRST - these are blocking issues.**

```bash
# Get CI check status
gh pr checks

# Get detailed check run information
PR_NUM=$(gh pr view --json number -q '.number' 2>/dev/null || echo "$ARGUMENTS")
gh pr view $PR_NUM --json statusCheckRollup --jq '.statusCheckRollup[] | select(.status != "COMPLETED" or .conclusion != "SUCCESS") | {name: .name, status: .status, conclusion: .conclusion}'
```

**If CI is failing:**
1. Identify which checks failed (lint, typecheck, tests, build)
2. Add CI failures as HIGH PRIORITY items to resolve
3. Read the CI logs to understand the specific errors

### Step 3: Gather ALL Comment Types with Permalinks

**CRITICAL: PR comments come from multiple sources. You MUST query all of them and capture permalinks:**

```bash
# Set variables for API calls
PR_NUM=$(gh pr view --json number -q '.number' 2>/dev/null || echo "$ARGUMENTS")
OWNER=$(gh repo view --json owner -q '.owner.login')
REPO=$(gh repo view --json name -q '.name')

# 1. Review comments (inline code comments on specific lines) - WITH PERMALINKS
echo "=== REVIEW COMMENTS (inline on code) ==="
gh api repos/$OWNER/$REPO/pulls/$PR_NUM/comments --jq '.[] | {
  id: .id,
  permalink: .html_url,
  author: .user.login,
  body: .body,
  path: .path,
  line: .line,
  created_at: .created_at,
  in_reply_to_id: .in_reply_to_id
}'

# 2. Review summaries (approve/request changes/comment reviews)
echo "=== REVIEW SUMMARIES ==="
gh api repos/$OWNER/$REPO/pulls/$PR_NUM/reviews --jq '.[] | {
  id: .id,
  permalink: .html_url,
  author: .user.login,
  state: .state,
  body: .body,
  submitted_at: .submitted_at
}'

# 3. General PR discussion comments
echo "=== DISCUSSION COMMENTS ==="
gh api repos/$OWNER/$REPO/issues/$PR_NUM/comments --jq '.[] | {
  id: .id,
  permalink: .html_url,
  author: .user.login,
  body: .body,
  created_at: .created_at
}'

# 4. Human-readable overview for context
echo "=== HUMAN READABLE OVERVIEW ==="
gh pr view $PR_NUM --comments

# 5. CRITICAL: Fetch unresolved inline review threads (GraphQL)
echo "=== UNRESOLVED REVIEW THREADS (inline comments) ==="
gh api graphql -f query='
  query {
    repository(owner: "'"$OWNER"'", name: "'"$REPO"'") {
      pullRequest(number: '"$PR_NUM"') {
        url
        reviewThreads(first: 100) {
          nodes {
            id
            isResolved
            isOutdated
            line
            path
            comments(first: 10) {
              nodes {
                body
                author { login }
                url
              }
            }
          }
        }
      }
    }
  }
' --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved == false) | {path: .path, line: .line, threadId: .id, comment: .comments.nodes[0].body, author: .comments.nodes[0].author.login, permalink: .comments.nodes[0].url}'
```

**CRITICAL: The GraphQL query above is MANDATORY. It fetches unresolved inline review threads that may not appear in other API calls. Always run this query to ensure you don't miss any feedback.**

### Step 4: Parse ALL Comments Within Review Bodies

**CRITICAL: Review bodies often contain MULTIPLE actionable items. You MUST parse them ALL.**

#### 4a: Parse Bot Comments (CodeRabbit, etc.)

**Bot comments use special formatting. ALWAYS expand and parse these sections:**

```markdown
# CodeRabbit format - MUST PARSE:
> [!CAUTION]
> Some comments are outside the diff and can't be posted inline...
> <details>
> <summary>⚠️ Outside diff range comments (N)</summary>
>   <details>
>   <summary>path/to/file.ts (N)</summary>
>   `line-range`: **Title of issue**
>   Description of what needs to be fixed...
>   </details>
> </details>
```

**For EACH "Outside diff range comment":**
1. Extract the file path from the `<summary>` tag
2. Extract the line number(s) from the backtick-wrapped range (e.g., `` `152-159` ``)
3. Extract the issue title (bold text after line range)
4. Extract the full description and any suggested code changes
5. Add as a SEPARATE actionable item to your todo list

**Also parse these CodeRabbit sections:**
- "Actionable comments posted: N" - count must match items you find
- "📝 Walkthrough" - may contain actionable suggestions
- Inline suggestions with `<details><summary>🔒 Suggested...</summary>` blocks

#### 4a-2: Parse Gemini Code Assist Comments

**Gemini uses a DIFFERENT format. Look for these patterns:**

```markdown
# Gemini inline comment format:
![medium](https://www.gstatic.com/codereviewagent/medium-priority.svg)

The actual feedback text follows the badge image...
```

**How to identify Gemini comments:**
1. Author is `gemini-code-assist[bot]` (REST API) or `gemini-code-assist` (GraphQL)
2. Comments start with `![priority]` image badge where priority is `high`, `medium`, or `low`
3. Comments are posted as individual inline review comments (no collapsible sections)

**Priority badge mapping:**

| Badge URL Contains | Category |
|--------------------|----------|
| `high-priority.svg` | `blocking` - must fix |
| `medium-priority.svg` | `suggestion` - should address |
| `low-priority.svg` | `nitpick` - minor improvement |

**To extract all Gemini comments, query:**
```bash
# Get count and details of all Gemini inline comments
GEMINI_COUNT=$(gh api repos/$OWNER/$REPO/pulls/$PR_NUM/comments --jq '[.[] | select(.user.login == "gemini-code-assist[bot]")] | length')
echo "Gemini comments found: $GEMINI_COUNT"

# Get full details
gh api repos/$OWNER/$REPO/pulls/$PR_NUM/comments --jq '.[] | select(.user.login == "gemini-code-assist[bot]") | {
  id: .id,
  permalink: .html_url,
  path: .path,
  line: .line,
  priority: (if (.body | test("high-priority")) then "blocking" elif (.body | test("medium-priority")) then "suggestion" else "nitpick" end),
  body: .body
}'
```

**IMPORTANT:** Gemini comments are individual inline comments, NOT embedded in a review summary. The review summary from Gemini is usually just a general overview and is non-actionable.

#### 4a-3: Parse Claude Bot Comments

**Claude posts a SINGLE discussion comment with MULTIPLE numbered items. You MUST extract each one.**

**How to identify Claude comments:**
1. Author is `claude[bot]`
2. Posted in the **discussion comments** (issues API), NOT inline review comments
3. Contains section headers with emojis: `🔴 Critical`, `⚠️ Important`, `💡 Suggestions`
4. Each item is numbered: "### 1.", "### 2.", etc.

**To extract Claude's review:**
```bash
# Fetch the Claude bot comment
CLAUDE_REVIEW=$(gh api repos/$OWNER/$REPO/issues/$PR_NUM/comments --jq '.[] | select(.user.login == "claude[bot]") | .body')

# Count critical issues (numbered items under 🔴 Critical Issues)
echo "$CLAUDE_REVIEW" | grep -E "^\s*### [0-9]+\." | wc -l
```

**Parsing Claude's review body:**

Claude organizes comments into sections. For each section, extract individual numbered items:

```markdown
## 🔴 Critical Issues
### 1. **Security: Fullstory Proxy Bypass Risk** (src/app/api/fs/[...path]/route.ts:14-67)
→ Extract as: [blocking] `src/app/api/fs/[...path]/route.ts:14-67` - "Security: Fullstory Proxy Bypass Risk"

### 2. **Security: Cookie Deletion Bypass** (src/components/cookie-consent/script-manager.ts:232-239)
→ Extract as: [blocking] `src/components/cookie-consent/script-manager.ts:232-239` - "Security: Cookie Deletion Bypass"

## ⚠️ Important Issues
### 4. **Performance: Script Loading Race Condition** (src/components/cookie-consent/script-manager.ts:162-169)
→ Extract as: [suggestion] `src/components/cookie-consent/script-manager.ts:162-169` - "Performance: Script Loading Race Condition"

## 💡 Suggestions
### 8. **Test Coverage**: No Tests for Cookie Consent System
→ Extract as: [nitpick] - "Test Coverage: No Tests for Cookie Consent System"
```

**Priority mapping from Claude sections:**

| Section | Category |
|---------|----------|
| `## 🔴 Critical Issues` | `blocking` |
| `## ⚠️ Important Issues` | `suggestion` |
| `## 💡 Suggestions` | `nitpick` |
| `## 📋 Checklist` items with ⚠️ | `suggestion` |

**IMPORTANT:** The Claude review may also contain a "Priority Fixes Before Merge" section with numbered items. These are SUMMARIES of the critical issues, NOT additional items. Do not double-count them.

#### 4b: Parse Human Review Comments

When parsing human review bodies, look for patterns like:
- Numbered lists (1. 2. 3.)
- Bullet points with file references
- Code blocks with suggested changes
- "In file X, line Y..." patterns
- Markdown headers splitting different feedback items

For each review body, extract individual actionable items:
```text
Review body might contain:
"1. In src/foo.ts line 45, consider using const instead of let
 2. The error handling in bar.ts could be improved
 3. Nit: typo in comment on line 123"

→ Extract as 3 separate items to address
```

#### 4c: Verification - Count Check

**After parsing, verify you found ALL items from EACH bot:**

**CodeRabbit Count Verification:**
```text
CodeRabbit says:                    You must have:
───────────────────────────────────────────────────
"Actionable comments posted: 5"  →  5 actionable items total
"⚠️ Outside diff range (2)"      →  2 outside-diff items
"🧹 Nitpick comments (1)"        →  1 nitpick item
```

**If your CodeRabbit count doesn't match, STOP and re-parse:**
1. Expand ALL `<details>` blocks - they contain hidden items
2. Check for nested `<details>` within `<details>`
3. Each file `<summary>` may contain multiple line-range items
4. Look for items in the CAUTION blockquote AND outside it

**Gemini Code Assist Count Verification:**
```bash
# Gemini doesn't provide a summary count, so you MUST query the API:
GEMINI_COUNT=$(gh api repos/$OWNER/$REPO/pulls/$PR_NUM/comments --jq '[.[] | select(.user.login == "gemini-code-assist[bot]")] | length')
echo "Gemini Code Assist comments found: $GEMINI_COUNT"
```

**Your enumeration MUST include ALL Gemini comments. If Gemini is present, verify:**
- You counted every `gemini-code-assist[bot]` comment
- You identified priority level (high/medium/low) for each
- You have file path and line number for each (line may be null for "outside diff range")

**Claude Bot Count Verification:**
```bash
# Claude posts a SINGLE discussion comment - count numbered items INSIDE it:
CLAUDE_BODY=$(gh api repos/$OWNER/$REPO/issues/$PR_NUM/comments --jq '.[] | select(.user.login == "claude[bot]") | .body')
if [ -n "$CLAUDE_BODY" ]; then
  CLAUDE_COUNT=$(echo "$CLAUDE_BODY" | grep -cE "^\s*### [0-9]+\.")
  echo "Claude bot issues found: $CLAUDE_COUNT"
else
  echo "Claude bot: No review comment found"
fi
```

**CRITICAL for Claude:** The numbered items (### 1., ### 2., etc.) are the actionable issues. Do NOT count:
- Section headers (## 🔴 Critical Issues)
- Checklist items (- [x] or - [⚠️])
- "Priority Fixes Before Merge" summary (these duplicate the numbered items)

### Step 4b: MANDATORY Enumeration Checkpoint

⛔ **STOP. You MUST print this enumeration before proceeding to Phase 2.**

Print a numbered list of EVERY item you found in this exact format:

```markdown
## Discovery Complete - Enumeration

**Bot comment counts (verify these!):**

| Bot | Found | Expected | Source |
|-----|-------|----------|--------|
| CodeRabbit | [N] | [N] | "Actionable comments posted: N" |
| Gemini Code Assist | [N] | [N] | API query (no summary) |
| Claude | [N] | [N] | Count `### N.` in body |
| Human reviewers | [N] | [N] | Manual count |

**Items found ([TOTAL]):**

### CodeRabbit Comments
1. [blocking] `path/to/file.ts:45` - "Comment summary..." ([@coderabbitai](permalink))
2. [suggestion] `path/to/file.ts:100-110` - "Comment summary..." ([@coderabbitai](permalink))

### Gemini Code Assist Comments
3. [suggestion] `path/to/file.ts:173` - "Comment summary..." ([@gemini-code-assist](permalink))
4. [suggestion] `path/to/file.ts:25` - "Comment summary..." ([@gemini-code-assist](permalink))

### Claude Bot Comments
5. [blocking] `src/api/route.ts:14-67` - "Security: Fullstory Proxy Bypass Risk" ([@claude](permalink))
6. [suggestion] `src/file.ts:162-169` - "Performance: Script Loading Race Condition" ([@claude](permalink))

### Human Reviews
7. [nitpick] `path/to/file.ts:200` - "Comment summary..." ([@human](permalink))
8. [non_actionable] "LGTM" ([@reviewer](permalink))

**Count verification:**
- CodeRabbit: [N] found / [N] expected ✅ Match / ❌ Mismatch
- Gemini: [N] found / [N] from API ✅ Match / ❌ Mismatch
- Claude: [N] found / [N] numbered items ✅ Match / ❌ Mismatch
- Total: [TOTAL] items
```

**If counts don't match:** Re-read the PR comments. Expand every `<details>` block. Query the API for Gemini. Do NOT proceed until counts match.

**If counts match:** Proceed to Phase 2.

---

## Phase 2: Classification - Categorize and Plan

### Step 5: Classify Each Comment

For EACH comment discovered, determine its category:

| Category | Detection Signals |
|----------|-------------------|
| `blocking` | "must", "required", "critical", "blocking", "error", "fail", "bug", "security", "breaking" |
| `suggestion` | "should", "suggest", "recommend", "improve", "consider adding", "would be better", code diff suggestions |
| `nitpick` | "nit", "minor", "style", "typo", "optional", "could", "maybe", "small thing" |
| `question` | Ends with "?", "can you explain", "why did you", "what about" |
| `non_actionable` | "LGTM", "looks good", "thanks", "approved", "nice", "great work", "+1" |

**Bot-specific classification signals:**

| Bot | Blocking | Suggestion | Nitpick |
|-----|----------|------------|---------|
| **CodeRabbit** | `🔴 Critical`, "must fix" | `🟡 Minor`, "should" | `🧹 Nitpick` |
| **Gemini** | `![high](...high-priority.svg)` | `![medium](...medium-priority.svg)` | `![low](...low-priority.svg)` |
| **Claude** | Under `## 🔴 Critical Issues` | Under `## ⚠️ Important Issues` | Under `## 💡 Suggestions` |

**IMPORTANT: Bot comments (CodeRabbit, Gemini, Claude) with code suggestions are NEVER non_actionable.**
- "Outside diff range comments" → treat as `suggestion` or `blocking`
- "Actionable comments posted: N" → all N items must be addressed
- Code diff blocks (```diff) → treat as `suggestion`, implement the change
- Gemini `![medium]` badges → treat as `suggestion`
- Claude numbered items → use their section header for priority

### Step 6: Create Structured Todo List with Categories

```markdown
Use TodoWrite to create actionable items with categories:

CRITICAL (CI Failures):
- [ ] [blocking] Fix lint error in src/components/Button.tsx:23
- [ ] [blocking] Fix type error: Property 'foo' does not exist on type 'Bar'

BLOCKING COMMENTS:
- [ ] [blocking] [@reviewer](permalink) Fix critical bug in src/api/route.ts:45
- [ ] [blocking] [@reviewer](permalink) Add missing error handling

SUGGESTIONS:
- [ ] [suggestion] [@reviewer](permalink) Improve test coverage for edge case
- [ ] [suggestion] [@reviewer](permalink) Refactor duplicate code in utils/

NITPICKS (fix automatically):
- [ ] [nitpick] [@reviewer](permalink) Fix typo "recieve" → "receive"
- [ ] [nitpick] [@bot](permalink) Add missing JSDoc comment

QUESTIONS (ask human):
- [ ] [question] [@reviewer](permalink) "Should this handle the null case?"

NON-ACTIONABLE (auto-acknowledge):
- [ ] [non_actionable] [@reviewer](permalink) "LGTM, nice work!"
```

## Phase 3: Resolution - Address Each Item with Evidence

### Step 7: Fix CI Failures First

**ALWAYS resolve CI failures before addressing comments:**

1. Run the failing checks locally to reproduce:
   ```bash
   npm run lint
   npm run type-check
   npm run test:unit
   npm run build
   ```

2. Fix each CI error systematically
3. Re-run locally to verify fixes work
4. **Record resolution:** "Fixed [error type] in [file:line]"

### Step 8: Work Through Comments by Category

**Resolution order:** blocking → suggestion → nitpick → question → non_actionable

For each comment:

1. **Read the full context**:
   - Read the file and surrounding code
   - Understand what change is being requested
   - Check if there are related comments on the same file

2. **Fix the issue** (for blocking, suggestion, nitpick):
   - Make the code change
   - **Record resolution type:** `code_fix`
   - **Record evidence:** Brief description of what changed (e.g., "Added null check in `src/api/route.ts:45`")

3. **For questions**, ask the human:
   ```
   Comment from @reviewer on src/foo.ts:45:
   "[comment text]"

   This comment asks a question. How should I respond?
   ```

4. **For non_actionable**, auto-acknowledge:
   - **Record resolution type:** `acknowledged`
   - No action needed

### Step 9: Handle "Won't Fix" and "Disagree" Cases

If you determine a comment should NOT be addressed:

**For "won't fix":**
- **Resolution type:** `wont_fix`
- **Evidence required:** Clear one-line reason (e.g., "Conflicts with project convention - we use camelCase per CLAUDE.md")

**For "disagree":**
- **Resolution type:** `disagree`
- **Evidence required:** Technical argument (e.g., "Current approach already handles this - see test at line 145")

**IMPORTANT:** You must still ask the human before marking something as `wont_fix` or `disagree`:
```
Comment from @reviewer on src/config.ts:23:
"[comment text]"

I recommend NOT addressing this because: [reason]

Should I mark this as 'won't fix' with this reasoning? (yes/no/different approach)
```

## Phase 4: Verification Gate - MANDATORY

### Step 10: Run ALL Local Checks Before Verification

**MANDATORY: Run these checks locally and fix any issues:**

```bash
# 1. Lint check (fix any errors)
echo "=== Running Lint ==="
npm run lint

# 2. Type check (fix any type errors)
echo "=== Running Type Check ==="
npm run type-check

# 3. Unit tests (fix any failures)
echo "=== Running Tests ==="
npm run test:unit

# 4. Build check (ensure it compiles)
echo "=== Running Build ==="
npm run build
```

### Step 11: Verify All Comments Resolved

**CRITICAL VERIFICATION GATE - You CANNOT proceed to commit until this passes.**

Review your resolution tracking. For EACH comment, verify:

| Check | Requirement |
|-------|-------------|
| Status | Must be `resolved` or `acknowledged` (not `pending`) |
| Resolution Type | Must have `code_fix`, `wont_fix`, `disagree`, or `acknowledged` |
| Evidence | If `code_fix`: must have what changed. If `wont_fix`/`disagree`: must have reason |

**If ANY comment fails verification:**

```markdown
## ❌ Verification Failed - Cannot Commit

The following comments have not been resolved:

### Pending Resolution (N items)
1. [@reviewer on src/api/route.ts:45](permalink)
   > "Add error handling for the null case"
   Status: pending | Missing: resolution type and evidence

2. [@reviewer on src/utils/helpers.ts:12](permalink)
   > "Consider using const here"
   Status: pending | Missing: resolution type and evidence

**Action required:** I cannot commit until all comments are resolved.
Please instruct me how to handle the remaining items:
- Fix the issue (I'll implement it)
- Mark as 'won't fix' (provide reason)
- Mark as 'disagree' (provide reasoning)
```

**HARD BLOCK: Do NOT proceed to Step 12 until all comments pass verification.**

**If ALL comments pass verification:**

```markdown
## ✅ Verification Passed - Ready to Commit

All N comments have been resolved:
- Code fixes: X
- Won't fix: Y
- Disagree: Z
- Acknowledged: W

Proceeding to commit and push...
```

### Step 12: Commit and Push

**Only after verification passes:**

```bash
# Stage changes
git add -A

# Commit with descriptive message
git commit -m "fix: address PR review feedback

- [list key changes made]
- [list CI fixes if any]"

# Push to remote
git push
```

### Step 13: Post Resolution Summary to PR

**MANDATORY: Post a comment to the PR documenting all resolutions:**

```bash
PR_NUM=$(gh pr view --json number -q '.number')

gh pr comment $PR_NUM --body "## 📋 PR Comment Resolution Summary

### ✅ Code Fixes (N items)
| Comment | Resolution |
|---------|------------|
| [@author on file:line](permalink) | Brief description of fix |
| [@author on file:line](permalink) | Brief description of fix |

### 🚫 Won't Fix (N items)
| Comment | Reason |
|---------|--------|
| [@author on file:line](permalink) | Explanation why not addressed |

### 💬 Disagree (N items)
| Comment | Reasoning |
|---------|-----------|
| [@author on file:line](permalink) | Technical argument |

### ℹ️ Acknowledged (N items)
- [@author](permalink): \"LGTM, nice work!\"

---
*Resolved by Claude Code • All N comments addressed*"
```

### Step 14: Verify CI Passes on Remote

After pushing, verify CI passes:

```bash
# Wait a moment for CI to start
sleep 10

# Check CI status
gh pr checks

# If CI still fails, investigate and fix
```

### Step 15: Mark Resolved Threads in GitHub

**CRITICAL: After fixing issues, mark the corresponding review threads as resolved using GraphQL:**

```bash
# For each thread you fixed, resolve it
# Get the thread IDs from the unresolved threads query in Step 3

# Example: Resolve a single thread
gh api graphql -f query='
  mutation {
    resolveReviewThread(input: {threadId: "THREAD_ID_HERE"}) {
      thread {
        id
        isResolved
      }
    }
  }
'

# Or batch resolve multiple threads with a script:
cat > /tmp/resolve_threads.sh << 'EOF'
#!/bin/bash
threads=(
  "THREAD_ID_1"
  "THREAD_ID_2"
  "THREAD_ID_3"
)
for thread_id in "${threads[@]}"; do
  echo "Resolving thread: $thread_id"
  gh api graphql -f query='
    mutation {
      resolveReviewThread(input: {threadId: "'"$thread_id"'"}) {
        thread {
          id
          isResolved
        }
      }
    }
  ' && echo "✅ Resolved" || echo "❌ Failed"
done
EOF
chmod +x /tmp/resolve_threads.sh
/tmp/resolve_threads.sh
```

**Only resolve threads for issues you actually fixed. Leave unaddressed threads unresolved.**

### Step 16: Final Summary

After completing all items, provide the console summary:

```markdown
## PR Comment Resolution Complete

### Resolution Breakdown:
- **Code Fixes:** X items
- **Won't Fix:** Y items
- **Disagree:** Z items
- **Acknowledged:** W items
- **Total:** N items

### Local Verification:
- [x] `npm run lint` - PASS
- [x] `npm run type-check` - PASS
- [x] `npm run test:unit` - PASS
- [x] `npm run build` - PASS

### Remote CI Status:
- [x] All checks passing

### PR Comment:
- [x] Resolution summary posted to PR
```

## Important Guidelines

1. **Verification gate is mandatory** - You CANNOT commit until every comment has explicit resolution
2. **Fix CI failures FIRST** - Nothing else matters if CI is red
3. **Run local checks BEFORE committing** - Don't rely on remote CI
4. **Fix bot comments and nitpicks automatically** - Don't ask, just do it
5. **Only ask for questions or uncertainty** - Minimize interruptions
6. **Never assume a review only has one comment** - Parse the full body for multiple items
7. **Check thread replies** - Some feedback may be in reply chains
8. **Document won't fix/disagree decisions** - Explain why with evidence
9. **Post resolution summary to PR** - Reviewers should see how their feedback was handled
10. **Include permalinks everywhere** - Every comment reference should be clickable

## Relationship to Other Commands

Recommended workflow:
1. `/resolve-pr-comments` - Address all feedback with verification (this command)
2. `/commit` - Create additional commits if needed
3. `/validate_plan` - Verify implementation is correct
4. `/describe_pr` - Update PR description if needed
