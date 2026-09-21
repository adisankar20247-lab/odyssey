import React, { useState } from 'react';
import { 
  Bookmark, 
  Printer, 
  PhoneCall, 
  ShieldAlert, 
  Calendar, 
  MapPin, 
  Trash2, 
  ExternalLink, 
  Compass, 
  Download, 
  Check, 
  Clock, 
  Eye, 
  Sparkles, 
  HardDriveDownload 
} from 'lucide-react';
import { Provider, ItineraryDay, TripPlanPreferences } from '../types';

interface SavedTripsViewProps {
  isItinerarySaved: boolean;
  savedDays: ItineraryDay[];
  savedProviders: Provider[];
  preferences: TripPlanPreferences;
  onViewItinerary: () => void;
  onSelectProvider: (provider: Provider) => void;
  onRemoveProvider: (providerId: string) => void;
  onPlanTrip: () => void;
}

export const SavedTripsView: React.FC<SavedTripsViewProps> = ({
  isItinerarySaved,
  savedDays,
  savedProviders,
  preferences,
  onViewItinerary,
  onSelectProvider,
  onRemoveProvider,
  onPlanTrip
}) => {
  const [printNotification, setPrintNotification] = useState<boolean>(false);

  const handlePrintSummary = () => {
    setPrintNotification(true);
    setTimeout(() => {
      window.print();
      setPrintNotification(false);
    }, 400);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F2942]">
            Saved Trips & Offline Handbook
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access your curated Kerala plans and verified local contacts even with spotty coastal connectivity.
          </p>
        </div>

        <button
          onClick={handlePrintSummary}
          className="px-4 py-2.5 rounded-xl bg-[#0F2942] hover:bg-[#16385C] text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF Summary</span>
        </button>
      </div>

      {/* OFFLINE READY NOTE - MANDATED */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-start gap-3 shadow-2xs">
        <HardDriveDownload className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
            Device Cache Active
          </div>
          <p className="text-xs text-emerald-900 font-semibold mt-0.5">
            “Key contact numbers, safety notes, and itinerary details are saved locally on your device.”
          </p>
          <p className="text-[11px] text-emerald-800 mt-1">
            You can pull up provider phone numbers, transit stops, and emergency contacts even while in low-signal cliff areas.
          </p>
        </div>
      </div>

      {/* EMERGENCY CARD - MANDATED */}
      <div className="bg-gradient-to-br from-rose-900 to-red-950 text-white rounded-2xl p-6 shadow-md border border-rose-800">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
            Kerala Emergency Helpline & Assistance
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <a
            href="tel:112"
            className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-xs transition-colors block"
          >
            <span className="text-[11px] text-rose-200 block font-semibold">Tourist Police Helpline</span>
            <span className="text-base font-black text-white font-mono mt-0.5 block">112 / 0471-2333011</span>
            <span className="text-[10px] text-slate-300 block mt-1">24/7 Thiruvananthapuram Control</span>
          </a>

          <a
            href="tel:1091"
            className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-xs transition-colors block"
          >
            <span className="text-[11px] text-rose-200 block font-semibold">Women Safety Helpline</span>
            <span className="text-base font-black text-white font-mono mt-0.5 block">1091</span>
            <span className="text-[10px] text-slate-300 block mt-1">Dedicated Kerala State Police</span>
          </a>

          <a
            href="tel:108"
            className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-xs transition-colors block"
          >
            <span className="text-[11px] text-rose-200 block font-semibold">Ambulance & Medical Trauma</span>
            <span className="text-base font-black text-white font-mono mt-0.5 block">108</span>
            <span className="text-[10px] text-slate-300 block mt-1">Government emergency response</span>
          </a>

          <a
            href="tel:+919447000111"
            className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-xs transition-colors block"
          >
            <span className="text-[11px] text-rose-200 block font-semibold">Pilot Corridor Coordinator</span>
            <span className="text-base font-black text-white font-mono mt-0.5 block">+91 94470 00111</span>
            <span className="text-[10px] text-slate-300 block mt-1">Duty Desk (Kovalam/Varkala)</span>
          </a>
        </div>
      </div>

      {/* SAVED ITINERARY SECTION */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#0F2942] flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-[#0D9488]" />
          <span>Saved Itineraries</span>
        </h2>

        {isItinerarySaved ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                2-Day Responsible Route Active
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                Thiruvananthapuram – Kovalam – Varkala Corridor Tour
              </h3>
              <p className="text-xs text-slate-500">
                Created for {preferences.travellerType} ({preferences.numberOfTravellers} pax) • Budget: ₹{preferences.totalBudget.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onViewItinerary}
                className="px-4 py-2 rounded-xl bg-[#0F2942] hover:bg-[#16385C] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open Itinerary</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="font-bold text-sm text-slate-700">No active saved itineraries</div>
            <p className="text-xs text-slate-500 mt-1">
              Use the Route Planner to create a personalised, explainable itinerary and click "Save Itinerary".
            </p>
            <button
              onClick={onPlanTrip}
              className="mt-3 px-4 py-2 rounded-xl bg-[#0D9488] text-white text-xs font-bold"
            >
              Plan a Journey
            </button>
          </div>
        )}
      </section>

      {/* SAVED PROVIDERS BOOKMARKS */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#0F2942] flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#0D9488]" />
          <span>Bookmarked Local Providers ({savedProviders.length})</span>
        </h2>

        {savedProviders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="font-bold text-sm text-slate-700">No bookmarked providers yet</div>
            <p className="text-xs text-slate-500 mt-1">
              Browse verified homestays, storytelling guides, and artisan workshops to save their direct contacts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedProviders.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#0D9488]">{p.category}</span>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{p.name}</h4>
                    </div>
                    <button
                      onClick={() => onRemoveProvider(p.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{p.location}</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-700">
                    Phone: <span className="font-mono text-emerald-700">{p.phone}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                  <a
                    href={`tel:${p.phone.replace(/\s+/g, '')}`}
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call Host</span>
                  </a>
                  <button
                    onClick={() => onSelectProvider(p)}
                    className="text-xs font-bold text-[#0D9488] hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
