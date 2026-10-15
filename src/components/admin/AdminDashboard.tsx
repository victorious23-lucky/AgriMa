import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import {
  Users,
  CheckCircle,
  ShoppingBag,
  Package,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  DollarSign,
  PlusCircle,
  FileSpreadsheet,
  Building,
  Scale
} from 'lucide-react';
import { DisputeModal } from '../disputes/DisputeModal';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    produceList,
    orders,
    transactions,
    disputes,
    marketPrices,
    setActiveView,
    verifyFarmer,
    resolveDispute
  } = useMarketplace();

  const [selectedDisputeResolution, setSelectedDisputeResolution] = useState<{
    disputeId: string;
    resolution: 'Refund Buyer' | 'Release to Farmer' | 'Split Escrow';
  } | null>(null);

  const totalUsers = users.length;
  const totalFarmers = users.filter((u) => u.role === 'farmer').length;
  const totalBuyers = users.filter((u) => u.role === 'buyer').length;
  const totalListings = produceList.length;
  const totalOrders = orders.length;
  const totalTransactionsValue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const activeDisputes = disputes.filter((d) => d.status !== 'Resolved');
  const platformEscrowHeld = transactions
    .filter((t) => t.status === 'Held in Escrow')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingVerificationFarmers = users.filter(
    (u) => u.role === 'farmer' && !u.isVerified
  );

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-stone-900 to-indigo-950 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600/60 uppercase tracking-wide border border-purple-400/30">
                National Platform Governance
              </span>
              <span className="text-[11px] font-medium text-purple-200">
                Administrator Alex Mwangi
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              AgriMa Platform Administration
            </h1>
            <p className="text-xs text-stone-300 mt-1 max-w-xl">
              Monitor agricultural transactions, verify farmer farmsteads, audit platform escrow, and arbitrate trade disputes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveView('users')}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xs transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('disputes')}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Disputes ({activeDisputes.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Statistics Cards for Administrator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Users */}
        <div
          onClick={() => setActiveView('users')}
          className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-purple-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Total Users</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-stone-900">{totalUsers}</p>
          <span className="text-[10px] text-stone-400">Farmers, buyers & admins</span>
        </div>

        {/* Farmers */}
        <div
          onClick={() => setActiveView('farmers')}
          className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-emerald-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Registered Farmers</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-800">{totalFarmers}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Direct producers</span>
        </div>

        {/* Buyers */}
        <div
          onClick={() => setActiveView('buyers')}
          className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-amber-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Registered Buyers</span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-900">{totalBuyers}</p>
          <span className="text-[10px] text-amber-600 font-medium">Wholesalers & retail</span>
        </div>

        {/* Produce Listings */}
        <div
          onClick={() => setActiveView('produce-listings')}
          className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-teal-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Produce Listings</span>
            <Package className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-stone-900">{totalListings}</p>
          <span className="text-[10px] text-teal-600 font-medium">Across all counties</span>
        </div>

        {/* Total Orders */}
        <div
          onClick={() => setActiveView('orders')}
          className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-blue-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-stone-900">{totalOrders}</p>
          <span className="text-[10px] text-stone-400">Lifetime volume</span>
        </div>

        {/* GMV Transactions */}
        <div
          onClick={() => setActiveView('transactions')}
          className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-emerald-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Gross Marketplace Value</span>
            <CreditCard className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-lg sm:text-xl font-black text-emerald-800 truncate">
            KES {(totalTransactionsValue ?? 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Platform GMV</span>
        </div>

        {/* Active Disputes */}
        <div
          onClick={() => setActiveView('disputes')}
          className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-red-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Active Disputes</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-red-700">{activeDisputes.length}</p>
          <span className="text-[10px] text-red-600 font-medium">Requires mediation</span>
        </div>

        {/* Escrow Health */}
        <div
          onClick={() => setActiveView('transactions')}
          className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-purple-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Escrow Holdings</span>
            <ShieldCheck className="w-4 h-4 text-purple-700" />
          </div>
          <p className="text-lg sm:text-xl font-black text-purple-900 truncate">
            KES {(platformEscrowHeld ?? 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-purple-700 font-medium">Locked in custody</span>
        </div>
      </div>

      {/* 4 Quick Actions Row */}
      <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-stone-700">Administrative Quick Actions:</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('market-prices')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 flex items-center gap-1.5 shadow-2xs"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            <span>Update Market Benchmark</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('farmers')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 flex items-center gap-1.5 shadow-2xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-700" />
            <span>Farmer Verification ({pendingVerificationFarmers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('reports')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 flex items-center gap-1.5 shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
            <span>View Executive Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('disputes')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 flex items-center gap-1.5 shadow-2xs"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Arbitrate Disputes</span>
          </button>
        </div>
      </div>

      {/* Main Admin Grids: Pending Verifications & Active Disputes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Farmer Verifications */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-stone-900">Farmer Verification Queue</h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('farmers')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              All Farmers
            </button>
          </div>

          <div className="space-y-3">
            {pendingVerificationFarmers.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-6">
                All registered farmers are verified.
              </p>
            ) : (
              pendingVerificationFarmers.map((f) => (
                <div
                  key={f.id}
                  className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={f.avatar}
                      alt={f.name}
                      className="w-10 h-10 rounded-full object-cover border border-stone-300"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900">{f.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {f.farmName || 'Smallholder Farm'} • {f.county} County
                      </p>
                      <p className="text-[10px] text-stone-400">Phone: {f.phone}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => verifyFarmer(f.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs"
                  >
                    Grant Verification
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Trade Disputes Mediation */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-stone-900">Active Trade Disputes</h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('disputes')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              All Disputes
            </button>
          </div>

          <div className="space-y-3">
            {activeDisputes.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-6">
                No active disputes. Marketplace order transactions are proceeding smoothly.
              </p>
            ) : (
              activeDisputes.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-2xl bg-red-50/50 border border-red-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-950">{d.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      {d.status}
                    </span>
                  </div>

                  <p className="text-xs text-stone-800 font-semibold">{d.reason}</p>
                  <p className="text-[11px] text-stone-600 line-clamp-2 italic">"{d.description}"</p>

                  <div className="pt-2 border-t border-red-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-stone-400">Raised: {d.createdAt}</span>
                    <button
                      type="button"
                      onClick={() => setActiveView('disputes')}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-stone-900 text-white hover:bg-black"
                    >
                      Arbitrate Claim
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
