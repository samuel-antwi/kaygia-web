# Troubleshooting Guide

This document contains solutions to common issues encountered during development.

## Module Import Issues

### Cannot find module from another layer

**Problem**: When importing modules across layers (e.g., importing from `server` to `admin`), you may encounter errors like:

```
Cannot find module '~/server/utils/email' or its corresponding type declarations.
```

**Solution**: There are several approaches to resolve this:

1. **Create local copies of utilities in each layer** (preferred):

   - For utilities that are needed in multiple layers, consider creating a local copy within each layer
   - This reduces cross-layer dependencies and makes each layer more self-contained

2. **Use relative imports with correct paths**:

   - When importing from another layer, use relative paths that navigate up to the common parent
   - Example:
     ```typescript
     // From layers/admin/server/api/admin/users/[userId]/resend-verification.post.ts
     // Importing utils/email.ts from the admin layer
     import { sendVerificationEmail } from "../../../../../utils/email";
     ```

3. **Move shared utilities to the root server directory**:
   - For truly shared utilities, consider moving them to a central location
   - Example: Move commonly used utilities to `server/utils/` so they can be imported with `~/server/utils/...`

## TypeScript Path Configuration

If you encounter persistent module resolution issues, you may need to check the TypeScript configuration in `tsconfig.json`. Ensure that path aliases are properly configured:

```json
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./*"],
      "@/*": ["./*"]
    }
  }
}
```

## Layer-Specific Imports

Remember that in a multi-layered architecture:

- Code in a specific layer should ideally only depend on that layer or shared utilities
- Cross-layer dependencies should be minimized
- Consider replicating small utilities rather than creating complex dependency chains
