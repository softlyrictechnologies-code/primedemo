export type PropertyType =
  | 'Agricultural Land'
  | 'Residential Plot'
  | 'Commercial Land'
  | 'Plantation / Estate'
  | 'Farmhouse / Villa Land'
  | 'Industrial Land';

export type AreaUnit = 'Acres' | 'Cents' | 'Sq. Ft' | 'Hectares' | 'Guntas';
export type PropertyStatus = 'published' | 'draft' | 'sold' | 'unavailable';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type EnquiryStatus = 'new' | 'contacted' | 'follow_up_required' | 'closed';

export interface Property {
  id: string;
  title: string;
  propertyRef: string;
  description: string;
  propertyType: PropertyType;
  location: string;
  district: string;
  town: string;
  village?: string;
  area: number;
  areaUnit: AreaUnit;
  price: number;
  images: string[];
  features: string[];
  roadAccess: string;
  approvalDetails: string;
  isFeatured: boolean;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
  sourceSubmissionId?: string;
}

export interface LandownerSubmission {
  id: string;
  submissionRef: string;
  ownerName: string;
  phone: string;
  email?: string;
  location: string;
  district: string;
  town: string;
  propertyType: PropertyType;
  area: number;
  areaUnit: AreaUnit;
  expectedPrice: number;
  description: string;
  roadAccess: string;
  approvalDetails?: string;
  images: string[];
  reviewStatus: ReviewStatus;
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface BuyerEnquiry {
  id: string;
  enquiryRef: string;
  buyerName: string;
  phone: string;
  email?: string;
  propertyId: string;
  propertyTitle: string;
  message: string;
  enquiryStatus: EnquiryStatus;
  followUpNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationItem {
  id: string;
  name: string;
  district: string;
  type: 'district' | 'town' | 'village';
  active: boolean;
}

export interface WebsiteContent {
  companyName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  aboutStory: string;
  yearsOfExcellence: number;
  acresManaged: number;
  satisfiedClients: number;
}
