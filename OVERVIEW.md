# Prime Housing — Project Overview

This repository is a React + Vite frontend for Prime Housing, a Chennai-based residential land and plot marketplace. It combines a public-facing sales website with an admin dashboard for property management, buyer inquiries, seller submissions, and content updates.

The app is built around Firebase services:
- Firestore for property listings, enquiries, admin records, seller submissions, and site content
- Firebase Authentication for admin access
- Firebase Storage for image uploads
- Cloud Functions for privileged server-side operations

The codebase deliberately supports three runtime modes via `VITE_APP_MODE`:
- `public`: public website only
- `admin`: admin dashboard only
- `all`: both public site and admin dashboard together

---

## 1) High-level architecture

### Frontend
- React 19 + Vite 8
- Tailwind CSS v4 styling
- React Router for public/admin routing
- Firebase client SDK for web access

### Backend / server logic
- Firebase Admin SDK in `functions/src/`
- callable/admin-protected functions for secure operations
- Firestore rules and storage rules guard access

### Runtime flow
1. The app bootstraps in `src/main.jsx`.
2. `src/app/App.jsx` decides which routes to render based on `APP_MODE`.
3. Public pages read from Firestore collections such as `properties`, `locations`, `insights`, and `sellerSubmissions`.
4. Admin pages interact with admin-only Firestore data and protected functions.
5. Site images are stored in Firebase Storage, while metadata and content live in Firestore.

---

## 2) Root-level files and purpose

### Project configuration
- `package.json` — app scripts, build targets, dependencies, and verification commands
- `vite.config.js` — Vite config using React and Tailwind plugins
- `index.html` — browser entry file
- `vercel.json` — deployment config for hosting
- `firebase.json` — Firebase hosting and project settings
- `firestore.rules` — Firestore read/write policy
- `firestore.indexes.json` — Firestore composite index configuration
- `storage.rules` — Firebase Storage access policy
- `cors.json` — CORS rules for Firebase Storage/file access

### Environment and local secrets
- `.env.local`, `.env.development`, `.env.public`, `.env.admin`, `.env.production`, `.env.example` — environment profiles for local/dev deployment
- `serviceAccountKey.json` — Firebase service account credentials used by scripts and backend verification tools

### Documentation and audit artifacts
- `README.md` — default starter-style project note; not the operational runtime guide
- `FRONTEND.md` — frontend-oriented notes
- `admin.md` — admin usage/operations notes
- `status.md` — operational status summary
- `docs/` — project documentation directory, including Firebase and backend setup notes
- `_archive/` — archived legacy or stale files kept for history without deleting anything
- `_archive/README.md` — reasoned list of archived files

### Firebase verification and setup scripts
- `scripts/check-firebase.js` — validates Firebase configuration and helper access
- `scripts/check-claim.js` — checks custom admin claims for a given Firebase user
- `scripts/setup-firestore.js` — seeds or initializes Firestore demo data
- `scripts/seed-firestore.cjs` — creates representative sample data
- `scripts/verify-all.cjs` — broad health check for Firebase/project readiness
- `scripts/health-check.cjs` — lightweight backend health script
- `scripts/inspect-firestore.cjs` — inspects collections and documents in Firestore
- `scripts/set-admin-claim.js` — assigns or manages admin claims
- `scripts/set-admin.cjs` — creates/updates admin user state
- `scripts/test-auth-diag.js` — diagnostics for auth and token behavior

---

## 3) Source tree summary

### `src/`
- `main.jsx` — application entry point; mounts React app
- `App.css` — global styling layer
- `index.css` — base Tailwind-driven global styles
- `firebase.js` — Firebase client initialization for web app

### `src/app/`
- `App.jsx` — top-level route selection for public/admin/all modes

### `src/config/`
- `appMode.js` — runtime mode detection based on `VITE_APP_MODE`
- `brand.js` — brand, theme, and site identity data

### `src/data/`
- `plotsData.js` — sample property dataset used for development or seed data

### `src/services/`
- `contactService.js` — submits contact form messages to Firestore or service layer
- `favoriteService.js` — favorite/save state operations for user property bookmarks
- `inquiryService.js` — buyer enquiries and validation logic
- `propertyService.js` — property queries, normalization, listing retrieval, and details lookup
- `publicSiteContent.js` — public website content loading from Firestore settings
- `sellerService.js` — seller submission workflow and validation
- `storageService.js` — upload, validation, and deletion helpers for image assets
- `userService.js` — user profile changes and admin-safe role updates

### `src/utils/`
- `propertyValidation.js` — property input validation helpers

### `src/components/`
- `BrandLogo.jsx` — logo rendering for branding
- `ChennaiAreaGuide.jsx` — area/location guide content for Chennai regions
- `Footer.jsx` — page footer
- `Header.jsx` — site header navigation
- `InteractiveMapModal.jsx` — map display modal for property locations
- `LevitatingHero.jsx` — animated hero banner for landing page
- `PlotComparisonDrawer.jsx` — side panel comparing land plots
- `PropertyCard.jsx` — reusable property listing card
- `PropertyDetailModal.jsx` — detail modal for property preview
- `QuickFiltersBar.jsx` — search/filter chips for listing filtering
- `Toast.jsx` — toast notification component
- `ui/` — shared UI primitives and low-level reusable controls

### `src/pages/`
- `AboutPage.jsx` — about the brand and company story
- `ContactPage.jsx` — contact form and office information
- `DevUiKitPage.jsx` — development UI exploration page
- `HomePage.jsx` — main landing page and hero sections
- `NotFoundPage.jsx` — fallback 404 page
- `PropertiesPage.jsx` — searchable property listing page
- `PropertyDetailsPage.jsx` — detailed property page with gallery, metadata, and inquiry flow
- `PublicWebsite.jsx` — public content-driven website shell
- `SubmitLandPage.jsx` — land submission workflow for sellers

### `src/admin/`
- `routes.jsx` — admin router and protected route tree
- `components/` — admin UI widgets and shared admin controls
  - `AdminHeader.jsx` — admin top bar
  - `AdminNotice.jsx` — local admin notifications
  - `AdminSidebar.jsx` — admin navigation sidebar
  - `ConfirmDialog.jsx` — confirmation modal
  - `DataTable.jsx` — reusable list table for admin data views
  - `LoadingSpinner.jsx` — loading indicator
  - `StatusBadge.jsx` — status chips for published/draft/sold-out states
- `context/AdminAuthContext.jsx` — admin auth state, login/logout, and claim checks
- `layouts/AdminLayout.jsx` — admin page wrapper layout
- `pages/` — admin dashboard and table pages
  - `AdminLogin.jsx` — admin login page
  - `Dashboard.jsx` — CRM-style overview dashboard
  - `Inquiries.jsx` — buyer inquiry management
  - `Insights.jsx` — insights/market data management
  - `Locations.jsx` — location management page
  - `Logs.jsx` — admin logs and audit history
  - `Messages.jsx` — contact/message inbox
  - `Properties.jsx` — full property CRUD, publish control, image uploads, sold-out handling
  - `Sellers.jsx` — seller submission review and approvals
  - `Users.jsx` — admin/user management
  - `WebsiteContent.jsx` — site copy and public content management
- `services/`
  - `adminDashboardService.js` — dashboard metrics queries
  - `adminInquiryService.js` — inquiry retrieval/action services
  - `adminLogService.js` — admin log fetch and persistence
  - `adminPropertyService.js` — admin property APIs
  - `adminSellerService.js` — listing seller-related admin actions
- `utils/RequireAdmin.jsx` — route guard ensuring only authorized admins can access pages

---

## 4) Function backend (`functions/src/`)

### `functions/src/index.js`
This is the Firebase Functions entry point. It wires admin-protected operations for claims, seller review, and admin-driven backend tasks.

### `functions/src/config/firebase.js`
Initializes the Firebase Admin SDK for server-side Firestore/Auth/Storage access.

### `functions/src/middleware/requireAdmin.js`
Checks an authenticated caller’s token and enforces `admin` or `role === 'admin'` protection before permitting sensitive operations.

### `functions/src/services/dashboardService.js`
Builds summary metrics for the admin dashboard, such as total published properties, pending submissions, and enquiry counts.

### `functions/src/services/enquiryService.js`
Validates buyer enquiry payloads, writes new exposure records to `inquiries`, and supports status updates.

### `functions/src/services/propertySearchService.js`
Retrieves published property records, applies location and price filters, and paginates the result set for search screens.

---

## 5) Runtime data model

### Core collections
- `properties` — land listings, prices, approvals, images, publish flags
- `inquiries` — buyer enquiries and follow-up tracking
- `sellerSubmissions` — property submissions from landowners
- `contactMessages` — contact-form submissions
- `users` — user profile and role metadata
- `favorites` — saved properties by user
- `locations` — Chennai corridor/location metadata
- `insights` — articles and market insight content
- `adminLogs` — audit events for admin actions

### Typical property record fields
- `title`, `subTitle`, `description`
- `location`, `area`, `areaSqFt`, `priceLakhs`
- `price`, `pricePerSqFt`
- `approval`, `approvalNo`, `verified`, `published`, `featured`
- `images`, `imageUrls`, `storagePaths`
- `coordinates`, `pattaStatus`, `roadWidth`, `waterSource`

### Firebase auth / admin model
Admin access is primarily controlled by Firebase custom claims:
- `admin === true`
- `role === 'admin'`
The frontend admin guard and backend middleware both check these values before allowing privileged actions.

---

## 6) Auth and security notes

### Frontend admin protection
- `src/admin/context/AdminAuthContext.jsx` manages login state and verifies custom claims.
- `src/admin/utils/RequireAdmin.jsx` blocks route access if the user is not an authorized admin.

### Backend enforcement
- `functions/src/middleware/requireAdmin.js` ensures secure callable functions reject unauthenticated or non-admin callers.
- `firestore.rules` and `storage.rules` enforce document-level restrictions and default denial patterns.

---

## 7) Operational workflow

### Public website flow
- Land buyers browse the home page and property listings.
- Search and filters narrow by corridor, price, size, and features.
- Each property card opens a detail page with images, legal metadata, and inquiry form.
- Visitors can submit buyer enquiries and landowner seller applications.

### Admin flow
- Admin signs in through `AdminLogin.jsx`.
- Dashboard aggregates property, enquiry, and seller metrics.
- Admin can create/edit/delete listings, toggle published state, mark sold-out status, and manage featured properties.
- Inquiries and contact messages can be reviewed and updated.
- Website content and location data can be edited through admin tools.

---

## 8) Build and verification commands

From `package.json`:
- `npm run dev` — local Vite development server
- `npm run build` — production build
- `npm run build:public` — public-mode build
- `npm run build:admin` — admin-mode build
- `npm run lint` — linting via Oxlint
- `npm run seed` — populate Firestore using sample data
- `npm run setup:firestore` — initialize Firestore collections and schema
- `npm run check:firebase` — Firebase diagnostics
- `npm run verify:backend` — deep backend verification and config checks

---

## 9) Implementation notes and project intent

This repo is organized as a single-frontend multi-mode application rather than a strict split frontend/backend monorepo. The public website and admin console are intentionally co-located so the same app can serve multiple experiences depending on environment configuration.

The project is built for real-world property operations, including:
- listing and publishing land plots
- price and corridor management
- legal approval tracking
- image handling via Firebase Storage
- buyer enquiry collection
- seller submission review
- admin authentication and claim enforcement

---

## 10) File coverage summary

This overview has described the main operational files in the project and their responsibilities. The repository contains additional UI, docs, and helper files under the same directories, but the core business logic and architecture are centered in:
- `src/app/App.jsx`
- `src/config/appMode.js`
- `src/firebase.js`
- `src/services/*.js`
- `src/admin/**/*.jsx`
- `functions/src/**/*.js`

The repo follows a practical pattern of “single app, multiple modes, Firebase-backed data,” with menu, route, and authentication boundaries separating public and admin use cases.
