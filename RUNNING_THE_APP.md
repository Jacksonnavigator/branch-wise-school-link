# Running the Application

## Current Status

The development server is running. The app has been configured to:

1. **Development Mode**: Uses fallback Firebase credentials if `.env` file is missing (with a warning)
2. **Production Mode**: Requires all environment variables to be set (fails if missing)

## Accessing the App

The app should be running at:
- **Local**: http://localhost:8080 (or check the terminal output for the exact port)

## Firebase Configuration

### Development Mode
- If `.env` file exists with Firebase credentials → uses those
- If `.env` file is missing → uses fallback values (shows warning in console)
- ⚠️ **Warning**: Fallback values are for development only and are INSECURE for production!

### Production Mode
- **Requires** all environment variables to be set
- Will fail to start if any are missing
- This ensures production security

## Environment Variables

If you want to use your own Firebase credentials (recommended), create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Testing the App

1. **Open the browser** to the URL shown in the terminal (usually http://localhost:8080)
2. **Check the browser console** for any errors
3. **Test authentication** - try logging in
4. **Test Firestore operations** - create/read/update data
5. **Check for security warnings** in the console

## Common Issues

### App won't start
- Check if port 8080 is available
- Check for TypeScript/compilation errors
- Check browser console for errors

### Firebase connection errors
- Verify Firebase credentials in `.env` file
- Check Firebase project is active
- Verify Firestore is enabled in Firebase Console

### Security rules errors
- Rules haven't been deployed yet (we'll do this next)
- Test rules in Firebase Console Rules Playground
- Check browser console for permission denied errors

## Next Steps

After verifying the app works:

1. **Deploy Firestore Rules** (next step)
2. **Test security rules** in Firebase Console
3. **Set up production environment variables**
4. **Build for production**: `npm run build`

## Stopping the Dev Server

Press `Ctrl+C` in the terminal where the dev server is running.

