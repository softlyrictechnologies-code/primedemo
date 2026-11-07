# Prime Housing Backend Architecture

## 1. Backend architecture

The backend is structured around Firebase services and follows a clear separation of concerns:

- Frontend app: React + Vite client for public website and admin portal
- Firebase Authentication: admin-only sign-in and role verification
- Firestore: primary database for listings, submissions, inquiries, content, users, and configuration
- Firebase Storage: image and document uploads for properties and approved submissions
- Firebase Cloud Functions: privileged admin workflows such as approval, publishing, custom claim assignment, and audit logging

High-level flow:

1. Landowners submit property data from the public form.
2. Submissions are saved privately in `sellerSubmissions` and remain hidden from public search.
3. Authorized admins review submissions from the admin panel.
4. Approved submissions are converted into `properties` records and published.
5. Buyers send enquiries against a property, and those enquiries are stored in `inquiries`.
6. Admins can review enquiries, update status, and log follow-up notes.
7. Public listing search reads only published property records.

---

## 2. Firebase database structure

### Core collections

| Collection | Purpose | Public access | Admin access |
|---|---|---|---|
| `properties` | Published and unpublished property listings | Read only if published | Full CRUD |
| `sellerSubmissions` | Private landowner submissions awaiting review | No public read | Full review and approval |
| `inquiries` | Buyer requests and site-visit enquiries | No public read | Full read/update |
| `users` | Authenticated user profiles and role metadata | User-only read/write | Full read/write |
| `locations` | Location names for filters and taxonomy | Public read | Full manage |
| `categories` | Property types for filters and taxonomy | Public read | Full manage |
| `websiteContent` | Homepage content, company details, contact info | Public read | Full manage |
| `adminLogs` | Audit trail of admin actions | No public read | Full read |

---

## 3. Collection names and fields

### 3.1 `properties`

Required fields:

- `title`: string
- `subTitle`: string
- `description`: string
- `propertyType`: string
- `location`: string
- `city`: string
- `areaSqFt`: number
- `price`: number
- `priceLakhs`: number
- `pricePerSqFt`: number
- `facing`: string
- `approval`: string
- `approvalNo`: string
- `dimensions`: string
- `roadWidth`: string
- `pattaStatus`: string
- `waterSource`: string
- `bankLoans`: array of strings
- `amenities`: array of strings
- `landmarks`: array of strings
- `images`: array of strings
- `imageUrls`: array of strings
- `published`: boolean
- `featured`: boolean
- `verified`: boolean
- `createdBy`: string
- `sourceSubmissionId`: string | null
- `createdAt`: timestamp
- `updatedAt`: timestamp

Relationship and status:

- One property can originate from one `sellerSubmissions` record via `sourceSubmissionId`.
- Only properties with `published === true` are visible to public search.
- Draft or rejected property records remain private.

### 3.2 `sellerSubmissions`

Required fields:

- `landownerName`: string
- `landownerPhone`: string
- `landownerEmail`: string
- `title`: string
- `propertyType`: string
- `location`: string
- `areaSqFt`: number
- `dimensions`: string
- `priceExpectation`: number
- `description`: string
- `images`: array of strings
- `status`: `'pending' | 'approved' | 'rejected' | 'revision_requested'`
- `submittedBy`: string
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `reviewedBy`: string | null
- `reviewNotes`: string | null

Relationship and status:

- This collection is private and only visible to admins or the owning user.
- Pending, rejected, and revision-requested records stay unpublished.
- Approved records are converted into property documents and published.

### 3.3 `inquiries`

Required fields:

- `propertyId`: string
- `buyerName`: string
- `buyerPhone`: string
- `buyerEmail`: string
- `message`: string
- `followUpNotes`: string
- `status`: `'new' | 'contacted' | 'follow-up' | 'closed'`
- `createdAt`: timestamp
- `updatedAt`: timestamp

Relationship and status:

- Stores all buyer enquiries against the relevant property.
- Admins read the linked property by `propertyId` and contact the buyer directly.
- Public users cannot read or edit enquiries.

### 3.4 `locations`

Required fields:

- `name`: string
- `slug`: string
- `city`: string
- `isActive`: boolean
- `createdAt`: timestamp
- `updatedAt`: timestamp

Purpose:

- Supports search filters and location lists on the public website.

### 3.5 `categories`

Required fields:

- `name`: string
- `slug`: string
- `isActive`: boolean
- `createdAt`: timestamp
- `updatedAt`: timestamp

Purpose:

- Supports property type filtering such as residential plot, commercial plot, villa, and other agreed categories.

### 3.6 `websiteContent`

Required fields:

- `page`: string
- `section`: string
- `title`: string
- `content`: string
- `meta`: object
- `updatedAt`: timestamp

Purpose:

- Stores homepage content, contact details, and other managed site content.

### 3.7 `users`

Required fields:

- `uid`: string
- `email`: string
- `displayName`: string
- `role`: `'buyer' | 'seller' | 'admin'`
- `createdAt`: timestamp
- `updatedAt`: timestamp

Purpose:

- Links Firebase Authentication with app-level metadata and access rules.

### 3.8 `adminLogs`

Required fields:

- `action`: string
- `target`: string
- `targetId`: string
- `details`: object
- `adminEmail`: string
- `adminUid`: string
- `createdAt`: timestamp

Purpose:

- Audit trail for approvals, rejections, property updates, and admin actions.

---

## 4. Authentication workflow

Authentication is based on Firebase Authentication with admin custom claims.

Flow:

1. Admin signs in with Firebase Auth.
2. Server checks the custom claim `admin === true` or `role === 'admin'`.
3. Admin-only Cloud Functions verify the request.
4. Firestore rules enforce the same guard for admin panel access.
5. Non-admin users can only access public flows and their own private records.

This matches the required secure admin access model.

---

## 5. Landowner submission workflow

Required workflow:

1. Receive landowner property details from the website form.
2. Validate required fields and phone/email information.
3. Store submission in `sellerSubmissions` as a private record.
4. Keep record status as `pending` by default.
5. Admin retrieves the submission in the admin panel.
6. Admin approves or rejects the submission.
7. Approved records are converted to a `properties` entry and published.
8. Rejected or pending submissions remain unpublished.

Implementation pattern:

- Public form writes to `sellerSubmissions`
- Status defaults to `pending`
- Admin-only review screen reads the collection
- Approval function creates a separate `properties` record and updates submission status to `approved`
- Rejection sets `status = 'rejected'`

---

## 6. Property approval and publishing workflow

Required workflow:

1. Admin opens a pending submission.
2. Admin reviews property details and approves it.
3. Cloud Function creates a new `properties` record using the submission fields.
4. The new property is marked `published: true`.
5. The submission status is updated to `approved`.
6. The property is available through the public search API.
7. If the submission is rejected, no public property record is created.

Key rule:

- Only approved records are transformed into public property listings.

---

## 7. Buyer enquiry workflow

Required workflow:

1. Buyer submits enquiry from a property detail page.
2. System validates the buyer name, phone, and property reference.
3. Enquiry record is stored in `inquiries` with linked `propertyId`.
4. Admin can read all enquiries from the admin dashboard.
5. Admin can see buyer contact details and linked property information.
6. Admin updates the status and adds follow-up notes.
7. Contact can be made by phone or email.

---

## 8. Firebase security rules plan

The security model must enforce the following:

- Public users can read only published property listings.
- Private submissions remain inaccessible to the public.
- Admins can read and update all listings, submissions, and enquiries.
- Buyers can manage only their relevant personal data where applicable.
- Sensitive landowner and buyer contact data is protected.

Planned rule structure:

- `properties`: read for published items; write for admin or creator when applicable
- `sellerSubmissions`: admin-only read/update; creator can view only their own submission
- `inquiries`: public create allowed for buyer form; admin-only read/update/delete
- `users`: user can access their own profile; admin can access all profiles
- `websiteContent`: public read and admin write
- `locations` and `categories`: public read and admin write
- `adminLogs`: admin-only read/write

---

## 9. Backend folder structure

```text
functions/
  package.json
  src/
    config/
      firebase.js
    middleware/
      requireAdmin.js
    services/
      dashboardService.js
      enquiryService.js
      propertySearchService.js
    index.js
src/
  services/
    propertyService.js
    sellerService.js
    inquiryService.js
    contactService.js
    userService.js
    storageService.js
  admin/
    services/
      adminDashboardService.js
      adminInquiryService.js
      adminPropertyService.js
      adminSellerService.js
      adminLogService.js
  firebase.js
firestore.rules
storage.rules
scripts/
  check-firebase.js
  check-claim.js
  set-admin-claim.js
```

---

## 10. Implementation plan

### Phase 1: Requirements analysis
- Confirm required property, submission, and enquiry fields.
- Confirm admin-only flows and public-facing data.

### Phase 2: Firebase database design
- Define collection structure.
- Define field types and publication flags.
- Map submission-to-property conversion.

### Phase 3: Configure Firebase services
- Enable Firestore, Authentication, and Storage.
- Set up admin claim enforcement.
- Add secure rules and deploy them.

### Phase 4: Landowner submission management
- Validate incoming data.
- Save to `sellerSubmissions` as private records.
- Allow admin review and decision.

### Phase 5: Property management
- Create, edit, approve, publish, and unpublish properties.
- Keep unpublished entries hidden from the public search layer.

### Phase 6: Public search and filtering
- Query only published properties.
- Apply location, price, area, category, feature, and sorting filters.
- Return no-results structure when filters match nothing.

### Phase 7: Buyer enquiry management
- Store enquiry with property association.
- Track follow-up notes and enquiry status.
- Present buyer contact details to admins.

### Phase 8: Dashboard and content management
- Aggregate totals for published properties, pending submissions, and enquiries.
- Manage homepage content and contact information.

### Phase 9: Security and testing
- Test admin auth, privacy, submission storage, approval flow, search filtering, and enquiry updates.
- Validate access rules with positive and negative checks.

---

## 11. Current backend status in the workspace

The codebase already contains the backend foundations for the required real-estate workflow, including:

- Firebase client configuration
- Submission and inquiry services
- Admin services for dashboard, property, seller approval, and enquiry management
- Firebase functions for admin claim verification and approval publishing logic
- Storage and Firestore rules for public/private separation

This is aligned to the required Prime Housing workflow and is ready for deployment to the real Firebase project environment.
