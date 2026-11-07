import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ShieldCheck, MapPin, Users, BriefcaseBusiness } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const services = [
  'Verified property discovery for residential and investment plots',
  'Landowner submission review, approval tracking and publishing workflows',
  'Buyer-oriented enquiry handling and follow-up coordination',
  'Market guidance across major Chennai growth corridors and property categories',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header savedCount={0} compareCount={0} onOpenListModal={() => {}} onOpenComparison={() => {}} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">About us</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">Trusted property advisory for Chennai buyers and landowners</h1>
            </div>
            <Link to="/properties" className="hidden rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white sm:inline-flex items-center gap-2">
              Explore listings <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <p className="text-sm leading-7 text-slate-600">
                We help landowners list private property details responsibly and connect verified buyers with suitable opportunities across Chennai. Our focus is transparency, documentation review, and clear communication from first enquiry to final follow-up.
              </p>
              <p className="text-sm leading-7 text-slate-600">
                The platform balances privacy for sellers with a visible, easy-to-search marketplace for buyers. Each listing is reviewed before publication to ensure that the property profile, location, and pricing information align with approved business standards.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <Building2 className="h-8 w-8 text-emerald-700" />
                <p className="mt-3 text-lg font-black text-slate-900">Residential & commercial</p>
                <p className="mt-1 text-sm text-slate-600">Plots, sites and investment properties in high-growth corridors.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <ShieldCheck className="h-8 w-8 text-emerald-700" />
                <p className="mt-3 text-lg font-black text-slate-900">Verified review</p>
                <p className="mt-1 text-sm text-slate-600">Property details remain private until admin approval and publication.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <MapPin className="h-8 w-8 text-emerald-700" />
                <p className="mt-3 text-lg font-black text-slate-900">Location-led search</p>
                <p className="mt-1 text-sm text-slate-600">Explore properties in OMR, ECR, Siruseri, GST Road and more.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <Users className="h-8 w-8 text-emerald-700" />
                <p className="mt-3 text-lg font-black text-slate-900">Buyer support</p>
                <p className="mt-1 text-sm text-slate-600">Follow-up, enquiry management and status tracking for every lead.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-4xl bg-slate-900 p-6 text-white">
            <div className="flex items-center gap-2 text-emerald-300">
              <BriefcaseBusiness className="h-5 w-5" />
              <h2 className="text-lg font-black">Our services</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-slate-200">
              {services.map((service) => (
                <li key={service} className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" /> {service}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer onOpenListModal={() => {}} />
    </div>
  );
}
