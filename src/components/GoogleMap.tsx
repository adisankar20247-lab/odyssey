import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Compass, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  Route, 
  Bus, 
  Train, 
  Footprints,
  Info,
  CheckCircle2,
  Calendar,
  Sparkles,
  Share2
} from 'lucide-react';
import { ItineraryStop } from '../types';

export interface MapWaypoint {
  id: string;
  name: string;
  category: string;
  location: string;
  lat: number;
  lng: number;
  time?: string;
  estimatedCost?: number;
  travelTimeToNext?: string;
  distanceToNext?: string;
  transitModeToNext?: string;
  whyRecommended?: string;
  dayNumber?: number;
  stopIndex?: number;
  badge?: string;
}

interface GoogleMapProps {
  stops?: ItineraryStop[];
  customWaypoints?: MapWaypoint[];
  activeStopId?: string;
  onSelectStop?: (stopId: string) => void;
  heightClass?: string;
  showRoutePolyline?: boolean;
  interactive?: boolean;
  centerCoordinate?: { lat: number; lng: number };
  zoomLevel?: number;
  title?: string;
  subtitle?: string;
  onOpenGrounding?: () => void;
}

// Fallback coordinate mapping for stops along the Thiruvananthapuram – Kovalam – Varkala corridor
const FALLBACK_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'stop-1-1': { lat: 8.4831, lng: 76.9436 },
  'stop-1-2': { lat: 8.5080, lng: 76.9530 },
  'stop-1-3': { lat: 8.5085, lng: 76.9554 },
  'stop-1-4': { lat: 8.4400, lng: 76.9950 },
  'stop-1-5': { lat: 8.3988, lng: 76.9785 },
  'stop-1-6': { lat: 8.3995, lng: 76.9790 },
  'stop-2-1': { lat: 8.7379, lng: 76.7163 },
  'stop-2-2': { lat: 8.7340, lng: 76.7200 },
  'stop-2-3': { lat: 8.7290, lng: 76.7250 },
  'stop-2-4': { lat: 8.7450, lng: 76.7110 },
  'stop-2-5': { lat: 8.7844, lng: 76.6853 },
  'dest-kovalam': { lat: 8.3988, lng: 76.9785 },
  'dest-varkala': { lat: 8.7379, lng: 76.7163 },
  'dest-tvm-heritage': { lat: 8.4831, lng: 76.9436 },
  'dest-napier': { lat: 8.5085, lng: 76.9554 },
  'dest-ponmudi': { lat: 8.7599, lng: 77.1167 },
  'dest-poovar': { lat: 8.3190, lng: 77.0610 },
  'dest-kappil': { lat: 8.7844, lng: 76.6853 },
  'dest-vizhinjam': { lat: 8.3780, lng: 76.9920 }
};

export const GoogleMap: React.FC<GoogleMapProps> = ({
  stops = [],
  customWaypoints,
  activeStopId,
  onSelectStop,
  heightClass = 'h-96 sm:h-[420px]',
  zoomLevel = 13,
  title = 'Google Maps Corridor Navigator',
  subtitle = 'Interactive routes & verified community stops in Kerala',
  onOpenGrounding
}) => {
  const [selectedWaypointId, setSelectedWaypointId] = useState<string>(activeStopId || '');
  const [mapType, setMapType] = useState<'m' | 'k' | 'p'>('m'); // m = roadmap, k = satellite, p = terrain
  const [currentZoom, setCurrentZoom] = useState<number>(zoomLevel);
  const [filterMode, setFilterMode] = useState<'all' | 'day1' | 'day2'>('all');

  // Convert stops into standardized waypoints
  const waypoints: MapWaypoint[] = useMemo(() => {
    if (customWaypoints && customWaypoints.length > 0) {
      return customWaypoints;
    }

    return stops.map((stop, index) => {
      const fallback = FALLBACK_COORDINATES[stop.id] || { lat: 8.4831, lng: 76.9436 };
      const lat = stop.coordinates?.lat && !isNaN(stop.coordinates.lat) ? stop.coordinates.lat : fallback.lat;
      const lng = stop.coordinates?.lng && !isNaN(stop.coordinates.lng) ? stop.coordinates.lng : fallback.lng;
      const dayNum = index < 5 ? 1 : 2;

      return {
        id: stop.id,
        name: stop.activityOrProviderName,
        category: stop.category,
        location: stop.location,
        lat,
        lng,
        time: stop.time,
        estimatedCost: stop.estimatedCost,
        travelTimeToNext: stop.travelTimeToNext,
        distanceToNext: stop.distanceToNext,
        transitModeToNext: stop.transitModeToNext,
        whyRecommended: stop.whyRecommended,
        dayNumber: dayNum,
        stopIndex: index + 1,
        badge: `Day ${dayNum}`
      };
    });
  }, [stops, customWaypoints]);

  // Keep internal selection synced with external activeStopId
  React.useEffect(() => {
    if (activeStopId && activeStopId !== selectedWaypointId) {
      setSelectedWaypointId(activeStopId);
    } else if (!selectedWaypointId && waypoints.length > 0) {
      setSelectedWaypointId(waypoints[0].id);
    }
  }, [activeStopId, waypoints]);

  const filteredWaypoints = useMemo(() => {
    if (filterMode === 'day1') return waypoints.filter(w => w.dayNumber === 1);
    if (filterMode === 'day2') return waypoints.filter(w => w.dayNumber === 2);
    return waypoints;
  }, [waypoints, filterMode]);

  const activeWaypoint = useMemo(() => {
    return waypoints.find(w => w.id === selectedWaypointId) || waypoints[0] || {
      id: 'default',
      name: 'Thiruvananthapuram Central',
      category: 'Heritage Hub',
      location: 'Thiruvananthapuram',
      lat: 8.4831,
      lng: 76.9436
    };
  }, [waypoints, selectedWaypointId]);

  const handleSelectWaypoint = (id: string) => {
    setSelectedWaypointId(id);
    if (onSelectStop) {
      onSelectStop(id);
    }
  };

  // Google Maps Embed URL based on active point coordinates, map type, and zoom
  const embedMapUrl = useMemo(() => {
    const lat = activeWaypoint.lat.toFixed(5);
    const lng = activeWaypoint.lng.toFixed(5);
    // Maps embed query using exact coordinates and title
    const query = `${lat},${lng}`;
    return `https://maps.google.com/maps?q=${query}&t=${mapType}&z=${currentZoom}&hl=en&output=embed`;
  }, [activeWaypoint, mapType, currentZoom]);

  // Direct Google Maps Directions link to the next stop or to the active waypoint
  const directionsUrl = useMemo(() => {
    const activeIdx = waypoints.findIndex(w => w.id === activeWaypoint.id);
    const nextWaypoint = activeIdx >= 0 && activeIdx < waypoints.length - 1 ? waypoints[activeIdx + 1] : null;
    
    if (nextWaypoint) {
      return `https://www.google.com/maps/dir/?api=1&origin=${activeWaypoint.lat},${activeWaypoint.lng}&destination=${nextWaypoint.lat},${nextWaypoint.lng}&travelmode=transit`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${activeWaypoint.lat},${activeWaypoint.lng}&travelmode=transit`;
  }, [activeWaypoint, waypoints]);

  const viewOnGoogleMapsUrl = useMemo(() => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeWaypoint.name + ', Kerala, India')}`;
  }, [activeWaypoint]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 to-[#0F2942] text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5">
                <span>{title}</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Google Maps Live
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-300">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Day Filters & Map Layer Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day selection */}
          <div className="bg-slate-800/80 p-1 rounded-xl flex text-[11px] font-bold border border-slate-700">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              All Stops ({waypoints.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('day1')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'day1' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Day 1
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('day2')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'day2' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Day 2
            </button>
          </div>

          {/* Map Layer Mode (Roadmap, Satellite, Terrain) */}
          <div className="bg-slate-800/80 p-1 rounded-xl flex text-[11px] font-bold border border-slate-700">
            <button
              type="button"
              onClick={() => setMapType('m')}
              title="Standard Roadmap"
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mapType === 'm' ? 'bg-[#0D9488] text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Road
            </button>
            <button
              type="button"
              onClick={() => setMapType('k')}
              title="Satellite Imagery"
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mapType === 'k' ? 'bg-[#0D9488] text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapType('p')}
              title="Terrain & Topography"
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mapType === 'p' ? 'bg-[#0D9488] text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Terrain
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setCurrentZoom(z => Math.min(z + 1, 19))}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
              title="Zoom in on Google Maps"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentZoom(z => Math.max(z - 1, 6))}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
              title="Zoom out on Google Maps"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className={`relative w-full ${heightClass} bg-slate-100 overflow-hidden`}>
        {/* Interactive Google Maps Iframe */}
        <iframe
          key={`${activeWaypoint.id}-${mapType}-${currentZoom}`}
          title={`Google Map - ${activeWaypoint.name}`}
          src={embedMapUrl}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />

        {/* Floating Active Stop Inspector Card */}
        <div className="absolute top-3 left-3 max-w-[280px] sm:max-w-xs bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-slate-200 pointer-events-auto">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#0F2942] text-white">
                  Stop #{activeWaypoint.stopIndex || 1}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {activeWaypoint.category}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#0F2942] leading-tight">
                {activeWaypoint.name}
              </h4>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{activeWaypoint.location}</span>
                <span className="text-slate-400">({activeWaypoint.lat.toFixed(4)}, {activeWaypoint.lng.toFixed(4)})</span>
              </div>
            </div>
          </div>

          {activeWaypoint.whyRecommended && (
            <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-100">
              {activeWaypoint.whyRecommended}
            </p>
          )}

          {/* Direct Google Maps Action Links */}
          <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-100">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
            >
              <Navigation className="w-3 h-3" />
              <span>Google Directions</span>
            </a>

            <a
              href={viewOnGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open in Google Maps</span>
            </a>
          </div>
        </div>

        {/* Floating Google Grounding Action if available */}
        {onOpenGrounding && (
          <div className="absolute bottom-3 right-3 pointer-events-auto">
            <button
              type="button"
              onClick={onOpenGrounding}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#0F2942] to-[#0D9488] hover:from-[#163E66] hover:to-[#0F766E] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Google Maps Grounding</span>
            </button>
          </div>
        )}
      </div>

      {/* Corridor Stop Selection Carousel */}
      <div className="p-3 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Select Corridor Stop to Center on Google Maps</span>
          </span>
          <span className="text-[11px] text-slate-500">
            {filteredWaypoints.length} locations plotted
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {filteredWaypoints.map((wp, index) => {
            const isSelected = wp.id === activeWaypoint.id;
            return (
              <button
                key={wp.id}
                type="button"
                onClick={() => handleSelectWaypoint(wp.id)}
                className={`flex-shrink-0 text-left px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#0D9488] shadow-sm ring-2 ring-[#0D9488]/20'
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                    isSelected ? 'bg-[#0D9488] text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {wp.stopIndex || index + 1}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {wp.badge || `Stop ${index + 1}`}
                  </span>
                  {wp.time && (
                    <span className="text-[10px] text-slate-400">
                      • {wp.time}
                    </span>
                  )}
                </div>
                <div className="text-xs font-extrabold text-[#0F2942] max-w-[170px] truncate">
                  {wp.name}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                  <span>{wp.location}</span>
                  {wp.transitModeToNext && (
                    <span className="text-emerald-700 font-semibold">
                      • {wp.transitModeToNext}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
