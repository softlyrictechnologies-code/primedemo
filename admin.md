# Prime Housing Admin Console — Actual implementation details

This document reflects the real admin system currently implemented in the project, based on the code under `src/admin`, `src/App.jsx`, and the Firestore-backed services.

## 1. Overview

The admin console is a protected React dashboard built on top of Firebase Authentication + Firestore.

Core app wiring:
- `src/App.jsx` registers the public website routes and the protected `/admin` routes.
- `src/admin/context/AdminAuthContext.jsx` manages Firebase auth state, admin verification, and role checks.
- `src/admin/utils/RequireAdmin.jsx` blocks access if the signed-in user does not pass admin verification.
- `src/admin/layouts/AdminLayout.jsx` wraps all admin pages inside the sidebar + top header shell.

The admin console includes:
- Dashboard overview
- Property management
- Buyer inquiry management
- Landowner seller submissions
- User management
- Contact message inbox
- Location/area management
- Insights / legal article pages
- Audit log history
- Branding / site settings

---

## 2. Admin authentication and authorization logic

### 2.1 Authentication source
The admin system uses Firebase Auth from:
- `src/firebase.js`

The auth context file is:
- `src/admin/context/AdminAuthContext.jsx`

### 2.2 Verification model
Admin access is only granted when the signed-in Firebase user has verified admin privileges.

The actual checks are:
- Firebase custom claims such as:
  - `admin === true`
  - `superAdmin === true`
  - `role === 'admin'`
  - `role === 'super_admin'`
- Fallback logic to check the Firestore document in `admins/{uid}`

This happens in:
- `checkAdminPrivileges(user)`
- `login(email, password)`
- `refreshAdminStatus()`

If the user is not verified, the login process throws an `Access Denied` error with a clear message.

### 2.3 Protected route behavior
`RequireAdmin.jsx` does the following:
- Shows a loading screen while auth is being verified
- Redirects anonymous users to `/admin/login`
- Redirects authenticated but non-admin users to a denial screen
- Exposes diagnostics such as UID, email, project ID, and admin claim status

### 2.4 Auth context values exposed to admin screens
The context provides:
- `currentUser`
- `adminProfile`
- `isAdmin`
- `isSuperAdmin`
- `claims`
- `diagnostics`
- `loading`
- `authError`
- `login()`
- `logout()`
- `refreshAdminStatus()`

---

## 3. Admin routes and page structure

Defined in `src/App.jsx`:

### Public site routes
- `/`
- `/properties`
- `/property/:id`
- `/submit-land`
- `/about`
- `/contact`
- `/dev/ui-kit` (only in development)

### Admin routes
- `/admin/login`
- `/admin` → protected layout
  - `/admin/dashboard`
  - `/admin/properties`
  - `/admin/inquiries`
  - `/admin/sellers`
  - `/admin/locations`
  - `/admin/users`
  - `/admin/messages`
  - `/admin/insights`
  - `/admin/logs`
  - `/admin/content`
  - `/admin/website-content`
  - `/admin/settings`
  - fallback redirects to dashboard

The admin layout is enclosed in:
- `src/admin/layouts/AdminLayout.jsx`

The shell contains:
- `AdminSidebar`
- `AdminHeader`
- `<Outlet />` for nested page rendering

---

## 4. Admin UI layout

### Sidebar navigation
`src/admin/components/AdminSidebar.jsx` includes the modules:
- Dashboard
- Properties
- Buyer Inquiries
- Seller Submissions
- Users
- Messages
- Locations & Areas
- Insights & Guides
- Audit Logs
- Settings & Branding

### Header behavior
`src/admin/components/AdminHeader.jsx` provides:
- current page title based on route
- admin status chip
- quick user info
- logout behavior
- mobile sidebar toggle

The header is route-aware and maps path names to page labels such as:
- `/admin/dashboard` → `Executive Overview`
- `/admin/properties` → `Property Management`
- `/admin/inquiries` → `Buyer Enquiries & Site Visits`
- `/admin/sellers` → `Landowner Submissions`
- `/admin/users` → `Registered Users`
- `/admin/messages` → `Contact Messages`
- `/admin/locations` → `Locations & Area Guides`
- `/admin/insights` → `Legal Guides & Insights`
- `/admin/logs` → `Audit Trail & Activity Logs`
- `/admin/settings` → `Settings & Branding`

---

## 5. Core admin modules

### 5.1 Dashboard
File:
- `src/admin/pages/Dashboard.jsx`

Purpose:
- Shows live operational metrics pulled from Firestore
- Displays KPI cards for published listings, pending seller submissions, buyer inquiries, sold-out plots, and messages
- Renders corridor distribution for property inventory
- Provides quick links to verification queues and inboxes

Data source:
- `src/admin/services/adminDashboardService.js`

Metrics produced:
- `properties.total`
- `properties.published`
- `properties.draft`
- `properties.soldOut`
- `properties.byCorridor`
- `inquiries.total`, `inquiries.new`, `inquiries.completed`
- `sellers.total`, `sellers.pending`, `sellers.approved`
- `users.total`, `users.buyers`, `users.sellers`, `users.admins`
- `messages.total`, `messages.new`
- `recentActivity`

This service queries Firestore collections including:
- `properties`
- `inquiries`
- `sellerSubmissions`
- `users`
- `contactMessages`
- `adminLogs`

### 5.2 Properties management
File:
- `src/admin/pages/Properties.jsx`

Purpose:
- Manage property listings
- Publish / unpublish listings
- Mark properties as sold out
- Add or edit listing metadata
- Review property data from the public marketplace

This module works with the same core property structure as the public website, using the collection:
- `properties`

The normalization layer is defined in:
- `src/services/propertyService.js`

Key logic in that file:
- `PROPERTIES_COLLECTION = 'properties'`
- `normalizePropertyDoc()` normalizes field names between Firestore and UI expectations
- It sets values such as `status`, `published`, `isSoldOut`, `area`, `price`, `formattedPrice`, `image`, etc.

### 5.3 Buyer inquiries
File:
- `src/admin/pages/Inquiries.jsx`

Purpose:
- Review and update property buyer inquiries
- Track inquiry status
- Delete stale or invalid inquiries

Data source:
- `src/services/inquiryService.js`

Collection:
- `inquiries`

Behavior:
- Inquiry validation enforces Indian mobile validation and required form fields
- Documents are intentionally deduplicated by a deterministic ID based on property + phone + date
- `status` values are used by the dashboard and admin review flows

### 5.4 Seller submissions
File:
- `src/admin/pages/Sellers.jsx`

Purpose:
- Review landowner submissions before they become live listings
- Approve or reject seller-submitted property proposals

Data source:
- `src/services/sellerService.js`

Collection:
- `sellerSubmissions`

Important logic:
- Public seller submissions are forced to default status `pending`
- Non-admins cannot override status to `approved` or `published`
- This enforces workflow control at the service layer

### 5.5 Users
File:
- `src/admin/pages/Users.jsx`

Purpose:
- Manage registered users
- See user role categories and admin access state
- Audit user metadata and records

Data source:
- `users`

### 5.6 Messages / contact form inbox
File:
- `src/admin/pages/Messages.jsx`

Purpose:
- Admin inbox for website contact form submissions
- Review visitor questions and messages
- Update message status if needed

Data source:
- `src/services/contactService.js`

Collection:
- `contactMessages`

Important logic:
- Messages default to status `new`
- Honeypot field checks are used to block spam submissions
- Phone validation and email validation are enforced before submission

### 5.7 Locations & Areas
File:
- `src/admin/pages/Locations.jsx`

Purpose:
- Manage location metadata for the public property filters and region mapping
- Used to populate the search filter options in the public hero and listing UI

This is important because the public home page hero loads area data from:
- `locations`

### 5.8 Insights / legal guides
File:
- `src/admin/pages/Insights.jsx`

Purpose:
- Manage legal / property exploration content for the site
- Supports educational content and buyer guidance

### 5.9 Audit logs
File:
- `src/admin/pages/Logs.jsx`

Purpose:
- Display recent admin actions
- Show security-relevant operational history

Service:
- `src/admin/services/adminLogService.js`

Collection:
- `adminLogs`

This service writes entries with:
- `action`
- `target`
- `targetId`
- `details`
- `adminEmail`
- `adminUid`
- `createdAt`

### 5.10 Settings & branding
File:
- `src/admin/pages/SettingsPage.jsx`

Purpose:
- Update branding metadata for the public website
- Manage company name, logo URL, tagline, primary accent color

Default branding values include:
- `companyName: 'Prime Housing'`
- `logoUrl: '/prime-housing-logo.jpeg'`
- `tagline: 'Verified landholding acquisition and advisory in premium corridors'`
- `primaryColor: '#064e3b'`

The settings are saved to:
- `siteSettings/site`

---

## 6. Firestore collection model used by the admin console

The project’s admin and public features rely on the following collections:

- `properties`
- `inquiries`
- `sellerSubmissions`
- `users`
- `contactMessages`
- `locations`
- `admins`
- `siteSettings`
- `siteContent`
- `websiteContent`
- `adminLogs`

The admin dashboard aggregates these to generate operational metrics.

---

## 7. Security design notes

The admin security pattern is intentionally strict:

1. Firebase auth is required.
2. Admin privileges are verified using Firebase custom claims or `admins/{uid}` fallback checks.
3. Routes are protected by `RequireAdmin`.
4. Sensitive data updates are guarded on the service layer.
5. Audit logs record admin actions in `adminLogs`.

The most important enforcement point is:
- `src/admin/context/AdminAuthContext.jsx`

This is the central gatekeeper for admin role verification.

---

## 8. Practical admin workflow

In real use, the admin flow looks like this:

1. Admin signs in at `/admin/login`
2. Firebase auth verifies the account
3. `AdminAuthContext` checks `admin` / `superAdmin` claims and `admins/{uid}`
4. `RequireAdmin` grants access to the protected admin layout
5. Admin dashboard loads live metrics from Firestore
6. Admins interact with management pages for properties, inquiries, sellers, messages, settings, and logs
7. Mutations and approvals are written back to Firestore
8. `adminLogs` records the action

---

## 9. High-level summary

The admin system is a Firebase-backed operational dashboard for Prime Housing. It is designed to let verified admin staff:
- monitor site performance
- manage property inventory
- approve land submissions
- review buyer leads
- respond to public messages
- control site branding and content metadata
- keep an audit trail of management actions

This is not a generic CMS; it is a workflow-oriented operational console tightly integrated with the property marketplace and lead-management data model.
