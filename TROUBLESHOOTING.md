# Troubleshooting Guide

## Current Error: "Something went wrong" Error Boundary

The app is showing an error boundary, which means an error occurred during React rendering or in a React component.

### Step 1: Check Browser Console

1. **Open Browser Developer Tools** (F12 or Right-click > Inspect)
2. **Go to Console tab**
3. **Look for error messages** - They will tell us what's failing

### Step 2: Check Error Details in UI

1. **Click on "► Error details (development only)"** in the error page
2. **Copy the error message** - This will show the exact error

### Step 3: Common Issues and Solutions

#### Issue 1: Firebase Initialization Error
**Symptoms:** Error about Firebase initialization or missing config
**Solution:** 
- Check if `.env` file has Firebase credentials
- Verify Firebase project is active
- Check browser console for Firebase errors

#### Issue 2: Firestore Permission Error
**Symptoms:** Permission denied errors when accessing Firestore
**Solution:**
- Firestore rules need to be deployed
- Rules might be too restrictive
- Check Firebase Console > Firestore > Rules

#### Issue 3: Auth Context Error
**Symptoms:** "useAuth must be used within AuthProvider" error
**Solution:**
- Check that AuthProvider wraps the app correctly
- Verify AuthContext is imported correctly

#### Issue 4: Hot Reload Issue
**Symptoms:** App works initially, then breaks after code changes
**Solution:**
- Hard refresh the browser (Ctrl+Shift+R)
- Clear browser cache
- Restart dev server

### Step 4: Quick Fixes

1. **Restart Dev Server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

2. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

3. **Check Firebase Connection:**
   - Open Firebase Console
   - Verify project is active
   - Check Firestore database is created

4. **Verify Environment Variables:**
   - Check `.env` file exists
   - Verify Firebase credentials are correct
   - Restart dev server after changing `.env`

### Step 5: Get More Information

Please provide:
1. **Browser console errors** (screenshot or copy/paste)
2. **Error details from the UI** (click "Error details")
3. **Network tab errors** (check for failed requests)
4. **Any Firebase errors** in the console

### Next Steps

Once we have the error message, we can fix it. The most likely issues are:
- Firebase initialization failing
- Firestore rules not deployed (causing permission errors)
- Missing environment variables
- Hot reload issue

