E2E test plan for Fees flow

Prerequisites:

- Running local dev server
- Test Firebase project with rules deployed or emulator configured
- A test user with role 'accountant' in test project

Manual steps:

1. Sign in as accountant
2. Navigate to /fees
3. Create a payment for a student
4. Verify the payment appears in the Recent Payments list
5. Generate receipt (download PDF)
6. Delete the payment

Automated (recommended):

- Use Playwright or Cypress against the local app with Firebase emulator
- Create fixtures for students and accounts
- Assert UI interactions and Firestore writes
