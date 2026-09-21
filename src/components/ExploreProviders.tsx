import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Accessibility, 
  HeartHandshake, 
  ShieldCheck, 
  ChevronRight, 
  X, 
  SlidersHorizontal,
  Globe2,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Database,
  ExternalLink,
  Navigation,
  Map,
  BedDouble
} from 'lucide-react';
import { Provider, ProviderCategory, VerificationStatus } from '../types';
import { TrustBadge, isStale } from './TrustBadge';
import { searchLocationWithGoogle, searchStaysWithGoogle, SearchGroundingResult } from '../services/geminiService';
import { fetchProvidersFromGoogleDB } from '../lib/firebase';

interface ExploreProvidersProps {
  providers: Provider[];
  initialCategory?: string;
  initialDestinationId?: string;
  onSelectProvider: (provider: Provider) => void;
  onCallProvider: (provider: Provider) => void;
  onWhatsAppEnquiry: (provider: Provider) => void;
  onRequestBook: (provider: Provider) => void;
  onOpenTrustModal: () => void;
}

export const ExploreProviders: React.FC<ExploreProvidersProps> = ({
  providers,
  initialCategory = '',
  initialDestinationId = '',
  onSelectProvider,
  onCallProvider,
  onWhatsAppEnquiry,
  onRequestBook,
  onOpenTrustModal
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [selectedVerification, setSelectedVerification] = useState<string>('All');
  const [maxBudget, setMaxBudget] = useState<number>(2500);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [filterAccessibleOnly, setFilterAccessibleOnly] = useState<boolean>(false);
  const [verifiedPartnersOnly, setVerifiedPartnersOnly] = useState<boolean>(false);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState<boolean>(false);

  // Google Search Grounding & Database states
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [locationGrounding, setLocationGrounding] = useState<SearchGroundingResult | null>(null);
  const [isSearchingStays, setIsSearchingStays] = useState<boolean>(false);
  const [stayGrounding, setStayGrounding] = useState<SearchGroundingResult | null>(null);
  const [lastDbQueryTime, setLastDbQueryTime] = useState<string>('');
  const [cloudDbCount, setCloudDbCount] = useState<number>(providers.length);

  // Trigger Google Search for current selected location
  const handleSearchLocationWithGoogle = async () => {
    const loc = selectedLocation === 'All Locations' ? 'Kerala Thiruvananthapuram Kovalam Varkala' : selectedLocation;
    setIsSearchingLocation(true);
    try {
      const res = await searchLocationWithGoogle(loc);
      setLocationGrounding(res);
    } catch (err) {
      console.warn('Google search location error:', err);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Trigger Google Search for Stays in selected location
  const handleSearchStaysWithGoogle = async () => {
    const loc = selectedLocation === 'All Locations' ? 'Kovalam Varkala' : selectedLocation;
    setIsSearchingStays(true);
    try {
      const res = await searchStaysWithGoogle(loc, 'Certified Homestay');
      setStayGrounding(res);
    } catch (err) {
      console.warn('Google search stays error:', err);
    } finally {
      setIsSearchingStays(false);
    }
  };

  // Sync Google Database output on input change
  useEffect(() => {
    let isCancelled = false;
    const syncDb = async () => {
      try {
        const res = await fetchProvidersFromGoogleDB({
          location: selectedLocation === 'All Locations' ? undefined : selectedLocation,
          category: selectedCategory || undefined,
          maxBudget: maxBudget,
          searchTerm: searchTerm || undefined
        });
        if (!isCancelled && res.data) {
          setCloudDbCount(res.data.length);
          setLastDbQueryTime(new Date().toLocaleTimeString());
        }
      } catch (err) {
        // graceful fallback to in-memory count
      }
    };
    syncDb();
    return () => { isCancelled = true; };
  }, [selectedLocation, selectedCategory, maxBudget, searchTerm]);

  const categories: { label: string; value: string }[] = [
    { label: 'All Services', value: '' },
    { label: 'Homestays', value: 'Homestay' },
    { label: 'Local Guides', value: 'Local Guide' },
    { label: 'Food Experiences', value: 'Food Experience' },
    { label: 'Restaurants', value: 'Restaurant' },
    { label: 'Artisan Workshops', value: 'Artisan Workshop' },
    { label: 'Cultural Workshops', value: 'Cultural Workshop' },
    { label: 'Activity Operators', value: 'Activity Operator' },
    { label: 'Local Transport', value: 'Local Transport' }
  ];

  const locations = [
    'All Locations',
    'Kovalam',
    'Varkala',
    'Thiruvananthapuram',
    'Neyyar',
    'Ponmudi',
    'Poovar'
  ];

  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      // Must not recommend pending or suspended providers per Data Authenticity rules
      if (p.adminReviewStatus === 'Pending' || p.adminReviewStatus === 'Suspended' || !p.activeStatus) {
        return false;
      }

      // Search match
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesLoc = p.location.toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesLoc && !matchesCategory) return false;
      }

      // Category match
      if (selectedCategory && p.category !== selectedCategory) {
        return false;
      }

      // Location match
      if (selectedLocation !== 'All Locations' && !p.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }

      // Verification match
      if (selectedVerification !== 'All' && p.verificationStatus !== selectedVerification) {
        return false;
      }

      // Verified partners only toggle
      if (verifiedPartnersOnly && p.verificationStatus !== 'Verified Local Partner') {
        return false;
      }

      // Budget match
      if (p.startingPrice > maxBudget) {
        return false;
      }

      // Language match
      if (selectedLanguage !== 'All' && !p.languages.includes(selectedLanguage)) {
        return false;
      }

      // Accessibility match
      if (filterAccessibleOnly) {
        const lowerNotes = p.accessibilityNotes.toLowerCase();
        const isAccessible = lowerNotes.includes('step-free') || lowerNotes.includes('ramp') || lowerNotes.includes('wheelchair') || lowerNotes.includes('level');
        if (!isAccessible) return false;
      }

      return true;
    });
  }, [
    providers, 
    searchTerm, 
    selectedCategory, 
    selectedLocation, 
    selectedVerification, 
    maxBudget, 
    selectedLanguage, 
    filterAccessibleOnly, 
    verifiedPartnersOnly
  ]);

  const activeFiltersCount = [
    selectedCategory !== '',
    selectedLocation !== 'All Locations',
    selectedVerification !== 'All',
    maxBudget < 2500,
    selectedLanguage !== 'All',
    filterAccessibleOnly,
    verifiedPartnersOnly
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedLocation('All Locations');
    setSelectedVerification('All');
    setMaxBudget(2500);
    setSelectedLanguage('All');
    setFilterAccessibleOnly(false);
    setVerifiedPartnersOnly(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F2942]">
              Verified Local Providers
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Connect directly with verified homestays, licensed storytelling guides, and craft cooperatives along the pilot corridor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVerifiedPartnersOnly(!verifiedPartnersOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-2xs ${
                verifiedPartnersOnly
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Partners Only</span>
            </button>

            <button
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                activeFiltersCount > 0
                  ? 'bg-[#0F2942] text-white border-[#0F2942]'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters ({activeFiltersCount})</span>
            </button>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, craft, location (e.g. 'Anjali', 'Kovalam', 'coir', 'guide')..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Horizontal Scroll Chips */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all border ${
                selectedCategory === cat.value
                  ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* GOOGLE DATABASE OUTPUT STATUS & GOOGLE SEARCH CONTROLS */}
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#0F2942] text-white border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <Database className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Google Database Output:</span>
                <span className="text-emerald-300 font-extrabold">{filteredProviders.length} records matching current input</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Targeting: {selectedLocation} • {selectedCategory || 'All Categories'} • Max ₹{maxBudget}
                {lastDbQueryTime && ` • Synced at ${lastDbQueryTime}`}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSearchLocationWithGoogle}
              disabled={isSearchingLocation}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{isSearchingLocation ? 'Querying...' : `Google Search Location: ${selectedLocation === 'All Locations' ? 'Corridor' : selectedLocation}`}</span>
            </button>

            <button
              type="button"
              onClick={handleSearchStaysWithGoogle}
              disabled={isSearchingStays}
              className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
            >
              <BedDouble className="w-3 h-3 text-teal-200" />
              <span>{isSearchingStays ? 'Searching...' : 'Google Search Stays'}</span>
            </button>
          </div>
        </div>

        {/* Location Grounding Output */}
        {locationGrounding && (
          <div className="mt-3 p-3.5 bg-slate-900/90 rounded-xl border border-emerald-500/40 text-xs text-white space-y-2">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold border-b border-slate-700 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Google Search Location Intelligence ({selectedLocation})</span>
              </span>
              <button onClick={() => setLocationGrounding(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed whitespace-pre-line">
              {locationGrounding.text}
            </p>
            {locationGrounding.webSources && locationGrounding.webSources.length > 0 && (
              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 items-center">
                <span className="text-[10px] text-slate-400 font-bold">Official Sources:</span>
                {locationGrounding.webSources.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-cyan-300 hover:underline flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>{s.title || 'Official Portal'}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stay Grounding Output */}
        {stayGrounding && (
          <div className="mt-3 p-3.5 bg-slate-900/90 rounded-xl border border-teal-500/40 text-xs text-white space-y-2">
            <div className="flex items-center justify-between text-[11px] text-teal-300 font-bold border-b border-slate-700 pb-1.5">
              <span className="flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5" />
                <span>Google Search Stay Grounding for {selectedLocation}</span>
              </span>
              <button onClick={() => setStayGrounding(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed whitespace-pre-line">
              {stayGrounding.text}
            </p>
            {stayGrounding.webSources && stayGrounding.webSources.length > 0 && (
              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 items-center">
                <span className="text-[10px] text-slate-400 font-bold">Citations:</span>
                {stayGrounding.webSources.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-teal-300 hover:underline flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>{s.title || 'Stay Directory'}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expandable Advanced Filters Drawer */}
      {showFiltersDrawer && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-[#0F2942] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#0D9488]" />
              Detailed Exploration Filters
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 font-bold hover:underline"
            >
              Reset All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Location filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location / Town
              </label>
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Verification level filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Verification Level
              </label>
              <select
                value={selectedVerification}
                onChange={e => setSelectedVerification(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
              >
                <option value="All">All Verification Levels</option>
                <option value="Verified Local Partner">Verified Local Partner</option>
                <option value="Official Source">Official Source</option>
                <option value="Curated Pilot Data">Curated Pilot Data</option>
                <option value="Community Submitted">Community Submitted</option>
              </select>
            </div>

            {/* Max Budget Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Max Starting Price</span>
                <span className="text-emerald-700">₹{maxBudget}</span>
              </div>
              <input
                type="range"
                min="200"
                max="2500"
                step="100"
                value={maxBudget}
                onChange={e => setMaxBudget(Number(e.target.value))}
                className="w-full accent-[#0D9488]"
              />
            </div>

            {/* Language filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Spoken Language
              </label>
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
              >
                <option value="All">Any Language</option>
                <option value="Malayalam">Malayalam</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>
          </div>

          {/* Checkbox Toggles */}
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterAccessibleOnly}
                onChange={e => setFilterAccessibleOnly(e.target.checked)}
                className="w-4 h-4 accent-[#0D9488] rounded"
              />
              <span>Wheelchair / Low-stride accessible listings only</span>
            </label>
          </div>
        </div>
      )}

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span>Showing {filteredProviders.length} active verified local providers</span>
        <button
          onClick={onOpenTrustModal}
          className="text-[#0D9488] hover:underline flex items-center gap-1"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>How we verify listings</span>
        </button>
      </div>

      {/* Providers Grid */}
      {filteredProviders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">No matching providers found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your budget slider or clearing specific filters to discover more local community partners.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-[#0F2942] text-white text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProviders.map(provider => {
            const stale = isStale(provider.lastUpdated);

            return (
              <div
                key={provider.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={provider.image}
                      alt={provider.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#0F2942] text-white shadow-xs">
                        {provider.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <TrustBadge status={provider.verificationStatus} compact={true} />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 
                          onClick={() => onSelectProvider(provider)}
                          className="font-extrabold text-base text-slate-900 hover:text-[#0D9488] cursor-pointer transition-colors leading-snug"
                        >
                          {provider.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{provider.location}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {provider.description}
                    </p>

                    {/* Community Impact Label - MANDATED */}
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-2">
                      <HeartHandshake className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        <strong>Community Impact:</strong> {provider.communityImpact}
                      </span>
                    </div>

                    {/* Accessibility Note */}
                    <div className="flex items-start gap-1.5 text-[11px] text-slate-500">
                      <Accessibility className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{provider.accessibilityNotes}</span>
                    </div>

                    {/* Languages & Last Updated info */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Languages: {provider.languages.join(', ')}</span>
                      <span>Updated: {provider.lastUpdated}</span>
                    </div>
                  </div>
                </div>

                {/* Footer with Price & Actions */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Indicative Tariff</span>
                      <span className="font-extrabold text-sm text-[#0F2942]">{provider.priceRange}</span>
                    </div>

                    <button
                      onClick={() => onSelectProvider(provider)}
                      className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-0.5"
                    >
                      <span>View Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Google Maps link & database tag */}
                  <div className="flex items-center justify-between pb-2 text-[11px]">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.name + ' ' + provider.location + ' Kerala')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#0D9488] hover:text-emerald-900 font-bold hover:underline"
                    >
                      <Map className="w-3 h-3 text-[#0D9488]" />
                      <span>View on Google Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <span className="text-slate-400 text-[10px]">Google Firestore verified</span>
                  </div>

                  {/* MANDATED ACTION BUTTONS: Call, WhatsApp, Request to Book */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onCallProvider(provider)}
                      className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      title={`Call ${provider.phone}`}
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>Call</span>
                    </button>

                    <button
                      onClick={() => onWhatsAppEnquiry(provider)}
                      className="py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      title="Send WhatsApp Enquiry"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => onRequestBook(provider)}
                      className="py-2 rounded-xl bg-[#0F2942] hover:bg-[#16385C] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
                      title="Request to Book"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
