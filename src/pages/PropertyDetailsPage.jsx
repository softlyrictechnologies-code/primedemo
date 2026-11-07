import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, IndianRupee, MapPin, Ruler, Building2, Phone, Mail, MessageSquare, CalendarDays, ShieldCheck } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { PLOTS_DATA } from '../data/plotsData';
import { getPublishedProperties } from '../services/propertyService';
import { submitInquiry } from '../services/inquiryService';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    message: '',
  });

  useEffect(() => {
    let ignore = false;

    const fetchProperty = async () => {
      setLoading(true);
      try {
        const online = await getPublishedProperties();
        const list = Array.isArray(online) && online.length > 0 ? online : PLOTS_DATA;
        const match = list.find((item) => String(item.id) === String(id));
        if (!ignore) setProperty(match || list[0] || null);
      } catch (error) {
        console.error('Could not load property details:', error);
        if (!ignore) setProperty(PLOTS_DATA.find((item) => String(item.id) === String(id)) || PLOTS_DATA[0] || null);
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
    const images = property?.gallery || property?.images || property?.image ? [property?.image, ...(property?.gallery || property?.images || [])].filter(Boolean) : [];
    return images.length > 0 ? images : ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'];
  }, [property]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!property) return;

    setSubmitting(true);
    try {
      await submitInquiry({
        propertyId: property.id || property.referenceId || 'property',
        propertyTitle: property.title || property.location || 'Property',
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        message: form.message,
        preferredDate: 'Within 2-3 days',
        preferredTime: 'Flexible',
      });
      setToastMessage('Your enquiry has been submitted successfully.');
      setForm({ customerName: '', customerPhone: '', customerEmail: '', message: '' });
    } catch (error) {
      setToastMessage(error.message || 'Unable to submit enquiry right now.');
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
          <h2 className="text-2xl font-black text-slate-900">Property not found</h2>
          <p className="mt-2 text-sm text-slate-600">The requested listing is no longer available or has not been published yet.</p>
          <Link to="/properties" className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white">
            <ArrowLeft className="h-4 w-4" /> Back to properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header savedCount={0} compareCount={0} onOpenListModal={() => {}} onOpenComparison={() => {}} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3 text-sm text-slate-600">
          <Link to="/properties" className="inline-flex items-center gap-2 font-semibold text-emerald-700">
            <ArrowLeft className="h-4 w-4" /> Return to listings
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm">
              <img src={gallery[0]} alt={property.title || property.location} className="h-[420px] w-full object-cover" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {gallery.slice(0, 3).map((image, index) => (
                <div key={`${image}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <img src={image} alt={`${property.title || 'Property'} image ${index + 1}`} className="h-32 w-full object-cover" />
                </div>
              ))}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Property reference: {property.referenceId || property.id || 'REF-001'}</p>
                  <h1 className="mt-2 text-3xl font-black text-slate-900">{property.title || 'Premium Land Listing'}</h1>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right border border-emerald-200">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Asking price</p>
                  <p className="mt-1 text-2xl font-black text-emerald-900">
                    ₹{(property.priceLakhs || property.expectedPrice || 0).toLocaleString('en-IN')}
                    {property.priceLakhs ? ' Lakh' : ''}
                  </p>
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

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">Enquire about this property</h2>
              <p className="mt-2 text-sm text-slate-600">Submit your details and the team will contact you with the next steps.</p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Full name</label>
                  <input name="customerName" value={form.customerName} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Your full name" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Phone</label>
                  <input name="customerPhone" value={form.customerPhone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="+91 98765 43210" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Email</label>
                  <input type="email" name="customerEmail" value={form.customerEmail} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows="4" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Tell us about your requirements and preferred investment budget" />
                </div>
                <button type="submit" disabled={submitting} className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-800 disabled:opacity-70">
                  {submitting ? 'Submitting...' : 'Send enquiry'}
                </button>
              </form>
            </div>

            <div className="rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
              <h3 className="text-lg font-black">Need help deciding?</h3>
              <p className="mt-2 text-sm text-slate-300">Speak with our property advisory team to verify documentation, pricing and legal status.</p>
              <div className="mt-5 space-y-3 text-sm text-slate-200">
                <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-emerald-300" /> +91 044 4890 2026</div>
                <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-emerald-300" /> support@primehousing.in</div>
                <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Verified documentation available</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer onOpenListModal={() => {}} />
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
