import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Bus, 
  Train, 
  Info, 
  Map as MapIcon, 
  Layers, 
  Route, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ItineraryStop } from '../types';
import { GoogleMap } from './GoogleMap';

interface RouteMapProps {
  stops: ItineraryStop[];
  onSelectStop?: (stop: ItineraryStop) => void;
  activeStopId?: string;
  onOpenGrounding?: () => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({ 
  stops, 
  onSelectStop,
  activeStopId: externalActiveStopId,
  onOpenGrounding
}) => {
  const [activeStopId, setActiveStopId] = useState<string>(externalActiveStopId || stops[0]?.id || '');
  const [viewMode, setViewMode] = useState<'google-maps' | 'schematic'>('google-maps');

  // Handle stop selection from either map or child components
  const handleSelectStopId = (id: string) => {
    setActiveStopId(id);
    const matchedStop = stops.find(s => s.id === id);
    if (matchedStop && onSelectStop) {
      onSelectStop(matchedStop);
    }
  };

  // Spatial alignment along Kerala southwestern coast corridor for schematic view
  const waypoints = [
    { id: 'tvm', name: 'Thiruvananthapuram Heritage & Napier', x: 220, y: 160, type: 'Heritage Hub' },
    { id: 'kovalam', name: 'Kovalam Beach & Lighthouse', x: 140, y: 260, type: 'Coastal Bay' },
    { id: 'varkala', name: 'Varkala North Cliff & Papanasam', x: 380, y: 70, type: 'Geological Cliff' },
    { id: 'kappil', name: 'Kappil Lake & Sea Estuary', x: 440, y: 40, type: 'Backwater Confluence' }
  ];

  return (
    <div className="space-y-3">
      {/* View Switcher Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0D9488]">
            <MapIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#0F2942] flex items-center gap-1.5">
              <span>Kerala Corridor Route Map</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live Google Maps
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Thiruvananthapuram Heritage → Kovalam Coast → Varkala North Cliff → Kappil Estuary
            </p>
          </div>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('google-maps')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'google-maps'
                  ? 'bg-[#0F2942] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Route className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Maps</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('schematic')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'schematic'
                  ? 'bg-[#0F2942] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Corridor Diagram</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Map View */}
      {viewMode === 'google-maps' ? (
        <GoogleMap 
          stops={stops}
          activeStopId={activeStopId}
          onSelectStop={handleSelectStopId}
          heightClass="h-[400px] sm:h-[460px]"
          title="Google Maps Route Geometry & Stop Locations"
          subtitle="Showing all corresponding stops with real Google Maps coordinates, routes, and transit connections"
          onOpenGrounding={onOpenGrounding}
        />
      ) : (
        /* Schematic Vector Map Fallback / Alternative View */
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 text-white shadow-md">
          {/* Map Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-sm text-slate-200">Schematic Corridor Geometry: TVM – Kovalam – Varkala</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
              Total Transit: ~62 km
            </span>
          </div>

          {/* Styled SVG Corridor Map */}
          <div className="relative h-64 sm:h-72 w-full bg-[#0B1522] overflow-hidden select-none">
            {/* Arabian Sea coastal water styling */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#0D9488_1px,transparent_1px)] [background-size:16px_16px]" />

            <svg className="w-full h-full" viewBox="0 0 500 320" fill="none">
              {/* Coastal Shoreline Curve */}
              <path
                d="M 50,320 C 120,270 180,210 240,150 C 300,90 380,60 480,20"
                stroke="#1E3A5F"
                strokeWidth="28"
                strokeLinecap="round"
                className="opacity-40"
              />

              {/* Rail & Green Road Transit Corridor Line */}
              <path
                d="M 140,260 L 220,160 L 380,70 L 440,40"
                stroke="#0D9488"
                strokeWidth="3.5"
                strokeDasharray="6 4"
                className="animate-pulse"
              />

              {/* Major Waypoint Nodes */}
              {waypoints.map((wp) => (
                <g key={wp.id} className="cursor-pointer group">
                  <circle
                    cx={wp.x}
                    cy={wp.y}
                    r="14"
                    fill="#0F2942"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    className="group-hover:fill-emerald-800 transition-colors"
                  />
                  <circle cx={wp.x} cy={wp.y} r="5" fill="#34D399" />
                  <text
                    x={wp.x + 18}
                    y={wp.y + 4}
                    fill="#F8FAFC"
                    fontSize="11"
                    fontWeight="700"
                    className="drop-shadow-md"
                  >
                    {wp.name}
                  </text>
                  <text
                    x={wp.x + 18}
                    y={wp.y + 16}
                    fill="#94A3B8"
                    fontSize="9"
                    fontWeight="500"
                  >
                    {wp.type}
                  </text>
                </g>
              ))}

              {/* Transit Leg Labels */}
              <g transform="translate(160, 200)">
                <rect x="0" y="0" width="85" height="18" rx="9" fill="#0F2942" stroke="#334155" />
                <text x="7" y="12" fill="#E2E8F0" fontSize="9" fontWeight="600">
                  🚌 KSRTC: 35 min
                </text>
              </g>

              <g transform="translate(280, 105)">
                <rect x="0" y="0" width="95" height="18" rx="9" fill="#0F2942" stroke="#334155" />
                <text x="7" y="12" fill="#E2E8F0" fontSize="9" fontWeight="600">
                  🚆 Train/EV: 45 min
                </text>
              </g>
            </svg>

            {/* Legend */}
            <div className="absolute bottom-2.5 left-3 bg-slate-950/80 backdrop-blur-xs p-2 rounded-lg border border-slate-800 text-[10px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Curated Corridor Legs</span>
              </div>
              <div className="text-slate-400">Low-carbon railway & electric auto routing</div>
            </div>
          </div>
        </div>
      )}

      {/* Corridor Transit & Responsible Route Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Train className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 block">
              Coastal Rail Transit
            </span>
            <span className="text-xs font-bold text-slate-800">
              TVM Central ⇄ Varkala Sivagiri (₹35)
            </span>
          </div>
        </div>

        <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Bus className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-teal-800 block">
              Electric City Transit
            </span>
            <span className="text-xs font-bold text-slate-800">
              KSRTC SWIFT Green Electric Buses
            </span>
          </div>
        </div>

        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-800 block">
              Responsible Impact
            </span>
            <span className="text-xs font-bold text-slate-800">
              ~72% CO₂ Reduction vs Private Cabs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
