# Setting Up Your .env File

## Step 1: Get Your Firebase Credentials

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select your project (or create a new one)

2. **Get Your Web App Configuration:**
   - Click on the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"
   - Scroll down to "Your apps" section
   - Click on the web app icon (</>) or "Add app" if you don't have one
   - You'll see your Firebase configuration

3. **Copy the Configuration Values:**
   You'll see something like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123",
     measurementId: "G-XXXXXXXXXX"
   };
   ```

## Step 2: Create/Update Your .env File

1. **Open your `.env` file** in the root of your project
   - If it doesn't exist, create it

2. **Add your Firebase credentials:**
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=AIzaSy... (your actual API key)
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

## Step 3: Example .env File

Based on your current setup, your `.env` file should look like this:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDhOQNB2-BrjPziMxkjJQNDLOyYuwGqKS0
VITE_FIREBASE_AUTH_DOMAIN=schools-20bd6.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=schools-20bd6
VITE_FIREBASE_STORAGE_BUCKET=schools-20bd6.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=540173783517
VITE_FIREBASE_APP_ID=1:540173783517:web:9060b4aea566f701dba634
VITE_FIREBASE_MEASUREMENT_ID=G-RR79WV073K

# Supabase Configuration (if using)
VITE_SUPABASE_PROJECT_ID=gbmxmdqilkaopebucieh
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://gbmxmdqilkaopebucieh.supabase.co
```

## Step 4: Important Notes

1. **Never commit `.env` to git** - It's already in `.gitignore`
2. **Restart your dev server** after updating `.env`:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```
3. **Use your actual Firebase credentials** - Don't use the example values if they're not yours
4. **Measurement ID is optional** - Only needed if you're using Firebase Analytics

## Step 5: Verify It's Working

After setting up your `.env` file:
1. Restart the dev server
2. Check the browser console - you should NOT see the warning about missing Firebase environment variables
3. The app should connect to your Firebase project

## Quick Reference

### Where to Find Each Value:

- **API Key**: Firebase Console > Project Settings > General > Web apps
- **Auth Domain**: Usually `your-project-id.firebaseapp.com`
- **Project ID**: Firebase Console > Project Settings > General
- **Storage Bucket**: Usually `your-project-id.appspot.com` or `your-project-id.firebasestorage.app`
- **Messaging Sender ID**: Firebase Console > Project Settings > Cloud Messaging
- **App ID**: Firebase Console > Project Settings > General > Your apps
- **Measurement ID**: Firebase Console > Project Settings > General > Your apps (Analytics section)

## Troubleshooting

### Warning Still Shows?
- Make sure `.env` is in the root directory (same level as `package.json`)
- Restart the dev server after creating/updating `.env`
- Check that variable names start with `VITE_`
- Verify there are no spaces around the `=` sign

### Still Not Working?
- Check that `.env` file has no syntax errors
- Verify all required variables are present
- Make sure you're using the correct project credentials
- Check Firebase Console to ensure your project is active

