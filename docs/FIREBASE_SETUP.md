# PlotFinder — Firebase Backend & Firestore Integration Guide

This guide details the complete configuration, Firestore security rules, setup scripts, and operational workflows for connecting **PlotFinder Chennai** to Google Cloud Firestore.

---

## 1. Project Configuration Summary

- **Firebase Project ID**: `plotfinder-be7f5`
- **Frontend Tech Stack**: React 19 + Vite + Tailwind CSS + Firebase Web SDK v12+
- **Database**: Cloud Firestore
- **Local Environment File**: `.env.local` (excluded from Git)
- **Security Rules**: `firestore.rules`
- **Initial Setup Script**: `scripts/setup-firestore.js` (executed via `npm run setup:firestore`)

---

## 2. One-Time Firebase Console Steps

Before running the automated seeding script or querying Firestore from your website, perform these quick steps in the Firebase Console:

### Step 2.1: Enable Cloud Firestore
1. Open the [Firebase Console](https://console.firebase.google.com/project/plotfinder-be7f5/firestore).
2. If you see **"Create database"**, click it.
3. Choose a location closest to your users (e.g., `asia-south1` for Mumbai / India or `nam5` / `us-central1`).
4. Select **Start in production mode** (or test mode if developing locally).
5. Click **Create**.

### Step 2.2: Download Firebase Admin Service Account Key (for local setup)
To allow the local setup script (`npm run setup:firestore`) to safely populate the initial collections and demo properties without permission restrictions:
1. Navigate to: [Service Accounts Settings](https://console.firebase.google.com/project/plotfinder-be7f5/settings/serviceaccounts/adminsdk).
2. Click **Generate new private key** and confirm.
3. A JSON file will download. Rename it to:
   ```
   serviceAccountKey.json
   ```
4. Move this file to the root directory of this project (`d:\demo ui\serviceAccountKey.json`).
   > **Security Note:** `serviceAccountKey.json` is already listed in `.gitignore` and `.env.local` is also ignored. Never commit private keys to GitHub.

---

## 3. Automatically Creating Collections & Demo Documents

Run the automated setup script:

```bash
npm run setup:firestore
```

### What this script does:
1. Confirms the target project ID (`plotfinder-be7f5`).
2. Checks the `properties` collection in Firestore.
3. Uses **deterministic document IDs** (`demo-siruseri-emerald`, `demo-ecr-azure`, `demo-navalur-grandeur`).
4. If a document already exists, it is **skipped** to avoid overwriting your custom changes.
5. If missing, it writes the demo plot with realistic Chennai attributes (Siruseri, ECR, Navalur) and marks it with `isDemo: true` and `published: true`.
6. Prints a detailed summary of created vs. skipped documents.

---

## 4. Firestore Collections Architecture

| Collection | Purpose | How it is Populated |
|---|---|---|
| **`properties`** | Real estate listings (title, price, area, location, approvals, etc.) | Initial demo data via `npm run setup:firestore`, or by authorized users/admin via `addProperty()` |
| **`inquiries`** | Customer inquiries and site visit requests | Automatically created when a user submits the **"Schedule Free Site Visit"** modal |
| **`users`** | User profiles, roles, and saved preferences | Populated when users register/log in via Firebase Authentication |
| **`favorites`** | Saved plot IDs linked to a `userId` | Populated when an authenticated buyer clicks "Save / Favorite" |

> **Note on Firestore collections:** In Firestore, collections only physically exist when they contain at least one document. Creating dummy empty documents in `inquiries`, `users`, and `favorites` is intentionally avoided so your database remains clean.

---

## 5. Security Rules Configuration (`firestore.rules`)

The project includes production-ready security rules in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. Properties: Public can only view published properties.
    // Writes require authentication or admin privileges.
    match /properties/{propertyId} {
      allow read: if resource.data.published == true || request.auth.token.admin == true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.token.admin == true ||
        (request.auth != null && resource.data.createdBy == request.auth.uid);
    }

    // 2. Users: Only user or admin can view/edit profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 3. Inquiries: Public can submit site visits (validated), only admins can read/manage
    match /inquiries/{inquiryId} {
      allow create: if request.resource.data.keys().hasAll(['propertyId', 'customerName', 'customerPhone'])
                    && request.resource.data.customerName is string
                    && request.resource.data.customerPhone is string;
      allow read, update, delete: if request.auth.token.admin == true;
    }

    // 4. Favorites: Users can only manage their own favorites
    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Deploying the Security Rules:
#### Option A: Firebase Console (Quickest)
1. Go to [Firestore Rules](https://console.firebase.google.com/project/plotfinder-be7f5/firestore/rules).
2. Copy the content of [firestore.rules](file:///d:/demo%20ui/firestore.rules).
3. Paste into the editor and click **Publish**.

#### Option B: Firebase CLI
```bash
npm install -g firebase-tools
firebase login
firebase use plotfinder-be7f5
firebase deploy --only firestore:rules
```

---

## 6. How the Frontend Connects to Firestore

- **`src/firebase.js`**: Initializes the Firebase Web SDK app, `db` (Firestore), and `auth`.
- **`src/services/propertyService.js`**:
  - `getPublishedProperties()`: Queries `properties` where `published == true`.
  - `getPropertyById(id)`: Fetches individual property details.
  - `addProperty(data)`: Authorized workflow to create new listings.
  - `updateProperty(id, data)`: Authorized workflow to update listings.
  - `submitInquiry(data)`: Securely sends site visit bookings to the `inquiries` collection.
- **`src/App.jsx`**:
  - Dynamically loads live listings from Firestore.
  - Displays a live status badge (`Cloud Firestore Live: X Listings Synchronized`).
  - Includes a skeleton pulsing loader while fetching data.
  - Includes a "Sync Now" button to re-fetch on demand.
  - Provides seamless fallback to cached listings if Firestore is empty or initializing.

---

## 7. Troubleshooting

| Symptom | Cause | Solution |
|---|---|---|
| `FirebaseError: [code=not-found]: 5 NOT_FOUND` | Firestore database is not created in Firebase Console yet. | Open Firebase Console -> Cloud Firestore -> Click "Create database". |
| `FirebaseError: Missing or insufficient permissions` | Rules are set to lock mode or user is unauthenticated. | Deploy `firestore.rules` or ensure the document being queried has `published: true`. |
| Setup script cannot find `serviceAccountKey.json` | Key not downloaded yet. | Download key from Project Settings > Service accounts > "Generate new private key" and save as `serviceAccountKey.json`. |
