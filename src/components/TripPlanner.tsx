import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Wallet, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Compass, 
  Bus, 
  Car, 
  Footprints, 
  Accessibility, 
  ShieldAlert, 
  Info,
  Clock,
  Heart,
  Search,
  ExternalLink,
  Database,
  BedDouble,
  Building,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { TripPlanPreferences, TravellerType, TravelStyle, TransportPreference, CrowdPreference, Destination, Provider } from '../types';
import { DEFAULT_TRIP_PREFERENCES, PROVIDERS } from '../data/mockData';
import { 
  searchStaysWithGoogle, 
  SearchGroundingResult,
  searchDestinationsWithGoogle,
  generateDynamicItineraryWithAI,
  DestinationSearchResult
} from '../services/geminiService';
import { fetchProvidersFromGoogleDB } from '../lib/firebase';

interface TripPlannerProps {
  onGenerateItinerary: (prefs: TripPlanPreferences, dynamicOutput?: any) => void;
  onCancel?: () => void;
  onOpenGeminiDecision?: () => void;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({
  onGenerateItinerary,
  onCancel,
  onOpenGeminiDecision
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [prefs, setPrefs] = useState<TripPlanPreferences>(DEFAULT_TRIP_PREFERENCES);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Google Search & Google Database state for Stay Selection
  const [stayPreference, setStayPreference] = useState<string>('Kudumbashree / Certified Homestay');
  const [isSearchingStays, setIsSearchingStays] = useState<boolean>(false);
  const [stayGroundingResult, setStayGroundingResult] = useState<SearchGroundingResult | null>(null);
  const [googleDbStays, setGoogleDbStays] = useState<Provider[]>([]);
  const [stayDbQueriedAt, setStayDbQueriedAt] = useState<string>('');
  const [selectedStayName, setSelectedStayName] = useState<string | null>(null);

  // Destination search for Starting Point
  const [isSearchingStartPoint, setIsSearchingStartPoint] = useState<boolean>(false);
  const [startPointDestinations, setStartPointDestinations] = useState<DestinationSearchResult[]>([]);
  const [showStartPointDropdown, setShowStartPointDropdown] = useState<boolean>(false);

  // Destination search for Preferred Corridor / Area
  const [isSearchingCorridor, setIsSearchingCorridor] = useState<boolean>(false);
  const [corridorDestinations, setCorridorDestinations] = useState<DestinationSearchResult[]>([]);
  const [showCorridorDropdown, setShowCorridorDropdown] = useState<boolean>(false);
  const [corridorSearchInput, setCorridorSearchInput] = useState<string>('');

  const handleSearchStartPoint = async (queryText?: string) => {
    const q = queryText !== undefined ? queryText : prefs.startingPoint;
    setIsSearchingStartPoint(true);
    try {
      const results = await searchDestinationsWithGoogle(q, 'startingPoint');
      setStartPointDestinations(results);
      setShowStartPointDropdown(true);
    } catch (e) {
      console.warn('Search start point destinations failed:', e);
    } finally {
      setIsSearchingStartPoint(false);
    }
  };

  const handleSearchCorridorDestinations = async (queryText?: string) => {
    const q = queryText !== undefined ? queryText : (corridorSearchInput || prefs.destinationArea);
    setIsSearchingCorridor(true);
    try {
      const results = await searchDestinationsWithGoogle(q, 'corridor');
      setCorridorDestinations(results);
      setShowCorridorDropdown(true);
    } catch (e) {
      console.warn('Search corridor destinations failed:', e);
    } finally {
      setIsSearchingCorridor(false);
    }
  };

  // Handle Google Search in Stay Selection + Google Database query
  const handleSearchStays = async () => {
    setIsSearchingStays(true);
    try {
      const locTarget = prefs.destinationArea || 'Kovalam Varkala Kerala';

      // 1. Google Search Grounding with Gemini
      const grounding = await searchStaysWithGoogle(locTarget, stayPreference);
      setStayGroundingResult(grounding);

      // 2. Query Google Database (Firestore) on the basis of input (location + stay category + budget)
      const dbResult = await fetchProvidersFromGoogleDB({
        location: locTarget,
        category: 'Homestay',
        maxBudget: prefs.totalBudget
      });

      if (dbResult.data.length > 0) {
        setGoogleDbStays(dbResult.data);
      } else {
        // Fallback to verified homestays from curated data
        const fallback = PROVIDERS.filter(p => p.category === 'Homestay');
        setGoogleDbStays(fallback.slice(0, 4));
      }
      setStayDbQueriedAt(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Stay search failed:', err);
    } finally {
      setIsSearchingStays(false);
    }
  };

  const travellerTypes: { type: TravellerType; label: string; desc: string }[] = [
    { type: 'Solo', label: 'Solo Traveller', desc: 'Curated safe routes with verified guides and social homestays' },
    { type: 'Student', label: 'Student Traveller', desc: 'Low-cost transit, student concessions & budget tiffin partners' },
    { type: 'Family', label: 'Family with Kids', desc: 'Kid-friendly artisan workshops, gentle beaches & clean restrooms' },
    { type: 'Senior-friendly', label: 'Senior-Friendly', desc: 'Low walking, step-free access, shaded seating & daylight transit' },
    { type: 'International visitor', label: 'International Tourist', desc: 'English guidance, cultural etiquette, verified taxi tariffs' }
  ];

  const travelStyles: { style: TravelStyle; label: string; budgetHint: string }[] = [
    { style: 'Budget', label: 'Budget Saver', budgetHint: '₹1,500 – ₹2,500 / day' },
    { style: 'Balanced', label: 'Balanced Explorer', budgetHint: '₹2,500 – ₹4,500 / day' },
    { style: 'Comfort', label: 'Comfort & Heritage', budgetHint: '₹4,500+ / day' }
  ];

  const transportOptions: { pref: TransportPreference; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { pref: 'Public transport', label: 'Public Transport (KSRTC & Trains)', icon: Bus },
    { pref: 'Auto/taxi', label: 'Verified Auto / EV Taxi', icon: Car },
    { pref: 'Walking-friendly', label: 'Walking & Heritage Trail', icon: Footprints },
    { pref: 'Rental vehicle', label: 'Rental Vehicle / Scooter', icon: Compass }
  ];

  const crowdPreferences: { pref: CrowdPreference; label: string }[] = [
    { pref: 'Prefer less crowded places', label: 'Quiet & Offbeat (Avoid peak hours)' },
    { pref: 'Balanced', label: 'Balanced Mix' },
    { pref: 'Popular places are okay', label: 'Popular Iconic Landmarks OK' }
  ];

  const interestOptions = [
    'Beaches', 'Heritage', 'Food', 'Nature', 'Artisans', 'Wellness', 'Adventure', 'Local culture'
  ];

  const accessibilityOptions = [
    'No special requirement',
    'Wheelchair-friendly places',
    'Low-walking itinerary',
    'Senior-friendly',
    'Accessible toilets'
  ];

  const safetyOptions = [
    'Daylight-only travel suggestions',
    'Verified providers only',
    'Emergency contacts shown'
  ];

  const handleInterestToggle = (interest: string) => {
    setPrefs(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAccessibilityToggle = (opt: string) => {
    if (opt === 'No special requirement') {
      setPrefs(prev => ({ ...prev, accessibilityNeeds: ['No special requirement'] }));
      return;
    }
    setPrefs(prev => {
      const filtered = prev.accessibilityNeeds.filter(a => a !== 'No special requirement');
      const exists = filtered.includes(opt);
      const next = exists ? filtered.filter(a => a !== opt) : [...filtered, opt];
      return {
        ...prev,
        accessibilityNeeds: next.length === 0 ? ['No special requirement'] : next
      };
    });
  };

  const handleSafetyToggle = (opt: string) => {
    setPrefs(prev => ({
      ...prev,
      safetyPreferences: prev.safetyPreferences.includes(opt)
        ? prev.safetyPreferences.filter(s => s !== opt)
        : [...prev.safetyPreferences, opt]
    }));
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    try {
      const dynamicOutput = await generateDynamicItineraryWithAI({
        ...prefs,
        selectedStayName: selectedStayName || undefined,
        stayPreference: stayPreference
      } as any);
      setIsGenerating(false);
      onGenerateItinerary(prefs, dynamicOutput);
    } catch (err) {
      console.warn('Dynamic AI generation returned error, falling back with input prefs:', err);
      setIsGenerating(false);
      onGenerateItinerary(prefs);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 px-3 sm:px-0">
      {/* Wizard Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span className={step >= 1 ? 'text-[#0D9488] font-bold' : ''}>1. Trip Basics</span>
          <span className={step >= 2 ? 'text-[#0D9488] font-bold' : ''}>2. Budget & Style</span>
          <span className={step >= 3 ? 'text-[#0D9488] font-bold' : ''}>3. Interests & Needs</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
          <div 
            className="bg-[#0D9488] h-full transition-all duration-300 ease-out rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Gemini AI Decision Assistant Trigger */}
        {onOpenGeminiDecision && (
          <div className="mb-6 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-950 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Unsure about budget, monsoon timing, or transport? Let Gemini AI evaluate trade-offs.</span>
            </div>
            <button
              type="button"
              onClick={onOpenGeminiDecision}
              className="px-3 py-1.5 rounded-lg bg-[#0F2942] hover:bg-[#163E66] text-white font-bold transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              Ask AI Decision Engine
            </button>
          </div>
        )}

        {/* STEP 1: TRIP BASICS */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F2942]">Trip Basics</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Tell us where your Kerala journey begins and how long you plan to explore.
              </p>
            </div>

            {/* STARTING POINT & PREFERRED CORRIDOR WITH DESTINATION SEARCH FEATURE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* 1. STARTING POINT WITH SEARCH DESTINATION */}
              <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Starting Point
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSearchStartPoint()}
                    className="text-[11px] font-bold text-[#0D9488] hover:underline flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" />
                    <span>Search Destinations</span>
                  </button>
                </div>

                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={prefs.startingPoint}
                    onChange={e => {
                      setPrefs({ ...prefs, startingPoint: e.target.value });
                      handleSearchStartPoint(e.target.value);
                    }}
                    onFocus={() => {
                      if (startPointDestinations.length === 0) handleSearchStartPoint();
                      setShowStartPointDropdown(true);
                    }}
                    className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-[#0F2942] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Search transit hub or address..."
                  />
                  <button
                    type="button"
                    onClick={() => handleSearchStartPoint()}
                    disabled={isSearchingStartPoint}
                    className="absolute right-1.5 top-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-all border border-emerald-200"
                  >
                    {isSearchingStartPoint ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {/* Popular Starting Hubs Quick Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Popular Hubs:</span>
                  {[
                    { label: 'Trivandrum Central (TVC)', val: 'Thiruvananthapuram Central' },
                    { label: 'Airport (TRV)', val: 'Trivandrum International Airport' },
                    { label: 'East Fort', val: 'East Fort Heritage Zone' },
                    { label: 'Varkala Station', val: 'Varkala Sivagiri Railway Station' }
                  ].map(hub => (
                    <button
                      key={hub.val}
                      type="button"
                      onClick={() => {
                        setPrefs({ ...prefs, startingPoint: hub.val });
                        setShowStartPointDropdown(false);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                        prefs.startingPoint === hub.val
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      {hub.label}
                    </button>
                  ))}
                </div>

                {/* Search Destination Results Dropdown for Starting Point */}
                {showStartPointDropdown && startPointDestinations.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg p-2 max-h-64 overflow-y-auto space-y-1">
                    <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-100">
                      <span>Google Search & Verified Starting Points</span>
                      <button 
                        type="button" 
                        onClick={() => setShowStartPointDropdown(false)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        ✕
                      </button>
                    </div>
                    {startPointDestinations.map(d => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setPrefs({ ...prefs, startingPoint: d.name });
                          setShowStartPointDropdown(false);
                        }}
                        className="p-2 rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors border border-transparent hover:border-emerald-200"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-xs text-[#0F2942]">{d.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">
                            {d.publicTransportFeasibility} Transit
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{d.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400">
                          <span>📍 {d.area}</span>
                          {d.distanceFromHub && <span>• {d.distanceFromHub}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. PREFERRED CORRIDOR / AREA WITH SEARCH DESTINATION */}
              <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Preferred Corridor / Area
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSearchCorridorDestinations()}
                    className="text-[11px] font-bold text-[#0D9488] hover:underline flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" />
                    <span>Search Destinations</span>
                  </button>
                </div>

                <div className="relative">
                  <Compass className="w-4 h-4 text-[#0D9488] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={prefs.destinationArea}
                    onChange={e => {
                      const val = e.target.value;
                      setPrefs({ ...prefs, destinationArea: val });
                      setCorridorSearchInput(val);
                      handleSearchCorridorDestinations(val);
                    }}
                    onFocus={() => {
                      if (corridorDestinations.length === 0) handleSearchCorridorDestinations();
                      setShowCorridorDropdown(true);
                    }}
                    className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-[#0F2942] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Search corridor, beach, cliff or town..."
                  />
                  <button
                    type="button"
                    onClick={() => handleSearchCorridorDestinations()}
                    disabled={isSearchingCorridor}
                    className="absolute right-1.5 top-1.5 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold transition-all border border-teal-200"
                  >
                    {isSearchingCorridor ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {/* Popular Corridors Quick Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Corridors:</span>
                  {[
                    { label: 'Full Corridor (TVM–Kovalam–Varkala)', val: 'Thiruvananthapuram–Kovalam–Varkala Corridor' },
                    { label: 'Varkala Cliff', val: 'Varkala Cliff & Backwaters' },
                    { label: 'Kovalam Bay', val: 'Kovalam Coastal Belt' },
                    { label: 'Poovar Estuary', val: 'Poovar Island Estuary' },
                    { label: 'Ponmudi Hills', val: 'Ponmudi Golden Valley & Hills' }
                  ].map(corridor => (
                    <button
                      key={corridor.val}
                      type="button"
                      onClick={() => {
                        setPrefs({ ...prefs, destinationArea: corridor.val });
                        setShowCorridorDropdown(false);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                        prefs.destinationArea === corridor.val
                          ? 'bg-[#0F2942] text-white border-[#0F2942]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-teal-50 hover:text-teal-900'
                      }`}
                    >
                      {corridor.label}
                    </button>
                  ))}
                </div>

                {/* Search Destination Results Dropdown for Preferred Corridor */}
                {showCorridorDropdown && corridorDestinations.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg p-2 max-h-64 overflow-y-auto space-y-1">
                    <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-100">
                      <span>Google Search & Verified Destinations</span>
                      <button 
                        type="button" 
                        onClick={() => setShowCorridorDropdown(false)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        ✕
                      </button>
                    </div>
                    {corridorDestinations.map(d => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setPrefs({ ...prefs, destinationArea: d.name });
                          setShowCorridorDropdown(false);
                        }}
                        className="p-2 rounded-lg hover:bg-teal-50 cursor-pointer transition-colors border border-transparent hover:border-teal-200"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-xs text-[#0F2942]">{d.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold shrink-0">
                            {d.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{d.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400">
                          <span>📍 {d.area}</span>
                          {d.distanceFromHub && <span>• {d.distanceFromHub}</span>}
                          {d.bestTime && <span>• ⏰ {d.bestTime}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Travel Dates
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={prefs.dates}
                    onChange={e => setPrefs({ ...prefs, dates: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="e.g. 24 Sep – 26 Sep 2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Number of Days
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPrefs({ ...prefs, numberOfDays: num })}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                        prefs.numberOfDays === num
                          ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {num} {num === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Travellers
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map(count => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPrefs({ ...prefs, numberOfTravellers: count })}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                        prefs.numberOfTravellers === count
                          ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-[#0F2942] hover:bg-[#16385C] text-white text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <span>Continue to Budget & Style</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BUDGET AND TRAVEL STYLE */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F2942]">Budget & Travel Style</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Local Lens routes prioritize explainable budgets and transparent community earnings.
              </p>
            </div>

            {/* Total Budget Slider */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-700" />
                  <span>Total Planned Budget (₹ INR)</span>
                </label>
                <span className="text-xl font-black text-[#0F2942]">
                  ₹{prefs.totalBudget.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="1500"
                max="15000"
                step="500"
                value={prefs.totalBudget}
                onChange={e => setPrefs({ ...prefs, totalBudget: Number(e.target.value) })}
                className="w-full mt-3 accent-[#0D9488] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>Budget (₹1,500)</span>
                <span>Standard (₹5,000)</span>
                <span>Comfort (₹15,000)</span>
              </div>
            </div>

            {/* Traveller Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Traveller Profile
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {travellerTypes.map(t => (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, travellerType: t.type })}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between ${
                      prefs.travellerType === t.type
                        ? 'border-[#0D9488] bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{t.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                    </div>
                    {prefs.travellerType === t.type && (
                      <Check className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Style */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Travel Style
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {travelStyles.map(s => (
                  <button
                    key={s.style}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, travelStyle: s.style })}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      prefs.travelStyle === s.style
                        ? 'border-[#0D9488] bg-emerald-50 font-bold text-emerald-950'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{s.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{s.budgetHint}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Transport Preference */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Transport Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {transportOptions.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.pref}
                      type="button"
                      onClick={() => setPrefs({ ...prefs, transportPreference: opt.pref })}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        prefs.transportPreference === opt.pref
                          ? 'border-[#0D9488] bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#0D9488]" />
                      <span className="text-xs leading-tight">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STAY SELECTION WITH GOOGLE SEARCH & GOOGLE DATABASE OUTPUT */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-700">
                    <BedDouble className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0F2942] flex items-center gap-1.5">
                      <span>Stay Selection (Google Search & Database Output)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                        Verified Stays
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Choose stay type, query Google Search for live tariffs, and explore matching stays from Google Firestore.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSearchStays}
                  disabled={isSearchingStays}
                  className="px-3.5 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0B7A70] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isSearchingStays ? 'Searching Google...' : `Search Stays with Google`}</span>
                </button>
              </div>

              {/* Stay Preference Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Stay Type Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'Kudumbashree / Certified Homestay',
                    'Heritage Eco-Villa',
                    'Community Guesthouse',
                    'Budget Coastal Stay'
                  ].map(stayType => (
                    <button
                      key={stayType}
                      type="button"
                      onClick={() => setStayPreference(stayType)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        stayPreference === stayType
                          ? 'border-teal-600 bg-teal-50/80 font-bold text-teal-950 ring-1 ring-teal-500/30'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{stayType.split('/')[0].trim()}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {stayType.includes('Homestay') ? 'Local families' : stayType.includes('Eco') ? 'Sustainable' : 'Affordable'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Google Search Grounded Stays Result */}
              {stayGroundingResult && (
                <div className="p-3 bg-white rounded-xl border border-teal-200 shadow-2xs text-xs space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-teal-800 font-bold border-b border-teal-100 pb-1.5">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Google Search Grounded Stay Insights</span>
                    </span>
                    <span className="text-slate-500 font-normal">Source: {stayGroundingResult.source}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line text-[11px]">
                    {stayGroundingResult.text}
                  </p>
                  {stayGroundingResult.webSources && stayGroundingResult.webSources.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-semibold">Citations:</span>
                      {stayGroundingResult.webSources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-teal-700 hover:underline flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded border border-teal-200"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>{src.title || 'Stay Reference'}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Google Database (Firestore) Stays Output */}
              {googleDbStays.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] mb-2 font-bold">
                    <span className="text-[#0F2942] flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-teal-600" />
                      <span>Google Database Output ({googleDbStays.length} verified stays in Firestore)</span>
                    </span>
                    {stayDbQueriedAt && (
                      <span className="text-slate-400 font-normal text-[10px]">Queried at {stayDbQueriedAt}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {googleDbStays.map(stay => (
                      <div
                        key={stay.id}
                        onClick={() => setSelectedStayName(stay.name)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          selectedStayName === stay.name
                            ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                              <span>{stay.name}</span>
                              {selectedStayName === stay.name && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              <span>{stay.location}</span>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                            ₹{stay.startingPrice}/night
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600 mt-2 line-clamp-1">
                          {stay.communityImpact}
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="text-teal-700 font-semibold">{stay.verificationStatus}</span>
                          <span className="text-slate-400">Click to attach to trip</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Crowd Preference */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Crowd Preference
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {crowdPreferences.map(c => (
                  <button
                    key={c.pref}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, crowdPreference: c.pref })}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                      prefs.crowdPreference === c.pref
                        ? 'border-[#0F2942] bg-[#0F2942] text-white font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-[#0F2942] hover:bg-[#16385C] text-white text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <span>Continue to Interests & Safety</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: INTERESTS AND NEEDS */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F2942]">Interests & Safety Needs</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Customize accessibility features, dietary preferences, and safety filters.
              </p>
            </div>

            {/* Interests Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Your Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(interest => {
                  const selected = prefs.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        selected
                          ? 'bg-[#0D9488] text-white border-[#0D9488]'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary & Language Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dietary Preference
                </label>
                <select
                  value={prefs.dietaryPreference}
                  onChange={e => setPrefs({ ...prefs, dietaryPreference: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Kerala Local (Vegetarian & Sea Food)">Kerala Local (Fresh Sea Food & Veg)</option>
                  <option value="Strict Vegetarian / Jain">Strict Vegetarian / Plant-based</option>
                  <option value="Halal Friendly">Halal Certified Local Eateries</option>
                  <option value="No Restrictions">No Special Food Restrictions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Language Preference for Guides
                </label>
                <select
                  value={prefs.languagePreference}
                  onChange={e => setPrefs({ ...prefs, languagePreference: e.target.value as any })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="English">English</option>
                  <option value="Malayalam">Malayalam (മലയാളം)</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                </select>
              </div>
            </div>

            {/* Accessibility Needs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Accessibility className="w-4 h-4 text-emerald-700" />
                <span>Accessibility Requirements</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {accessibilityOptions.map(opt => {
                  const selected = prefs.accessibilityNeeds.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleAccessibilityToggle(opt)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        selected
                          ? 'border-[#0D9488] bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {selected && <Check className="w-4 h-4 text-[#0D9488]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Safety Preferences */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Safety Filters</span>
              </label>
              <div className="space-y-2">
                {safetyOptions.map(opt => {
                  const selected = prefs.safetyPreferences.includes(opt);
                  return (
                    <label
                      key={opt}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs text-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => handleSafetyToggle(opt)}
                        className="w-4 h-4 accent-[#0D9488] rounded"
                      />
                      <span className="font-semibold">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Pilot Disclaimer */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Itinerary is calculated using verified pilot benchmarks along the TVM–Kovalam–Varkala corridor. No booking fee or commercial commissions are levied.
              </span>
            </div>

            {/* Final Generation Button */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isGenerating}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm sm:text-base shadow-md flex items-center gap-2 transition-all transform active:scale-98 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Calculating Responsible Route...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Generate My Responsible Route</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
