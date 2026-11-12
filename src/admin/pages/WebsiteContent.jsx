import React, { useEffect, useState } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Eye, Loader2, Mail, MapPin, Phone, Save, Sparkles, PencilLine } from 'lucide-react';
import { db } from '../../firebase.js';
import { DEFAULT_PUBLIC_SITE_CONTENT } from '../../services/publicSiteContent.js';
import { useAdminAuth } from '../context/AdminAuthContext';
import { logAdminAction } from '../services/adminLogService';

const EDITABLE_SECTIONS = [
  {
    title: 'Homepage hero and search',
    fields: [
      { key: 'heroEyebrow', label: 'Hero eyebrow' },
      { key: 'heroTitle', label: 'Hero headline', rows: 2 },
      { key: 'heroValueProposition', label: 'Hero value proposition', rows: 2 },
      { key: 'heroDescription', label: 'Hero description', rows: 3 },
      { key: 'heroTrustOne', label: 'Trust label 1' },
      { key: 'heroTrustTwo', label: 'Trust label 2' },
      { key: 'heroTrustThree', label: 'Trust label 3' },
      { key: 'allLocationsLabel', label: 'All locations option' },
      { key: 'allCategoriesLabel', label: 'All categories option' },
      { key: 'searchPlaceholder', label: 'Search placeholder' },
      { key: 'searchButtonText', label: 'Search button text' },
    ],
  },
  {
    title: 'Property categories',
    fields: [
      { key: 'offeringsEyebrow', label: 'Section label' },
      { key: 'offeringsTitle', label: 'Section heading' },
      { key: 'offeringsSubtitle', label: 'Section description', rows: 2 },
      { key: 'offeringOneTitle', label: 'Category 1 title' },
      { key: 'offeringOneNote', label: 'Category 1 description' },
      { key: 'offeringTwoTitle', label: 'Category 2 title' },
      { key: 'offeringTwoNote', label: 'Category 2 description' },
      { key: 'offeringThreeTitle', label: 'Category 3 title' },
      { key: 'offeringThreeNote', label: 'Category 3 description' },
      { key: 'offeringFourTitle', label: 'Category 4 title' },
      { key: 'offeringFourNote', label: 'Category 4 description' },
      { key: 'offeringLinkText', label: 'Category link text' },
    ],
  },
  {
    title: 'Featured listings',
    fields: [
      { key: 'featuredEyebrow', label: 'Section label' },
      { key: 'featuredTitle', label: 'Section heading' },
      { key: 'featuredSubtitle', label: 'Section description', rows: 2 },
      { key: 'latestTitle', label: 'Latest listings heading' },
      { key: 'latestSubtitle', label: 'Latest listings description', rows: 2 },
      { key: 'latestEmptyText', label: 'Latest listings empty state' },
      { key: 'featuredViewAllText', label: 'View all link text' },
      { key: 'featuredBadgeText', label: 'Featured badge' },
      { key: 'propertyDetailsText', label: 'Details button' },
      { key: 'loadMoreText', label: 'Load more button' },
      { key: 'emptyFeaturedText', label: 'Empty state message', rows: 2 },
      { key: 'emptyFeaturedLinkText', label: 'Empty state link' },
    ],
  },
  {
    title: 'Why choose Prime Housing',
    fields: [
      { key: 'whyEyebrow', label: 'Section label' },
      { key: 'whyTitle', label: 'Section heading' },
      { key: 'whyPointOne', label: 'Benefit 1', rows: 2 },
      { key: 'whyPointTwo', label: 'Benefit 2', rows: 2 },
      { key: 'whyPointThree', label: 'Benefit 3', rows: 2 },
      { key: 'whyPointFour', label: 'Benefit 4', rows: 2 },
      { key: 'whyPointFive', label: 'Benefit 5', rows: 2 },
      { key: 'whyPointSix', label: 'Benefit 6', rows: 2 },
    ],
  },
  {
    title: 'Popular locations',
    fields: [
      { key: 'locationsEyebrow', label: 'Section label' },
      { key: 'locationsTitle', label: 'Section heading' },
      { key: 'locationsDescription', label: 'Section description', rows: 2 },
      { key: 'locationsLinkText', label: 'Locations link' },
      { key: 'locationsEmptyText', label: 'Empty state message', rows: 2 },
      { key: 'plotSingularText', label: 'Single property count word' },
      { key: 'plotPluralText', label: 'Multiple property count word' },
    ],
  },
  {
    title: 'Site navigation',
    fields: [
      { key: 'navHome', label: 'Home link' },
      { key: 'navProperties', label: 'All properties link' },
      { key: 'navResidential', label: 'Residential plots link' },
      { key: 'navCommercial', label: 'Commercial link' },
      { key: 'navJointVenture', label: 'Joint venture link' },
      { key: 'navFarmLand', label: 'Farm land link' },
      { key: 'navListLand', label: 'List your land link' },
      { key: 'navAbout', label: 'About link' },
      { key: 'navContact', label: 'Contact link' },
    ],
  },
  {
    title: 'Public About page',
    fields: [
      { key: 'aboutEyebrow', label: 'Page label' },
      { key: 'aboutTitle', label: 'Page heading', rows: 2 },
      { key: 'aboutDescription', label: 'Introduction', rows: 4 },
      { key: 'intro', label: 'Company overview', rows: 4 },
      { key: 'aboutFeatureOneTitle', label: 'Feature 1 title' },
      { key: 'aboutFeatureOneNote', label: 'Feature 1 description', rows: 2 },
      { key: 'aboutFeatureTwoTitle', label: 'Feature 2 title' },
      { key: 'aboutFeatureTwoNote', label: 'Feature 2 description', rows: 2 },
      { key: 'aboutFeatureThreeTitle', label: 'Feature 3 title' },
      { key: 'aboutFeatureThreeNote', label: 'Feature 3 description', rows: 2 },
      { key: 'aboutFeatureFourTitle', label: 'Feature 4 title' },
      { key: 'aboutFeatureFourNote', label: 'Feature 4 description', rows: 2 },
      { key: 'aboutServicesTitle', label: 'Services heading' },
      { key: 'aboutServiceOne', label: 'Service 1', rows: 2 },
      { key: 'aboutServiceTwo', label: 'Service 2', rows: 2 },
      { key: 'aboutServiceThree', label: 'Service 3', rows: 2 },
      { key: 'aboutServiceFour', label: 'Service 4', rows: 2 },
      { key: 'aboutCtaText', label: 'Listings button text' },
    ],
  },
  {
    title: 'Public Contact page',
    fields: [
      { key: 'contactEyebrow', label: 'Page label' },
      { key: 'contactTitle', label: 'Page heading' },
      { key: 'contactSubtitle', label: 'Introduction', rows: 2 },
      { key: 'contactUrgentTitle', label: 'Urgent contact heading' },
      { key: 'contactUrgentDescription', label: 'Urgent contact description', rows: 3 },
      { key: 'contactNameLabel', label: 'Name field label' },
      { key: 'contactPhoneLabel', label: 'Phone field label' },
      { key: 'contactEmailLabel', label: 'Email field label' },
      { key: 'contactSubjectLabel', label: 'Subject field label' },
      { key: 'contactMessageLabel', label: 'Message field label' },
      { key: 'contactSubmitText', label: 'Submit button text' },
      { key: 'contactNamePlaceholder', label: 'Name placeholder' },
      { key: 'contactPhonePlaceholder', label: 'Phone placeholder' },
      { key: 'contactEmailPlaceholder', label: 'Email placeholder' },
      { key: 'contactSubjectPlaceholder', label: 'Subject placeholder' },
      { key: 'contactMessagePlaceholder', label: 'Message placeholder' },
    ],
  },
  {
    title: 'Other public pages and footer',
    fields: [
      { key: 'intro', label: 'Company introduction', rows: 4 },
      { key: 'catalogTitle', label: 'Property catalogue heading' },
      { key: 'catalogDescription', label: 'Property catalogue description', rows: 2 },
      { key: 'submitTitle', label: 'Land submission heading' },
      { key: 'submitDescription', label: 'Land submission description', rows: 2 },
      { key: 'conversionTitle', label: 'Homepage call-to-action heading' },
      { key: 'conversionSubtitle', label: 'Homepage call-to-action description', rows: 2 },
      { key: 'conversionPrimaryText', label: 'Primary call-to-action button' },
      { key: 'conversionSecondaryText', label: 'Secondary call-to-action button' },
      { key: 'footerDescription', label: 'Footer company description', rows: 3 },
      { key: 'testimonialEyebrow', label: 'Testimonial section label' },
      { key: 'testimonialTitle', label: 'Testimonial heading' },
      { key: 'footerTrustOne', label: 'Footer trust point 1' },
      { key: 'footerTrustTwo', label: 'Footer trust point 2' },
      { key: 'footerNavTitle', label: 'Footer navigation heading' },
      { key: 'footerBrowseLink', label: 'Footer browse link' },
      { key: 'footerListLink', label: 'Footer list land link' },
      { key: 'footerAboutLink', label: 'Footer About link' },
      { key: 'footerContactLink', label: 'Footer Contact link' },
      { key: 'footerCorridorsTitle', label: 'Footer corridor heading' },
      { key: 'footerCorridorsText', label: 'Footer corridors, one per line', rows: 6 },
      { key: 'footerContactTitle', label: 'Footer contact heading' },
      { key: 'footerContactRole', label: 'Footer team title' },
      { key: 'footerLocationSuffix', label: 'Footer location suffix' },
      { key: 'footerPropertyGuidanceLink', label: 'Footer property guidance link' },
      { key: 'footerSellLink', label: 'Footer sell link' },
      { key: 'footerCopyright', label: 'Footer copyright text' },
      { key: 'reviewOneName', label: 'Review 1 name' },
      { key: 'reviewOneRole', label: 'Review 1 role' },
      { key: 'reviewOneComment', label: 'Review 1 comment', rows: 3 },
      { key: 'reviewOneLocation', label: 'Review 1 location' },
      { key: 'reviewTwoName', label: 'Review 2 name' },
      { key: 'reviewTwoRole', label: 'Review 2 role' },
      { key: 'reviewTwoComment', label: 'Review 2 comment', rows: 3 },
      { key: 'reviewTwoLocation', label: 'Review 2 location' },
      { key: 'reviewThreeName', label: 'Review 3 name' },
      { key: 'reviewThreeRole', label: 'Review 3 role' },
      { key: 'reviewThreeComment', label: 'Review 3 comment', rows: 3 },
      { key: 'reviewThreeLocation', label: 'Review 3 location' },
    ],
  },
];
const EDITABLE_FIELDS = EDITABLE_SECTIONS.flatMap(({ fields }) => fields);

function TextField({ field, value, onChange, disabled }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{field.label}</span>
      {field.rows ? (
        <textarea rows={field.rows} value={value} disabled={disabled} onChange={onChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60" />
      ) : (
        <input value={value} disabled={disabled} onChange={onChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60" />
      )}
    </label>
  );
}

export default function WebsiteContent() {
  const { isAdmin, role } = useAdminAuth();
  const canEdit = isAdmin || role === 'editor';
  const [content, setContent] = useState(DEFAULT_PUBLIC_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let active = true;
    getDoc(doc(db, 'websiteContent', 'site'))
      .then((snapshot) => {
        if (!active) return;
        if (snapshot.exists()) setContent((current) => ({ ...current, ...snapshot.data() }));
      })
      .catch((loadError) => {
        console.error('[WebsiteContent] Could not load website copy:', loadError);
        if (active) setError('Could not load saved content. You can still edit the default copy and try again.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const update = (key, value) => setContent((current) => ({ ...current, [key]: value }));

  const handleSave = async (event) => {
    event.preventDefault();
    if (!canEdit) {
      setError('Administrator access is required to save public website content.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = Object.fromEntries(
        [...EDITABLE_FIELDS.map(({ key }) => key), 'phone', 'email', 'location']
          .map((key) => [key, String(content[key] || '').trim()])
      );
      await setDoc(doc(db, 'websiteContent', 'site'), {
        ...payload,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      await logAdminAction({ action: 'WEBSITE_CONTENT_UPDATED', target: 'websiteContent', targetId: 'site' });
      setEditing(false);
      setNotice('Website content saved. Public pages sync these changes from Firebase automatically.');
    } catch (saveError) {
      console.error('[WebsiteContent] Could not save website copy:', saveError);
      setError(saveError.message || 'Could not save website content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">Public website</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Edit website content</h2>
            <p className="mt-1 text-sm text-slate-500">Edit homepage sections and public page copy. Saved changes sync to public pages from Firebase automatically.</p>
          </div>
          <Link to="/" target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            <Eye className="h-4 w-4" /> Preview public site
          </Link>
          <button type="button" disabled={!canEdit || loading} onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl border border-[#cbd8cf] px-4 py-2.5 text-sm font-bold text-[#153d32] hover:bg-[#f1f5f0] disabled:opacity-50">
            <PencilLine className="h-4 w-4" /> {editing ? 'Editing content' : 'Edit content'}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900">Page copy</h3>
          {loading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading saved content...</div>
          ) : (
            <div className="mt-5 space-y-6">
              {EDITABLE_SECTIONS.map((section) => (
                <fieldset key={section.title} className="rounded-2xl border border-slate-200 p-4">
                  <legend className="px-2 text-sm font-black text-slate-800">{section.title}</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {section.fields.map((field) => (
                      <div key={field.key} className={field.rows ? 'sm:col-span-2' : ''}>
                        <TextField field={field} value={content[field.key] || ''} disabled={!canEdit || !editing} onChange={(event) => update(field.key, event.target.value)} />
                      </div>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900">Contact information</h3>
            <div className="mt-5 space-y-4">
              {[
                { key: 'phone', label: 'Public phone number', Icon: Phone },
                { key: 'email', label: 'Public email address', Icon: Mail },
                { key: 'location', label: 'Service area', Icon: MapPin },
              ].map(({ key, label, Icon }) => (
                <label key={key} className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
                  <span className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <Icon className="h-4 w-4 shrink-0 text-indigo-600" />
                    <input value={content[key] || ''} disabled={!canEdit || !editing} onChange={(event) => update(key, event.target.value)} className="w-full bg-transparent text-sm text-slate-800 outline-none disabled:opacity-60" />
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-blue-900/10 bg-[#10243b] p-6 text-white shadow-sm">
            <div className="flex items-center gap-2 text-blue-200"><Sparkles className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[0.16em]">Live copy preview</p></div>
            <h3 className="mt-4 font-serif text-2xl font-bold">{content.heroTitle || 'Your homepage headline'}</h3>
            <p className="mt-2 text-sm leading-6 text-blue-50/80">{content.heroDescription || 'Your homepage description'}</p>
            <p className="mt-4 border-t border-white/15 pt-4 text-xs text-blue-100/80">{content.phone} · {content.email}</p>
          </section>

          <button type="submit" disabled={!canEdit || !editing || saving || loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#153d32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#214f40] disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving website content...' : 'Save website content'}
          </button>
        </div>
      </div>
    </form>
  );
}
