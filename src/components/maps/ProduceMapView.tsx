import React, { useState, useMemo } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { GoogleMapsViewer, MapLocationMarker, KENYA_HUBS, calculateDistanceKm } from '../common/GoogleMapsViewer';
import {
  MapPin,
  Filter,
  Layers,
  Store,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Star,
  Search,
  Truck
} from 'lucide-react';
import { ProduceCategory } from '../../types';

export const ProduceMapView: React.FC = () => {
  const { produceList, setSelectedProduce, setActiveView, marketPrices } = useMarketplace();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHub, setSelectedHub] = useState<string>('Nairobi (Wakulima / Marikiti Market)');
  const [selectedProduceItem, setSelectedProduceItem] = useState<any | null>(null);

  // Compute map markers for produce listings
  // If a produce listing doesn't have explicit coordinates, generate plausible county coordinates
  const countyCoords: Record<string, { lat: number; lng: number }> = {
    'Kirinyaga': { lat: -0.5, lng: 37.28 },
    'Kiambu': { lat: -1.03, lng: 36.83 },
    'Murang\'a': { lat: -0.72, lng: 37.15 },
    'Nyandarua': { lat: -0.18, lng: 36.52 },
    'Nakuru': { lat: -0.30, lng: 36.08 },
    'Uasin Gishu': { lat: 0.52, lng: 35.27 },
    'Trans Nzoia': { lat: 1.02, lng: 35.01 },
    'Machakos': { lat: -1.52, lng: 37.26 },
    'Makueni': { lat: -1.80, lng: 37.62 },
    'Meru': { lat: 0.05, lng: 37.65 },
    'Nyeri': { lat: -0.42, lng: 36.95 },
    'Nandi': { lat: 0.18, lng: 35.10 },
    'Bomet': { lat: -0.78, lng: 35.34 },
    'Kisii': { lat: -0.68, lng: 34.77 },
    'Nairobi': { lat: -1.29, lng: 36.82 }
  };

  const filteredProduce = useMemo(() => {
    return produceList.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.county.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [produceList, selectedCategory, searchQuery]);

  const markers: MapLocationMarker[] = useMemo(() => {
    return filteredProduce.map((p, idx) => {
      const defaultCoord = countyCoords[p.county] || { lat: -0.8 + (idx * 0.1) % 1.5, lng: 36.5 + (idx * 0.12) % 1.5 };
      const lat = p.latitude ?? defaultCoord.lat;
      const lng = p.longitude ?? defaultCoord.lng;

      return {
        id: p.id,
        title: p.name,
        subtitle: `${p.county} • by ${p.farmerName}`,
        latitude: lat,
        longitude: lng,
        type: 'farm',
        price: `KES ${p.pricePerUnit}/${p.unit}`,
        category: p.category,
        imageUrl: p.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
        onClick: () => setSelectedProduceItem(p)
      };
    });
  }, [filteredProduce]);

  // Target hub for distance calculation
  const targetHub = KENYA_HUBS.find((h) => h.name === selectedHub) || KENYA_HUBS[0];

  const categories = [
    'all',
    'Vegetables',
    'Fruits',
    'Cereals & Grains',
    'Tubers & Roots',
    'Legumes & Pulses',
    'Herbs & Spices'
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-sm border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 text-emerald-300 text-xs px-2.5 py-1 rounded-full mb-2 border border-emerald-700/60 font-medium">
            <MapPin className="w-3.5 h-3.5" />
            Geospatial Farm Produce Network
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Produce Farms & Wholesale Hubs Map
          </h1>
          <p className="text-emerald-200 text-sm mt-1 max-w-2xl">
            Explore live farm gate locations, calculate transit distances to major markets, and source directly from verified smallholder farmers across Kenya.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('browse')}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition border border-emerald-700 cursor-pointer"
          >
            Switch to List View
          </button>
        </div>
      </div>

      {/* Filter and Distance Calculator Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search produce, county, or farmer..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Destination Wholesale Hub Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium flex items-center gap-1 shrink-0">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              Measure Distance to Hub:
            </span>
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {KENYA_HUBS.map((hub) => (
                <option key={hub.name} value={hub.name}>
                  {hub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {cat === 'all' ? 'All Produce' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-2">
          <GoogleMapsViewer
            markers={markers}
            height="520px"
            center={{ latitude: -0.6, longitude: 36.8 }}
            zoom={8}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500 px-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Farm Listing
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Wholesale Market Hub
              </span>
            </div>
            <span>Showing {markers.length} farm locations on map</span>
          </div>
        </div>

        {/* Sidebar Panel: Selected Farm or Nearby Farms */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs flex flex-col h-[550px] overflow-hidden">
          {selectedProduceItem ? (
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {selectedProduceItem.category}
                </span>
                <button
                  onClick={() => setSelectedProduceItem(null)}
                  className="text-stone-400 hover:text-stone-700 text-xs font-medium"
                >
                  Clear Selection
                </button>
              </div>

              <img
                src={selectedProduceItem.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                alt={selectedProduceItem.name}
                className="w-full h-40 object-cover rounded-xl border border-stone-200 mb-3"
              />

              <h3 className="font-bold text-lg text-stone-900 leading-snug">
                {selectedProduceItem.name}
              </h3>
              <div className="text-emerald-700 font-extrabold text-xl mt-1">
                KES {selectedProduceItem.pricePerUnit.toLocaleString()} / {selectedProduceItem.unit}
              </div>

              {/* Farmer and Location info */}
              <div className="mt-3 p-3 bg-stone-50 rounded-xl space-y-2 text-xs border border-stone-100">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Farmer:</span>
                  <span className="font-semibold text-stone-800 flex items-center gap-1">
                    {selectedProduceItem.farmerName}
                    {selectedProduceItem.farmerVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Farm Location:</span>
                  <span className="font-medium text-stone-800">
                    {selectedProduceItem.county} County
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Available Stock:</span>
                  <span className="font-semibold text-stone-800">
                    {selectedProduceItem.quantity} {selectedProduceItem.unit}
                  </span>
                </div>

                {/* Distance to selected Hub */}
                {(() => {
                  const defaultCoord = countyCoords[selectedProduceItem.county] || { lat: -0.5, lng: 36.8 };
                  const lat = selectedProduceItem.latitude ?? defaultCoord.lat;
                  const lng = selectedProduceItem.longitude ?? defaultCoord.lng;
                  const dist = calculateDistanceKm(lat, lng, targetHub.lat, targetHub.lng);
                  const estHours = Math.max(1, Math.round(dist / 45));

                  return (
                    <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-emerald-800 font-medium">
                      <span>Distance to {targetHub.county}:</span>
                      <span className="font-bold">~{dist} km ({estHours}h drive)</span>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="mt-auto pt-4 space-y-2">
                <button
                  onClick={() => {
                    setSelectedProduce(selectedProduceItem);
                  }}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Details & Make Offer
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <h3 className="font-bold text-sm text-stone-900 mb-1">
                Regional Farm Produce Listings
              </h3>
              <p className="text-xs text-stone-500 mb-3">
                Click any pin on the map or select a listing below to review transit distance and logistics.
              </p>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {filteredProduce.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedProduceItem(item)}
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition cursor-pointer flex items-center gap-3"
                  >
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{item.name}</h4>
                      <p className="text-[11px] text-stone-500">
                        {item.county} • by {item.farmerName}
                      </p>
                      <span className="text-xs font-extrabold text-emerald-700">
                        KES {item.pricePerUnit}/{item.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
