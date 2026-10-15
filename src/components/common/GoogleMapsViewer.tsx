import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ExternalLink,
  Store,
  Truck,
  Compass,
  Search,
  Check
} from 'lucide-react';

export interface MapLocationMarker {
  id: string;
  title: string;
  subtitle?: string;
  latitude: number;
  longitude: number;
  type: 'farm' | 'buyer' | 'market' | 'transit' | 'custom';
  price?: string;
  category?: string;
  imageUrl?: string;
  statusBadge?: string;
  onClick?: () => void;
}

export interface MapRoute {
  origin: { latitude: number; longitude: number; label: string };
  destination: { latitude: number; longitude: number; label: string };
  currentLocation?: { latitude: number; longitude: number };
  statusText?: string;
}

interface GoogleMapsViewerProps {
  markers?: MapLocationMarker[];
  route?: MapRoute;
  center?: { latitude: number; longitude: number };
  zoom?: number;
  height?: string;
  className?: string;
  interactive?: boolean;
  selectable?: boolean;
  onSelectLocation?: (coords: { latitude: number; longitude: number; address?: string }) => void;
  selectedCoords?: { latitude: number; longitude: number } | null;
}

// Key agricultural hubs across Kenya with precise coordinates
export const KENYA_HUBS = [
  { name: 'Nairobi (Wakulima / Marikiti Market)', county: 'Nairobi', lat: -1.286389, lng: 36.817223, type: 'market' },
  { name: 'Mombasa (Kongowea Wholesale Market)', county: 'Mombasa', lat: -4.0435, lng: 39.6682, type: 'market' },
  { name: 'Nakuru (Top Market)', county: 'Nakuru', lat: -0.3031, lng: 36.0800, type: 'market' },
  { name: 'Eldoret (Municipal Wholesale Market)', county: 'Uasin Gishu', lat: 0.5143, lng: 35.2698, type: 'market' },
  { name: 'Kisumu (Jubilee Market)', county: 'Kisumu', lat: -0.1022, lng: 34.7617, type: 'market' },
  { name: 'Kangemi Market', county: 'Nairobi', lat: -1.2655, lng: 36.7505, type: 'market' },
  { name: 'Nyeri (Chaka Hub)', county: 'Nyeri', lat: -0.4246, lng: 36.9528, type: 'market' },
  { name: 'Meru (Makutano Hub)', county: 'Meru', lat: 0.0463, lng: 37.6559, type: 'market' }
];

// Calculate Haversine distance in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const GoogleMapsViewer: React.FC<GoogleMapsViewerProps> = ({
  markers = [],
  route,
  center = { latitude: -0.5, longitude: 36.8 }, // Central Kenya default
  zoom: initialZoom = 8,
  height = '420px',
  className = '',
  interactive = true,
  selectable = false,
  onSelectLocation,
  selectedCoords
}) => {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [activeMarker, setActiveMarker] = useState<MapLocationMarker | null>(null);
  const [currentCenter, setCurrentCenter] = useState(center);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Compute map bounds projection for responsive SVG map
  // Kenya spans roughly: Lat -4.5 to +4.5, Lng 34.0 to 41.5
  const mapBounds = {
    minLat: -4.5,
    maxLat: 4.5,
    minLng: 33.8,
    maxLng: 42.0
  };

  // Convert GPS coordinates to percentage x,y within viewport
  const coordsToPercent = (lat: number, lng: number) => {
    // Zoom factor offset centered around currentCenter
    const zoomScale = Math.pow(1.25, zoomLevel - 7);
    const centerXPercent = ((currentCenter.longitude - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const centerYPercent = ((mapBounds.maxLat - currentCenter.latitude) / (mapBounds.maxLat - mapBounds.minLat)) * 100;

    const rawXPercent = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const rawYPercent = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;

    const x = 50 + (rawXPercent - centerXPercent) * zoomScale;
    const y = 50 + (rawYPercent - centerYPercent) * zoomScale;

    return { x, y };
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 1, 14));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 1, 4));

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectable && !onSelectLocation) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const pctX = (clickX / rect.width) * 100;
    const pctY = (clickY / rect.height) * 100;

    const zoomScale = Math.pow(1.25, zoomLevel - 7);
    const centerXPercent = ((currentCenter.longitude - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const centerYPercent = ((mapBounds.maxLat - currentCenter.latitude) / (mapBounds.maxLat - mapBounds.minLat)) * 100;

    const rawXPercent = centerXPercent + (pctX - 50) / zoomScale;
    const rawYPercent = centerYPercent + (pctY - 50) / zoomScale;

    const lng = mapBounds.minLng + (rawXPercent / 100) * (mapBounds.maxLng - mapBounds.minLng);
    const lat = mapBounds.maxLat - (rawYPercent / 100) * (mapBounds.maxLat - mapBounds.minLat);

    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLng = Math.round(lng * 10000) / 10000;

    onSelectLocation?.({
      latitude: roundedLat,
      longitude: roundedLng,
      address: `Selected GPS (${roundedLat.toFixed(3)}, ${roundedLng.toFixed(3)})`
    });
  };

  // Quick jump to major hub
  const handleSelectHub = (hub: typeof KENYA_HUBS[0]) => {
    setCurrentCenter({ latitude: hub.lat, longitude: hub.lng });
    setZoomLevel(9);
    if (selectable && onSelectLocation) {
      onSelectLocation({
        latitude: hub.lat,
        longitude: hub.lng,
        address: `${hub.name}, ${hub.county} County`
      });
    }
  };

  const routeDistance = route
    ? calculateDistanceKm(
        route.origin.latitude,
        route.origin.longitude,
        route.destination.latitude,
        route.destination.longitude
      )
    : 0;

  const estimatedHours = routeDistance ? Math.max(1, Math.round(routeDistance / 50)) : 0;

  return (
    <div
      ref={mapContainerRef}
      className={`relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-900 text-white shadow-md ${
        isFullscreen ? 'fixed inset-4 z-50 h-auto' : ''
      } ${className}`}
      style={{ height: isFullscreen ? 'auto' : height }}
    >
      {/* Top Map Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Search / Hub Selector */}
        <div className="flex items-center gap-2 pointer-events-auto bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700/80 shadow-lg text-xs">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <select
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer max-w-[200px] truncate"
            onChange={(e) => {
              const found = KENYA_HUBS.find((h) => h.name === e.target.value);
              if (found) handleSelectHub(found);
            }}
            defaultValue=""
          >
            <option value="" disabled className="bg-stone-900 text-stone-400">
              Jump to Agricultural Hub...
            </option>
            {KENYA_HUBS.map((hub) => (
              <option key={hub.name} value={hub.name} className="bg-stone-900 text-white">
                {hub.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Controls & Fullscreen */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-stone-900/90 backdrop-blur-md p-1 rounded-xl border border-stone-700/80 shadow-lg text-xs">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              mapType === 'roadmap' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:text-white'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              mapType === 'satellite' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapType('terrain')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              mapType === 'terrain' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:text-white'
            }`}
          >
            Terrain
          </button>

          <div className="w-[1px] h-4 bg-stone-700 mx-1" />

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div
        onClick={handleMapClick}
        className={`w-full h-full relative cursor-${selectable ? 'crosshair' : 'grab'} select-none`}
        style={{
          backgroundColor: mapType === 'satellite' ? '#15241b' : mapType === 'terrain' ? '#212720' : '#1e293b'
        }}
      >
        {/* Map Background Graphics & Grid (Kenya Landscape Representation) */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none opacity-40">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Major Kenyan geographic contours (Rift Valley, Lake Victoria, Coastline, Mt Kenya) */}
          <path
            d="M 20% 60% Q 25% 70% 30% 65% T 35% 80%"
            fill="none"
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="3"
            strokeDasharray="4 4"
          />
          <path
            d="M 75% 75% Q 82% 85% 90% 95%"
            fill="none"
            stroke="rgba(56, 189, 248, 0.6)"
            strokeWidth="4"
          />
        </svg>

        {/* Route Polyline (if present) */}
        {route && (
          <svg className="w-full h-full absolute inset-0 pointer-events-none z-10">
            {(() => {
              const start = coordsToPercent(route.origin.latitude, route.origin.longitude);
              const end = coordsToPercent(route.destination.latitude, route.destination.longitude);
              return (
                <>
                  <line
                    x1={`${start.x}%`}
                    y1={`${start.y}%`}
                    x2={`${end.x}%`}
                    y2={`${end.y}%`}
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                  <line
                    x1={`${start.x}%`}
                    y1={`${start.y}%`}
                    x2={`${end.x}%`}
                    y2={`${end.y}%`}
                    stroke="rgba(16, 185, 129, 0.2)"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                </>
              );
            })()}
          </svg>
        )}

        {/* Wholesale Market Benchmark Hubs Pins */}
        {KENYA_HUBS.map((hub) => {
          const pos = coordsToPercent(hub.lat, hub.lng);
          if (pos.x < -10 || pos.x > 110 || pos.y < -10 || pos.y > 110) return null;
          return (
            <div
              key={hub.name}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectHub(hub);
              }}
            >
              <div className="w-4 h-4 rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center animate-ping absolute inset-0" />
              <div className="relative w-4 h-4 rounded-full bg-amber-500 text-stone-900 flex items-center justify-center shadow-lg border border-amber-300">
                <Store className="w-2.5 h-2.5" />
              </div>
              <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap bg-stone-900/95 border border-amber-500/40 text-amber-200 text-[10px] px-2 py-0.5 rounded shadow-lg pointer-events-none z-30">
                {hub.name}
              </div>
            </div>
          );
        })}

        {/* Dynamic Map Markers */}
        {markers.map((marker) => {
          const pos = coordsToPercent(marker.latitude, marker.longitude);
          if (pos.x < -10 || pos.x > 110 || pos.y < -10 || pos.y > 110) return null;

          const isSelected = activeMarker?.id === marker.id;

          return (
            <div
              key={marker.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-full z-20 group cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMarker(marker);
                marker.onClick?.();
              }}
            >
              {/* Pin Bubble */}
              <div
                className={`relative px-2 py-1 rounded-xl shadow-xl flex items-center gap-1.5 border transition-all duration-200 ${
                  marker.type === 'farm'
                    ? 'bg-emerald-600 border-emerald-400 text-white hover:bg-emerald-500'
                    : marker.type === 'buyer'
                    ? 'bg-blue-600 border-blue-400 text-white hover:bg-blue-500'
                    : marker.type === 'transit'
                    ? 'bg-purple-600 border-purple-400 text-white hover:bg-purple-500'
                    : 'bg-amber-600 border-amber-400 text-white hover:bg-amber-500'
                } ${isSelected ? 'scale-110 ring-4 ring-emerald-400/50' : ''}`}
              >
                {marker.type === 'farm' && <MapPin className="w-3.5 h-3.5" />}
                {marker.type === 'buyer' && <Navigation className="w-3.5 h-3.5" />}
                {marker.type === 'transit' && <Truck className="w-3.5 h-3.5 animate-bounce" />}
                {marker.type === 'market' && <Store className="w-3.5 h-3.5" />}

                <span className="text-[11px] font-bold max-w-[120px] truncate">{marker.title}</span>

                {marker.price && (
                  <span className="text-[10px] bg-black/30 px-1 rounded font-semibold text-emerald-200">
                    {marker.price}
                  </span>
                )}
              </div>

              {/* Pin Pointer Tail */}
              <div className="w-2 h-2 mx-auto rotate-45 -mt-1 bg-inherit border-r border-b border-inherit shadow" />
            </div>
          );
        })}

        {/* Selected Coords Marker (Location Picker) */}
        {selectedCoords && (
          (() => {
            const pos = coordsToPercent(selectedCoords.latitude, selectedCoords.longitude);
            return (
              <div
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-full z-30 pointer-events-none"
              >
                <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-2xl flex items-center gap-1 border-2 border-white animate-bounce">
                  <MapPin className="w-3.5 h-3.5" />
                  Selected Location
                </div>
                <div className="w-2.5 h-2.5 mx-auto rotate-45 -mt-1 bg-red-500 border-r border-b border-white" />
              </div>
            );
          })()
        )}
      </div>

      {/* Route Info Badge (when tracking orders) */}
      {route && (
        <div className="absolute bottom-3 left-3 z-20 bg-stone-900/90 backdrop-blur-md p-3 rounded-xl border border-stone-700/80 shadow-xl max-w-sm text-xs">
          <div className="flex items-center justify-between font-semibold text-stone-200 mb-1">
            <span className="flex items-center gap-1 text-emerald-400">
              <Truck className="w-3.5 h-3.5" />
              Live Route Transit
            </span>
            <span className="text-stone-400">~{routeDistance} km</span>
          </div>
          <div className="text-[11px] text-stone-300 flex items-center justify-between gap-3">
            <div>
              <div className="text-stone-400 text-[10px]">Farm Origin</div>
              <div className="font-medium truncate max-w-[120px]">{route.origin.label}</div>
            </div>
            <div className="text-emerald-400 font-bold">➔</div>
            <div>
              <div className="text-stone-400 text-[10px]">Delivery Point</div>
              <div className="font-medium truncate max-w-[120px]">{route.destination.label}</div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-800 flex items-center justify-between text-[11px]">
            <span className="text-stone-400">Estimated Drive:</span>
            <span className="font-semibold text-emerald-300">~{estimatedHours} hours (Standard Truck)</span>
          </div>
        </div>
      )}

      {/* Selected Marker Popup Card */}
      {activeMarker && (
        <div className="absolute top-16 right-3 z-30 w-72 bg-stone-900/95 backdrop-blur-md rounded-xl p-3 border border-stone-700 shadow-2xl text-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                {activeMarker.category || activeMarker.type}
              </span>
              <h4 className="font-bold text-stone-100 text-sm">{activeMarker.title}</h4>
              {activeMarker.subtitle && <p className="text-stone-400 text-[11px]">{activeMarker.subtitle}</p>}
            </div>
            <button
              onClick={() => setActiveMarker(null)}
              className="text-stone-400 hover:text-white text-base leading-none p-1"
            >
              ✕
            </button>
          </div>

          {activeMarker.imageUrl && (
            <img
              src={activeMarker.imageUrl}
              alt={activeMarker.title}
              className="w-full h-24 object-cover rounded-lg mt-2 border border-stone-800"
            />
          )}

          <div className="mt-2 flex items-center justify-between">
            {activeMarker.price && <div className="text-emerald-400 font-bold text-sm">{activeMarker.price}</div>}
            <div className="text-[10px] text-stone-400">
              {activeMarker.latitude.toFixed(3)}, {activeMarker.longitude.toFixed(3)}
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom-Right Zoom & Recenter Controls */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-white rounded-xl border border-stone-700/80 shadow-lg transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-white rounded-xl border border-stone-700/80 shadow-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setCurrentCenter(center);
            setZoomLevel(initialZoom);
          }}
          className="p-2 bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-white rounded-xl border border-stone-700/80 shadow-lg transition"
          title="Recenter Map"
        >
          <Compass className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {/* Selectable Helper Guide */}
      {selectable && (
        <div className="absolute top-14 left-3 z-20 bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/50 text-[11px] text-emerald-300 shadow flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-emerald-400" />
          Click anywhere on map to pin farm or delivery coordinates
        </div>
      )}
    </div>
  );
};
