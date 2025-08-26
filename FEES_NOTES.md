Summary of fees enhancements

Files added/changed:
- src/pages/Fees.tsx: Full UI for recording/listing/deleting payments
- src/lib/fees.ts: Utilities for creating/editing payments, CSV export, PDF receipt
- src/lib/__tests__/fees.test.ts: Unit tests for utilities (Vitest)
- firestore.rules: Firestore security rules for payments and related collections
- tests/e2e/fees.e2e.md: E2E plan for fees flow

How to run tests (locally):
1. Install new deps: npm install
2. Run unit tests: npx vitest

Firestore rules:
- The `firestore.rules` file contains a starting point. Review and deploy to your Firebase project or use the emulator before relying on it in production.

Notes:
- Receipt generation uses jsPDF to create a simple PDF blob.
- Duplicate detection in `createPayment` is a simple heuristic; consider a more robust server-side check when scaling.
