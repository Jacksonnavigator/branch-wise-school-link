# Firebase Deployment Guide

This guide will help you deploy your Firestore security rules to Firebase.

## Prerequisites

1. **Firebase CLI installed**
   ```bash
   npm install -g firebase-tools
   ```

2. **Logged into Firebase**
   ```bash
   firebase login
   ```

3. **Firebase project ID**
   - Your project ID is: `schools-20bd6` (from firebase.ts)
   - Or use the project ID from your `.env` file: `VITE_FIREBASE_PROJECT_ID`

## Step 1: Verify Firebase CLI Installation

Check if Firebase CLI is installed:
```bash
firebase --version
```

If not installed, install it:
```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase

Login to your Firebase account:
```bash
firebase login
```

This will open a browser window for authentication. After logging in, you'll be authenticated in the CLI.

## Step 3: Verify Project Configuration

The project is already configured with:
- `firebase.json` - Firebase configuration file
- `.firebaserc` - Project ID configuration (default: `schools-20bd6`)

If your project ID is different, update `.firebaserc`:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

Or set it via command line:
```bash
firebase use schools-20bd6
```

## Step 4: Validate Firestore Rules

Before deploying, validate the rules to catch any syntax errors:
```bash
firebase deploy --only firestore:rules --dry-run
```

Or use the Firebase Console to test rules:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database > Rules
4. Use the Rules Playground to test your rules

## Step 5: Deploy Firestore Rules

Deploy the security rules:
```bash
firebase deploy --only firestore:rules
```

You should see output like:
```
=== Deploying to 'schools-20bd6'...

i  deploying firestore
i  firestore: checking firestore.rules for compilation errors...
✔  firestore: rules file firestore.rules compiled successfully
i  firestore: uploading rules firestore.rules...
✔  firestore: deployed rules successfully

✔  Deploy complete!
```

## Step 6: Verify Deployment

1. **Check Firebase Console:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Firestore Database > Rules
   - Verify the rules are deployed

2. **Test Rules:**
   - Use the Rules Playground in Firebase Console
   - Test different scenarios:
     - User reading their own profile
     - Admin reading all users
     - Payment creation with valid data
     - Payment creation with invalid amount
     - Role change prevention
     - Payment field modification prevention

## Troubleshooting

### Error: "Project not found"
If you get a "Project not found" error:
1. Verify your project ID in `.firebaserc`
2. Make sure you're logged in: `firebase login`
3. List your projects: `firebase projects:list`
4. Set the correct project: `firebase use <project-id>`

### Error: "Permission denied"
If you get a permission error:
1. Make sure you're logged in: `firebase login`
2. Verify you have admin access to the Firebase project
3. Check your Firebase project permissions in the console

### Error: "Rules compilation failed"
If rules fail to compile:
1. Check `firestore.rules` for syntax errors
2. Use Firebase Console Rules Playground to test
3. Validate rules locally: `firebase deploy --only firestore:rules --dry-run`

### Rules Not Working as Expected
1. **Check Rules in Console:**
   - Go to Firestore Database > Rules
   - Verify rules are deployed correctly
   - Check for any warnings or errors

2. **Test in Rules Playground:**
   - Use the simulator to test different scenarios
   - Check authentication state
   - Verify user roles and permissions

3. **Check Firestore Indexes:**
   - Some queries require composite indexes
   - Firebase will prompt you to create indexes
   - Go to Firestore Database > Indexes

## Additional Commands

### List Firebase Projects
```bash
firebase projects:list
```

### Switch Firebase Project
```bash
firebase use <project-id>
```

### View Current Project
```bash
firebase use
```

### Deploy Only Rules (without other services)
```bash
firebase deploy --only firestore:rules
```

### Deploy with Specific Project
```bash
firebase deploy --only firestore:rules --project schools-20bd6
```

## Next Steps

After deploying the rules:

1. **Test the Rules:**
   - Use the Rules Playground in Firebase Console
   - Test with different user roles
   - Verify payment validation works
   - Test role change prevention

2. **Monitor Security:**
   - Check Firestore usage in Firebase Console
   - Monitor for any permission denied errors
   - Review audit logs (when implemented)

3. **Create Indexes (if needed):**
   - Firebase will prompt you to create indexes for queries
   - Go to Firestore Database > Indexes
   - Create the required indexes

4. **Update Application:**
   - Test your application with the new rules
   - Verify all operations work correctly
   - Fix any issues that arise

## Security Checklist

After deployment, verify:
- ✅ Rules are deployed successfully
- ✅ User authentication is required for branch access
- ✅ Payment amounts are validated (0 < amount <= 10,000,000)
- ✅ Users cannot change their own role
- ✅ Payment fields (student_id, branch_id, receipt_id) cannot be modified after creation
- ✅ Only admins can read audit logs
- ✅ All collections are properly secured

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Review Firestore rules syntax
3. Test rules in Rules Playground
4. Check Firebase CLI version: `firebase --version`
5. Update Firebase CLI if needed: `npm install -g firebase-tools@latest`

## Notes

- The project ID `schools-20bd6` is set as default in `.firebaserc`
- If your project ID is different, update `.firebaserc` before deploying
- Rules are automatically validated before deployment
- Always test rules in the Rules Playground before deploying to production

