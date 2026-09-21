import React from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  Accessibility, 
  ShieldCheck, 
  Bus, 
  Train, 
  CheckCircle2, 
  AlertCircle, 
  Compass, 
  ChevronRight,
  HeartHandshake
} from 'lucide-react';
import { Destination, Provider } from '../types';
import { TrustBadge } from './TrustBadge';

interface DestinationDetailModalProps {
  destination: Destination | null;
  isOpen: boolean;
  onClose: () => void;
  providers: Provider[];
  onSelectProvider: (provider: Provider) => void;
  onPlanTripToArea: (areaName: string) => void;
  onReportIssue: (destName: string) => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  isOpen,
  onClose,
  providers,
  onSelectProvider,
  onPlanTripToArea,
  onReportIssue
}) => {
  if (!isOpen || !destination) return null;

  const localProviders = providers.filter(p => 
    p.location.toLowerCase().includes(destination.area.toLowerCase()) ||
    destination.name.toLowerCase().includes(p.location.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Image */}
        <div className="relative h-60 sm:h-72 w-full bg-slate-900">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500 text-white uppercase tracking-wider">
              {destination.category}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1 leading-snug">
              {destination.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-200 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{destination.area}, Kerala</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Trust Stamp */}
          <TrustBadge
            status="Official Source"
            lastUpdated={destination.lastUpdated}
            source={destination.source}
          />

          {/* About */}
          <div>
            <h3 className="font-bold text-sm text-[#0F2942] uppercase tracking-wider mb-1.5">
              Destination Overview
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {destination.description}
            </p>
          </div>

          {/* Highlights & Best Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-xs text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Compass className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Key Highlights</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(destination.highlights || [
                  destination.tagline,
                  `${destination.category} experience`,
                  `${destination.crowdLevel} crowd pattern`
                ]).map((h: string, i: number) => (
                  <span key={i} className="px-2 py-1 rounded bg-white text-slate-700 text-xs border border-slate-200">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Optimal Visiting Time</span>
              </div>
              <div className="text-slate-600">{destination.bestTimeToVisit}</div>
              <div className="pt-1 text-[11px] text-slate-500">
                <span className="font-semibold">Entry:</span> {destination.entryFee || 'Free public access / Nominal state conservation pass'}
              </div>
            </div>
          </div>

          {/* Accessibility & Safety Notices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="font-bold text-xs text-slate-700 flex items-center gap-1.5 mb-1">
                <Accessibility className="w-4 h-4 text-emerald-600" />
                <span>Accessibility Notes</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {destination.accessibilityNotes || `${destination.accessibilityRating} accessibility rated. Ramps and assistance points mapped for the pilot corridor.`}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="font-bold text-xs text-slate-700 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Safety & Flag Status</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{destination.safetyRating}</p>
            </div>
          </div>

          {/* Public Transit Connections */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
            <Bus className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-800">Public Transit & Feasibility: </span>
              <span className="text-slate-600">
                {destination.publicTransportAccess || `${destination.publicTransportFeasibility} feasibility via KSRTC bus corridor and local verified auto stands.`}
              </span>
            </div>
          </div>

          {/* Verified Local Providers at this Destination */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>Verified Local Partners at {destination.name} ({localProviders.length})</span>
              </h4>
            </div>

            {localProviders.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                Local providers currently being verified by field coordinators.
              </div>
            ) : (
              <div className="space-y-2">
                {localProviders.slice(0, 3).map(lp => (
                  <div
                    key={lp.id}
                    onClick={() => {
                      onClose();
                      onSelectProvider(lp);
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-[#0D9488] uppercase">{lp.category}</span>
                      <div className="font-bold text-xs text-slate-900">{lp.name}</div>
                      <div className="text-[11px] text-slate-500">{lp.priceRange}</div>
                    </div>
                    <span className="text-xs font-bold text-[#0D9488] flex items-center gap-0.5">
                      Enquire <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => {
                onClose();
                onReportIssue(destination.name);
              }}
              className="text-xs text-amber-800 hover:underline flex items-center gap-1 font-semibold"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Report Issue at Destination</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onPlanTripToArea(destination.area);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0F2942] hover:bg-[#16385C] text-white text-xs font-bold transition-colors shadow-xs"
            >
              Plan Route via {destination.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
