import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { submitContactMessage } from '../services/contactService';
import { usePublicSiteContent } from '../services/publicSiteContent';

export default function ContactPage() {
  const siteContent = usePublicSiteContent();
  const [searchParams] = useSearchParams();
  const requestedProperty = (searchParams.get('property') || '').slice(0, 100);
  const [form, setForm] = useState(() => ({
    name: '', email: '', phone: '',
    subject: requestedProperty ? `Enquiry about ${requestedProperty}` : '',
    message: requestedProperty ? `I would like more information about ${requestedProperty}. Please contact me.` : '',
    website: '',
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.website) {
      setToastMessage('Invalid submission.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactMessage(form);
      setToastMessage('Your message has been sent to our team.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
    } catch (error) {
      setToastMessage(error.message || 'Unable to send your message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ph-site min-h-screen bg-slate-50 text-slate-900">
      <Header savedCount={0} compareCount={0} onOpenComparison={() => {}} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{siteContent.contactEyebrow}</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">{siteContent.contactTitle}</h1>
            <p className="mt-2 text-sm text-slate-600">{siteContent.contactSubtitle}</p>

            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-emerald-700" /> {siteContent.phone}</div>
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-emerald-700" /> {siteContent.email}</div>
              <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-emerald-700" /> {siteContent.location} Advisory Desk</div>
            </div>

            <div className="mt-8 rounded-3xl bg-slate-900 p-5 text-slate-200">
              <p className="text-sm font-bold text-white">{siteContent.contactUrgentTitle}</p>
              <p className="mt-2 text-sm text-slate-300">{siteContent.contactUrgentDescription}</p>
            </div>
          </div>

          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="hidden">
                <input type="text" name="website" value={form.website} onChange={handleChange} tabIndex="-1" autoComplete="off" />
              </div>

              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{siteContent.contactNameLabel}</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder={siteContent.contactNamePlaceholder} required />
              </div>
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{siteContent.contactPhoneLabel}</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder={siteContent.contactPhonePlaceholder} pattern="^(?:\+?91[ \-]?)?[6-9](?:[0-9][ \-]?){9}$" title="Enter a valid 10-digit Indian mobile number" required />
              </div>
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{siteContent.contactEmailLabel}</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder={siteContent.contactEmailPlaceholder} />
              </div>
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{siteContent.contactSubjectLabel}</label>
                <input name="subject" value={form.subject} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder={siteContent.contactSubjectPlaceholder} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{siteContent.contactMessageLabel}</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows="5" maxLength={1000} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder={siteContent.contactMessagePlaceholder} required />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-800 disabled:opacity-70">
                  {isSubmitting ? 'Sending...' : siteContent.contactSubmitText}
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
