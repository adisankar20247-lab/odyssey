import React, { useState } from 'react';
import { 
  Map as MapIcon, 
  MapPin, 
  X, 
  Maximize2, 
  Minimize2, 
  Navigation, 
  Compass, 
  Layers, 
  ExternalLink, 
  Bus, 
  Train, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles,
  Route
} from 'lucide-react';
import { ItineraryStop } from '../types';
import { GoogleMap, MapWaypoint } from './GoogleMap';

interface FloatingMapWidgetProps {
  stops?: ItineraryStop[];
  onSelectStop?: (stop: ItineraryStop) => void;
}

const DEFAULT_CORRIDOR_WAYPOINTS: MapWaypoint[] = [
  {
    id: 'waypoint-tvm',
    name: 'Thiruvananthapuram Central (TVC)',
    category: 'Heritage & Rail Gateway',
    location: 'Thiruvananthapuram City',
    lat: 8.4875,
    lng: 76.9530,
    time: '08:00 AM',
    estimatedCost: 35,
    travelTimeToNext: '45 mins',
    distanceToNext: '16 km',
    transitModeToNext: 'KSRTC City / Fast Passenger Bus',
    whyRecommended: 'Central hub for eco-friendly public transit connections to Kovalam and Varkala.',
    dayNumber: 1,
    stopIndex: 1,
    badge: 'Transit Gateway'
  },
  {
    id: 'waypoint-kovalam',
    name: 'Kovalam Beach & Lighthouse',
    category: 'Coastal Bay & Heritage',
    location: 'Kovalam',
    lat: 8.3988,
    lng: 76.9785,
    time: '11:00 AM',
    estimatedCost: 200,
    travelTimeToNext: '1 hr 15 mins',
    distanceToNext: '44 km',
    transitModeToNext: 'Southern Railway / Direct KSRTC',
    whyRecommended: 'Certified lifeguard patrolled beach with local fishermen co-op and coconut grove walks.',
    dayNumber: 1,
    stopIndex: 2,
    badge: 'Heritage Lookout'
  },
  {
    id: 'waypoint-varkala',
    name: 'Varkala North Cliff & Papanasam',
    category: 'Geological Cliff & Beach',
    location: 'Varkala',
    lat: 8.7379,
    lng: 76.7163,
    time: '03:30 PM',
    estimatedCost: 150,
    travelTimeToNext: '20 mins',
    distanceToNext: '8 km',
    transitModeToNext: 'Green E-Auto / Coastal Walk',
    whyRecommended: 'Red laterite cliffs, natural mineral springs, and community-led artisan handicraft stalls.',
    dayNumber: 2,
    stopIndex: 1,
    badge: 'Geological Vista'
  },
  {
    id: 'waypoint-kappil',
    name: 'Kappil Lake & Sea Estuary',
    category: 'Backwater Confluence',
    location: 'Edava / Kappil',
    lat: 8.7845,
    lng: 76.6890,
    time: '05:30 PM',
    estimatedCost: 50,
    whyRecommended: 'Quiet confluence where Arabian Sea meets backwaters; serene, uncrowded sunset walking spot.',
    dayNumber: 2,
    stopIndex: 2,
    badge: 'Quiet Sunset Spot'
  },
  {
    id: 'waypoint-poovar',
    name: 'Poovar Island & Golden Sand Beach',
    category: 'Estuary Mangrove Belt',
    location: 'Poovar (South Corridor)',
    lat: 8.3190,
    lng: 77.0610,
    time: '10:00 AM',
    estimatedCost: 350,
    whyRecommended: 'Community row-boat tours through pristine mangrove channels into the ocean sandspit.',
    dayNumber: 1,
    stopIndex: 3,
    badge: 'Eco Mangroves'
  },
  {
    id: 'waypoint-ponmudi',
    name: 'Ponmudi Golden Valley & Hills',
    category: 'Western Ghats Highland',
    location: 'Ponmudi',
    lat: 8.7599,
    lng: 77.1167,
    time: '07:00 AM',
    estimatedCost: 80,
    whyRecommended: 'Mist-clad hill sanctuary with freshwater streams and state forest department eco-guides.',
    dayNumber: 2,
    stopIndex: 3,
    badge: 'Highland Trail'
  }
];

export const FloatingMapWidget: React.FC<FloatingMapWidgetProps> = ({
  stops = [],
  onSelectStop
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<MapWaypoint>(DEFAULT_CORRIDOR_WAYPOINTS[0]);
  const [activeTab, setActiveTab] = useState<'map' | 'stops'>('map');

  // If active itinerary stops are passed, convert them into waypoints
  const waypointsToUse: MapWaypoint[] = stops.length > 0
    ? stops.map((s, idx) => ({
        id: s.id,
        name: s.activityOrProviderName,
        category: s.timeSlot,
        location: s.location,
        lat: s.coordinates?.lat || (DEFAULT_CORRIDOR_WAYPOINTS[idx % DEFAULT_CORRIDOR_WAYPOINTS.length].lat),
        lng: s.coordinates?.lng || (DEFAULT_CORRIDOR_WAYPOINTS[idx % DEFAULT_CORRIDOR_WAYPOINTS.length].lng),
        time: s.timeSlot,
        estimatedCost: s.estimatedCost,
        travelTimeToNext: s.travelTime,
        distanceToNext: s.travelDistance,
        transitModeToNext: s.travelMode,
        whyRecommended: s.responsibleRecommendation,
        dayNumber: s.dayNumber,
        stopIndex: idx + 1,
        badge: s.travelMode || 'Verified Stop'
      }))
    : DEFAULT_CORRIDOR_WAYPOINTS;

  const handleOpenGoogleDirections = (wp: MapWaypoint) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${wp.lat},${wp.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON (Visible when closed) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0F2942] hover:bg-slate-800 text-white shadow-2xl border border-teal-500/40 hover:border-teal-400 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
            title="Open Kerala Corridor Floating Map"
          >
            {/* Pulsing Live Beacon Indicator */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
            </span>

            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
              <Compass className="w-4 h-4 text-teal-300 group-hover:rotate-45 transition-transform duration-300" />
              <span>Floating Map</span>
            </div>

            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-900/80 text-teal-200 border border-teal-500/30">
              TVM • Kovalam • Varkala
            </span>
          </button>
        </div>
      )}

      {/* 2. FLOATING MAP WINDOW (Docked or Expanded) */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-out bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden ${
            isExpanded
              ? 'inset-3 sm:inset-8 rounded-3xl'
              : 'bottom-20 right-3 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[480px] h-[540px] max-h-[82vh] rounded-2xl'
          }`}
        >
          {/* HEADER BAR */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0F2942] text-white border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                <MapIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-xs sm:text-sm text-white">
                    Kerala Corridor Live Map
                  </h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-400/20 text-teal-300 border border-teal-400/30">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Thiruvananthapuram → Kovalam → Varkala
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Expand / Restore Button */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title={isExpanded ? 'Dock to corner' : 'Maximize map'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              {/* Minimize / Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close floating map"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* QUICK DESTINATION SHORTCUT CHIPS */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
              Quick Pin:
            </span>
            {waypointsToUse.map(wp => (
              <button
                key={wp.id}
                type="button"
                onClick={() => setSelectedWaypoint(wp)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                  selectedWaypoint.id === wp.id
                    ? 'bg-[#0D9488] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-teal-50 hover:text-teal-900'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>{wp.name.split('(')[0].split('&')[0].trim()}</span>
              </button>
            ))}
          </div>

          {/* MAIN INTERACTIVE MAP AREA */}
          <div className="flex-1 relative bg-slate-100 min-h-0 flex flex-col">
            <GoogleMap
              customWaypoints={waypointsToUse}
              activeStopId={selectedWaypoint.id}
              onSelectStop={(id) => {
                const found = waypointsToUse.find(w => w.id === id);
                if (found) setSelectedWaypoint(found);
              }}
              heightClass="h-full w-full"
              zoomLevel={12}
              title=""
              subtitle=""
            />

            {/* FLOATING STOP PREVIEW CARD AT BOTTOM OF MAP */}
            {selectedWaypoint && (
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200/90 shadow-lg text-xs space-y-1.5 animate-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[#0F2942] text-xs sm:text-sm">
                        {selectedWaypoint.name}
                      </span>
                      {selectedWaypoint.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                          {selectedWaypoint.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span>📍 {selectedWaypoint.location}</span>
                      <span>• Lat: {selectedWaypoint.lat.toFixed(4)}, Lng: {selectedWaypoint.lng.toFixed(4)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenGoogleDirections(selectedWaypoint)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0F2942] hover:bg-slate-800 text-white font-bold text-[10px] flex items-center gap-1 shrink-0 shadow-xs"
                    title="Open live navigation in Google Maps"
                  >
                    <Navigation className="w-3 h-3 text-teal-300" />
                    <span>Navigate</span>
                  </button>
                </div>

                {selectedWaypoint.whyRecommended && (
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {selectedWaypoint.whyRecommended}
                  </p>
                )}

                {/* Transit & Daylight Tip */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-1 text-teal-800 font-semibold">
                    <Train className="w-3 h-3 text-teal-600" />
                    <span>Transit: Southern Railway (₹35) / KSRTC (₹45)</span>
                  </div>
                  <span className="text-amber-700 font-medium">Safe Daylight: till 18:30 IST</span>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER BAR */}
          <div className="px-3 py-2 bg-slate-900 text-slate-300 text-[10px] flex items-center justify-between border-t border-slate-800 shrink-0">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Official Kerala Tourism Responsible Corridor</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=Kerala+Thiruvananthapuram+Kovalam+Varkala`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="text-teal-300 hover:text-teal-200 hover:underline flex items-center gap-1 font-bold"
            >
              <span>Full Google Maps</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
