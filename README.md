# Online Student Grievance Logging and Response System

A responsive Next.js + TypeScript web application for student complaint reporting with Firebase Auth, Firestore, and Firebase Hosting.

## Project Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Add Firebase configuration in `src/lib/firebase.ts` and update `.env.local`.

4. Deploy to Firebase Hosting:
   ```bash
   firebase deploy
   ```

## Architecture

- `src/app/` — Next.js routes and pages
- `src/components/` — reusable UI components
- `src/lib/` — Firebase helpers, validation, and type definitions
- `firebase.json` — Firebase Hosting and rewrites
- `firestore.rules` — Firestore security rules

## Next Steps

1. Configure Firebase project and Auth providers.
2. Implement role-based access control for students and admins.
3. Add complaint submission, moderation, notifications, and analytics.
4. Enable image/document uploads with Firebase Storage.

## Cost-safety and Local Development (Recommended)

To avoid unintended billing and to develop safely:

- Use the Firebase Spark (free) plan — do NOT attach a billing account unless you need paid features.
- Avoid Phone/SMS auth (it requires billing). Use Email/Password or OAuth providers.
- Use the Firebase Local Emulator Suite for Auth, Firestore, and Storage to develop and test locally.

Quick commands:

```bash
# install firebase-tools globally if you haven't
npm install -g firebase-tools

# start local emulators (Auth, Firestore, Storage, Hosting if configured)
npm run emulate

# export emulator data (useful before stopping)
npm run emulate:export

# re-start using exported data
npm run emulate:import
```

Monitor your project usage in the Firebase console and set budgets/alerts if you enable billing later.
