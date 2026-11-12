import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Compass, MapPin, ArrowRight, Search, Landmark, Sprout, ShieldCheck, Handshake } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getHomepageProperties } from '../services/propertyService';
import { usePublicSiteContent } from '../services/publicSiteContent';

const typeTiles = [
  { value: 'Residential Plot', icon: Building2, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1100&q=85', number: 'One', fallbackTitle: 'Residential Plots', fallbackNote: 'Build your future in a place that feels like home.' },
  { value: 'Commercial Plot', icon: Landmark, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1100&q=85', number: 'Two', fallbackTitle: 'Commercial Land', fallbackNote: 'Well-connected sites for ambitious businesses.' },
  { value: 'Agricultural Land', icon: Sprout, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1100&q=85', number: 'Four', fallbackTitle: 'Agricultural Land', fallbackNote: 'Discover open land with room to grow.' },
  { value: 'Investment Land', icon: Compass, image: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1100&q=85', number: 'Three', fallbackTitle: 'Investment Land', fallbackNote: 'Explore opportunities in high-growth corridors.' },
];
export default function HomePage() {
  const navigate = useNavigate();
  const siteContent = usePublicSiteContent();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroFilters, setHeroFilters] = useState({
    search: '',
    location: '__all_locations__',
    type: '__all_types__',
    budget: 'any',
    areaRange: 'any',
  });

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getHomepageProperties({ pageSize: 12, featuredLimit: 0 });
        if (active) setProperties(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err?.message || 'Unable to load listings.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => { active = false; };
  }, []);

  const heroLocations = useMemo(() => [...new Set(properties.map((item) => item.location || item.area).filter(Boolean))], [properties]);
  const heroTypes = useMemo(() => [...new Set(properties.map((item) => item.type || item.propertyType).filter(Boolean))], [properties]);

  const latest = useMemo(() => properties.slice(0, 4), [properties]);
  const popularLocations = useMemo(() => {
    const corridors = ['OMR', 'ECR', 'Siruseri', 'Navalur', 'Kelambakkam', 'Thalambur', 'Mahabalipuram', 'Chengalpattu'];
    return corridors.map((corridor) => [corridor, properties.filter((item) => `${item.location || ''} ${item.area || ''}`.toLowerCase().includes(corridor.toLowerCase())).length]);
  }, [properties]);

  const handleHeroSearch = () => {
    const params = new URLSearchParams();

    if (heroFilters.search.trim()) params.set('search', heroFilters.search.trim());
    if (heroFilters.location !== '__all_locations__') params.set('location', heroFilters.location);
    if (heroFilters.type !== '__all_types__') params.set('type', heroFilters.type);
    const budgetRanges = { 'up-to-50': ['', '50'], '50-100': ['50', '100'], '100-plus': ['100', ''] };
    const areaRanges = { 'under-1000': ['', '1000'], '1000-2000': ['1000', '2000'], '2000-plus': ['2000', ''] };
    const [minPrice, maxPrice] = budgetRanges[heroFilters.budget] || [];
    const [minArea, maxArea] = areaRanges[heroFilters.areaRange] || [];
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minArea) params.set('minArea', minArea);
    if (maxArea) params.set('maxArea', maxArea);

    navigate(`/properties${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="ph-site min-h-screen bg-[#F4F2EC] text-[#17231d]">
      <Header />

      <main className="ph-home-main mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="ph-home-hero relative isolate overflow-hidden rounded-[2rem] bg-[#113222] text-white shadow-overlay">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80"
              alt="Premium land and property landscape"
              className="h-full w-full object-cover opacity-40"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#071b11]/95 via-[#113222]/85 to-[#1d4931]/65" />
          </div>

          <div className="relative grid gap-10 px-5 py-8 sm:px-8 md:px-10 md:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-12 lg:py-12">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="max-w-3xl font-serif text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
                  {siteContent.heroTitle || 'Find Land That Builds Your Future.'}
                </h1>
                <p className="max-w-xl text-lg font-semibold leading-relaxed text-white sm:text-xl">
                  {siteContent.heroValueProposition}
                </p>
                {siteContent.heroDescription && <p className="max-w-xl text-sm leading-relaxed text-brand-50/90 sm:text-base">{siteContent.heroDescription}</p>}
              </div>

              <div className="ph-trust-points flex flex-wrap gap-2">
                {[siteContent.heroTrustOne, siteContent.heroTrustTwo, siteContent.heroTrustThree].filter(Boolean).map((item) => <span key={item} className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-black/15 px-2.5 py-1.5 text-[10px] font-semibold text-white/90"><ShieldCheck className="h-3 w-3 text-emerald-300" />{item}</span>)}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/properties"
                  className="inline-flex items-center justify-center rounded-full bg-accent-400 px-6 py-3 text-sm font-bold text-neutral-900 transition duration-200 hover:-translate-y-0.5 hover:bg-accent-300"
                >
                  Explore Properties
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Contact Our Team
                </Link>
              </div>

            </div>

          </div>
          <div className="ph-hero-search z-10 mb-6 rounded-2xl border border-white/50 bg-white p-3 shadow-2xl shadow-black/20 sm:p-4">
            <form className="ph-search-row grid gap-2 sm:grid-cols-2 xl:grid-cols-[1.35fr_1fr_1fr_0.9fr_0.9fr_auto]" onSubmit={(event) => { event.preventDefault(); handleHeroSearch(); }}>
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-neutral-700 focus-within:border-[#2f6d51] focus-within:ring-2 focus-within:ring-[#2f6d51]/10">
                <Search className="h-4 w-4 shrink-0 text-[#2f6d51]" />
                <input value={heroFilters.search} onChange={(event) => setHeroFilters((current) => ({ ...current, search: event.target.value }))} aria-label="Search by place, neighbourhood, or property" className="w-full min-w-0 border-0 bg-transparent text-sm font-medium text-neutral-800 outline-none placeholder:text-neutral-400" placeholder={siteContent.searchPlaceholder || 'Location, project, or keyword'} />
              </label>
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-neutral-700 focus-within:border-[#2f6d51] focus-within:ring-2 focus-within:ring-[#2f6d51]/10">
                <MapPin className="h-4 w-4 shrink-0 text-[#2f6d51]" />
                <select aria-label="Select location" value={heroFilters.location} onChange={(event) => setHeroFilters((current) => ({ ...current, location: event.target.value }))} className="w-full min-w-0 border-0 bg-transparent text-sm font-semibold text-neutral-800 outline-none">
                  <option value="__all_locations__">{siteContent.allLocationsLabel || 'All locations'}</option>
                  {heroLocations.map((location) => <option key={location} value={location}>{location}</option>)}
                </select>
              </label>
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-neutral-700 focus-within:border-[#2f6d51] focus-within:ring-2 focus-within:ring-[#2f6d51]/10">
                <Building2 className="h-4 w-4 shrink-0 text-[#2f6d51]" />
                <select aria-label="Select property category" value={heroFilters.type} onChange={(event) => setHeroFilters((current) => ({ ...current, type: event.target.value }))} className="w-full min-w-0 border-0 bg-transparent text-sm font-semibold text-neutral-800 outline-none">
                  <option value="__all_types__">{siteContent.allCategoriesLabel || 'All categories'}</option>
                  {heroTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-neutral-700 focus-within:border-[#2f6d51] focus-within:ring-2 focus-within:ring-[#2f6d51]/10">
                <span className="shrink-0 text-sm font-bold text-[#2f6d51]">₹</span>
                <select aria-label="Select budget range" value={heroFilters.budget} onChange={(event) => setHeroFilters((current) => ({ ...current, budget: event.target.value }))} className="w-full min-w-0 border-0 bg-transparent text-sm font-semibold text-neutral-800 outline-none">
                  <option value="any">Any budget</option><option value="up-to-50">Up to ₹50L</option><option value="50-100">₹50L–₹1Cr</option><option value="100-plus">₹1Cr+</option>
                </select>
              </label>
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-neutral-700 focus-within:border-[#2f6d51] focus-within:ring-2 focus-within:ring-[#2f6d51]/10">
                <span className="shrink-0 text-[11px] font-bold text-[#2f6d51]">SQ.FT</span>
                <select aria-label="Select land area" value={heroFilters.areaRange} onChange={(event) => setHeroFilters((current) => ({ ...current, areaRange: event.target.value }))} className="w-full min-w-0 border-0 bg-transparent text-sm font-semibold text-neutral-800 outline-none">
                  <option value="any">Any area</option><option value="under-1000">Under 1,000</option><option value="1000-2000">1,000–2,000</option><option value="2000-plus">2,000+</option>
                </select>
              </label>
              <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#153d32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#24553e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#153d32] focus-visible:ring-offset-2">{siteContent.searchButtonText || 'Search'} <Search className="h-4 w-4" /></button>
            </form>
          </div>
        </section>

        <section className="ph-home-stats" aria-label="Prime Housing at a glance">
          <div><Building2 /><strong>{properties.length}</strong><span>Listings to Explore</span></div>
          <div><MapPin /><strong>{heroLocations.length}</strong><span>Locations Covered</span></div>
          <div><Compass /><strong>4</strong><span>Land Categories</span></div>
          <div><Handshake /><strong>Direct</strong><span>Local Enquiry Support</span></div>
        </section>

        <section className="ph-offerings mt-12">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700">{siteContent.offeringsEyebrow}</p>
              <h2 className="mt-2 text-2xl font-black text-neutral-900">{siteContent.offeringsTitle}</h2>
              <p className="mt-1 text-sm text-neutral-500">{siteContent.offeringsSubtitle}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {typeTiles.map((tile) => {
              const Icon = tile.icon;
              const tileTitle = siteContent[`offering${tile.number}Title`] || tile.fallbackTitle;
              const tileNote = siteContent[`offering${tile.number}Note`] || tile.fallbackNote;
              return <Link key={tile.value} to={`/properties?type=${encodeURIComponent(tile.value)}`} className="ph-category-card group relative flex min-h-[270px] items-end overflow-hidden rounded-[22px] border border-[#e8e2d7] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <img src={tile.image} alt={tileTitle} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#10271e]/90 via-[#10271e]/22 to-transparent" />
                <div className="relative z-10 p-5 text-white">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/15 backdrop-blur"><Icon className="h-5 w-5" /></span>
                  <h3 className="font-serif text-xl font-bold">{tileTitle}</h3>
                  <p className="mt-1 max-w-[260px] text-sm leading-5 text-white/85">{tileNote}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide">{siteContent.offeringLinkText || 'Explore category'} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
                </div>
              </Link>;
            })}
          </div>
        </section>

        <section className="ph-latest mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2f6d51]">Just listed</p><h2 className="mt-2 text-2xl font-bold text-[#113222]">{siteContent.latestTitle}</h2><p className="mt-1 text-sm text-neutral-600">{siteContent.latestSubtitle}</p></div>
            <Link to="/properties" className="hidden items-center gap-2 text-sm font-semibold text-[#2f6d51] sm:inline-flex">Browse all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {latest.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {latest.slice(0, 3).map((property) => (
              <Link key={property.id} to={`/properties/${property.id}`} className="group overflow-hidden rounded-xl border border-[#dfe5dd] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <img src={property.image || property.images?.[0]} alt={property.title} loading="lazy" className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                <div className="p-4"><p className="flex items-center gap-1.5 text-xs text-[#69756e]"><MapPin className="h-3.5 w-3.5 text-[#2f6d51]" />{property.location}</p><h3 className="mt-1 line-clamp-2 min-h-12 font-serif text-lg font-bold text-[#17231d]">{property.title}</h3><div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-[#43534a]"><span className="rounded-md bg-[#f2f5f2] px-2.5 py-1.5">{property.propertyType}</span><span className="rounded-md bg-[#f2f5f2] px-2.5 py-1.5">{Number(property.areaSqFt || 0).toLocaleString('en-IN')} sq.ft</span></div><div className="mt-3 flex items-center justify-between border-t border-[#edf0ec] pt-3"><span className="font-serif text-lg font-bold text-[#113222]">₹{property.priceLakhs >= 100 ? `${(property.priceLakhs / 100).toFixed(2)} Cr` : `${property.priceLakhs || 0} L`}</span><span className="inline-flex min-w-[112px] items-center justify-center gap-1 rounded-lg border border-[#2f6d51] px-3 py-2 text-xs font-bold text-[#285d45]">View {siteContent.propertyDetailsText || 'Details'} <ArrowRight className="h-3.5 w-3.5" /></span></div></div>
              </Link>
            ))}
          </div> : !loading && <p className="rounded-xl border border-dashed border-[#dfe5dd] bg-white p-6 text-center text-sm text-[#69756e]">{siteContent.latestEmptyText}</p>}
        </section>

        <section className="ph-why mt-12 rounded-4xl border border-neutral-200 bg-white p-6 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700">{siteContent.whyEyebrow}</p>
          <h2 className="mt-2 text-2xl font-black text-neutral-900">{siteContent.whyTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[siteContent.whyPointOne, siteContent.whyPointTwo, siteContent.whyPointThree, siteContent.whyPointFour, siteContent.whyPointFive, siteContent.whyPointSix].filter(Boolean).map((point) => (
              <div key={point} className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-700">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Building2 className="h-5 w-5" />
                </div>
                {point}
              </div>
            ))}
          </div>
        </section>

        <section className="ph-city-section mt-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2f6d51]">{siteContent.locationsEyebrow}</p>
              <h2 className="mt-2 text-2xl font-black text-neutral-900">{siteContent.locationsTitle}</h2>
              <p className="mt-1 text-sm text-neutral-600">{siteContent.locationsDescription}</p>
            </div>
            <Link to="/properties" className="hidden items-center gap-2 text-sm font-semibold text-[#2f6d51] sm:inline-flex">{siteContent.locationsLinkText} <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularLocations.map(([location, count], index) => {
              const cover = properties.find((property) => `${property.location || ''} ${property.area || ''}`.toLowerCase().includes(location.toLowerCase()));
              const fallbackPhotos = [
                'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
              ];
              return <Link key={location} to={`/properties?search=${encodeURIComponent(location)}`} className="ph-city-card group relative flex h-44 items-end overflow-hidden rounded-2xl bg-neutral-300 p-4 text-white shadow-card">
                <img src={cover?.image || fallbackPhotos[index]} alt={`${location} property location`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#071d2c]/85 via-[#071d2c]/15 to-transparent" />
                <span className="relative z-10 flex w-full items-end justify-between gap-2">
                  <span className="font-bold">{location}</span>
                  <span className="rounded-full border border-white/40 bg-white/15 px-2.5 py-1 text-[11px] font-bold backdrop-blur">{count} {count === 1 ? siteContent.plotSingularText : siteContent.plotPluralText} <ArrowRight className="ml-1 inline h-3 w-3" /></span>
                </span>
              </Link>;
            })}
            {!popularLocations.length && <div className="col-span-full rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-600">{siteContent.locationsEmptyText}</div>}
          </div>
        </section>

        <section className="ph-conversion-section relative mt-12 overflow-hidden rounded-[26px] bg-[#153d32] px-6 py-10 text-center text-white sm:px-10 sm:py-14">
          <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=85" alt="Open land at golden hour" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-0 bg-[#102c24]/85" />
          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#d8bd8a]">{siteContent.companyName}</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">{siteContent.conversionTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/80">{siteContent.conversionSubtitle}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/submit-land" className="inline-flex items-center gap-2 rounded-full bg-[#c6a46a] px-6 py-3 text-sm font-bold text-[#202522] transition hover:-translate-y-0.5 hover:bg-[#d3b57f]">{siteContent.conversionPrimaryText} <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">{siteContent.conversionSecondaryText}</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
