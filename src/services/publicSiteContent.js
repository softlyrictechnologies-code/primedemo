import { useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';

export const DEFAULT_PUBLIC_SITE_CONTENT = {
  companyName: 'Prime Housing',
  tagline: 'Property listings and land advisory in Chennai',
  primaryColor: '#153D32',
  phone: '+91 98400 40327',
  email: 'hello@primehousing.in',
  location: 'Chennai & South India',
  navHome: 'Home',
  navProperties: 'All Properties',
  navResidential: 'Residential Plots',
  navCommercial: 'Commercial',
  navJointVenture: 'Joint Venture',
  navFarmLand: 'Farm Land',
  navListLand: 'List Your Land',
  navAbout: 'About',
  navContact: 'Contact',
  heroTitle: 'Find Land That Builds Your Future.',
  heroValueProposition: "Discover carefully selected residential plots, investment land, and commercial opportunities across Chennai and surrounding locations.",
  heroDescription: '',
  heroEyebrow: 'A considered collection of land',
  heroTrustOne: 'Reviewed before publishing',
  heroTrustTwo: 'Clear property details',
  heroTrustThree: 'Direct enquiry support',
  allLocationsLabel: 'All locations',
  allCategoriesLabel: 'All categories',
  searchPlaceholder: 'Place, neighbourhood or property...',
  searchButtonText: 'Search',
  intro: 'Prime Housing connects landowners and buyers through a transparent, thoughtful marketplace for residential plots, commercial land, agricultural properties, and estates.',
  offeringsEyebrow: 'Browse by type',
  offeringsTitle: 'Find the right land for what comes next',
  offeringsSubtitle: 'Explore land for a home, a business, or your next investment.',
  offeringOneTitle: 'Residential plots',
  offeringOneNote: 'Find a site for your home',
  offeringTwoTitle: 'Commercial plots',
  offeringTwoNote: 'Land for business plans',
  offeringThreeTitle: 'Investment land',
  offeringThreeNote: 'Explore opportunities in high-growth corridors',
  offeringFourTitle: 'Farm & agricultural land',
  offeringFourNote: 'Explore open land opportunities',
  offeringLinkText: 'Explore',
  featuredEyebrow: 'Featured',
  featuredTitle: 'Exceptional Land. Exceptional Opportunities.',
  featuredSubtitle: 'Explore properties selected for location, accessibility, and investment potential.',
  latestTitle: 'Recently added properties',
  latestSubtitle: 'New opportunities recently added to the collection.',
  latestEmptyText: 'New property listings will appear here as they are published.',
  featuredViewAllText: 'View all',
  featuredBadgeText: 'Featured',
  propertyDetailsText: 'Details',
  loadMoreText: 'Load more property',
  emptyFeaturedText: 'Featured listings will appear here as they are published.',
  emptyFeaturedLinkText: 'Browse all properties',
  whyEyebrow: 'Why choose us',
  whyTitle: 'A simpler land buying process',
  whyPointOne: 'Property submissions reviewed before publication',
  whyPointTwo: 'Useful listing details for comparing opportunities',
  whyPointThree: 'Explore established Chennai neighbourhoods',
  whyPointFour: 'A clear route for buyers and landowners to connect',
  whyPointFive: 'Strategic locations near Chennai growth corridors',
  whyPointSix: 'Professional assistance throughout your property search',
  locationsEyebrow: 'Explore Chennai',
  locationsTitle: 'Find land in your preferred location',
  locationsDescription: 'Browse available properties by neighbourhood.',
  locationsLinkText: 'All locations',
  locationsEmptyText: 'Location collections will appear as properties are published.',
  plotSingularText: 'Plot',
  plotPluralText: 'Plots',
  catalogTitle: 'Find your property',
  catalogDescription: 'Browse land and property listings with transparent details and straightforward search filters.',
  aboutTitle: 'A more considered way to find the right piece of land.',
  aboutEyebrow: 'About Prime Housing',
  aboutDescription: 'Prime Housing brings buyers and landowners together through a clear, thoughtful property experience. Explore homesites, investment plots, agricultural land, and commercial opportunities, with a local team ready to help you take the next step.',
  aboutFeatureOneTitle: 'Agricultural & lifestyle land',
  aboutFeatureOneNote: 'Cultivable fields, farm plots, and high-growth holdings in premium corridors.',
  aboutFeatureTwoTitle: 'A considered review',
  aboutFeatureTwoNote: 'Submissions are reviewed by the team before a property can be published.',
  aboutFeatureThreeTitle: 'Location-led search',
  aboutFeatureThreeNote: 'Explore properties across Chennai growth corridors, plantation clusters, and rural land belts.',
  aboutFeatureFourTitle: 'Buyer support',
  aboutFeatureFourNote: 'Follow-up, enquiry management, and closure coordination for every acquisition lead.',
  aboutServicesTitle: 'Our services',
  aboutServiceOne: 'Verified property discovery for residential and investment plots',
  aboutServiceTwo: 'Landowner submission review, approval tracking and publishing workflows',
  aboutServiceThree: 'Buyer-oriented enquiry handling and follow-up coordination',
  aboutServiceFour: 'Market guidance across major Chennai growth corridors and property categories',
  aboutCtaText: 'Explore listings',
  conversionTitle: 'Your Land Deserves the Right Buyer.',
  conversionSubtitle: 'Connect your property with serious buyers through our professional listing and enquiry process.',
  conversionPrimaryText: 'List Your Land',
  conversionSecondaryText: 'Talk to Our Team',
  footerDescription: 'A considered collection of homesites and land, backed by local knowledge and clear guidance from first search to next steps.',
  testimonialEyebrow: 'Local property guidance in Chennai',
  testimonialTitle: 'What Land Buyers Say',
  footerTrustOne: 'Documentation guidance',
  footerTrustTwo: 'Local market insight',
  footerNavTitle: 'Navigation & Links',
  footerBrowseLink: 'Browse All Chennai Plots',
  footerListLink: 'List Your Land / Sell Property',
  footerAboutLink: 'About Our Company',
  footerContactLink: 'Contact & Support',
  footerCorridorsTitle: 'Key Corridors',
  footerCorridorsText: 'OMR Tech Expressway\nECR Coastal Belt\nSiruseri SIPCOT Hub\nNavalur Residential\nTambaram & GST Road\nPorur & DLF Cybercity',
  footerContactTitle: 'Chennai Land Advisory',
  footerContactRole: 'Property Team',
  footerLocationSuffix: 'Land Advisory Desk',
  footerPropertyGuidanceLink: 'Property guidance',
  footerSellLink: 'Sell Land',
  footerCopyright: 'All rights reserved.',
  reviewOneName: 'Ranganathan V.',
  reviewOneRole: 'IT Director @ Cognizant, OMR',
  reviewOneComment: 'Found a villa plot in Siruseri with Prime Housing. The legal verification and enquiry handling were clear and helpful.',
  reviewOneLocation: 'Purchased in Siruseri',
  reviewTwoName: 'Dr. Priya Sundaram',
  reviewTwoRole: 'Senior Consultant, Apollo Hospitals',
  reviewTwoComment: 'Prime Housing’s clean design and detailed sq.ft price comparison gave us total clarity. We bought an ECR coastal plot with complete peace of mind.',
  reviewTwoLocation: 'Purchased in Uthandi ECR',
  reviewThreeName: 'Karthik & Ananya Subramanian',
  reviewThreeRole: 'NRI Investors (Singapore)',
  reviewThreeComment: 'Buying land remotely from overseas is usually scary, but Prime Housing’s 360 virtual tour, verified Patta documents, and live video walkthrough made it 100% transparent!',
  reviewThreeLocation: 'Purchased in Navalur OMR',
  contactEyebrow: 'Contact us',
  contactTitle: 'We’d love to help',
  contactSubtitle: 'Tell us what you are looking for and our team will get back to you.',
  contactUrgentTitle: 'Need urgent assistance?',
  contactUrgentDescription: 'Our property advisory team can guide you on buyer enquiries, land submission reviews, and partnership opportunities.',
  contactNameLabel: 'Name',
  contactPhoneLabel: 'Phone',
  contactEmailLabel: 'Email',
  contactSubjectLabel: 'Subject',
  contactMessageLabel: 'Message',
  contactSubmitText: 'Send message',
  contactNamePlaceholder: 'Your name',
  contactPhonePlaceholder: '9876543210',
  contactEmailPlaceholder: 'you@example.com',
  contactSubjectPlaceholder: 'General enquiry',
  contactMessagePlaceholder: 'Tell us how we can help',
  submitTitle: 'Submit your land for review',
  submitDescription: 'Share the property details and our team will contact you after an initial review.',
};

function mergePublicSiteContent(settings = {}, content = {}) {
  return {
    ...DEFAULT_PUBLIC_SITE_CONTENT,
    ...settings,
    ...content,
    companyName: content.companyName || settings.companyName || DEFAULT_PUBLIC_SITE_CONTENT.companyName,
    primaryColor: typeof (content.primaryColor || settings.primaryColor) === 'string' && (content.primaryColor || settings.primaryColor).toLowerCase() !== '#ff7900'
      ? (content.primaryColor || settings.primaryColor)
      : DEFAULT_PUBLIC_SITE_CONTENT.primaryColor,
    tagline: content.tagline || settings.tagline || settings.trustLine || DEFAULT_PUBLIC_SITE_CONTENT.tagline,
    phone: content.phone || settings.phone || DEFAULT_PUBLIC_SITE_CONTENT.phone,
    email: content.email || settings.email || DEFAULT_PUBLIC_SITE_CONTENT.email,
    location: content.location || settings.location || DEFAULT_PUBLIC_SITE_CONTENT.location,
  };
}

export async function fetchPublicSiteContent() {
  const [settingsResult, contentResult] = await Promise.allSettled([
    getDoc(doc(db, 'siteSettings', 'site')),
    getDoc(doc(db, 'websiteContent', 'site')),
  ]);
  const settings = settingsResult.status === 'fulfilled' && settingsResult.value.exists() ? settingsResult.value.data() : {};
  const content = contentResult.status === 'fulfilled' && contentResult.value.exists() ? contentResult.value.data() : {};
  return mergePublicSiteContent(settings, content);
}

export function usePublicSiteContent() {
  const [siteContent, setSiteContent] = useState(DEFAULT_PUBLIC_SITE_CONTENT);

  useEffect(() => {
    let settings = {};
    let content = {};
    const publish = () => setSiteContent(mergePublicSiteContent(settings, content));
    const handleError = (error) => console.warn('[PublicSiteContent] Could not sync website content:', error);
    const unsubscribeSettings = onSnapshot(doc(db, 'siteSettings', 'site'), (snapshot) => {
      settings = snapshot.exists() ? snapshot.data() : {};
      publish();
    }, handleError);
    const unsubscribeContent = onSnapshot(doc(db, 'websiteContent', 'site'), (snapshot) => {
      content = snapshot.exists() ? snapshot.data() : {};
      publish();
    }, handleError);
    return () => {
      unsubscribeSettings();
      unsubscribeContent();
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--ph-brand-accent', siteContent.primaryColor || '#2f6d51');
  }, [siteContent.primaryColor]);

  return siteContent;
}
