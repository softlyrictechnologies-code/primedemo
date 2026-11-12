# Prime Housing Firebase setup guide

This repository is configured for the Firebase project `prime-housing-72330` and supports both the public property website and the protected admin panel. The app reads from Firestore, uses Firebase Auth for admin login, and keeps the Firebase Web config in local environment files that are not committed to source control.

---

## 1. Project configuration

- Firebase project: `prime-housing-72330`
- Frontend: React 19 + Vite 8 + Tailwind v4 + Firebase Web SDK
- Runtime modes: `public`, `admin`, and `all` via `VITE_APP_MODE`
- Firestore rules: `firestore.rules`
- Hosting config: `firebase.json`
- Local env file: `.env.local` (kept local; do not commit)

The web app expects these Firebase variables in the local environment when you run the app:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_APP_MODE`

---

## 2. Required Firebase console setup

### 2.1 Enable Firebase Auth
1. Open the Firebase console for `prime-housing-72330`.
2. Go to Authentication.
3. Enable the email/password sign-in provider for admin login.
4. Ensure the admin account you use for the dashboard exists as a signed-in user in Firebase Auth.

### 2.2 Enable Firestore
1. Go to Firestore Database in the Firebase console.
2. Create the database if it does not already exist.
3. Use a region close to the target users, such as `asia-south1` or `us-central1`.
4. Start in production mode unless you are intentionally doing local-only testing.

### 2.3 Enable Storage
1. Open Firebase Storage.
2. Ensure the default bucket is enabled.
3. Confirm the bucket matches the value in `VITE_FIREBASE_STORAGE_BUCKET`.

### 2.4 Create the admin user
1. In Firebase Authentication, create or confirm the admin email account.
2. In Firestore, create or update the matching user in the `users` collection with `role: 'admin'` if your workflow relies on Firestore profile metadata.
3. Add the custom claim `admin: true` or `role: 'admin'` to the user to satisfy the dashboard access checks.

> The app checks both Firebase custom claims and Firestore admin profile flags before granting access. Do not add admin privileges in code; create the actual Firebase user and claim in the console or via script.

---

## 3. Local environment configuration

Create a local `.env.local` file with the project values from your Firebase web app, then run the app. Do not commit the file or any service-account JSON files.

Example keys are already represented in the project template file `.env.example`, but the actual values must stay local and private.

```bash
npm install
npm run dev
```

---

## 4. Useful scripts

The project includes several repo-local scripts that are safe to run without embedding secrets in code:

```bash
npm run seed
npm run setup:firestore
npm run check:firebase
npm run verify:backend
```

These scripts rely on environment variables and the Firebase project configuration, not hardcoded API keys.

---

## 5. Firestore rules and hosting

The repo includes the rules in `firestore.rules`, and the hosting configuration in `firebase.json`.

To deploy rules:

```bash
firebase login
firebase use prime-housing-72330
firebase deploy --only firestore:rules
```

To deploy hosting:

```bash
firebase deploy --only hosting
```

Do not change the logic in `firestore.rules` or `storage.rules` unless you are explicitly updating project security requirements. This task kept those files intact.

---

## 6. Admin access notes

The dashboard checks the authenticated user for:

- `admin === true` custom claim
- `role === 'admin'` or `role === 'super_admin'`
- Firestore `admins` or `users` data for admin verification

If a user can sign in but is denied access, check that the Firebase Auth user has the expected custom claim and that the project is using the correct environment values.

---

## 7. Security reminders

- Never commit `.env.local`, `.env`, or any service-account JSON.
- Do not hardcode Firebase API keys into the repository.
- Keep service credentials outside the workspace or in secure secret storage.
- Do not publish or attach service account keys to issues, PRs, or chat threads.

---

## 8. Troubleshooting checklist

When the app cannot connect to Firebase:

1. Check that `.env.local` exists and contains the right values.
2. Confirm the project ID matches `prime-housing-72330`.
3. Validate that Authentication and Firestore are enabled in the Firebase console.
4. Confirm the user has the proper admin claim or role.
5. Run the repo verification scripts to confirm the configuration state.

This setup is designed to preserve the public site and admin panel behavior without changing the Firebase data model or project design.

