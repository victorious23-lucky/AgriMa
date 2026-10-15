import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Produce, ProduceCategory } from '../../types';
import { COUNTIES, PRODUCE_CATEGORIES } from '../../data/mockData';
import {
  Search,
  Filter,
  Package,
  MapPin,
  Calendar,
  ShieldCheck,
  ShoppingBag,
  Scale,
  MessageSquare,
  TrendingUp,
  Eye,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { ProduceDetailModal } from './ProduceDetailModal';
import { CreateOrderModal } from '../orders/CreateOrderModal';
import { NegotiationModal } from '../negotiation/NegotiationModal';
import { ProduceMapView } from '../maps/ProduceMapView';

export const BrowseProduce: React.FC = () => {
  const { produceList, marketPrices, openChatWithUser } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCounty, setSelectedCounty] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const [selectedProduce, setSelectedProduce] = useState<Produce | null>(null);
  const [orderProduce, setOrderProduce] = useState<Produce | null>(null);
  const [offerProduce, setOfferProduce] = useState<Produce | null>(null);

  // Filter produce
  const filtered = produceList.filter((item) => {
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (item.name || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q) ||
      (item.farmerName || '').toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesCounty = selectedCounty === 'all' || item.county === selectedCounty;
    const matchesAvailability =
      selectedAvailability === 'all'
        ? item.availabilityStatus !== 'Sold'
        : item.availabilityStatus === selectedAvailability;

    const matchesPrice = item.pricePerUnit <= maxPrice;

    return matchesSearch && matchesCategory && matchesCounty && matchesAvailability && matchesPrice;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.pricePerUnit - b.pricePerUnit;
    if (sortBy === 'price-desc') return b.pricePerUnit - a.pricePerUnit;
    if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
    return new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime();
  });

  return (
    <div className="space-y-6">
      {/* AgriMa Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 text-white p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold border border-white/15">
            <span>🌱</span>
            <span>AgriMa Digital Agricultural Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Fair Prices for Farmers. Fresh Produce for Buyers.
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium">
            Connect directly with verified farmers across Kenya. Enjoy live market price intelligence, transparent counter-offers, and escrow-secured payments with zero middlemen commissions.
          </p>

          <div className="flex flex-wrap gap-2 pt-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-white border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Escrow Protected</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-white border border-white/10">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              <span>Live Price Benchmarks</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-white border border-white/10">
              <Scale className="w-3.5 h-3.5 text-amber-300" />
              <span>Direct Price Negotiation</span>
            </span>
          </div>
        </div>

        {/* Decorative background ambient circles */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-24 -bottom-16 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          All Produce ({produceList.length})
        </button>
        {PRODUCE_CATEGORIES.map((cat) => {
          const count = produceList.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-4">
        {/* Search Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              id="input-search-produce"
              type="text"
              placeholder="Search by crop, farmer name, region or variety..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            >
              <option value="all">All Produce Categories</option>
              {PRODUCE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              id="filter-county"
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            >
              <option value="all">All Counties</option>
              {COUNTIES.map((county) => (
                <option key={county} value={county}>
                  {county} County
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary filters: Sort & Price slider */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-semibold text-stone-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1 text-xs bg-stone-50 border border-stone-300 rounded-lg"
            >
              <option value="featured">Newest Harvest Date</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="views">Most Popular / Inquiries</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-stone-500 font-medium">
              Max Price: <b>KES {(maxPrice ?? 0).toLocaleString()}</b>
            </span>
            <input
              type="range"
              min="500"
              max="15000"
              step="250"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-28 sm:w-36 accent-emerald-700"
            />
          </div>

          {/* View mode toggle: Grid vs Map */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Grid View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'map' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Produce Grid or Map View */}
      {viewMode === 'map' ? (
        <ProduceMapView />
      ) : sorted.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">No produce matches your filters</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try resetting your search filters or increasing the maximum price range.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedCounty('all');
              setMaxPrice(10000);
            }}
            className="mt-3 px-4 py-1.5 rounded-xl text-xs font-bold bg-stone-800 text-white hover:bg-stone-900"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((produce) => {
            const pName = (produce?.name || '').toLowerCase();
            const benchmark = marketPrices.find((mp) => {
              const cName = (mp?.crop || '').toLowerCase();
              return cName && pName && (cName.includes(pName) || pName.includes(cName));
            });

            return (
              <div
                key={produce.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Status */}
                  <div
                    className="relative aspect-video overflow-hidden cursor-pointer"
                    onClick={() => setSelectedProduce(produce)}
                  >
                    <img
                      src={produce.images[0]}
                      alt={produce.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-stone-900 backdrop-blur-xs shadow-xs">
                        {produce.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                          produce.availabilityStatus === 'In Stock'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-800 text-white'
                        }`}
                      >
                        {produce.availabilityStatus}
                      </span>
                    </div>

                    {produce.images.length > 1 && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] backdrop-blur-xs font-medium">
                        +{produce.images.length - 1} photos
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div
                      className="cursor-pointer"
                      onClick={() => setSelectedProduce(produce)}
                    >
                      <h3 className="text-sm font-bold text-stone-900 line-clamp-1 hover:text-emerald-700 transition-colors">
                        {produce.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        <span className="truncate">{produce.location}, {produce.county}</span>
                      </div>
                    </div>

                    {/* Price & Stock info */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-lg font-black text-emerald-800">
                          KES {(produce.pricePerUnit ?? 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-stone-500 font-medium"> / {produce.unit}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-stone-800 block">
                          {produce.quantity} {produce.unit}
                        </span>
                        <span className="text-[10px] text-stone-400">Available</span>
                      </div>
                    </div>

                    {/* Benchmark badge */}
                    {benchmark && benchmark.averagePrice && (
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 text-[11px] flex items-center justify-between">
                        <span className="text-stone-500">
                          Market Avg: KES {(benchmark.averagePrice ?? 0).toLocaleString()}
                        </span>
                        <span
                          className={`font-bold ${
                            produce.pricePerUnit <= benchmark.averagePrice
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {produce.pricePerUnit <= benchmark.averagePrice
                            ? `✓ ${Math.round(((benchmark.averagePrice - produce.pricePerUnit) / benchmark.averagePrice) * 100)}% Cheaper`
                            : 'Above Avg'}
                        </span>
                      </div>
                    )}

                    {/* Farmer snippet */}
                    <div className="flex items-center justify-between text-xs text-stone-600 pt-1 border-t border-stone-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                          {produce.farmerName.charAt(0)}
                        </span>
                        <span className="font-semibold text-stone-800 truncate max-w-[130px]">
                          {produce.farmerName}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openChatWithUser(
                            produce.farmerId,
                            produce.farmerName,
                            'farmer',
                            produce.name
                          );
                        }}
                        className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px] font-medium"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat Farmer</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setOfferProduce(produce)}
                    className="flex-1 py-2 px-2 text-center text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Scale className="w-3.5 h-3.5 text-amber-700" />
                    <span>Make Offer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderProduce(produce)}
                    className="flex-1 py-2 px-2 text-center text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Produce Detail Modal */}
      {selectedProduce && (
        <ProduceDetailModal
          isOpen={true}
          onClose={() => setSelectedProduce(null)}
          produce={selectedProduce}
        />
      )}

      {/* Direct Order Modal */}
      {orderProduce && (
        <CreateOrderModal
          isOpen={true}
          onClose={() => setOrderProduce(null)}
          produce={orderProduce}
        />
      )}

      {/* Price Negotiation Modal */}
      {offerProduce && (
        <NegotiationModal
          isOpen={true}
          onClose={() => setOfferProduce(null)}
          produce={offerProduce}
        />
      )}
    </div>
  );
};
