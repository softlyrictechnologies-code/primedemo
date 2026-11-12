import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import LevitatingHero from '../components/LevitatingHero';
import QuickFiltersBar from '../components/QuickFiltersBar';
import PropertyCard from '../components/PropertyCard';
import PropertyDetailModal from '../components/PropertyDetailModal';
import PlotComparisonDrawer from '../components/PlotComparisonDrawer';
import ChennaiAreaGuide from '../components/ChennaiAreaGuide';
import InteractiveMapModal from '../components/InteractiveMapModal';
import Toast from '../components/Toast';
import Footer from '../components/Footer';

import { BUDGET_RANGES } from '../data/plotsData';
import { getPublishedProperties } from '../services/propertyService';
import { Building2, Compass } from 'lucide-react';

export default function PublicWebsite() {
  // Firestore Properties State
  const [properties, setProperties] = useState([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Search & Filter State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedBudget, setSelectedBudget] = useState('0');
  const [sortBy, setSortBy] = useState('featured');
  const [onlyCmdaApproved, setOnlyCmdaApproved] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  // User Interactivity States
  const [savedPlotIds, setSavedPlotIds] = useState(new Set());
  const [comparedPlotIds, setComparedPlotIds] = useState([]);
  
  // Modals & Drawers
  const [selectedPlotForModal, setSelectedPlotForModal] = useState(null);
  const [isComparisonDrawerOpen, setIsComparisonDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchPropertiesData = useCallback(async () => {
    setIsLoadingProperties(true);
    setLoadError(null);
    try {
      const data = await getPublishedProperties();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching published properties from Firestore:', err);
      setLoadError(err?.message || 'Unable to load Firestore listings.');
      setProperties([]);
    } finally {
      setIsLoadingProperties(false);
    }
  }, []);

  useEffect(() => {
    fetchPropertiesData();
  }, [fetchPropertiesData]);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  const handleToggleSave = (plotId) => {
    setSavedPlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(plotId)) {
        next.delete(plotId);
        showToast("Removed plot from saved list.");
      } else {
        next.add(plotId);
        showToast("Plot saved to your favorites!");
      }
      return next;
    });
  };

  const handleToggleCompare = (plotId) => {
    if (comparedPlotIds.includes(plotId)) {
      setComparedPlotIds((prev) => prev.filter((id) => id !== plotId));
      showToast("Removed plot from comparison.");
    } else {
      if (comparedPlotIds.length >= 3) {
        showToast("You can compare up to 3 plots maximum.");
        return;
      }
      setComparedPlotIds((prev) => [...prev, plotId]);
      showToast("Added plot to side-by-side comparison!");
    }
  };

  // Filtered & Sorted Plots Memo
  const filteredPlots = useMemo(() => {
    let result = [...properties];

    // Keyword Filter
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.area?.toLowerCase().includes(q) ||
          (p.landmarks && p.landmarks.some((l) => l.toLowerCase().includes(q)))
      );
    }

    // Area Filter
    if (selectedArea !== 'all') {
      result = result.filter((p) => p.area === selectedArea);
    }

    // Property Type Filter
    if (selectedType !== 'All Types') {
      result = result.filter((p) => (p.type === selectedType || p.propertyType === selectedType));
    }

    // Budget Filter
    const budgetObj = BUDGET_RANGES[Number(selectedBudget)] || BUDGET_RANGES[0];
    if (budgetObj.min > 0 || budgetObj.max < Infinity) {
      result = result.filter(
        (p) => p.priceLakhs >= budgetObj.min && p.priceLakhs <= budgetObj.max
      );
    }

    // CMDA Approval Filter
    if (onlyCmdaApproved) {
      result = result.filter(
        (p) => p.approval?.includes('CMDA') || p.approval?.includes('DTCP')
      );
    }

    // Sort Logic
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.priceLakhs - b.priceLakhs);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.priceLakhs - a.priceLakhs);
    } else if (sortBy === 'sqft-asc') {
      result.sort((a, b) => (a.pricePerSqft || 0) - (b.pricePerSqft || 0));
    } else if (sortBy === 'appreciation') {
      result.sort(
        (a, b) => parseFloat(b.appreciationRate || '0') - parseFloat(a.appreciationRate || '0')
      );
    } else if (sortBy === 'featured') {
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [properties, searchKeyword, selectedArea, selectedType, selectedBudget, onlyCmdaApproved, sortBy]);

  const comparedPlotsData = useMemo(() => {
    return properties.filter((p) => comparedPlotIds.includes(p.id));
  }, [properties, comparedPlotIds]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col justify-between selection:bg-[#1B4D3E] selection:text-white">
      
      {/* Toast Notification Handler */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Main Sticky Glass Header */}
      <Header
        savedCount={savedPlotIds.size}
        compareCount={comparedPlotIds.length}
        onOpenComparison={() => setIsComparisonDrawerOpen(true)}
      />

      <main className="flex-1">
        
        {/* Levitating Hero Section */}
        <LevitatingHero
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedBudget={selectedBudget}
          setSelectedBudget={setSelectedBudget}
          onPerformSearch={() => {
            const section = document.getElementById('plots-results-section');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Results & Listing Section */}
        <section id="plots-results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Quick Filters Bar */}
          <QuickFiltersBar
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onlyCmdaApproved={onlyCmdaApproved}
            setOnlyCmdaApproved={setOnlyCmdaApproved}
            totalResultsCount={filteredPlots.length}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Firebase Connection & Live Sync Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isLoadingProperties ? 'bg-amber-400 animate-ping' : loadError ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span className="font-bold text-slate-800">
                {isLoadingProperties
                  ? 'Connecting to Cloud Firestore...'
                  : loadError
                    ? 'Could not load property listings'
                    : `Cloud Firestore: ${properties.length} Listings`}
              </span>
              {!isLoadingProperties && !loadError && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#1B4D3E] font-extrabold text-[10px]">
                  Firebase Connected
                </span>
              )}
            </div>
            {loadError && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                Firestore warning: {loadError}
              </span>
            )}

            <button
              onClick={fetchPropertiesData}
              disabled={isLoadingProperties}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors disabled:opacity-50"
              title="Refresh properties from Firestore"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingProperties ? 'animate-spin' : ''}`} />
              Sync Now
            </button>
          </div>

          {/* Map View vs Grid View */}
          {viewMode === 'map' ? (
            <InteractiveMapModal
              plots={filteredPlots}
              onSelectPlot={(p) => setSelectedPlotForModal(p)}
            />
          ) : (
            <div>
              {isLoadingProperties ? (
                /* Skeleton Loading State */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="rounded-[2.5rem] bg-white p-5 border border-slate-100 shadow-md animate-pulse space-y-4"
                    >
                      <div className="w-full h-56 bg-slate-200 rounded-3xl" />
                      <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
                      <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="h-10 bg-slate-100 rounded-xl" />
                        <div className="h-10 bg-slate-100 rounded-xl" />
                        <div className="h-10 bg-slate-100 rounded-xl" />
                      </div>
                      <div className="h-12 bg-slate-200 rounded-2xl w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredPlots.length === 0 ? (
                <div className="py-16 text-center bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 space-y-3 shadow-lg">
                  <Compass className="w-12 h-12 text-slate-400 mx-auto animate-bounce" />
                  <h3 className="text-xl font-bold text-[#111827]">No Plots Match Your Filters</h3>
                  <p className="text-xs text-slate-500">Try resetting your area or budget range to see more Chennai listings.</p>
                  <button
                    onClick={() => {
                      setSelectedArea('all');
                      setSearchKeyword('');
                      setSelectedType('All Types');
                      setSelectedBudget('0');
                      setOnlyCmdaApproved(false);
                    }}
                    className="mt-3 px-6 py-2.5 rounded-full bg-[#1B4D3E] text-white text-xs font-bold shadow-md hover:bg-[#143B30] transition-all"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredPlots.map((plot) => (
                    <PropertyCard
                      key={plot.id}
                      plot={plot}
                      onSelectPlot={(p) => setSelectedPlotForModal(p)}
                      isSaved={savedPlotIds.has(plot.id)}
                      onToggleSave={handleToggleSave}
                      isCompared={comparedPlotIds.includes(plot.id)}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

        </section>

        {/* Chennai Corridor High Growth Spotlight */}
        <div id="area-guide-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ChennaiAreaGuide onSelectArea={(areaId) => setSelectedArea(areaId)} />
        </div>

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      {selectedPlotForModal && (
        <PropertyDetailModal
          plot={selectedPlotForModal}
          onClose={() => setSelectedPlotForModal(null)}
          onTriggerToast={showToast}
        />
      )}

      {isComparisonDrawerOpen && (
        <PlotComparisonDrawer
          comparePlots={comparedPlotsData}
          onClose={() => setIsComparisonDrawerOpen(false)}
          onRemovePlot={(id) => handleToggleCompare(id)}
        />
      )}

    </div>
  );
}

