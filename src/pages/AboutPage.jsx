import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ShieldCheck, MapPin, Users, BriefcaseBusiness } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { usePublicSiteContent } from '../services/publicSiteContent';

export default function AboutPage() {
  const siteContent = usePublicSiteContent();
  const features = [1, 2, 3, 4].map((number) => ({
    title: siteContent[`aboutFeature${['One', 'Two', 'Three', 'Four'][number - 1]}Title`],
    note: siteContent[`aboutFeature${['One', 'Two', 'Three', 'Four'][number - 1]}Note`],
  }));
  const services = [siteContent.aboutServiceOne, siteContent.aboutServiceTwo, siteContent.aboutServiceThree, siteContent.aboutServiceFour].filter(Boolean);
  return (
    <div className="ph-site min-h-screen bg-slate-50 text-slate-900">
      <Header savedCount={0} compareCount={0} onOpenComparison={() => {}} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{siteContent.aboutEyebrow}</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">{siteContent.aboutTitle}</h1>
            </div>
            <Link to="/properties" className="hidden rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white sm:inline-flex items-center gap-2">
              {siteContent.aboutCtaText} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <p className="text-sm leading-7 text-slate-600">
                {siteContent.aboutDescription}
              </p>
              <p className="text-sm leading-7 text-slate-600">
                {siteContent.intro}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature, index) => {
                const FeatureIcon = [Building2, ShieldCheck, MapPin, Users][index];
                return <div key={feature.title} className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <FeatureIcon className="h-8 w-8 text-emerald-700" />
                  <p className="mt-3 text-lg font-black text-slate-900">{feature.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{feature.note}</p>
                </div>;
              })}
            </div>
          </div>

          <div className="mt-10 rounded-4xl bg-slate-900 p-6 text-white">
            <div className="flex items-center gap-2 text-emerald-300">
              <BriefcaseBusiness className="h-5 w-5" />
              <h2 className="text-lg font-black">{siteContent.aboutServicesTitle}</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-slate-200">
              {services.map((service) => (
                <li key={service} className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" /> {service}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
