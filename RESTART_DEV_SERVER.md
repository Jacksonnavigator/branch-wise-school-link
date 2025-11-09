# Fix: useState is not defined

## Solution

The error "useState is not defined" is likely a Vite caching issue. Follow these steps:

### Step 1: Stop the Dev Server
Press `Ctrl+C` in the terminal where the dev server is running

### Step 2: Clear Vite Cache
```bash
# Windows PowerShell
Remove-Item -Path .vite -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path node_modules\.vite -Recurse -Force -ErrorAction SilentlyContinue

# Or manually delete:
# - .vite folder (if exists)
# - node_modules/.vite folder (if exists)
```

### Step 3: Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

### Step 4: Restart Dev Server
```bash
npm run dev
```

### Step 5: If Still Not Working

1. **Check if React is installed:**
   ```bash
   npm list react react-dom
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Verify the import:**
   The file `src/contexts/AuthContext.tsx` should have:
   ```typescript
   import React, { createContext, useContext, useState, useEffect } from 'react';
   ```

4. **Check browser console:**
   - Open DevTools (F12)
   - Check for any module resolution errors
   - Check for any React-related errors

## Common Causes

1. **Vite cache corruption** - Fixed by clearing cache
2. **Hot module reload issue** - Fixed by restarting server
3. **Browser cache** - Fixed by hard refresh
4. **Module resolution issue** - Check tsconfig.json and vite.config.ts

## Verification

After restarting, the app should:
- Load without errors
- Show the login/auth page
- Not show "useState is not defined" error

