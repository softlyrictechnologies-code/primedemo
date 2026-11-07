import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, Building2, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { submitPropertyForReview } from '../services/sellerService';

export default function SubmitLandPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [form, setForm] = useState({
    title: '',
    location: '',
    propertyType: 'Residential Plot',
    areaSqFt: '',
    expectedPrice: '',
    sellerName: '',
    sellerPhone: '',
    description: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await submitPropertyForReview({
        title: form.title,
        location: form.location,
        propertyType: form.propertyType,
        areaSqFt: form.areaSqFt,
        expectedPrice: form.expectedPrice,
        sellerName: form.sellerName,
        sellerPhone: form.sellerPhone,
        description: form.description,
      });

      setSubmitted(true);
      setToastMessage('Your property submission has been received and is pending admin review.');
      setForm({
        title: '',
        location: '',
        propertyType: 'Residential Plot',
        areaSqFt: '',
        expectedPrice: '',
        sellerName: '',
        sellerPhone: '',
        description: '',
      });
    } catch (error) {
      setToastMessage(error.message || 'We could not submit your property right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header savedCount={0} compareCount={0} onOpenListModal={() => {}} onOpenComparison={() => {}} />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Landowner portal</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">Submit your land for review</h1>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right border border-emerald-200 text-emerald-900">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Private review</p>
              <p className="text-sm font-bold">Pending approval</p>
            </div>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Property title</label>
                <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Example: OMR 2.5 acre residential plot" required />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="OMR, Siruseri, or nearby area" required />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Property type</label>
                <select name="propertyType" value={form.propertyType} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white">
                  <option>Residential Plot</option>
                  <option>Commercial Plot</option>
                  <option>Farm Land</option>
                  <option>Villa Site</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Land area (sq.ft)</label>
                <input type="number" name="areaSqFt" value={form.areaSqFt} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="1500" required />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Expected price</label>
                <input type="number" name="expectedPrice" value={form.expectedPrice} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="2500000" required />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Landowner name</label>
                <input name="sellerName" value={form.sellerName} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Your name" required />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Phone number</label>
                <input name="sellerPhone" value={form.sellerPhone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="+91 98765 43210" required />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Property description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows="5" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Share access roads, location notes, nearby landmarks, amenities, and any approvals." required />
              </div>

              <div className="md:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Information remains private until admin approval.</div>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-800 disabled:opacity-70">
                  {isSubmitting ? 'Submitting...' : 'Submit for review'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-4xl bg-emerald-50 border border-emerald-200 p-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" />
              <h2 className="mt-4 text-2xl font-black text-slate-900">Submission received</h2>
              <p className="mt-2 text-sm text-slate-600">Your land listing has been stored privately and is awaiting admin review before it can be published.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Link to="/" className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">Return home</Link>
                <Link to="/properties" className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800">Browse listings</Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer onOpenListModal={() => {}} />
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
