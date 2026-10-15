import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  MapPin,
  ShoppingBag,
  DollarSign,
  Package,
  Award
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { produceList, orders, transactions, users, marketPrices } = useMarketplace();

  // Aggregate stats
  const totalVolume = orders.reduce((sum, o) => sum + o.quantity, 0);
  const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Top selling produce by order count
  const produceSalesMap: { [key: string]: { name: string; count: number; value: number } } = {};
  orders.forEach((o) => {
    if (!produceSalesMap[o.produceName]) {
      produceSalesMap[o.produceName] = { name: o.produceName, count: 0, value: 0 };
    }
    produceSalesMap[o.produceName].count += 1;
    produceSalesMap[o.produceName].value += o.totalAmount;
  });
  const topSellingProduce = Object.values(produceSalesMap).sort((a, b) => b.value - a.value);

  // Regional activity by county
  const countyActivityMap: { [key: string]: number } = {};
  produceList.forEach((p) => {
    countyActivityMap[p.county] = (countyActivityMap[p.county] || 0) + 1;
  });
  const countyEntries = Object.entries(countyActivityMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          Executive Market Analytics & Reports
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          High-resolution visibility into national agricultural throughput, crop price variances, and regional production hubs.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">Gross Commodity GMV</span>
          <p className="text-2xl font-black text-emerald-800 mt-1">
            KES {(totalGMV ?? 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Direct farmer earnings</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">Total Produce Traded</span>
          <p className="text-2xl font-black text-stone-900 mt-1">{(totalVolume ?? 0).toLocaleString()}</p>
          <span className="text-[10px] text-stone-400">Total bags/crates transferred</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">Active Supply Acreage</span>
          <p className="text-2xl font-black text-purple-900 mt-1">680+ Acres</p>
          <span className="text-[10px] text-purple-700 font-medium">Verified farm lands</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">Escrow Success Rate</span>
          <p className="text-2xl font-black text-emerald-800 mt-1">98.4%</p>
          <span className="text-[10px] text-emerald-600 font-medium">Delivered without disputes</span>
        </div>
      </div>

      {/* Charts & Analytics Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Traded Agricultural Commodities */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Award className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-bold text-stone-900">Top Agricultural Commodities by Trade Value</h2>
          </div>

          <div className="space-y-3">
            {topSellingProduce.map((item, idx) => {
              const maxVal = topSellingProduce[0]?.value || 1;
              const pct = Math.round((item.value / maxVal) * 100);

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900">
                      {idx + 1}. {item.name}
                    </span>
                    <span className="font-black text-emerald-800">
                      KES {(item.value ?? 0).toLocaleString()} ({item.count} orders)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Activity by County */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <MapPin className="w-5 h-5 text-purple-600" />
            <h2 className="text-sm font-bold text-stone-900">Harvest Supply Hubs by County</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {countyEntries.map(([county, count]) => (
              <div
                key={county}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-stone-900">{county} County</p>
                  <p className="text-[10px] text-stone-500">{count} Active crop harvests</p>
                </div>
                <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-900 font-bold text-xs flex items-center justify-center">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
