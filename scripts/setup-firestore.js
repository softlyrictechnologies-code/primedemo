import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env.local and .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const EXPECTED_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'prime-housing-72330';

console.log('='.repeat(70));
console.log('  PRIME HOUSING — AUTOMATIC FIRESTORE INITIALIZATION');
console.log('='.repeat(70));
console.log(`Target Firebase Project ID : ${EXPECTED_PROJECT_ID}`);

// -----------------------------------------------------------------------------
// Seed Data Definitions (Using Stable Document IDs for Idempotency)
// -----------------------------------------------------------------------------

// A. Properties (Preserving existing demo listings and ensuring full field set)
const SEED_PROPERTIES = [
  {
    docId: 'demo-siruseri-emerald',
    data: {
      title: 'Emerald Crest – Gated Villa Plot near SIPCOT',
      subTitle: 'Premium 1500 sq.ft Corner Plot with 40ft Avenue Road',
      description: 'Emerald Crest offers an ultra-exclusive opportunity to build your luxury villa right at the heart of Chennai’s premier tech corridor in Siruseri. Fully approved by CMDA and DTCP with ready-to-construct infrastructure, underground EB, LED streetlights, and 40ft wide internal tar roads.',
      propertyType: 'Villa Plot',
      location: 'Siruseri, OMR, Chennai',
      area: 'Siruseri',
      areaSqFt: 1500,
      price: 5850000,
      pricePerSqFt: 3900,
      facing: 'East Facing',
      approval: 'CMDA & DTCP Approved',
      approvalNo: 'CMDA/PPD/LO No. 34/2024',
      amenities: [
        '24/7 Gated Security & CCTV',
        'Underground Electricity Cables',
        'Solar Avenue Streetlights',
        'Rainwater Harvesting Pits',
        'Architect-Designed Landscaping & Children Play Area'
      ],
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      ],
      imageUrls: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      ],
      featured: true,
      published: true,
      createdBy: 'admin-seed-system',
      priceLakhs: 58.5,
      formattedPrice: '₹58.5 Lakhs',
      dimensions: '30 ft x 50 ft',
      roadWidth: '40 Feet Blacktop Road',
      pattaStatus: 'Clear Single Ownership Patta',
      waterSource: 'Sweet Potable Water at 35 ft Depth',
      bankLoans: ['HDFC', 'SBI', 'ICICI', 'Axis Bank'],
      landmarks: [
        '3 Mins to SIPCOT IT Park Main Gate',
        '5 Mins to PSBB Millennium School',
        '800m to Proposed Metro Station Phase 2'
      ],
      appreciationRate: '+14.5% YoY',
      coordinates: { lat: 12.8285, lng: 80.2223 },
      isDemo: true,
    }
  },
  {
    docId: 'demo-ecr-azure',
    data: {
      title: 'Azure Waters Coastal Avenue',
      subTitle: 'Luxury Ocean-Breeze Villa Plot 100m from ECR Beach',
      description: 'Azure Waters brings breezy seaside living to Uthandi on the coastal corridor of ECR. 100 meters from the serene beach with CMDA approval and CRZ clearances in place. Features 50ft avenue roads and rapid capital appreciation.',
      propertyType: 'Villa Plot',
      location: 'Uthandi, ECR, Chennai',
      area: 'ECR',
      areaSqFt: 2400,
      price: 16800000,
      pricePerSqFt: 7000,
      facing: 'North-East Corner',
      approval: 'CMDA Approved & CRZ Cleared',
      approvalNo: 'CMDA/ECR/REG/112/2023',
      amenities: [
        'Private Avenue Access to Beach',
        '24/7 Monitored Boom Barrier',
        'Grand Arch Entrance',
        'Underground Drainage & Water Lines',
        'Landscaped Green Walkway'
      ],
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      ],
      imageUrls: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      ],
      featured: true,
      published: true,
      createdBy: 'admin-seed-system',
      priceLakhs: 168.0,
      formattedPrice: '₹1.68 Crores',
      dimensions: '40 ft x 60 ft',
      roadWidth: '50 Feet Main Avenue',
      pattaStatus: 'Computerized Patta in Hand',
      waterSource: 'Purified Water System & Deep Aquifer',
      bankLoans: ['HDFC', 'SBI', 'Axis Bank'],
      landmarks: [
        '100m to Pristine Uthandi Beach',
        '5 Mins to Mayajaal Multiplex',
        '12 Mins to Sholinganallur Junction'
      ],
      appreciationRate: '+18.2% YoY',
      coordinates: { lat: 12.8601, lng: 80.2467 },
      isDemo: true,
    }
  },
  {
    docId: 'demo-navalur-grandeur',
    data: {
      title: 'Grandeur Meadows – Gated Community Plot',
      subTitle: 'Ready-to-Build Residential Plot behind Vivira Mall',
      description: 'Strategically located behind Vivira Mall on Navalur OMR. High-appreciation residential gated community with 30ft blacktop avenue, underground sewage, and 24/7 security.',
      propertyType: 'Residential Plot',
      location: 'Navalur, OMR, Chennai',
      area: 'Navalur',
      areaSqFt: 1800,
      price: 7600000,
      pricePerSqFt: 4222,
      facing: 'North Facing',
      approval: 'CMDA Approved',
      approvalNo: 'CMDA/PP/2023/88',
      amenities: [
        'Gated Community with Boundary Wall',
        'EB Transformer Installed',
        'Streetlights & Tree Avenue',
        'Potable Ground Water'
      ],
      images: [
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      ],
      imageUrls: [
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      ],
      featured: false,
      published: true,
      createdBy: 'admin-seed-system',
      priceLakhs: 76.0,
      formattedPrice: '₹76.0 Lakhs',
      dimensions: '30 ft x 60 ft',
      roadWidth: '30 Feet Road',
      pattaStatus: 'Clear Title Patta with Nil Encumbrance',
      waterSource: 'Borewell & Corporation Water Connection',
      bankLoans: ['SBI', 'HDFC', 'Canara Bank'],
      landmarks: [
        '3 Mins to Vivira Mall & AGS Cinemas',
        '7 Mins to Marina Mall Egattur',
        '10 Mins to Siruseri IT Corridor'
      ],
      appreciationRate: '+13.0% YoY',
      coordinates: { lat: 12.8456, lng: 80.2291 },
      isDemo: true,
    }
  }
];

// B. Inquiries
const SEED_INQUIRIES = [
  {
    docId: 'seed-inquiry-demo',
    data: {
      propertyId: 'demo-siruseri-emerald',
      propertyTitle: 'Emerald Crest – Gated Villa Plot near SIPCOT',
      customerName: 'Karthik Subramanian',
      customerPhone: '+91 98401 23456',
      customerEmail: 'karthik.subramanian@example.com',
      preferredDate: 'Tomorrow',
      preferredTime: '10:00 AM',
      message: 'Interested in site visit for Emerald Crest 1500 sq.ft villa plot with free shuttle pickup.',
      status: 'new',
      transport: 'shuttle',
    }
  }
];

// C. Users (Roles: buyer, seller, admin)
const SEED_USERS = [
  {
    docId: 'seed-user-admin',
    data: {
      uid: 'seed-user-admin',
      name: 'Prime Housing Administrator',
      email: 'visitor@example.com',
      phone: '+91 044 4890 2026',
      role: 'admin',
    }
  },
  {
    docId: 'seed-user-buyer',
    data: {
      uid: 'seed-user-buyer',
      name: 'Ravi Chandran',
      email: 'ravi.buyer@example.com',
      phone: '+91 98410 54321',
      role: 'buyer',
    }
  },
  {
    docId: 'seed-user-seller',
    data: {
      uid: 'seed-user-seller',
      name: 'Venkatesh Builders Chennai',
      email: 'venkatesh.seller@example.com',
      phone: '+91 98412 87654',
      role: 'seller',
    }
  }
];

// D. Favorites
const SEED_FAVORITES = [
  {
    docId: 'seed-fav-buyer-emerald',
    data: {
      userId: 'seed-user-buyer',
      propertyId: 'demo-siruseri-emerald',
    }
  }
];

// E. Seller Submissions (Default status: pending)
const SEED_SELLER_SUBMISSIONS = [
  {
    docId: 'seed-submission-kelambakkam-clover',
    data: {
      sellerId: 'seed-user-seller',
      title: 'Clover Heights – Residential Plot near Kelambakkam Junction',
      propertyType: 'Residential Plot',
      location: 'Kelambakkam, OMR, Chennai',
      areaSqFt: 1200,
      expectedPrice: 4200000,
      description: 'Well-connected corner plot with clear DTCP approval draft, 30ft avenue road, and ground water at 25 feet.',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
      ],
      status: 'pending',
      sellerName: 'Venkatesh Builders Chennai',
      sellerPhone: '+91 98412 87654',
    }
  }
];

// F. Contact Messages (Default status: new)
const SEED_CONTACT_MESSAGES = [
  {
    docId: 'seed-contact-inquiry-1',
    data: {
      name: 'Priya Narayanan',
      email: 'priya.n@example.com',
      phone: '+91 97909 11223',
      subject: 'Inquiry regarding CMDA Title Verification Assistance',
      message: 'Hello Prime Housing team, do you provide assistance in verifying Patta transfer and encumbrance certificates for plots in Sholinganallur?',
      status: 'new',
    }
  }
];

// G. Locations (Chennai corridors: OMR, ECR, Siruseri, Navalur, Kelambakkam, Sholinganallur, Porur, Tambaram)
const SEED_LOCATIONS = [
  {
    docId: 'loc-omr',
    data: {
      name: 'OMR (Old Mahabalipuram Road)',
      slug: 'omr',
      description: 'Chennai’s premier IT Expressway corridor connecting Tidel Park to Kelambakkam. Highest appreciation corridor driven by Metro Phase 2.',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      featured: true,
      avgPricePerSqft: 4500,
      growthRate: '+14% YoY',
    }
  },
  {
    docId: 'loc-ecr',
    data: {
      name: 'ECR (East Coast Road)',
      slug: 'ecr',
      description: 'Scenic coastal highway renowned for luxury beachfront villas, resort communities, and high-value investment land parcels.',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      featured: true,
      avgPricePerSqft: 6800,
      growthRate: '+17% YoY',
    }
  },
  {
    docId: 'loc-siruseri',
    data: {
      name: 'Siruseri',
      slug: 'siruseri',
      description: 'Home to Asia’s largest SIPCOT IT Park. Massive employment hub with robust residential gated community development.',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      featured: true,
      avgPricePerSqft: 3900,
      growthRate: '+15% YoY',
    }
  },
  {
    docId: 'loc-navalur',
    data: {
      name: 'Navalur',
      slug: 'navalur',
      description: 'Vibrant residential epicenter of OMR featuring Vivira Mall, multiplexes, top schools, and healthcare facilities.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      featured: true,
      avgPricePerSqft: 4200,
      growthRate: '+13% YoY',
    }
  },
  {
    docId: 'loc-kelambakkam',
    data: {
      name: 'Kelambakkam',
      slug: 'kelambakkam',
      description: 'Fastest-growing junction connecting OMR to GST Road and ECR. Affordable residential plots with high rental yields.',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      featured: false,
      avgPricePerSqft: 3400,
      growthRate: '+12% YoY',
    }
  },
  {
    docId: 'loc-sholinganallur',
    data: {
      name: 'Sholinganallur',
      slug: 'sholinganallur',
      description: 'Key junction of OMR and Medavakkam. Central tech interchange hosting major IT campuses and metro interchange stations.',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      featured: true,
      avgPricePerSqft: 5200,
      growthRate: '+16% YoY',
    }
  },
  {
    docId: 'loc-porur',
    data: {
      name: 'Porur',
      slug: 'porur',
      description: 'Western Chennai growth catalyst anchored by DLF Cybercity, Ramachandra Medical, and Mount-Poonamallee highway connectivity.',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      featured: true,
      avgPricePerSqft: 4800,
      growthRate: '+13.5% YoY',
    }
  },
  {
    docId: 'loc-tambaram',
    data: {
      name: 'Tambaram',
      slug: 'tambaram',
      description: 'Historic gateway to Southern Chennai with premier rail connectivity, outer ring road access, and established social infrastructure.',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      featured: false,
      avgPricePerSqft: 3800,
      growthRate: '+11% YoY',
    }
  }
];

// H. Insights (Articles & Buying Guides)
const SEED_INSIGHTS = [
  {
    docId: 'insight-cmda-dtcp-guide',
    data: {
      title: 'CMDA vs DTCP Approval: Chennai Land Buyer Checklist 2026',
      slug: 'cmda-vs-dtcp-approval-chennai-guide',
      excerpt: 'Understand legal differences, local body approvals, planning permit numbers, and Patta verification steps before buying residential plots in Chennai.',
      content: 'Purchasing a plot in Chennai requires thorough verification of whether the layout falls under CMDA (Chennai Metropolitan Development Authority) or DTCP (Directorate of Town and Country Planning). Key verification steps include: 1) Checking the Layout Approval Order Number; 2) Verifying Gift Deed for OSR (Open Space Reservation) roads to local panchayat/corporation; 3) Scrutinizing Encumbrance Certificate (EC) for past 30 years; 4) Confirming computerized Patta under Tamil Nilam portal.',
      category: 'Legal & Approvals',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
      published: true,
    }
  },
  {
    docId: 'insight-chennai-metro-phase-2',
    data: {
      title: 'How Chennai Metro Phase 2 Corridor 3 & 4 Are Impacting Plot Appreciation',
      slug: 'chennai-metro-phase-2-plot-appreciation',
      excerpt: 'Analysis of metro stations across OMR, Sholinganallur, and Porur, and their historical 3-year capital appreciation multipliers for adjacent land parcels.',
      content: 'Phase 2 of the Chennai Metro Rail project spanning 118.9 km across 3 corridors is transforming real estate dynamics. Plots located within 1 km radius of upcoming elevated stations in Navalur, Siruseri, and Karapakkam have witnessed average annual appreciation rates of 14% to 18%, significantly outpacing central apartment yields.',
      category: 'Infrastructure & ROI',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
      published: true,
    }
  },
  {
    docId: 'insight-omr-vs-ecr-investment',
    data: {
      title: 'OMR vs ECR: Which Corridor Offers Maximum ROI for Villa Plots?',
      slug: 'omr-vs-ecr-villa-plot-roi-comparison',
      excerpt: 'A comprehensive comparison between OMR tech-driven rental yields and ECR lifestyle coastal capital gains.',
      content: 'While OMR offers consistent liquidity, ready tenant markets from IT professionals, and institutional bank financing, ECR presents ultra-luxury scarcity value, higher appreciation ceiling for beachside properties, and thriving weekend rental / resort potential.',
      category: 'Market Trends',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      published: true,
    }
  }
];

// I. Admin Logs (Restricted records)
const SEED_ADMIN_LOGS = [
  {
    docId: 'seed-admin-log-init',
    data: {
      adminId: 'system-bootstrap',
      action: 'DATABASE_INITIALIZATION',
      entityType: 'system',
      entityId: EXPECTED_PROJECT_ID,
    }
  }
];

// Mapping of all collections to their seed definitions
const ALL_COLLECTIONS = [
  { name: 'properties', items: SEED_PROPERTIES, label: 'Real Estate Listings' },
  { name: 'inquiries', items: SEED_INQUIRIES, label: 'Customer Inquiries & Site Visits' },
  { name: 'users', items: SEED_USERS, label: 'User Profiles (Buyer, Seller, Admin)' },
  { name: 'favorites', items: SEED_FAVORITES, label: 'Buyer Saved Properties' },
  { name: 'sellerSubmissions', items: SEED_SELLER_SUBMISSIONS, label: 'Seller Submissions (Pending Review)' },
  { name: 'contactMessages', items: SEED_CONTACT_MESSAGES, label: 'Customer Contact Messages' },
  { name: 'locations', items: SEED_LOCATIONS, label: 'Chennai Corridors & Area Guides' },
  { name: 'insights', items: SEED_INSIGHTS, label: 'Market Insights & Buying Guides' },
  { name: 'adminLogs', items: SEED_ADMIN_LOGS, label: 'Administrative Action Logs' },
];

// -----------------------------------------------------------------------------
// Service Account Detection
// -----------------------------------------------------------------------------
function findServiceAccountKey() {
  const possiblePaths = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    path.join(rootDir, 'serviceAccountKey.json'),
    path.join(rootDir, 'service-account.json'),
  ].filter(Boolean);

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.project_id && parsed.private_key) {
          return { filePath: p, data: parsed };
        }
      } catch {
        // Continue searching
      }
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// Admin SDK Setup Runner
// -----------------------------------------------------------------------------
async function runAdminSetup(serviceAccountInfo) {
  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getFirestore, FieldValue } = await import('firebase-admin/firestore');
  const serviceAccount = serviceAccountInfo.data;

  console.log(`✓ Service account file : ${serviceAccountInfo.filePath}`);
  console.log(`✓ Service account project: ${serviceAccount.project_id}`);

  if (serviceAccount.project_id !== EXPECTED_PROJECT_ID) {
    console.warn(`[WARNING] Service account project (${serviceAccount.project_id}) differs from VITE_FIREBASE_PROJECT_ID (${EXPECTED_PROJECT_ID}).`);
  }

  const existingApps = getApps();
  const app = existingApps.length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      })
    : existingApps[0];

  const firestore = getFirestore(app);
  
  // Verify database connectivity
  try {
    await firestore.listCollections();
    console.log(`✓ Database accessibility verified for project: ${serviceAccount.project_id}`);
  } catch (err) {
    console.error(`✗ Database connection error: ${err.message}`);
    throw err;
  }

  console.log('\n--- Processing Required Firestore Collections (Idempotent) ---');
  
  const results = [];

  for (const colDef of ALL_COLLECTIONS) {
    const colRef = firestore.collection(colDef.name);
    const existingSnap = await colRef.get();
    const existingCount = existingSnap.size;

    let createdCount = 0;
    let skippedCount = 0;

    for (const item of colDef.items) {
      const docRef = colRef.doc(item.docId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        skippedCount++;
      } else {
        const now = FieldValue.serverTimestamp();
        await docRef.set({
          ...item.data,
          createdAt: now,
          updatedAt: now,
        });
        createdCount++;
      }
    }

    const totalNow = existingCount + createdCount;
    results.push({
      collection: colDef.name,
      label: colDef.label,
      existingCount,
      createdCount,
      skippedCount,
      totalCount: totalNow,
    });

    console.log(`  • ${colDef.name.padEnd(20)} [${colDef.label}]`);
    console.log(`    Existing: ${existingCount} | Created: ${createdCount} | Skipped: ${skippedCount} | Total: ${totalNow}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('  FIRESTORE SETUP SUMMARY TABLE');
  console.log('='.repeat(70));
  console.log(
    'Collection'.padEnd(20) +
    'Existing'.padEnd(12) +
    'Created'.padEnd(12) +
    'Skipped'.padEnd(12) +
    'Total'.padEnd(10)
  );
  console.log('-'.repeat(66));
  for (const r of results) {
    console.log(
      r.collection.padEnd(20) +
      String(r.existingCount).padEnd(12) +
      String(r.createdCount).padEnd(12) +
      String(r.skippedCount).padEnd(12) +
      String(r.totalCount).padEnd(10)
    );
  }
  console.log('='.repeat(70));
  console.log('✓ All 9 collections successfully verified/created with stable seed documents.');
  console.log('✓ Existing business data preserved without destructive overwrites.');
}

// -----------------------------------------------------------------------------
// Client SDK Fallback Runner (if no Admin key is present)
// -----------------------------------------------------------------------------
async function runClientFallback() {
  console.log('\n[NOTICE] No local serviceAccountKey.json found.');
  console.log('Attempting setup using Firebase Client Web SDK...');

  const { initializeApp } = await import('firebase/app');
  const { getFirestore, doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');

  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: EXPECTED_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  for (const colDef of ALL_COLLECTIONS) {
    let createdCount = 0;
    let skippedCount = 0;

    for (const item of colDef.items) {
      const docRef = doc(db, colDef.name, item.docId);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          skippedCount++;
        } else {
          await setDoc(docRef, {
            ...item.data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          createdCount++;
        }
      } catch (err) {
        console.warn(`[INFO] Could not write ${colDef.name}/${item.docId} via Client SDK: ${err.message}`);
      }
    }
    console.log(`• ${colDef.name}: Created ${createdCount}, Skipped ${skippedCount}`);
  }
}

// -----------------------------------------------------------------------------
// Main Entry Point
// -----------------------------------------------------------------------------
async function main() {
  try {
    const serviceAccountInfo = findServiceAccountKey();

    if (serviceAccountInfo) {
      await runAdminSetup(serviceAccountInfo);
    } else {
      await runClientFallback();
    }
    process.exit(0);
  } catch (err) {
    console.error('\n[FATAL ERROR] Firestore setup script failed:', err);
    process.exit(1);
  }
}

main();
