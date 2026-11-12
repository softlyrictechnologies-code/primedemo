import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, SlidersHorizontal, Search, MapPin, Filter, Heart, Eye, BadgeCheck, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getPublishedPropertiesPage } from '../services/propertyService';
import { usePublicSiteContent } from '../services/publicSiteContent';
import { submitInquiry } from '../services/inquiryService';

const matchesTypeCategory = (property, selectedType) => {
  if (selectedType === 'All types') return true;
  const actualType = String(property.type || property.propertyType || '').toLowerCase();
  const category = selectedType.toLowerCase();
  if (category === 'residential plot') return actualType.includes('residential') || actualType.includes('villa') || actualType.includes('gated');
  if (category === 'commercial plot') return actualType.includes('commercial');
  if (category === 'agricultural land') return actualType.includes('agricultural') || actualType.includes('farm');
  return actualType === category;
};

const defaultFilters = {
  search: '',
  location: 'All locations',
  type: 'All types',
  availability: 'Any availability',
  budget: 'Any budget',
  minPrice: '',
  maxPrice: '',
  minArea: '',
  maxArea: '',
};

const budgetPills = [
  { label: 'Up to ₹50L', minPrice: '', maxPrice: '50' },
  { label: '₹50L–₹1Cr', minPrice: '50', maxPrice: '100' },
  { label: '₹1–2Cr', minPrice: '100', maxPrice: '200' },
  { label: '₹2Cr+', minPrice: '200', maxPrice: '' },
];
const areaPills = [
  { label: 'Under 1,000 sq.ft', minArea: '', maxArea: '1000' },
  { label: '1,000–2,000 sq.ft', minArea: '1000', maxArea: '2000' },
  { label: '2,000–5,000 sq.ft', minArea: '2000', maxArea: '5000' },
  { label: '5,000+ sq.ft', minArea: '5000', maxArea: '' },
];
const isApprovedListing = (approval = '') => /\b(approved|verified|registered)\b/i.test(String(approval));

export default function PropertiesPage() {
  const siteContent = usePublicSiteContent();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [locations, setLocations] = useState(['All locations']);
  const [types, setTypes] = useState(['All types']);
  const [pageCursor, setPageCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(9);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [quickEnquiry, setQuickEnquiry] = useState({ name: '', phone: '' });
  const [quickEnquiryState, setQuickEnquiryState] = useState('');
  const [savedIds, setSavedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('primeHousingSavedProperties') || '[]')); }
    catch { return new Set(); }
  });
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || 'All locations',
    type: searchParams.get('type') || 'All types',
    availability: searchParams.get('availability') || 'Any availability',
    budget: searchParams.get('budget') || 'Any budget',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
  }));
  const queryLocation = filters.location;
  const queryType = filters.type;

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const page = await getPublishedPropertiesPage({ pageSize: 24, sortBy, filters: { location: queryLocation, type: queryType } });
        if (active) {
          setProperties(page.properties);
          setLocations((current) => ['All locations', ...new Set([...current.slice(1), ...page.properties.map((item) => item.location || item.area || 'Chennai')])]);
          setTypes((current) => ['All types', ...new Set([...current.slice(1), ...page.properties.map((item) => item.type || item.propertyType || 'Plot')])]);
          setPageCursor(page.cursor);
          setHasMore(page.hasMore);
        }
      } catch (err) {
        if (active) setError(err?.message || 'Unable to load properties.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => { active = false; };
  }, [sortBy, queryLocation, queryType]);

  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || 'All locations',
      type: searchParams.get('type') || 'All types',
      availability: searchParams.get('availability') || 'Any availability',
      budget: searchParams.get('budget') || 'Any budget',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minArea: searchParams.get('minArea') || '',
      maxArea: searchParams.get('maxArea') || '',
    });
  }, [searchParams]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const propertyPriceLakhs = Number(property.priceLakhs ?? (property.price ? property.price / 100000 : 0));
      const propertyArea = Number(property.areaSqFt ?? property.totalAreaSqft ?? property.area ?? 0);
      const matchesSearch = !filters.search || `${property.title} ${property.location} ${property.area} ${property.district} ${property.type}`.toLowerCase().includes(filters.search.toLowerCase());
      const matchesLocation = filters.location === 'All locations' || property.location === filters.location || property.area === filters.location || String(property.location || '').toLowerCase().includes(filters.location.toLowerCase());
      const matchesType = matchesTypeCategory(property, filters.type);
      const matchesAvailability = filters.availability === 'Any availability' || String(property.availability || property.status || 'Available').toLowerCase() === filters.availability.toLowerCase();
      const matchesBudget = filters.budget === 'Any budget' || !Number.isFinite(Number(filters.budget)) || propertyPriceLakhs <= Number(filters.budget);
      const matchesMinPrice = !filters.minPrice || propertyPriceLakhs >= Number(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || propertyPriceLakhs <= Number(filters.maxPrice);
      const matchesMinArea = !filters.minArea || propertyArea >= Number(filters.minArea);
      const matchesMaxArea = !filters.maxArea || propertyArea <= Number(filters.maxArea);
      return matchesSearch && matchesLocation && matchesType && matchesAvailability && matchesBudget && matchesMinPrice && matchesMaxPrice && matchesMinArea && matchesMaxArea;
    });
  }, [filters, properties]);

  const sortedProperties = useMemo(() => [...filteredProperties].sort((a, b) => {
    if (sortBy === 'price-low') return Number(a.price || a.priceLakhs * 100000) - Number(b.price || b.priceLakhs * 100000);
    if (sortBy === 'price-high') return Number(b.price || b.priceLakhs * 100000) - Number(a.price || a.priceLakhs * 100000);
    const dateValue = (property) => property.createdAt?.seconds || (property.createdAt ? new Date(property.createdAt).getTime() / 1000 : 0);
    return dateValue(b) - dateValue(a);
  }), [filteredProperties, sortBy]);

  useEffect(() => setVisibleCount(9), [filters, sortBy]);

  const toggleSaved = (propertyId) => {
    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(propertyId)) next.delete(propertyId);
      else next.add(propertyId);
      localStorage.setItem('primeHousingSavedProperties', JSON.stringify([...next]));
      return next;
    });
  };

  const setPriceRange = (range) => setFilters((current) => ({ ...current, budget: 'Any budget', minPrice: range.minPrice, maxPrice: range.maxPrice }));
  const setAreaRange = (range) => setFilters((current) => ({ ...current, minArea: range.minArea, maxArea: range.maxArea }));

  const sendQuickEnquiry = async (event) => {
    event.preventDefault();
    if (!quickView) return;
    setQuickEnquiryState('Sending…');
    try {
      await submitInquiry({ propertyId: quickView.id, propertyTitle: quickView.title, name: quickEnquiry.name, phone: quickEnquiry.phone, source: 'quick-enquire', status: 'new' });
      setQuickEnquiryState('Enquiry received. Our advisor will call you shortly.');
    } catch (error) {
      setQuickEnquiryState(error?.message || 'Unable to send your enquiry right now.');
    }
  };

  const loadMoreProperties = async () => {
    if (visibleCount < sortedProperties.length) {
      setVisibleCount((count) => count + 9);
      return;
    }
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setError('');
    try {
      const page = await getPublishedPropertiesPage({ pageSize: 24, cursor: pageCursor, sortBy, filters: { location: filters.location, type: filters.type } });
      setProperties((current) => [...current, ...page.properties]);
      setPageCursor(page.cursor);
      setHasMore(page.hasMore);
      setVisibleCount((count) => count + 9);
    } catch (err) {
      setError(err?.message || 'Unable to load more properties.');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="ph-site min-h-screen bg-[#F4F2EC] text-[#17231d]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <div className="mb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2f6d51]">Verified real estate catalog</p>
              <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#113222]">{siteContent.catalogTitle}</h1>
              <p className="mt-1 max-w-2xl text-sm text-[#66736b]">{siteContent.catalogDescription}</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort properties" className="rounded-xl border border-[#d8ded8] bg-white px-3 py-2.5 text-sm text-[#35463b] outline-none focus:ring-2 focus:ring-[#113222]/20">
                <option value="newest">Newest</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </div>
          </div>
        </div>

        <section aria-label="Property search and filters" className="rounded-2xl border border-[#dfe4dd] bg-white p-3 shadow-[0_10px_30px_rgba(17,50,34,.07)] md:p-4">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.6fr)_minmax(155px,1fr)_minmax(155px,1fr)_minmax(150px,1fr)_auto_auto]">
            <label className="flex min-w-0 items-center gap-3 rounded-xl border border-[#dce3dc] bg-[#fafbf9] px-3 py-2.5">
              <Search className="h-4 w-4 text-neutral-500" />
              <input
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-neutral-400"
                placeholder="Search properties"
                aria-label="Search properties"
              />
            </label>

            <label className="flex min-w-0 items-center gap-2 rounded-xl border border-[#dce3dc] bg-[#fafbf9] px-3 py-2.5">
              <MapPin className="h-4 w-4 text-neutral-500" />
              <select value={filters.location} onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))} aria-label="Filter by location" className="w-full border-0 bg-transparent text-sm outline-none">
                {locations.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </label>
            <label className="sr-only" htmlFor="availability-filter">Availability</label>
            <select id="availability-filter" value={filters.availability} onChange={(event) => setFilters((current) => ({ ...current, availability: event.target.value }))} aria-label="Filter by availability" className="rounded-xl border border-[#dce3dc] bg-[#fafbf9] px-3 py-2.5 text-sm">
              <option>Any availability</option><option>Available</option><option>Under offer</option><option>Sold</option>
            </select>

            <label className="flex min-w-0 items-center gap-2 rounded-xl border border-[#dce3dc] bg-[#fafbf9] px-3 py-2.5">
              <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
              <select value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))} aria-label="Filter by property type" className="w-full border-0 bg-transparent text-sm outline-none">
                {types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => setAdvancedOpen((open) => !open)} aria-expanded={advancedOpen} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dce3dc] px-4 py-2.5 text-sm font-semibold text-[#264936] hover:bg-[#f4f7f3]"><Filter className="h-4 w-4" /> Advanced</button>
            <a href="#property-results" className="inline-flex items-center justify-center rounded-xl bg-[#113222] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1a4931]">Show {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} <ArrowRight className="ml-2 h-4 w-4" /></a>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-[#77847b]">Budget</span>
            {budgetPills.map((range) => {
              const active = filters.minPrice === range.minPrice && filters.maxPrice === range.maxPrice && filters.budget === 'Any budget';
              return <button key={range.label} type="button" onClick={() => setPriceRange(active ? { minPrice: '', maxPrice: '' } : range)} aria-pressed={active} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? 'border-[#113222] bg-[#eaf0eb] text-[#113222]' : 'border-[#e1e5df] bg-white text-[#536158] hover:border-[#91a999]'}`}>{range.label}</button>;
            })}
            <span className="ml-2 mr-1 text-[11px] font-bold uppercase tracking-wide text-[#77847b]">Area</span>
            {areaPills.map((range) => {
              const active = filters.minArea === range.minArea && filters.maxArea === range.maxArea;
              return <button key={range.label} type="button" onClick={() => setAreaRange(active ? { minArea: '', maxArea: '' } : range)} aria-pressed={active} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? 'border-[#113222] bg-[#eaf0eb] text-[#113222]' : 'border-[#e1e5df] bg-white text-[#536158] hover:border-[#91a999]'}`}>{range.label}</button>;
            })}
          </div>

          {advancedOpen && <div className="mt-3 grid gap-3 rounded-xl bg-[#f7f8f5] p-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-500">
              <span className="shrink-0 text-xs font-bold">Min ₹L</span>
              <input type="number" min="0" value={filters.minPrice} onChange={(event) => setFilters((current) => ({ ...current, minPrice: event.target.value }))} placeholder="Any" aria-label="Minimum price in lakhs" className="w-full min-w-0 bg-transparent text-sm text-neutral-800 outline-none" />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-500">
              <span className="shrink-0 text-xs font-bold">Max ₹L</span>
              <input type="number" min="0" value={filters.maxPrice} onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value }))} placeholder="Any" aria-label="Maximum price in lakhs" className="w-full min-w-0 bg-transparent text-sm text-neutral-800 outline-none" />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-500">
              <span className="shrink-0 text-xs font-bold">Min sq.ft</span>
              <input type="number" min="0" value={filters.minArea} onChange={(event) => setFilters((current) => ({ ...current, minArea: event.target.value }))} placeholder="Any" aria-label="Minimum area in square feet" className="w-full min-w-0 bg-transparent text-sm text-neutral-800 outline-none" />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-500">
              <span className="shrink-0 text-xs font-bold">Max sq.ft</span>
              <input type="number" min="0" value={filters.maxArea} onChange={(event) => setFilters((current) => ({ ...current, maxArea: event.target.value }))} placeholder="Any" aria-label="Maximum area in square feet" className="w-full min-w-0 bg-transparent text-sm text-neutral-800 outline-none" />
            </label>
          </div>}

          {(filters.search || filters.location !== 'All locations' || filters.type !== 'All types' || filters.availability !== 'Any availability' || filters.budget !== 'Any budget' || filters.minPrice || filters.maxPrice || filters.minArea || filters.maxArea) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="self-center text-xs font-semibold text-[#66736b]">Active filters</span>
              {filters.search && <button type="button" onClick={() => setFilters((current) => ({ ...current, search: '' }))} className="rounded-full border border-[#e2ddd3] px-3 py-1.5 text-xs">Search: {filters.search} ×</button>}
              {filters.location !== 'All locations' && <button type="button" onClick={() => setFilters((current) => ({ ...current, location: 'All locations' }))} className="rounded-full border border-[#e2ddd3] px-3 py-1.5 text-xs">{filters.location} ×</button>}
              {filters.type !== 'All types' && <button type="button" onClick={() => setFilters((current) => ({ ...current, type: 'All types' }))} className="rounded-full border border-[#e2ddd3] px-3 py-1.5 text-xs">{filters.type} ×</button>}
              {filters.availability !== 'Any availability' && <button type="button" onClick={() => setFilters((current) => ({ ...current, availability: 'Any availability' }))} className="rounded-full border border-[#e2ddd3] px-3 py-1.5 text-xs">{filters.availability} ×</button>}
              {(filters.minPrice || filters.maxPrice) && <button type="button" onClick={() => setFilters((current) => ({ ...current, minPrice: '', maxPrice: '', budget: 'Any budget' }))} className="rounded-full border border-[#e2ddd3] px-3 py-1.5 text-xs">Price range ×</button>}
              {(filters.minArea || filters.maxArea) && <button type="button" onClick={() => setFilters((current) => ({ ...current, minArea: '', maxArea: '' }))} className="rounded-full border border-[#e2ddd3] px-3 py-1.5 text-xs">Area ×</button>}
              <button type="button" onClick={() => setFilters(defaultFilters)} className="ml-auto min-h-[44px] px-2 text-xs font-bold text-[#153d32] underline underline-offset-4">Reset Filters</button>
            </div>
          )}
        </section>

        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-3xl border border-neutral-200 bg-white p-3 shadow-card">
                <div className="h-44 animate-pulse rounded-2xl bg-neutral-200" />
                <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-neutral-200" />
                <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
        ) : filteredProperties.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-600">
            <p className="text-lg font-bold text-neutral-900">No listings match these filters.</p>
            <button type="button" onClick={() => setFilters(defaultFilters)} className="mt-4 inline-flex items-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white">
              Reset filters
            </button>
          </div>
        ) : (
          <div id="property-results" className="ph-results-grid mt-5 grid scroll-mt-28 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedProperties.slice(0, visibleCount).map((property) => (
              <article key={property.id} className="ph-property-card group overflow-hidden rounded-2xl border border-[#e1e5df] bg-white shadow-[0_5px_18px_rgba(17,50,34,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(17,50,34,.14)]">
                <div className="ph-property-photo relative overflow-hidden">
                  <Link to={`/properties/${property.id}`} aria-label={`View ${property.title}`} className="block">
                    <img src={property.image || property.images?.[0]} alt={property.title} className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" />
                  </Link>
                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className="rounded-full bg-[#e9f4ec] px-3 py-1 text-[10px] font-bold text-[#1e6439] shadow">Available</span>
                    {property.featured && <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold text-[#113222] shadow">Featured</span>}
                    {isApprovedListing(property.approval) && <span className="inline-flex items-center gap-1 rounded-full bg-[#113222]/95 px-2.5 py-1 text-[10px] font-bold text-white shadow"><BadgeCheck className="h-3 w-3" />{property.approval}</span>}
                  </div>
                  <div className="absolute right-3 top-3 flex gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <button type="button" onClick={() => setQuickView(property)} className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-[#183c28] shadow" aria-label={`Quick view ${property.title}`}><Eye className="h-3.5 w-3.5" />Quick view</button>
                    <button type="button" onClick={() => toggleSaved(property.id)} aria-pressed={savedIds.has(property.id)} aria-label={savedIds.has(property.id) ? 'Remove from saved properties' : 'Save property'} className="rounded-full bg-white/95 p-2 text-[#183c28] shadow"><Heart className={`h-4 w-4 ${savedIds.has(property.id) ? 'fill-rose-600 text-rose-600' : ''}`} /></button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[#6b786f]"><MapPin className="h-3.5 w-3.5 text-[#2f6d51]" />{property.location}</p>
                  <Link to={`/properties/${property.id}`} className="mt-1 block"><h2 className="line-clamp-2 min-h-12 font-serif text-lg font-bold leading-snug text-[#17231d] transition group-hover:text-[#2f6d51]">{property.title}</h2></Link>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-md bg-[#eaf0eb] px-2.5 py-1.5 text-[11px] font-semibold text-[#264936]">{property.propertyType || property.type}</span>
                    <span className="rounded-md bg-[#f2f5f2] px-2.5 py-1.5 text-[11px] font-semibold text-[#43534a]">{Number(property.areaSqFt || property.totalAreaSqft || 0).toLocaleString('en-IN')} sq.ft</span>
                    <span className="rounded-md bg-[#f2f5f2] px-2.5 py-1.5 text-[11px] font-semibold tabular-nums text-[#43534a]">{(Number(property.areaSqFt || property.totalAreaSqft || 0) / 435.6).toFixed(1)} cents</span>
                    <span className="rounded-md bg-[#f2f5f2] px-2.5 py-1.5 text-[11px] font-semibold text-[#43534a]">{property.facing || 'Facing not listed'}</span>
                    <span className="rounded-md bg-[#f2f5f2] px-2.5 py-1.5 text-[11px] font-semibold text-[#43534a]">Road: {property.roadWidth || property.roadAccess || 'Ask advisor'}</span>
                    <span className="rounded-md bg-[#f2f5f2] px-2.5 py-1.5 text-[11px] font-semibold text-[#43534a]">₹{Number(property.pricePerSqFt || property.pricePerSqft || 0).toLocaleString('en-IN')}/sq.ft</span>
                  </div>
                  <div className="mt-4 flex items-end justify-between border-t border-[#edf0ec] pt-3">
                    <div><p className="text-[10px] font-bold uppercase tracking-wide text-[#859188]">Asking price</p><span className="font-serif text-xl font-bold tabular-nums text-[#113222]">₹{property.priceLakhs >= 100 ? `${(property.priceLakhs / 100).toFixed(2)} Cr` : `${property.priceLakhs || 0} L`}</span></div>
                    <Link to={`/property/${property.id}`} className="inline-flex min-w-[112px] items-center justify-center gap-1 rounded-lg border border-[#2f6d51] px-4 py-2 text-xs font-bold text-[#285d45] transition hover:bg-[#113222] hover:text-white">View {siteContent.propertyDetailsText || 'Details'} <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && (sortedProperties.length > visibleCount || hasMore) && (
          <div className="mt-8 flex justify-center">
            <button type="button" onClick={loadMoreProperties} disabled={loadingMore} className="rounded-xl bg-[#113222] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1a4931] disabled:cursor-wait disabled:opacity-70">
              {loadingMore ? 'Loading properties...' : sortedProperties.length > visibleCount ? 'Show more properties' : 'Search more listings'}
            </button>
          </div>
        )}
      </main>

      {quickView && <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#09190f]/65 p-4" role="dialog" aria-modal="true" aria-labelledby="quick-view-title" onClick={() => setQuickView(null)}>
        <div className="relative my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => setQuickView(null)} aria-label="Close quick view" className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 text-[#183c28] shadow"><X className="h-4 w-4" /></button>
          <img src={quickView.image || quickView.images?.[0]} alt={quickView.title} className="h-64 w-full object-cover" />
          <div className="p-6"><p className="text-xs font-semibold text-[#627168]">{quickView.location}</p><h2 id="quick-view-title" className="mt-1 font-serif text-2xl font-bold text-[#113222]">{quickView.title}</h2><div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-lg bg-[#f2f5f2] px-3 py-2">{Number(quickView.areaSqFt || quickView.totalAreaSqft || 0).toLocaleString('en-IN')} sq.ft</span><span className="rounded-lg bg-[#f2f5f2] px-3 py-2">{quickView.facing || 'Facing not listed'}</span>{isApprovedListing(quickView.approval) && <span className="rounded-lg bg-[#eaf0eb] px-3 py-2 font-bold text-[#113222]">{quickView.approval}</span>}</div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="font-serif text-2xl font-bold tabular-nums text-[#113222]">₹{quickView.priceLakhs >= 100 ? `${(quickView.priceLakhs / 100).toFixed(2)} Cr` : `${quickView.priceLakhs || 0} L`}</p><div className="flex gap-2"><button type="button" onClick={() => toggleSaved(quickView.id)} className="inline-flex items-center gap-2 rounded-xl border border-[#d5dfd7] px-4 py-3 text-sm font-bold text-[#183c28]"><Heart className="h-4 w-4" />Save</button><Link to={`/properties/${quickView.id}`} className="inline-flex items-center gap-2 rounded-xl border border-[#2f6d51] px-4 py-3 text-sm font-bold text-[#183c28]">View Details <ArrowRight className="h-4 w-4" /></Link></div></div><form onSubmit={sendQuickEnquiry} className="mt-6 grid gap-3 border-t border-[#E2DDD3] pt-5 sm:grid-cols-[1fr_1fr_auto]"><input required aria-label="Your name" value={quickEnquiry.name} onChange={(event) => setQuickEnquiry((current) => ({ ...current, name: event.target.value }))} placeholder="Your name" className="min-w-0 rounded-lg border border-[#E2DDD3] px-3 py-2.5 text-sm"/><input required type="tel" pattern="^(?:\+?91[ \-]?)?[6-9](?:[0-9][ \-]?){9}$" title="Enter a valid 10-digit Indian mobile number" aria-label="10-digit mobile number" value={quickEnquiry.phone} onChange={(event) => setQuickEnquiry((current) => ({ ...current, phone: event.target.value }))} placeholder="10-digit mobile number" className="min-w-0 rounded-lg border border-[#E2DDD3] px-3 py-2.5 text-sm"/><button type="submit" className="min-h-[44px] rounded-lg bg-[#1E4033] px-4 py-2.5 text-sm font-bold text-white">Enquire</button>{quickEnquiryState && <p role="status" className="text-sm text-[#1E4033] sm:col-span-3">{quickEnquiryState}</p>}</form></div>
        </div>
      </div>}

      <Footer />
    </div>
  );
}
