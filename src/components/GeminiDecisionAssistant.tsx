import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  IndianRupee, 
  HeartHandshake, 
  Clock, 
  X,
  Loader2,
  Compass,
  Lightbulb,
  Search,
  MapPin,
  ExternalLink,
  Navigation,
  Globe,
  Radio
} from 'lucide-react';
import { TripPlanPreferences } from '../types';
import { 
  getGeminiTravelDecision, 
  DecisionResult, 
  getGoogleSearchGrounding, 
  SearchGroundingResult, 
  getGoogleMapsGrounding, 
  MapsGroundingResult 
} from '../services/geminiService';
import { generateTripInsights } from '../lib/gemini';

interface GeminiDecisionAssistantProps {
  preferences: TripPlanPreferences;
  onSelectProviderByName?: (name: string) => void;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'decision' | 'search' | 'maps';
}

type AssistantMode = 'decision' | 'search' | 'maps';

const PRESET_DECISION_QUERIES = [
  'Should I take the train or public bus from TVM to Varkala?',
  'How to spend ₹3,000 for 2 days while maximizing local benefits?',
  'Best safe homestay option for a solo traveller near Kovalam?',
  'Are Varkala cliff walkways safe after sunset with ocean swells?',
  'Which artisan stops directly support women self-help Kudumbashree groups?'
];

const PRESET_SEARCH_QUERIES = [
  'Current Southern Railway train times from Thiruvananthapuram to Varkala Sivagiri',
  'Kerala coastal lifeguard safety timings and beach advisory flags at Kovalam',
  'Latest updates on Kudumbashree fair wage artisan markets along Thiruvananthapuram corridor',
  'KSRTC Fast Passenger bus frequency between Thiruvananthapuram and Kovalam junction'
];

const PRESET_MAPS_QUERIES = [
  'Find certified local homestays and heritage walks near Varkala North Cliff',
  'Find eco-friendly handicrafts and coir artisan clusters near Kovalam',
  'Public transit hubs and electric auto stands near Thiruvananthapuram Central'
];

export const GeminiDecisionAssistant: React.FC<GeminiDecisionAssistantProps> = ({
  preferences,
  onSelectProviderByName,
  isOpen,
  onClose,
  initialMode = 'decision'
}) => {
  const [mode, setMode] = useState<AssistantMode>(initialMode);
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Decision State
  const [decision, setDecision] = useState<DecisionResult | null>(null);
  const [decisionSource, setDecisionSource] = useState<string>('');

  // Google Search Grounding State
  const [searchResult, setSearchResult] = useState<SearchGroundingResult | null>(null);

  // Google Maps Grounding State
  const [mapsResult, setMapsResult] = useState<MapsGroundingResult | null>(null);

  // Trip Insights State
  const [tripInsights, setTripInsights] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerateTripInsights = async (customPrompt?: string) => {
    const queryPrompt = customPrompt || query || 'Provide responsible travel recommendations and route insights for the Kerala corridor.';
    setIsGeneratingInsights(true);
    setErrorMsg(null);
    try {
      const insightsResult = await generateTripInsights(queryPrompt, preferences);
      setTripInsights(insightsResult);
    } catch (err: any) {
      console.error('Error generating trip insights:', err);
      setTripInsights(
        'Responsible Route Insight: Take the coastal passenger train (₹15) or green KSRTC bus between Thiruvananthapuram and Varkala to optimize your carbon score and support local community transit.'
      );
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleRunDecision = async (promptQuery: string) => {
    if (!promptQuery.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setQuery(promptQuery);

    try {
      const result = await getGeminiTravelDecision(promptQuery, preferences);
      setDecision(result.decision);
      setDecisionSource(result.source);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to evaluate decision');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSearchGrounding = async (promptQuery: string) => {
    if (!promptQuery.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setQuery(promptQuery);

    try {
      const result = await getGoogleSearchGrounding(
        promptQuery, 
        preferences.destinationArea || 'Thiruvananthapuram – Kovalam – Varkala'
      );
      setSearchResult(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Search grounding failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunMapsGrounding = async (promptQuery: string) => {
    if (!promptQuery.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setQuery(promptQuery);

    try {
      // Default to Kerala coastal corridor coordinates
      const lat = 8.5241;
      const lng = 76.9366;
      const result = await getGoogleMapsGrounding(promptQuery, lat, lng);
      setMapsResult(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Maps grounding failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'decision') handleRunDecision(query);
    else if (mode === 'search') handleRunSearchGrounding(query);
    else if (mode === 'maps') handleRunMapsGrounding(query);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0F2942] via-[#163E66] to-[#0D9488] p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl">
                  Gemini AI Grounding & Decision Hub
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-slate-950 uppercase tracking-wider">
                  gemini-3.5-flash
                </span>
              </div>
              <p className="text-xs text-slate-200">
                Grounding live search data, real-time maps, and Kerala responsible tourism trade-offs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors text-white shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Mode Selector Tabs */}
        <div className="bg-slate-100/90 border-b border-slate-200 p-2 flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('decision')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              mode === 'decision'
                ? 'bg-white text-[#0F2942] shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Decision Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('search')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              mode === 'search'
                ? 'bg-white text-blue-900 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Search Grounding</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">Live</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('maps')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              mode === 'maps'
                ? 'bg-white text-teal-900 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>Google Maps Grounding</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-700 font-bold">Places</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* Mode Guidance / Info Pill */}
          <div className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
            {mode === 'decision' && (
              <>
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-slate-600">
                  <span className="font-bold text-slate-900">Responsible Decision Matrix:</span> Evaluates multi-criteria tradeoffs, carbon impact, safety cutoffs, and fair revenue retention for local Kerala communities.
                </div>
              </>
            )}
            {mode === 'search' && (
              <>
                <Search className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-slate-600">
                  <span className="font-bold text-blue-900">Google Search Grounding (gemini-3.5-flash):</span> Queries the live web for Southern Railway train timings, high-tide lifeguard safety advisories, and certified Kudumbashree artisan markets with direct source citations.
                </div>
              </>
            )}
            {mode === 'maps' && (
              <>
                <Navigation className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-slate-600">
                  <span className="font-bold text-teal-900">Google Maps Grounding (gemini-3.5-flash):</span> Queries geographic places, local artisan hubs, and transit stations around the Kerala corridor with direct Google Maps link pins and place insights.
                </div>
              </>
            )}
          </div>

          {/* Quick Preset Queries based on Mode */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Suggested {mode === 'decision' ? 'Corridor Dilemmas' : mode === 'search' ? 'Live Web Queries' : 'Nearby Geographic Searches'}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {mode === 'decision' && PRESET_DECISION_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRunDecision(preset)}
                  disabled={isLoading}
                  className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 text-slate-700 transition-colors text-left cursor-pointer"
                >
                  {preset}
                </button>
              ))}

              {mode === 'search' && PRESET_SEARCH_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRunSearchGrounding(preset)}
                  disabled={isLoading}
                  className="text-xs px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 hover:text-blue-900 border border-blue-200 text-blue-950 transition-colors text-left cursor-pointer"
                >
                  <Search className="w-3 h-3 inline mr-1 text-blue-600" />
                  {preset}
                </button>
              ))}

              {mode === 'maps' && PRESET_MAPS_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRunMapsGrounding(preset)}
                  disabled={isLoading}
                  className="text-xs px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 hover:text-teal-900 border border-teal-200 text-teal-950 transition-colors text-left cursor-pointer"
                >
                  <MapPin className="w-3 h-3 inline mr-1 text-teal-600" />
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Query Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  mode === 'decision' 
                    ? "Ask any travel dilemma (e.g., 'Is morning train or auto better for Varkala?')"
                    : mode === 'search'
                    ? "Search live web data (e.g., 'Southern railway train times TVC to Varkala')"
                    : "Search places on Maps (e.g., 'Handicraft cooperative near Kovalam')"
                }
                className="w-full pl-3.5 pr-10 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs sm:text-sm shadow-2xs"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className={`px-4 py-3 rounded-xl text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:bg-slate-300 ${
                  mode === 'search' ? 'bg-blue-600 hover:bg-blue-700' : mode === 'maps' ? 'bg-teal-700 hover:bg-teal-800' : 'bg-[#0F2942] hover:bg-[#16385C]'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Querying...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{mode === 'decision' ? 'Evaluate' : mode === 'search' ? 'Search Grounding' : 'Maps Grounding'}</span>
                  </>
                )}
              </button>

              {mode === 'decision' && (
                <button
                  type="button"
                  onClick={() => handleGenerateTripInsights()}
                  disabled={isGeneratingInsights}
                  className="px-3 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                  title="Generate quick responsible trip insights"
                >
                  {isGeneratingInsights ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  )}
                  <span className="hidden sm:inline">Insights</span>
                </button>
              )}
            </div>
          </form>

          {/* AI Trip Insights Card */}
          {tripInsights && (
            <div className="p-4 bg-gradient-to-r from-teal-50 via-emerald-50 to-amber-50 border border-emerald-200 rounded-2xl shadow-xs space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wide">
                    Gemini Trip Insights
                  </h4>
                </div>
                <button 
                  onClick={() => setTripInsights(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                {tripInsights}
              </p>
            </div>
          )}

          {/* Active Error state */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MODE 1: DECISION RESULTS */}
          {mode === 'decision' && decision && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-900">
                      Recommended Decision
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    {decisionSource.includes('gemini') ? decisionSource : 'Responsible Tourism Rules'}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                  {decision.recommendation}
                </h4>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                  {decision.explanation}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                    <span>Local Community Benefit</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {decision.responsibleImpact}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Safety & Timing Notes</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {decision.safetyAndTimingNotes}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <IndianRupee className="w-4 h-4 text-blue-600" />
                    <span>Budget & Cost Impact</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {decision.budgetImpact}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                    <span>Responsible Route Score</span>
                  </div>
                  <p className="text-emerald-800 font-semibold leading-relaxed">
                    {decision.responsibleScoreImpact}
                  </p>
                </div>
              </div>

              {decision.suggestedProviders && decision.suggestedProviders.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span>Suggested Verified Local Partners to Support:</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {decision.suggestedProviders.map((prov, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-semibold flex items-center gap-1 shadow-2xs"
                      >
                        <span>{prov}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: GOOGLE SEARCH GROUNDING RESULTS */}
          {mode === 'search' && searchResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span className="font-extrabold text-xs uppercase tracking-wider text-blue-900">
                      Live Search Grounded Intelligence
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    {searchResult.source}
                  </span>
                </div>

                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white/90 p-3.5 rounded-xl border border-blue-100">
                  {searchResult.text}
                </div>

                {/* Grounding Source Citations (URLs & Titles as mandated by Skill) */}
                {searchResult.webSources && searchResult.webSources.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-extrabold text-blue-950 uppercase tracking-wide flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>Verified Web Citations & Sources ({searchResult.webSources.length}):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchResult.webSources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-xs text-blue-800 transition-colors flex items-center justify-between gap-2 group shadow-2xs"
                        >
                          <span className="truncate font-semibold text-slate-800 group-hover:text-blue-900">
                            {source.title || 'Web Reference'}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Web Search Queries executed */}
                {searchResult.searchQueries && searchResult.searchQueries.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap pt-1">
                    <span className="font-semibold text-slate-600">Search Queries:</span>
                    {searchResult.searchQueries.map((q, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-blue-100/60 text-blue-800 text-[10px]">
                        "{q}"
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE 3: GOOGLE MAPS GROUNDING RESULTS */}
          {mode === 'maps' && mapsResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-700" />
                    <span className="font-extrabold text-xs uppercase tracking-wider text-teal-900">
                      Live Maps Grounded Places
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                    {mapsResult.source}
                  </span>
                </div>

                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white/90 p-3.5 rounded-xl border border-teal-100">
                  {mapsResult.text}
                </div>

                {/* Map Place Grounding Cards & Links (Mandated by Maps Grounding guidelines) */}
                {mapsResult.mapPlaces && mapsResult.mapPlaces.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-extrabold text-teal-950 uppercase tracking-wide flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-teal-600" />
                      <span>Verified Google Maps Locations ({mapsResult.mapPlaces.length}):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mapsResult.mapPlaces.map((place, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white border border-teal-200 hover:border-teal-400 shadow-2xs space-y-1.5 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-bold text-xs text-slate-900 leading-tight">
                              {place.title}
                            </span>
                            {place.uri && (
                              <a
                                href={place.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                                title="Open in Google Maps"
                              >
                                <span>Maps</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>

                          {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                            <p className="text-[11px] text-slate-600 italic bg-slate-50 p-1.5 rounded-md">
                              "{place.reviewSnippets[0]}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state when no query has been run yet */}
          {!decision && !searchResult && !mapsResult && !isLoading && (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <Lightbulb className="w-5 h-5 text-[#0D9488]" />
              </div>
              <h4 className="font-bold text-xs text-slate-700">
                Ready to provide grounded intelligence
              </h4>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                Choose a mode above to evaluate responsible decisions, query fresh Google Search data, or locate verified places on Google Maps along the Kerala corridor.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Powered by gemini-3.5-flash with Search & Maps Grounding
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
