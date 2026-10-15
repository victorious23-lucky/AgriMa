import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { MarketPrice, ProduceCategory } from '../../types';
import { PRODUCE_CATEGORIES, COUNTIES } from '../../data/mockData';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Scale,
  Sparkles,
  ArrowUpRight,
  HelpCircle,
  BarChart3
} from 'lucide-react';

export const MarketPriceView: React.FC = () => {
  const { marketPrices, produceList, setActiveView } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<string>('all');

  // Calculator comparison tool state
  const [calcCrop, setCalcCrop] = useState(marketPrices[0]?.crop || 'Irish Potatoes (Shangi)');
  const [calcPrice, setCalcPrice] = useState<number>(2600);

  const filteredPrices = marketPrices.filter((mp) => {
    const q = (searchQuery || '').trim().toLowerCase();
    const marketOrLocation = mp.market || mp.location || '';
    const matchesSearch =
      !q ||
      (mp.crop || '').toLowerCase().includes(q) ||
      marketOrLocation.toLowerCase().includes(q) ||
      (mp.county || '').toLowerCase().includes(q);

    const matchesCat = selectedCategory === 'all' || mp.category === selectedCategory;
    const matchesMarket = selectedMarket === 'all' || marketOrLocation.includes(selectedMarket);

    return matchesSearch && matchesCat && matchesMarket;
  });

  const selectedBenchmark = marketPrices.find((m) => m.crop === calcCrop) || marketPrices[0];

  const getTrendIcon = (trend: MarketPrice['trend']) => {
    switch (trend) {
      case 'up':
      case 'rising':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" /> Rising (+4%)
          </span>
        );
      case 'down':
      case 'falling':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <TrendingDown className="w-3.5 h-3.5" /> Softening (-3%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
            <Minus className="w-3.5 h-3.5" /> Stable
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              Official Agricultural Benchmarks
            </span>
            <span className="text-xs text-stone-400">• Updated Daily</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Market Price Reference Index
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time wholesale and farmgate price intelligence across Kenya's primary agricultural terminals.
          </p>
        </div>
      </div>

      {/* Interactive Price Comparison & Fair Pricing Calculator */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 text-white shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-emerald-100">Fair Price Calculator & Benchmark Check</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Select Crop</label>
            <select
              value={calcCrop}
              onChange={(e) => setCalcCrop(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-hidden focus:border-emerald-500"
            >
              {marketPrices.map((p) => (
                <option key={p.id} value={p.crop}>
                  {p.crop} ({p.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Your Listing / Quoted Price (KES / {selectedBenchmark?.unit})
            </label>
            <input
              type="number"
              value={calcPrice}
              onChange={(e) => setCalcPrice(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-stone-800 border border-stone-700 rounded-xl text-emerald-400 font-bold focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700/80 flex flex-col justify-center">
            <span className="text-[10px] text-stone-400 font-medium">Market Analysis Verdict:</span>
            {selectedBenchmark && (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xs font-bold text-white">
                  Market Avg: KES {(selectedBenchmark.averagePrice ?? 0).toLocaleString()}
                </span>
                <span
                  className={`text-xs font-extrabold ${
                    calcPrice <= (selectedBenchmark.averagePrice ?? 0) ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {selectedBenchmark.averagePrice && calcPrice <= selectedBenchmark.averagePrice
                    ? `✓ ${Math.round(((selectedBenchmark.averagePrice - calcPrice) / selectedBenchmark.averagePrice) * 100)}% Cheaper (High Demand)`
                    : selectedBenchmark.averagePrice
                    ? `+${Math.round(((calcPrice - selectedBenchmark.averagePrice) / selectedBenchmark.averagePrice) * 100)}% Above Terminal Benchmark`
                    : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search crop or terminal market..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            >
              <option value="all">All Crop Categories</option>
              {PRODUCE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            >
              <option value="all">All Regional Markets</option>
              <option value="Nairobi">Nairobi (Marikiti & Kangemi)</option>
              <option value="Nakuru">Nakuru Wholesale Hub</option>
              <option value="Eldoret">Eldoret Main Depot</option>
              <option value="Mombasa">Mombasa Kongowea</option>
              <option value="Kisumu">Kisumu Jubilee Market</option>
              <option value="Kiambu">Kiambu County Depots</option>
            </select>
          </div>
        </div>
      </div>

      {/* Market Prices Table / Cards */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="px-5 py-3">Crop / Commodity</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Regional Terminal</th>
                <th className="px-5 py-3">Average Price</th>
                <th className="px-5 py-3">Price Band (Min - Max)</th>
                <th className="px-5 py-3">Market Trend</th>
                <th className="px-5 py-3">Last Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-stone-400">
                    No commodity price records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPrices.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-stone-900">{item.crop}</p>
                      <span className="text-[10px] text-stone-400">Unit: {item.unit}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-700">
                        {item.category}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-medium text-stone-800">{item.market || item.location || 'Terminal Hub'}</p>
                      <span className="text-[10px] text-stone-400">{item.county} County</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-sm font-black text-emerald-800">
                        KES {(item.averagePrice ?? 0).toLocaleString()}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-stone-600">
                      <span className="font-medium">
                        KES {(item.minPrice ?? 0).toLocaleString()} – KES {(item.maxPrice ?? 0).toLocaleString()}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">{getTrendIcon(item.trend)}</td>

                    <td className="px-5 py-3.5 text-stone-400 text-[11px]">{item.dateUpdated || item.lastUpdated || 'Recent'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
