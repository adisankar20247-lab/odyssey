import React, { useState, useRef } from 'react';
import { 
  Award, 
  Wallet, 
  MapPin, 
  Clock, 
  Navigation, 
  ShieldCheck, 
  Share2, 
  Bookmark, 
  Edit3, 
  AlertCircle, 
  Check, 
  Calendar, 
  Users, 
  ArrowRight, 
  Info, 
  HeartHandshake, 
  Bus, 
  Sparkles,
  PhoneCall,
  MessageCircle,
  Accessibility,
  Eye,
  Map as MapIcon
} from 'lucide-react';
import { 
  ItineraryDay, 
  CostBreakdown, 
  ResponsibleScoreBreakdown, 
  TripPlanPreferences, 
  ItineraryStop, 
  Provider 
} from '../types';
import { TrustBadge } from './TrustBadge';
import { RouteMap } from './RouteMap';

interface ItineraryViewProps {
  days: ItineraryDay[];
  cost: CostBreakdown;
  score: ResponsibleScoreBreakdown;
  preferences: TripPlanPreferences;
  aiSummary?: string;
  aiSource?: string;
  onEditPreferences: () => void;
  onSaveItinerary: () => void;
  isSaved: boolean;
  onReportIssue: (entityName?: string) => void;
  onSelectProviderById: (providerId: string) => void;
  onRequestBook: (stop: ItineraryStop) => void;
  onOpenTrustModal: () => void;
  onOpenGeminiDecision?: (mode?: 'decision' | 'search' | 'maps') => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  days,
  cost,
  score,
  preferences,
  aiSummary,
  aiSource,
  onEditPreferences,
  onSaveItinerary,
  isSaved,
  onReportIssue,
  onSelectProviderById,
  onRequestBook,
  onOpenTrustModal,
  onOpenGeminiDecision
}) => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [highlightedStopId, setHighlightedStopId] = useState<string>('');
  const mapSectionRef = useRef<HTMLDivElement | null>(null);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleFocusStopOnMap = (stopId: string) => {
    setHighlightedStopId(stopId);
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const allStops = days.flatMap(d => d.stops);

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Title Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Personalised Kerala Route</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F2942]">
              Your {days.length}-Day Responsible Kerala Journey
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Starting from <strong className="text-slate-700">{preferences.startingPoint || 'Thiruvananthapuram'}</strong> • Corridor: <strong className="text-slate-700">{preferences.destinationArea || 'Thiruvananthapuram–Kovalam–Varkala'}</strong>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenGeminiDecision && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenGeminiDecision('decision')}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#0F2942] to-[#0D9488] hover:from-[#163E66] hover:to-[#0F766E] text-white transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Decision Matrix</span>
                </button>

                <button
                  onClick={() => onOpenGeminiDecision('search')}
                  className="px-2.5 py-2 rounded-xl text-xs font-bold bg-sky-50 text-sky-900 border border-sky-300 hover:bg-sky-100 transition-all flex items-center gap-1 cursor-pointer"
                  title="Live Google Search Grounding for current conditions, tides & train times"
                >
                  <span>Search Grounding</span>
                </button>

                <button
                  onClick={() => onOpenGeminiDecision('maps')}
                  className="px-2.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100 transition-all flex items-center gap-1 cursor-pointer"
                  title="Live Google Maps Grounding for locations, accessibility & navigation"
                >
                  <span>Maps Grounding</span>
                </button>
              </div>
            )}

            <button
              onClick={onSaveItinerary}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-2xs ${
                isSaved
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved to Profile' : 'Save Itinerary'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={onEditPreferences}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Style</span>
            </button>

            <button
              onClick={() => onReportIssue('Itinerary Route Feedback')}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        {/* Selected Travel Profile Summary Chips */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            {preferences.travellerType} ({preferences.numberOfTravellers} {preferences.numberOfTravellers > 1 ? 'travellers' : 'traveller'})
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            Style: {preferences.travelStyle}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
            <Bus className="w-3.5 h-3.5 text-blue-600" />
            {preferences.transportPreference}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {preferences.crowdPreference}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            {preferences.dates}
          </span>
        </div>

        {/* Dynamic AI Output Attribution Box */}
        {aiSummary && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200 text-xs text-emerald-950">
            <div className="flex items-center justify-between gap-2 mb-1.5 font-bold text-emerald-900">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>AI Dynamic Output (Generated for this Trip)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-extrabold border border-emerald-300">
                {aiSource || 'Gemini 3.5 Flash + Google Grounding'}
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs">{aiSummary}</p>
          </div>
        )}
      </div>

      {/* SCREEN 4: RESPONSIBLE ROUTE SCORE CARD */}
      <section className="bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl border-2 border-emerald-300 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Main Score Dial */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl bg-[#0F2942] text-white flex flex-col items-center justify-center shadow-md shrink-0">
              <Award className="w-5 h-5 text-emerald-400 mb-0.5" />
              <div className="text-2xl font-black leading-none">{score.overall}</div>
              <div className="text-[10px] text-slate-300 font-semibold">/ 100</div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2942]">
                  Responsible Route Score
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Grade A
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                {score.explanation}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenTrustModal}
            className="text-xs font-bold text-[#0D9488] hover:text-teal-800 shrink-0 flex items-center gap-1 self-end lg:self-center"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Score Methodology</span>
          </button>
        </div>

        {/* Score Components with Progress Bars */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 border-t border-emerald-100">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Budget Fit</span>
              <span className="text-emerald-700">{score.budgetFit}/100</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${score.budgetFit}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Local Community Benefit</span>
              <span className="text-emerald-700">{score.communityBenefit}/100</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${score.communityBenefit}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Safety Confidence</span>
              <span className="text-emerald-700">{score.safetyConfidence}/100</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${score.safetyConfidence}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Accessibility Match</span>
              <span className="text-emerald-700">{score.accessibilityMatch}/100</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${score.accessibilityMatch}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Public Transport Feasibility</span>
              <span className="text-emerald-700">{score.publicTransportFeasibility}/100</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: `${score.publicTransportFeasibility}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Crowd Suitability</span>
              <span className="text-emerald-700">{score.crowdSuitability}/100</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${score.crowdSuitability}%` }} />
            </div>
          </div>
        </div>

        {/* Mandatory Transparency Disclaimer */}
        <div className="mt-5 p-3 rounded-xl bg-white/80 border border-emerald-200 text-[11px] text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            <strong>Transparent Note:</strong> Score is generated from curated pilot data and is not a live crowd or safety prediction.
          </span>
        </div>
      </section>

      {/* EXPLAINABLE BUDGET BREAKDOWN */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0F2942]">Explainable Budget Breakdown</h2>
            <p className="text-xs text-slate-500">Every anticipated rupee calculated transparently for 2 days.</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Estimated Total</span>
            <span className="text-2xl font-black text-emerald-700">₹{cost.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-semibold block">Stay (Homestay)</span>
            <span className="text-base font-extrabold text-slate-800">₹{cost.stay.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">1 night courtyard room</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-semibold block">Food & Tiffin</span>
            <span className="text-base font-extrabold text-slate-800">₹{cost.food.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Local partner eateries</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-semibold block">Local Transport</span>
            <span className="text-base font-extrabold text-slate-800">₹{cost.transport.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Public bus & e-auto</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-semibold block">Activities & Entry</span>
            <span className="text-base font-extrabold text-slate-800">₹{cost.activities.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Guided walk & workshops</span>
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-emerald-800 font-semibold block">Buffer / Safety</span>
            <span className="text-base font-extrabold text-emerald-900">₹{cost.emergencyBuffer.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">Reserved contingency</span>
          </div>
        </div>
      </section>

      {/* GOOGLE MAPS ROUTE MAP */}
      <div ref={mapSectionRef}>
        <RouteMap 
          stops={allStops} 
          activeStopId={highlightedStopId}
          onSelectStop={(stop) => setHighlightedStopId(stop.id)}
          onOpenGrounding={onOpenGeminiDecision}
        />
      </div>

      {/* GEMINI DECISION ENGINE CALLOUT */}
      {onOpenGeminiDecision && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-[#0F2942] rounded-2xl p-5 text-white shadow-md border border-emerald-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base">
                  Facing a Route or Budget Dilemma?
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950 uppercase tracking-wider">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
                Ask Gemini to decide: compare train vs bus timings, optimize for monsoon daylight, find verified homestays, or adjust your spending responsibly.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenGeminiDecision?.('decision')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-black transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Ask Gemini Decision Engine</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>
      )}

      {/* DAY 1 & DAY 2 TIMELINE TABS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {days.map(d => (
            <button
              key={d.dayNumber}
              onClick={() => setActiveDay(d.dayNumber)}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                activeDay === d.dayNumber
                  ? 'bg-[#0F2942] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Day {d.dayNumber}
            </button>
          ))}
          <span className="text-xs text-slate-500 ml-2 font-medium hidden sm:inline">
            {days.find(d => d.dayNumber === activeDay)?.theme}
          </span>
        </div>

        {/* Stops Timeline */}
        {days
          .filter(d => d.dayNumber === activeDay)
          .map(d => (
            <div key={d.dayNumber} className="space-y-6">
              {d.stops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12">
                    {/* Stop Media Column */}
                    <div className="md:col-span-4 relative h-48 md:h-auto min-h-[190px] bg-slate-100">
                      <img
                        src={stop.image}
                        alt={stop.activityOrProviderName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-[#0F2942] text-white text-xs font-extrabold flex items-center justify-center shadow-md">
                          {idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/95 text-slate-900 shadow-xs">
                          {stop.category}
                        </span>
                      </div>
                    </div>

                    {/* Stop Details Column */}
                    <div className="md:col-span-8 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Top Meta Line: Time & Trust Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D9488]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{stop.time}</span>
                            <span className="text-slate-400">({stop.estimatedTime})</span>
                          </div>

                          <TrustBadge status={stop.verificationBadge} compact={true} />
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 leading-snug">
                          {stop.activityOrProviderName}
                        </h3>

                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{stop.location}</span>
                        </div>

                        {/* "Why Recommended" explanation - MANDATED */}
                        <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950">
                          <div className="font-bold text-[11px] text-emerald-800 uppercase tracking-wider mb-0.5">
                            Why Recommended for You:
                          </div>
                          <p className="leading-relaxed">{stop.whyRecommended}</p>
                        </div>

                        {/* Accessibility & Safety Notes */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                            <div className="font-bold text-[11px] text-slate-700 flex items-center gap-1">
                              <Accessibility className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Accessibility:</span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5">{stop.accessibilityNote}</p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                            <div className="font-bold text-[11px] text-slate-700 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span>Safety Notice:</span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5">{stop.safetyNote}</p>
                          </div>
                        </div>

                        {/* Transparency footer */}
                        <div className="mt-2 text-[10px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Source: {stop.sourceLabel}</span>
                          <span>•</span>
                          <span>Last Verified: {stop.lastUpdated}</span>
                        </div>
                      </div>

                      {/* Stop Footer with Pricing and Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Estimated Expense</span>
                          <span className="font-extrabold text-sm text-[#0F2942]">
                            {stop.estimatedCost === 0 ? 'Free / Public Heritage' : `₹${stop.estimatedCost}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleFocusStopOnMap(stop.id)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer transition-colors"
                            title="Focus this stop on the route map"
                          >
                            <MapIcon className="w-3.5 h-3.5 text-teal-600" />
                            <span>Map</span>
                          </button>

                          {stop.providerId && (
                            <button
                              onClick={() => onSelectProviderById(stop.providerId!)}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Provider</span>
                            </button>
                          )}

                          <button
                            onClick={() => onRequestBook(stop)}
                            className="px-4 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <span>Request to Book / Enquire</span>
                          </button>
                        </div>
                      </div>

                      {/* Transit Leg to Next Stop */}
                      {stop.travelTimeToNext && (
                        <div className="mt-2 pt-2 border-t border-dashed border-slate-200 flex items-center gap-2 text-xs text-slate-500 bg-slate-50/80 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 p-3 rounded-b-2xl">
                          <Bus className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                          <span className="font-semibold text-slate-700">Next Leg:</span>
                          <span className="text-slate-600">{stop.transitModeToNext}</span>
                          <span className="text-slate-400 ml-auto mr-2 font-mono text-[11px]">
                            {stop.distanceToNext} ({stop.travelTimeToNext})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </section>
    </div>
  );
};
