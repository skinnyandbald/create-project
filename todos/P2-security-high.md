# P2 - High Priority Security Issues

These issues should be addressed soon.

## 1. Overly Permissive Claude Settings

**Location:** `scaffolds/*/settings.json`
**Severity:** HIGH
**Description:** The Claude settings files grant broad permissions that may expose sensitive operations. Consider principle of least privilege.

**Current:**
```json
{
  "permissions": {
    "allow": [
      "Bash(*)",
      "Read(*)",
      "Write(*)"
    ]
  }
}
```

**Recommendation:**
Review and restrict permissions to only what's needed for each stack. Consider:
- Limiting Bash to specific commands
- Restricting Write to specific directories
- Adding explicit denies for sensitive paths

---

## 2. Secret Exposure Risk

**Location:** `scaffolds/*/claudeignore`
**Severity:** HIGH
**Description:** The `.claudeignore` file should be comprehensive to prevent Claude from reading sensitive files.

**Current content may be missing:**
- `.env*`
- `*.pem`
- `*.key`
- `*_rsa`
- `credentials.json`
- `secrets.yaml`
- `.git/config` (may contain tokens)

**Recommendation:**
Expand `.claudeignore` with comprehensive patterns for secrets.

---

## 3. Unsafe sed Usage

**Location:** `bin/scaffold` - lines 148, 200, 227
**Severity:** MEDIUM
**Description:** Using `sed -i ''` is macOS-specific. On Linux, this syntax will fail or behave unexpectedly.

**Fix:**
```bash
# Cross-platform sed in-place
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/{{PROJECT_NAME}}/$project_name/g" "$file"
else
    sed -i "s/{{PROJECT_NAME}}/$project_name/g" "$file"
fi

# Or use a temp file approach:
sed "s/{{PROJECT_NAME}}/$project_name/g" "$file" > "$file.tmp" && mv "$file.tmp" "$file"
```
