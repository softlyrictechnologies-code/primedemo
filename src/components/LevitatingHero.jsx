import React, { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase.js';

const DEFAULT_AREAS = [{ id: 'all', name: 'All Regions' }];
const DEFAULT_TYPES = ['All Types'];
const DEFAULT_CONTENT = {
  heroTitle: 'Find Verified Plots and Land with Prime Housing',
  heroSubtitle: 'Discover premium land opportunities with clear guidance, verified documentation, and trusted local expertise.',
  trustLine: '',
  heroPills: [],
};

export default function LevitatingHero({
  searchKeyword,
  setSearchKeyword,
  selectedArea,
  setSelectedArea,
  selectedType,
  setSelectedType,
  onPerformSearch,
}) {
  const [areaOptions, setAreaOptions] = useState(DEFAULT_AREAS);
  const [typeOptions, setTypeOptions] = useState(DEFAULT_TYPES);
  const [heroBackground, setHeroBackground] = useState(false);
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    const image = new Image();
    image.src = '/hero-bg.jpg';
    image.onload = () => setHeroBackground(true);
    image.onerror = () => setHeroBackground(false);
  }, []);

  useEffect(() => {
    let active = true;

    const loadFilterOptions = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'locations'), where('active', '==', true)));
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

        const areas = items
          .filter((item) => !item.type || item.type === 'location')
          .map((item) => ({ id: String(item.name || item.id), name: item.name || item.id }))
          .filter((item) => item.name)
          .filter((item, index, arr) => arr.findIndex((entry) => entry.id === item.id) === index);

        const categories = items
          .filter((item) => item.type === 'category')
          .map((item) => item.name || item.id)
          .filter(Boolean)
          .filter((item, index, arr) => arr.indexOf(item) === index);

        if (!active) return;

        setAreaOptions(
          [{ id: 'all', name: 'All Regions' }, ...areas.map((area) => ({ ...area, name: area.name }))]
        );
        setTypeOptions(categories.length ? ['All Types', ...categories] : ['All Types']);
      } catch (error) {
        console.error('Failed to load filter metadata from locations:', error);
      }
    };

    const loadContent = async () => {
      try {
        const refs = [
          doc(db, 'siteSettings', 'site'),
          doc(db, 'siteContent', 'site'),
          doc(db, 'websiteContent', 'site'),
        ];

        const snapshots = await Promise.allSettled(refs.map((ref) => getDoc(ref)));
        const merged = { ...DEFAULT_CONTENT };

        snapshots.forEach((result) => {
          if (result.status === 'fulfilled' && result.value?.exists()) {
            Object.assign(merged, result.value.data());
          }
        });

        if (!active) return;

        setContent({
          ...DEFAULT_CONTENT,
          ...merged,
          heroTitle: merged.heroTitle || merged.heroHeadline || DEFAULT_CONTENT.heroTitle,
          heroSubtitle: merged.heroSubtitle || merged.heroDescription || merged.tagline || DEFAULT_CONTENT.heroSubtitle,
          trustLine: merged.trustLine || merged.trustBadge || merged.badgeText || '',
          heroPills: Array.isArray(merged.heroPills) ? merged.heroPills.filter(Boolean).slice(0, 3) : [],
        });
      } catch (error) {
        console.warn('[LevitatingHero] Could not load content metadata:', error);
      }
    };

    loadFilterOptions();
    loadContent();

    return () => {
      active = false;
    };
  }, []);

  const heroPills = useMemo(
    () => (Array.isArray(content.heroPills) ? content.heroPills.filter(Boolean).slice(0, 3) : []),
    [content.heroPills]
  );

  return (
    <section className="relative overflow-hidden border-b border-[#234533] bg-[#102319] py-16 text-white md:py-24">
      {heroBackground ? (
        <>
          <img
            src="/hero-bg.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c1a13] via-[#102319]/90 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1a13] via-[#102319] to-[#17372b]" />
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-5 pt-2 md:pt-4">
          {content.trustLine ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#52b788]/40 bg-[#1e4230] px-3 py-1.5 text-[11px] font-semibold text-[#74c69d]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{content.trustLine}</span>
            </div>
          ) : null}

          <h1 className="max-w-3xl font-serif text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {content.heroTitle}
          </h1>

          <p className="max-w-2xl text-base font-light leading-relaxed text-neutral-300 sm:text-lg">
            {content.heroSubtitle}
          </p>

          {heroPills.length > 0 ? (
            <div className="flex flex-wrap gap-3 pt-1">
              {heroPills.map((pill, index) => (
                <span
                  key={`${pill}-${index}`}
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] text-neutral-300"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#52b788]" />
                  {pill}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onPerformSearch?.();
          }}
          className="mt-10 max-w-4xl rounded-2xl border border-white/20 bg-white p-4 text-neutral-900 shadow-2xl shadow-[#0c1a13]/40 sm:p-5"
        >
          <div className="grid gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-3">
              <label htmlFor="hero-location" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                Location / Region
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-[#cfd7d2] bg-[#f9faf9] px-3 py-2.5 focus-within:border-[#2d6a4f] focus-within:ring-2 focus-within:ring-[#2d6a4f]/20">
                <MapPin className="h-4 w-4 text-[#2d6a4f]" />
                <select
                  id="hero-location"
                  value={selectedArea}
                  onChange={(event) => setSelectedArea(event.target.value)}
                  className="w-full border-0 bg-transparent py-1 text-sm text-neutral-800 outline-none"
                >
                  {areaOptions.map((area) => (
                    <option key={area.id} value={area.id} className="text-neutral-900">
                      {area.name === 'All Locations' ? 'All Regions' : area.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-3">
              <label htmlFor="hero-type" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                Property Classification
              </label>
              <div className="rounded-lg border border-[#cfd7d2] bg-[#f9faf9] px-3 py-2.5 focus-within:border-[#2d6a4f] focus-within:ring-2 focus-within:ring-[#2d6a4f]/20">
                <select
                  id="hero-type"
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value)}
                  className="w-full border-0 bg-transparent py-1 text-sm text-neutral-800 outline-none"
                >
                  {typeOptions.map((type) => (
                    <option key={type} value={type} className="text-neutral-900">
                      {type === 'All Types' ? 'All Categories' : type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-4">
              <label htmlFor="hero-keyword" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                Keywords or Title
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-[#cfd7d2] bg-[#f9faf9] px-3 py-2.5 focus-within:border-[#2d6a4f] focus-within:ring-2 focus-within:ring-[#2d6a4f]/20">
                <Search className="h-4 w-4 text-[#2d6a4f]" />
                <input
                  id="hero-keyword"
                  type="text"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="Search by title or keyword"
                  className="w-full border-0 bg-transparent py-1 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2d6a4f] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#1b4332] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

