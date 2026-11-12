import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, Ruler, Building2, Phone, Mail, ShieldCheck, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { getPropertyById } from '../services/propertyService';
import { submitInquiry } from '../services/inquiryService';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    message: '',
    website: '',
  });

  useEffect(() => {
    let ignore = false;

    const fetchProperty = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const match = await getPropertyById(id);
        if (!ignore) setProperty(match?.published ? match : null);
      } catch (error) {
        console.error('Could not load property details:', error);
        if (!ignore) {
          setProperty(null);
          setLoadError(error?.code === 'permission-denied'
            ? 'This property is not currently available.'
            : 'We could not load this property right now. Please try again.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchProperty();
    return () => {
      ignore = true;
    };
  }, [id]);

  const gallery = useMemo(() => {
    const propertyImages = [property?.image, ...(property?.gallery || property?.images || [])].filter(Boolean);
    const images = [...new Set(propertyImages)];
    return images.length > 0 ? images : ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'];
  }, [property]);

  const priceInLakhs = Number(property?.priceLakhs ?? (property?.price ? property.price / 100000 : property?.expectedPrice ? property.expectedPrice / 100000 : 0));
  const displayPrice = priceInLakhs >= 100
    ? `₹${(priceInLakhs / 100).toFixed(2)} Cr`
    : `₹${priceInLakhs.toLocaleString('en-IN')} L`;

  useEffect(() => setActiveImageIndex(0), [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!property || form.website) return;

    setSubmitting(true);
    try {
      await submitInquiry({
        propertyId: property.id || property.referenceId || 'property',
        propertyTitle: property.title || property.location || 'Property',
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        message: form.message,
        status: 'new',
        source: 'website',
      });

      setToastMessage('Your enquiry has been submitted successfully.');
      setForm({ name: '', phone: '', email: '', address: '', message: '', website: '' });
    } catch (error) {
      const msg = error?.message || 'Unable to submit enquiry right now.';
      setToastMessage(msg === 'We already received your enquiry today' ? 'We already received your enquiry today.' : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto" />
          <p className="mt-4 text-sm font-bold text-slate-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="rounded-3xl bg-white max-w-lg w-full p-8 border border-slate-200 text-center shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">{loadError ? 'Property unavailable' : 'Property not found'}</h2>
          <p className="mt-2 text-sm text-slate-600">{loadError || 'The requested listing is no longer available or has not been published yet.'}</p>
          <Link to="/properties" className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white">
            <ArrowLeft className="h-4 w-4" /> Back to properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ph-site min-h-screen bg-slate-50 text-slate-900">
      <Header savedCount={0} compareCount={0} onOpenComparison={() => {}} />
      <main className="ph-detail-main mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-8">
        <div className="mb-6 flex items-center gap-3 text-sm text-slate-600">
          <Link to="/properties" className="inline-flex items-center gap-2 font-semibold text-emerald-700">
            <ArrowLeft className="h-4 w-4" /> Return to listings
          </Link>
        </div>

        <div className="ph-detail-layout grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="ph-detail-content space-y-6">
            <div className="ph-gallery-main relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button type="button" className="block w-full cursor-zoom-in" onClick={() => setLightboxOpen(true)} aria-label="Open property photo full screen"><img src={gallery[activeImageIndex]} alt={property.title || property.location} className="h-[420px] w-full object-cover" /></button>
              {gallery.length > 1 && <>
                <button type="button" aria-label="Previous property image" onClick={() => setActiveImageIndex((index) => (index - 1 + gallery.length) % gallery.length)} className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow hover:bg-white"><ChevronLeft className="h-5 w-5" /></button>
                <button type="button" aria-label="Next property image" onClick={() => setActiveImageIndex((index) => (index + 1) % gallery.length)} className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow hover:bg-white"><ChevronRight className="h-5 w-5" /></button>
              </>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {gallery.slice(0, 3).map((image, index) => (
                <button type="button" key={`${image}-${index}`} onClick={() => setActiveImageIndex(index)} aria-label={`Show property photo ${index + 1}`} className={`overflow-hidden rounded-xl border bg-white shadow-sm ${activeImageIndex === index ? 'border-[#2f6d51] ring-2 ring-[#2f6d51]/20' : 'border-slate-200'}`}>
                  <img src={image} alt={`${property.title || 'Property'} image ${index + 1}`} className="h-32 w-full object-cover" />
                </button>
              ))}
            </div>

            <div className="ph-detail-info rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Property reference: {property.referenceId || property.id || 'REF-001'}</p>
                  <h1 className="mt-2 text-3xl font-black text-slate-900">{property.title || 'Premium Land Listing'}</h1>
                </div>
                <div className="rounded-xl bg-emerald-50 px-4 py-3 text-right border border-emerald-200">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Asking price</p>
                  <p className="mt-1 text-2xl font-black text-emerald-800">{displayPrice}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2"><MapPin className="h-3.5 w-3.5 text-emerald-700" /> {property.location || property.area || 'Chennai'}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2"><Ruler className="h-3.5 w-3.5 text-emerald-700" /> {property.areaSqFt || property.sqft || property.areaValue || '1200'} sq.ft</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2"><Building2 className="h-3.5 w-3.5 text-emerald-700" /> {property.type || property.propertyType || 'Residential Plot'}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" /> {property.availability || property.status || 'Available'}</span>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Description</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {property.description || 'This property offers an excellent location for development, investment, or building a dream home with direct access to growing infrastructure and community amenities.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Property features</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {(property.features || ['Clear title', 'Approved layout', 'Good road access', 'Access to utilities']).map((feature) => (
                      <li key={feature} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <aside className="ph-detail-aside space-y-6">
            <div id="property-enquiry" className="ph-inquiry-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">Enquire about this property</h2>
              <p className="mt-2 text-sm text-slate-600">Send your question and our team will contact you.</p>

              {property.isSoldOut && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">Sold out</p>}
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <fieldset disabled={property.isSoldOut} className="space-y-4 disabled:opacity-50">
                <div className="hidden">
                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    tabIndex="-1"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Full name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Your full name" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="9876543210" pattern="^(?:\+?91[ \-]?)?[6-9](?:[0-9][ \-]?){9}$" title="Enter a valid 10-digit Indian mobile number" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Address (optional)</label>
                  <textarea name="address" value={form.address} onChange={handleChange} rows="3" maxLength={300} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Your address" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows="4" maxLength={1000} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Tell us about your requirements and preferred investment budget" required />
                </div>
                <button type="submit" disabled={submitting} className="w-full rounded-xl bg-[#2f6d51] px-4 py-3 text-sm font-black text-white transition hover:bg-[#24553e] disabled:opacity-70">
                  {submitting ? 'Submitting...' : 'Send enquiry'}
                </button>
                </fieldset>
                {property.isSoldOut && <p className="text-sm text-slate-500">Enquiries are closed for this property.</p>}
              </form>
            </div>

            <div className="rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
              <h3 className="text-lg font-black">Need help deciding?</h3>
              <p className="mt-2 text-sm text-slate-300">Speak with our property advisory team to verify documentation, pricing and legal status.</p>
              <div className="mt-5 space-y-3 text-sm text-slate-200">
                <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-emerald-300" /> +91 98400 40327</div>
                <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-emerald-300" /> hello@primehousing.in</div>
                <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Ask us about property documentation</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-2 gap-2 border-t border-[#E2DDD3] bg-white/95 p-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-lg backdrop-blur lg:hidden">
        <a href="tel:+919840040327" className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-[#1E4033] px-3 text-sm font-semibold text-[#1E4033]"><Phone className="h-4 w-4" />Call Advisor</a>
        <a href="#property-enquiry" className="flex min-h-[48px] items-center justify-center rounded-lg bg-[#1E4033] px-3 text-sm font-semibold text-white">Send Enquiry</a>
      </div>
      {lightboxOpen && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#101612]/95 p-4" role="dialog" aria-modal="true" aria-label="Property photo lightbox" onClick={() => setLightboxOpen(false)}>
        <button type="button" onClick={() => setLightboxOpen(false)} aria-label="Close photo" className="absolute right-4 top-4 rounded-full bg-white p-3 text-[#152D24]"><X className="h-5 w-5" /></button>
        {gallery.length > 1 && <button type="button" aria-label="Previous property image" onClick={(event) => { event.stopPropagation(); setActiveImageIndex((index) => (index - 1 + gallery.length) % gallery.length); }} className="absolute left-4 rounded-full bg-white p-3 text-[#152D24]"><ChevronLeft className="h-6 w-6" /></button>}
        <img src={gallery[activeImageIndex]} alt={property.title || property.location} className="max-h-[90vh] max-w-[92vw] object-contain" onClick={(event) => event.stopPropagation()} />
        {gallery.length > 1 && <button type="button" aria-label="Next property image" onClick={(event) => { event.stopPropagation(); setActiveImageIndex((index) => (index + 1) % gallery.length); }} className="absolute right-4 rounded-full bg-white p-3 text-[#152D24]"><ChevronRight className="h-6 w-6" /></button>}
      </div>}
      <Footer />
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
