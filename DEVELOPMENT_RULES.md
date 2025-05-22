# 🚨 CRITICAL DEVELOPMENT RULES

## ⛔ NEVER MODIFY PACKAGE.JSON WITHOUT EXPLICIT PERMISSION

### 🚫 **FORBIDDEN ACTIONS:**
- **NEVER remove any existing packages** from `package.json`
- **NEVER overwrite the entire `package.json` file**
- **NEVER change existing package versions** without permission
- **NEVER remove or modify existing npm scripts**

### ✅ **ALLOWED ACTIONS (with caution):**
- **Add new packages** - Only if explicitly requested or clearly needed for the task
- **Add new scripts** - By appending to existing scripts section
- **Update package versions** - Only if explicitly requested for security/compatibility

## 📋 **SAFE MODIFICATION PROCESS:**

### **Before touching package.json:**
1. **ASK PERMISSION** - "Can I add package X for feature Y?"
2. **READ the current file** - Understand what's already there
3. **Make minimal changes** - Only add what's needed
4. **Verify nothing is removed** - Double-check the diff

### **When adding packages:**
```bash
# ✅ CORRECT: Add specific packages
npm install new-package

# ❌ WRONG: Overwriting package.json
# Never manually rewrite the entire file
```

### **When adding scripts:**
```json
// ✅ CORRECT: Add to existing scripts
"scripts": {
  "existing-script": "...",
  "new-script": "new command"
}

// ❌ WRONG: Replacing entire scripts section
```

## 🔒 **CRITICAL PACKAGES - NEVER TOUCH:**

### **Authentication & Security:**
- `bcrypt`, `bcryptjs` - Password hashing
- `nuxt-auth-utils` - Authentication system
- `zod` - Validation schemas

### **Database & Storage:**
- `drizzle-orm`, `drizzle-kit` - Database ORM
- `postgres`, `pg` - Database connections
- `@supabase/supabase-js` - Storage and auth

### **Email & Communication:**
- `resend` - Email service
- Any email-related packages

### **Core Framework:**
- `nuxt` - Framework core
- `vue` - Vue.js core
- `typescript` - Type system

### **UI & Forms:**
- `reka-ui`, `shadcn-nuxt` - UI components
- `vee-validate` - Form validation
- `tailwindcss` - Styling

## 🚨 **INCIDENT PREVENTION:**

### **Before ANY file modification:**
1. **Read the existing file completely**
2. **Understand what each dependency does**
3. **Ask if unsure about any package**
4. **Use git diff to review changes**
5. **Test that nothing is broken**

### **Red Flags - STOP and ASK:**
- File has many existing dependencies
- Packages related to auth, email, database
- Core framework packages
- Production dependencies
- Anything you don't recognize

## 📝 **DOCUMENTATION STANDARD:**

When making any package changes, document:
```
## Package Changes Made:
- ✅ Added: package-name@version - Reason: needed for feature X
- ⚠️ Updated: package-name 1.0.0 → 1.1.0 - Reason: security fix
- 🚫 Removed: NEVER without explicit permission
```

## 🎯 **RECOVERY PROCESS:**

If packages are accidentally removed:
1. **Immediately notify** about the mistake
2. **Check git history** for original package.json
3. **Restore all removed packages** 
4. **Verify application still works**
5. **Document what was learned**

---

## ⚖️ **ACCOUNTABILITY:**

This rule exists because:
- **Removing auth packages** can break login/security
- **Removing email packages** can break user verification
- **Removing database packages** can break data access
- **Production systems** depend on these packages
- **Recovery takes time** and can cause downtime

**NO EXCEPTIONS** - Always ask before removing packages.