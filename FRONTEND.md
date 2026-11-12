# Prime Housing — Complete Frontend Architecture & Logic Documentation

> Document Version: 1.0.0
> Target Framework: React 19 • Vite 8 • JavaScript (JSX) • Tailwind CSS • Firebase
> Purpose: Comprehensive technical specification of the Prime Housing frontend, routing, admin access control, Firebase integration, property listing logic, lead flows, and operational UX.

---

## Table of Contents

1. [Executive Overview & Platform Concept](#1-executive-overview--platform-concept)
2. [Frontend Architecture & Technology Stack](#2-frontend-architecture--technology-stack)
3. [Directory & File Tree Analysis](#3-directory--file-tree-analysis)
4. [Routing & Navigation Architecture](#4-routing--navigation-architecture)
5. [Global State & Application Controller (src/App.jsx)](#5-global-state--application-controller-srcappjsx)
6. [Authentication & Access Control (src/admin/context/AdminAuthContext.jsx)](#6-authentication--access-control-srcadmincontextadminauthcontextjsx)
7. [Firebase Backend & Data Layer (src/firebase.js)](#7-firebase-backend--data-layer-srcfirebasejs)
8. [Property Data Model & Normalization Layer (src/services/propertyService.js)](#8-property-data-model--normalization-layer-srcservicespropertyservicejs)
9. [Public Portal Pages & Components](#9-public-portal-pages--components)
10. [Administrative Console Structure](#10-administrative-console-structure)
11. [Core End-to-End Business Logic Workflows](#11-core-end-to-end-business-logic-workflows)
12. [UX, Styling, & Brand System](#12-ux-styling--brand-system)
13. [Build, Hosting, & Deployment Notes](#13-build-hosting--deployment-notes)
14. [Preservation & Extension Guidelines](#14-preservation--extension-guidelines)

---

## 1. Executive Overview & Platform Concept

Prime Housing is a Chennai-focused land and property marketplace built to help buyers discover verified plots, residential land, agricultural parcels, commercial site opportunities, and investment-ready properties. The product is split into a public-facing shopping experience and a protected administrative area for listing management, site operations, and seller or buyer coordination.

### Core Product Objective

- property buyers searching for residential and investment land in Chennai corridors
- landowners submitting parcels for listing and sale consideration
- internal admin users managing property records, enquiry workflows, and operational brand settings

### Public vs Admin Separation

- Public users land on pages such as /, /properties, /about, /contact, /submit-land
- Admin flows are routed under /admin/login and /admin/*
- Access to admin functionality is enforced by RequireAdmin and Firebase-backed privilege checks

---

## 2. Frontend Architecture & Technology Stack

```text
index.html
  |
  +-- src/main.jsx
          |
          +-- src/App.jsx
                  |
                  +-- Public routes
                  |      +-- HomePage
                  |      +-- PropertiesPage
                  |      +-- PropertyDetailsPage
                  |      +-- SubmitLandPage
                  |      +-- AboutPage
                  |      +-- ContactPage
                  |
                  +-- Protected admin routes
                         +-- AdminAuthProvider
                         +-- RequireAdmin
                         +-- AdminLayout
                         +-- Dashboard / Properties / Inquiries / etc.

  +-- src/firebase.js
          +-- Firestore (db)
          +-- Auth (auth)
          +-- Storage (storage)
```

### Core Technologies

- UI Framework: React 19
- Routing: react-router-dom using BrowserRouter, Routes, Route, Navigate, Link
- Build Tooling: Vite 8
- Styling Engine: Tailwind CSS via @import "tailwindcss" in index.css
- Icons: lucide-react
- Data Layer: Firebase Firestore, Firebase Auth, Firebase Storage
- State Model: local component state and admin auth context
- Language: JavaScript / JSX

### Product Structure

This project is intentionally not a TypeScript-first architecture. It uses pragmatic JavaScript modules and Firebase-backed data flows rather than a strict typed domain abstraction.

---

## 3. Directory & File Tree Analysis

```text
src/
  App.jsx
  firebase.js
  index.css
  main.jsx
  components/
    Header.jsx
    Footer.jsx
  pages/
    HomePage.jsx
    PropertiesPage.jsx
    PropertyDetailsPage.jsx
    SubmitLandPage.jsx
    AboutPage.jsx
    ContactPage.jsx
    DevUiKitPage.jsx
  services/
    propertyService.js
    inquiryService.js
    userService.js
  admin/
    components/
    context/
      AdminAuthContext.jsx
    layouts/
      AdminLayout.jsx
    pages/
      AdminLogin.jsx
      Dashboard.jsx
      Properties.jsx
      Inquiries.jsx
      Sellers.jsx
      Users.jsx
      Messages.jsx
      Locations.jsx
      Insights.jsx
      Logs.jsx
      WebsiteContent.jsx
      SettingsPage.jsx
    utils/
      RequireAdmin.jsx
  data/
    plotsData.js
  types/
    index.ts
```

---

## 4. Routing & Navigation Architecture

### Routing Approach

This app uses BrowserRouter and real URL paths instead of hash routing.

### Route registry

| Route | Component | Access | Purpose |
|---|---|---|---|
| / | HomePage | Public | Entry and initial property discovery |
| /properties | PropertiesPage | Public | Searchable property catalog |
| /property/:id | PropertyDetailsPage | Public | Detailed listing information |
| /submit-land | SubmitLandPage | Public | Landowner listing intake |
| /about | AboutPage | Public | Brand and trust story |
| /contact | ContactPage | Public | Contact and support |
| /admin/login | AdminLogin | Restricted | Secure admin sign in |
| /admin | RequireAdmin + AdminLayout | Restricted | Protected shell |
| /admin/dashboard | Dashboard | Restricted | Admin overview |
| /admin/properties | Properties | Restricted | Listing management |
| /admin/inquiries | Inquiries | Restricted | Buyer enquiries |
| /admin/sellers | Sellers | Restricted | Seller data |
| /admin/locations | Locations | Restricted | Region taxonomy |
| /admin/content | WebsiteContent | Restricted | Content controls |
| /admin/settings | SettingsPage | Restricted | Operational settings |

### App structure

```jsx
<BrowserRouter>
  <AdminAuthProvider>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/property/:id" element={<PropertyDetailsPage />} />
      <Route path="/submit-land" element={<SubmitLandPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="properties" element={<Properties />} />
        <Route path="inquiries" element={<Inquiries />} />
        ...
      </Route>
    </Routes>
  </AdminAuthProvider>
</BrowserRouter>
```

---

## 5. Global State & Application Controller

### App layer responsibilities

The root app coordinates:

- route declarations
- protected admin nesting
- site shell composition
- public fallback routing

The `App.jsx` file wraps the app in `AdminAuthProvider`, then renders both public and protected views.

### Important logic

- public pages are public and page-based
- admin pages are assembled under /admin in a nested Route tree
- any unmatched route falls back to the public landing page

---

## 6. Authentication & Access Control

### Admin authorization model

The project uses Firebase Authentication together with custom admin privilege checks. The `AdminAuthContext.jsx` provider verifies whether the signed-in user has an admin claim or a matching admin document in Firestore.

Key operations:

- listen for auth state changes
- request token claims with getIdTokenResult(true)
- check for tokenClaims.admin, tokenClaims.superAdmin, or role values
- check Firestore admins/{uid}
- set `isAdmin` and `isSuperAdmin`
- block access if verification fails

### Access enforcement

The `RequireAdmin.jsx` component is the route guard.

If the user is not authenticated, it redirects to /admin/login.
If the user is authenticated but not an admin, it shows a diagnostic access-denied state and allows sign-out or return to the public site.

---

## 7. Firebase Backend & Data Layer

### Firebase entry point

The app centralizes Firebase in `src/firebase.js`.

```js
export const app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
```

This creates a single source of truth for:

- Firestore database access
- Firebase Auth session management
- Storage access for media uploads

### Environment defaults

The configuration uses Vite env variables with safe fallback values:

- projectId falls back to prime-housing-72330
- authDomain falls back to prime-housing-72330.firebaseapp.com
- storageBucket falls back to prime-housing-72330.firebasestorage.app

---

## 8. Property Data Model & Normalization Layer

### Primary service file

The most important data file is `src/services/propertyService.js`.

It exports:

- normalizePropertyDoc()
- getPublishedProperties()
- getPropertyById()
- addProperty()
- updateProperty()
- deleteProperty()

### Why this file matters

This layer is responsible for formatting and normalisation so a Firestore property record can be consumed consistently by the UI. It takes raw object data and converts it into a stable interface.

Example responsibilities:

- convert price and priceLakhs to usable numbers
- create default image and gallery values
- expose `published`, `status`, and `isSoldOut` consistently
- provide fallback metadata for area, location, and approvals

### Example normalisation logic

```js
export function normalizePropertyDoc(id, data = {}) {
  const areaSqFt = data.areaSqFt ?? data.totalAreaSqft ?? 1200;
  const price = data.price ?? (data.priceLakhs ? data.priceLakhs * 100000 : 0);
  const priceLakhs = data.priceLakhs ?? (price ? Number((price / 100000).toFixed(2)) : 0);

  return {
    id,
    title: data.title || 'Untitled Property',
    description: data.description || '',
    propertyType: data.propertyType || data.type || 'Residential Plot',
    location: data.location || (data.area ? `${data.area}, Chennai` : 'Chennai'),
    price,
    priceLakhs,
    image: mainImage,
    images: rawImages,
    published: data.published ?? true,
    status: status,
    featured: data.featured ?? false,
  };
}
```

This is the core compatibility layer that keeps the UI functional even when Firestore documents come through in slightly different shapes.

---

## 9. Public Website — Full UI Analysis

### Header (src/components/Header.jsx)

The header is a premium navigation bar for a buyer platform. It includes:

- a logo image from /prime-housing-logo.svg
- a nav group with Home, Explore Properties, Submit Land, About Prime Housing, Contact Us, Admin Portal
- a strong green CTA button labeled List Your Land
- mobile expansion behaviour for smaller screens

Core traits:

```jsx
<Link to="/submit-land" className="px-4 sm:px-5 py-2.5 rounded-full bg-[#1B4D3E] hover:bg-[#143B30] ...">
```

This is a direct conversion tool for listing submissions and demonstrates the business model of the app.

### Footer (src/components/Footer.jsx)

The footer acts as the trust layer for the brand. It includes:

- buyer testimonials
- quick links and navigation
- corridors and market activity summaries
- direct contact and support information
- legal and trust messaging

It is intended to reinforce confidence and help close leads.

### Home Page (src/pages/HomePage.jsx)

This is the main landing page and lead-generation surface. It includes:

1. hero with large property imagery and primary CTA
2. property type tiles
3. featured property cards
4. latest additions list
5. popular location cards
6. final conversion panels for buyers and landowners

The UI uses a simple but impactful formula:

- strong green/charcoal hero
- card layout sections
- workmanlike repetition and conversion blocks
- a simple discomfort-free browsing experience

### Properties Catalog (src/pages/PropertiesPage.jsx)

This page is the marketplace catalogue. It is designed to help buyers filter and compare stock quickly. The logic is built around Firestore data and page-level filtering.

### Property Details (src/pages/PropertyDetailsPage.jsx)

This is the detail experience for each property. It includes metadata, image gallery, pricing, legal and verification information, and strong CTAs for buyer enquiries.

### Submit Land (src/pages/SubmitLandPage.jsx)

This flow gives landowners a route to list property or submit a parcel for review. It is a key conversion path for the business.

### About and Contact pages

These pages support story and trust credibility. They explain the market and keep the product grounded in a real-estate advisory environment.

---

## 10. Reusable Frontend Components

### Property card system

Property cards are compact and practical. They use a standard card structure with:

- large image or cover shot
- location chip and type chip
- title
- price
- navigable detail flow

### Search and filter experience

Filters are straightforward and focused on clear property evaluation. The app does not use a layered search-engine abstraction; it relies on a clean UI and standard page query logic.

---

## 11. Administrative Console — Full UI Analysis

### Admin Login (src/admin/pages/AdminLogin.jsx)

This is a secure gate for internal operations. It uses a dark, technical dashboard aesthetic with:

- admin email and password fields
- Firebase auth validation
- custom error handling
- route redirect after successful authentication

### Admin Layout (src/admin/layouts/AdminLayout.jsx)

The layout consists of:

- sidebar navigation
- top header
- content area using Outlet

This is a standard admin-shell arrangement that keeps the UI modular.

### Admin Dashboard & monitoring views

Admin screens include multiple operational pages for:

- Dashboard
- Properties
- Inquiries
- Sellers
- Messages
- Locations
- Insights
- Logs
- Website Content
- Settings

These screens are all under the protected /admin route tree and are meant for internal business operations.

---

## 12. Frontend State, Auth & Business Logic

### App route state model

The app relies on route structure rather than a complex global store. The state is mostly local or context-specific.

### Admin auth state model

The admin flow is handled in `AdminAuthContext.jsx` with:

- currentUser
- adminProfile
- isAdmin
- isSuperAdmin
- claims
- diagnostics
- loading
- authError

This makes the project accessible to maintainers and easy to diagnose when access is denied.

### Property fetching and publishing logic

The service layer checks `published` and `isSoldOut` flags before returning property records to the UI. This is a key business rule because the app wants to show only valid inventory to general buyers.

### Firebase integration pattern

Firebase is used as the operational database layer for both public content and admin workflows.

---

## 13. Build, Hosting & Deployment Notes

The project is Vite-based and ready for static hosting or Firebase hosting. It includes:

- `vite.config.js`
- `firebase.json`
- `firestore.rules`
- `storage.rules`

This is consistent with a frontend-first deployment model where Firebase handles app data and hosting.

---

## 14. Preservation & Extension Guidelines

Any developer modifying this frontend should preserve the following:

1. Keep the public vs admin separation intact.
2. Continue to use BrowserRouter rather than hash routing.
3. Respect the existing Tailwind token system from src/index.css.
4. Keep admin access guarded behind RequireAdmin.
5. Use the service layer for property operations instead of bypassing the data abstraction.
6. Maintain the premium green property-brand standard visible in Header, Footer, HomePage, and AdminLogin.

---

## Final Interpretation

The actual codebase in this workspace is a robust, practical property marketplace frontend with a premium but straightforward UX strategy. The visual tone is calm, wealthy, and trustworthy, and the code reflects a real-world business workflow instead of a simulated design-only prototype.

The project is not a fictional TerraVerde system; it is a real Prime Housing implementation with real route structure, real admin auth, real Firebase access, and real property management logic.

That is the correct architectural baseline for any future frontend documentation, UI changes, or enhancement work.
