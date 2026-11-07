export const CHENNAI_AREAS = [
  { id: 'all', name: 'All Locations', count: 48, avgPriceSqft: '₹4,450' },
  { id: 'OMR', name: 'OMR (IT Corridor)', count: 18, avgPriceSqft: '₹4,850', hot: true, highlight: 'Near Tech Parks & Metro Phase II' },
  { id: 'ECR', name: 'ECR (Coastal)', count: 12, avgPriceSqft: '₹7,200', hot: true, highlight: 'Premium Beachside Living' },
  { id: 'Siruseri', name: 'Siruseri Hub', count: 9, avgPriceSqft: '₹4,200', hot: false, highlight: 'Opposite SIPCOT Entrance' },
  { id: 'Navalur', name: 'Navalur', count: 6, avgPriceSqft: '₹5,100', hot: false, highlight: 'Near Vivira Mall & Multiplexes' },
  { id: 'Tambaram', name: 'Tambaram / GST', count: 8, avgPriceSqft: '₹3,600', hot: false, highlight: 'Railway & Outer Ring Road Access' },
  { id: 'Porur', name: 'Porur & West', count: 5, avgPriceSqft: '₹5,400', hot: false, highlight: 'Close to DLF Cybercity' },
];

export const PROPERTY_TYPES = [
  'All Types',
  'Residential Plot',
  'Villa Plot',
  'Gated Community Plot',
  'Commercial Land',
  'Agricultural Land'
];

export const BUDGET_RANGES = [
  { label: 'Any Budget', min: 0, max: Infinity },
  { label: 'Under ₹30 Lakhs', min: 0, max: 30 },
  { label: '₹30L - ₹60 Lakhs', min: 30, max: 60 },
  { label: '₹60L - ₹1.2 Crores', min: 60, max: 120 },
  { label: 'Above ₹1.2 Crores', min: 120, max: Infinity },
];

export const PLOTS_DATA = [
  {
    id: 'plot-1',
    title: 'Emerald Crest – Gated Villa Plot near SIPCOT',
    subTitle: 'Premium 1500 sq.ft Corner Plot with 40ft Avenue Road',
    location: 'Siruseri, OMR, Chennai',
    area: 'Siruseri',
    type: 'Villa Plot',
    priceLakhs: 58.5,
    formattedPrice: '₹58.5 Lakhs',
    pricePerSqft: 3900,
    totalAreaSqft: 1500,
    dimensions: '30 ft x 50 ft',
    facing: 'East Facing',
    roadWidth: '40 Feet Blacktop Road',
    approval: 'CMDA & DTCP Approved',
    approvalNo: 'CMDA/PPD/LO No. 34/2024',
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    ],
    pattaStatus: 'Clear Single Ownership Patta',
    waterSource: 'Sweet Potable Water at 35 ft Depth',
    bankLoans: ['HDFC', 'SBI', 'ICICI', 'Axis Bank'],
    landmarks: [
      '3 Mins to SIPCOT IT Park Main Gate',
      '5 Mins to PSBB Millennium School',
      '800m to Proposed Metro Station Phase 2'
    ],
    amenities: [
      '24/7 Gated Security & CCTV',
      'Underground Electricity Cables',
      'Solar Avenue Streetlights',
      'Rainwater Harvesting Pits',
      'Architect-Designed Landscaping & Children Play Area'
    ],
    appreciationRate: '+14.5% YoY',
    description: 'Emerald Crest offers an ultra-exclusive opportunity to build your luxury villa right at the heart of Chennai’s premier tech corridor in Siruseri. Fully approved by CMDA and DTCP with ready-to-construct infrastructure, underground EB, LED streetlights, and 40ft wide internal tar roads.',
    coordinates: { lat: 12.8285, lng: 80.2223 }
  },
  {
    id: 'plot-2',
    title: 'Azure Waters Coastal Avenue',
    subTitle: 'Luxury Ocean-Breeze Villa Plot 100m from ECR Beach',
    location: 'Uthandi, ECR, Chennai',
    area: 'ECR',
    type: 'Villa Plot',
    priceLakhs: 168.0,
    formattedPrice: '₹1.68 Crores',
    pricePerSqft: 7000,
    totalAreaSqft: 2400,
    dimensions: '40 ft x 60 ft',
    facing: 'North-East Corner',
    roadWidth: '50 Feet Main Avenue',
    approval: 'CMDA Approved & CRZ Cleared',
    approvalNo: 'CMDA/ECR/REG/112/2023',
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    ],
    pattaStatus: 'Computerized Patta in Hand',
    waterSource: 'Purified Water System & Deep Aquifer',
    bankLoans: ['HDFC', 'SBI', 'Axis Bank'],
    landmarks: [
      '100 Meters to Uthandi Quiet Beach',
      '4 Mins to Mayajaal Entertainment Multiplex',
      '15 Mins to Sholinganallur Junction'
    ],
    amenities: [
      'Private Gated Enclave',
      'Oceanview Promenade Walkway',
      'Underground Drainage & Fiber Optic Broadband',
      'Stormwater Drain Network'
    ],
    appreciationRate: '+18.2% YoY',
    description: 'Experience true coastal tranquility with Azure Waters. Located in the coveted Uthandi beach enclave, this North-East corner plot promises unhindered sea breeze, lush surroundings, and high capital growth for custom luxury home builders.',
    coordinates: { lat: 12.8622, lng: 80.2520 }
  },
  {
    id: 'plot-3',
    title: 'Navalur Grand Central Park View',
    subTitle: 'CMDA Approved Residential Plot adjacent to Vivira Mall',
    location: 'Navalur, OMR, Chennai',
    area: 'Navalur',
    type: 'Residential Plot',
    priceLakhs: 74.4,
    formattedPrice: '₹74.4 Lakhs',
    pricePerSqft: 6200,
    totalAreaSqft: 1200,
    dimensions: '30 ft x 40 ft',
    facing: 'North Facing',
    roadWidth: '33 Feet Road',
    approval: 'CMDA Approved',
    approvalNo: 'CMDA/PPD/LO No. 91/2023',
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=1200&q=80',
    ],
    pattaStatus: 'Clear Individual Patta',
    waterSource: 'Metro Water & Copious Ground Water',
    bankLoans: ['HDFC', 'ICICI', 'Canara Bank', 'SBI'],
    landmarks: [
      '2 Mins walk to Vivira Mall & AGS Cinemas',
      '3 Mins to Marina Mall & Navalur Bus Stop',
      'Direct Expressway Access'
    ],
    amenities: [
      'Compound Wall for Entire Layout',
      'Blacktop Road with Curbing',
      'Avenue Plantation',
      'Ready EB Connection Poles'
    ],
    appreciationRate: '+12.8% YoY',
    description: 'Prime Navalur residential plot situated right behind Vivira Mall. Perfect for constructing stilt+3 independent floors or a multi-family bungalow. High rental yields guaranteed due to proximity to TCS, Cognizant, and HCL campuses.',
    coordinates: { lat: 12.8465, lng: 80.2268 }
  },
  {
    id: 'plot-4',
    title: 'Perungudi Tech Gateway Land',
    subTitle: 'Commercial / Mixed-Use Plot close to Perungudi Toll',
    location: 'Perungudi, OMR, Chennai',
    area: 'OMR',
    type: 'Commercial Land',
    priceLakhs: 230.0,
    formattedPrice: '₹2.30 Crores',
    pricePerSqft: 9583,
    totalAreaSqft: 2400,
    dimensions: '40 ft x 60 ft',
    facing: 'East Facing',
    roadWidth: '60 Feet Commercial Avenue',
    approval: 'CMDA Multi-Story Approved',
    approvalNo: 'CMDA/MSB/2024/77',
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80',
    ],
    pattaStatus: 'Clear Commercial Title',
    waterSource: 'Metrowater Line Connected',
    bankLoans: ['SBI Commercial', 'HDFC Realty', 'Axis Bank'],
    landmarks: [
      '500m to Perungudi MRTS Station',
      '1 Min to World Trade Center Chennai',
      'Direct Connectivity to Taramani'
    ],
    amenities: [
      'High FSI Permission (up to 2.5)',
      '3-Phase Commercial EB Transformer',
      'Heavy Vehicle Access Road',
      'Fully Enclosed Perimeter Fence'
    ],
    appreciationRate: '+19.5% YoY',
    description: 'Rare commercial land parcel in Perungudi OMR ideal for tech office headquarters, boutique service apartments, or premium retail showroom. Exceptional frontage on a 60ft wide road with CMDA commercial clearance.',
    coordinates: { lat: 12.9642, lng: 80.2461 }
  },
  {
    id: 'plot-5',
    title: 'Akkarai Sanctuary Beachside Plot',
    subTitle: 'Secluded 1800 sq.ft Resort-Style Plot on ECR',
    location: 'Akkarai, ECR, Chennai',
    area: 'ECR',
    type: 'Villa Plot',
    priceLakhs: 135.0,
    formattedPrice: '₹1.35 Crores',
    pricePerSqft: 7500,
    totalAreaSqft: 1800,
    dimensions: '30 ft x 60 ft',
    facing: 'South-East Facing',
    roadWidth: '35 Feet Gated Avenue',
    approval: 'DTCP & Panchayat Approved',
    approvalNo: 'DTCP/ECR/AK-55',
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    ],
    pattaStatus: 'Verified Patta & EC 30 Years',
    waterSource: 'Subterranean Fresh Water Spring',
    bankLoans: ['HDFC', 'ICICI Bank'],
    landmarks: [
      '3 Mins to Akkarai Signal & Link Road',
      '10 Mins to ECR Beach Clubs & Fine Dining',
      'Easy Bypass to Sholinganallur'
    ],
    amenities: [
      'Exclusive Gated Community of 12 Villas',
      'Underground Drainage',
      'Security Post with Automated Barrier',
      'Solar Powered Common Lighting'
    ],
    appreciationRate: '+16.0% YoY',
    description: 'Located in the ultra-high net worth Akkarai zone right off the ECR Link Road. Build your weekend getaway villa or permanent dream residence amidst lush green palm trees and pristine sea air.',
    coordinates: { lat: 12.8988, lng: 80.2489 }
  },
  {
    id: 'plot-6',
    title: 'Tambaram East Royal Greens Phase III',
    subTitle: 'Affordable Residential Plot 8 Mins from Tambaram Station',
    location: 'Tambaram East, GST Road, Chennai',
    area: 'Tambaram',
    type: 'Gated Community Plot',
    priceLakhs: 39.6,
    formattedPrice: '₹39.6 Lakhs',
    pricePerSqft: 3300,
    totalAreaSqft: 1200,
    dimensions: '30 ft x 40 ft',
    facing: 'North Facing',
    roadWidth: '30 Feet Tar Road',
    approval: 'CMDA Approved',
    approvalNo: 'CMDA/TMB/LO-2024/09',
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    ],
    pattaStatus: 'Clear Patta with Zero Encumbrance',
    waterSource: 'Borewell Water at 45 ft',
    bankLoans: ['SBI', 'HDFC', 'PNB Housing', 'LIC Housing'],
    landmarks: [
      '8 Mins to Tambaram Railway Terminal',
      '5 Mins to MCC (Madras Christian College)',
      'Direct Access to Outer Ring Road (ORR)'
    ],
    amenities: [
      'Grand Entrance Arch',
      'Children Play Park & Jogging Track',
      'Compound Security Wall',
      'Streetlights & Stormwater Drains'
    ],
    appreciationRate: '+11.2% YoY',
    description: 'Perfect budget-friendly investment for first-time home builders in Tambaram East. Highly accessible via GST road, Camp Road, and Selaiyur. Excellent connectivity to Chennai Airport and Kilambakkam Bus Terminus.',
    coordinates: { lat: 12.9250, lng: 80.1400 }
  },
  {
    id: 'plot-7',
    title: 'Porur Tech Park View Layout',
    subTitle: 'Premium Residential Land 3 Mins from DLF Cybercity',
    location: 'Porur, West Chennai',
    area: 'Porur',
    type: 'Residential Plot',
    priceLakhs: 86.4,
    formattedPrice: '₹86.4 Lakhs',
    pricePerSqft: 5400,
    totalAreaSqft: 1600,
    dimensions: '32 ft x 50 ft',
    facing: 'East Facing',
    roadWidth: '33 Feet Avenue Road',
    approval: 'CMDA Approved',
    approvalNo: 'CMDA/POR/2023/144',
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
    ],
    pattaStatus: 'Title Clear Single Owner Patta',
    waterSource: 'Metrowater & Deep Aquifer',
    bankLoans: ['HDFC', 'ICICI', 'SBI', 'Axis'],
    landmarks: [
      '3 Mins to DLF IT Park & L&T Infocity',
      '5 Mins to SRMC Ramachandra Hospital',
      'Quick Reach to Poonamallee High Road'
    ],
    amenities: [
      'Gated Entry Gate',
      'Underground Drainage & Electricity',
      'Tree Lined Avenues',
      'Paved Footpaths'
    ],
    appreciationRate: '+15.1% YoY',
    description: 'High capital value plot in Porur, Chennai’s west hub. Located in a tranquil residential residential pocket with easy walkability to DLF IT campus and Ramachandra Hospital.',
    coordinates: { lat: 13.0382, lng: 80.1565 }
  },
  {
    id: 'plot-8',
    title: 'Padur Eco Living Organic Farmstead',
    subTitle: 'Spacious Agricultural / Hobby Farm Plot near Kazhipattur Lake',
    location: 'Padur, OMR, Chennai',
    area: 'OMR',
    type: 'Agricultural Land',
    priceLakhs: 42.0,
    formattedPrice: '₹42.0 Lakhs',
    pricePerSqft: 1750,
    totalAreaSqft: 2400,
    dimensions: '40 ft x 60 ft',
    facing: 'North-West Facing',
    roadWidth: '30 Feet Dirt-Tar Access Road',
    approval: 'DTCP Approved Eco Layout',
    approvalNo: 'DTCP/OMR/PAD/88',
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    ],
    pattaStatus: 'Clear Farm Patta Title',
    waterSource: 'High Yield Organic Well Water',
    bankLoans: ['SBI Agriculture', 'NABARD Approved'],
    landmarks: [
      '2 Mins to Hindustan University',
      '5 Mins to Chettinad Health City',
      'Near Muttukadu Backwaters'
    ],
    amenities: [
      'Drip Irrigation Pipeline setup',
      'Fruit Trees Planted (Mango, Chiku, Coconut)',
      'Solar Fencing Perimeter',
      'Organic Soil Certification'
    ],
    appreciationRate: '+13.0% YoY',
    description: 'Ideal for building an weekend farm sanctuary or eco-cottage close to OMR. Rich fertile soil with established coconut and fruit-bearing trees.',
    coordinates: { lat: 12.8050, lng: 80.2290 }
  }
];

export const CHENNAI_STATS = {
  verifiedPlotsCount: '1,420+',
  totalBuyers: '8,500+',
  avgAppreciation: '14.8%',
  verifiedPartners: ['CMDA', 'DTCP', 'RERA Tamil Nadu', 'CREDAI Chennai']
};

export const REVIEWS = [
  {
    id: 1,
    name: 'Ranganathan V.',
    role: 'IT Director @ Cognizant, OMR',
    comment: 'Found my dream 2400 sq.ft villa plot in Siruseri within 3 days on Prime Housing! The CMDA verification document check and instant site visit arrangement were completely hassle-free.',
    rating: 5,
    location: 'Purchased in Siruseri'
  },
  {
    id: 2,
    name: 'Dr. Priya Sundaram',
    role: 'Senior Consultant, Apollo Hospitals',
    comment: 'Prime Housing’s clean design and detailed sq.ft price comparison gave us total clarity. We bought an ECR coastal plot with complete peace of mind.',
    rating: 5,
    location: 'Purchased in Uthandi ECR'
  },
  {
    id: 3,
    name: 'Karthik & Ananya Subramanian',
    role: 'NRI Investors (Singapore)',
    comment: 'Buying land remotely from overseas is usually scary, but Prime Housing’s 360 virtual tour, verified Patta documents, and live video walkthrough made it 100% transparent!',
    rating: 5,
    location: 'Purchased in Navalur OMR'
  }
];
