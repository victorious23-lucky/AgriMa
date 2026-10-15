import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Produce, Order, Negotiation } from '../../types';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  CreditCard,
  Scale,
  Package,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Search,
  Truck
} from 'lucide-react';
import { NegotiationModal } from '../negotiation/NegotiationModal';
import { ProduceDetailModal } from './ProduceDetailModal';

export const BuyerDashboard: React.FC = () => {
  const {
    currentUser,
    orders,
    negotiations,
    produceList,
    marketPrices,
    setActiveView,
    confirmDeliveryBuyer,
    openChatWithUser
  } = useMarketplace();

  const [activeNegotiation, setActiveNegotiation] = useState<Negotiation | null>(null);
  const [selectedProduce, setSelectedProduce] = useState<Produce | null>(null);

  if (!currentUser) return null;

  const myOrders = orders.filter((o) => o.buyerId === currentUser.id);
  const activeOrders = myOrders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled');
  const completedOrders = myOrders.filter((o) => o.status === 'Completed');
  const inTransitOrders = myOrders.filter((o) => o.status === 'In Transit');
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const myNegotiations = negotiations.filter((n) => n.buyerId === currentUser.id);
  const pendingNegotiations = myNegotiations.filter((n) => n.status === 'pending' || n.status === 'countered');

  const featuredProduce = produceList.filter((p) => p.availabilityStatus === 'In Stock').slice(0, 3);
  const recentOrders = myOrders.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-600/60 uppercase tracking-wide border border-amber-400/30">
                AgriMa Buyer Hub
              </span>
              <span className="text-[11px] font-medium text-amber-200">
                {currentUser.businessName || 'Direct Enterprise Buyer'} • {currentUser.county}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs text-stone-300 mt-1 max-w-xl">
              Source harvest crops directly from verified farms. All transactions protected by automated Escrow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-buyer-browse-produce"
              type="button"
              onClick={() => setActiveView('browse')}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Browse Fresh Produce</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('market-prices')}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Price Benchmarks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Negotiation Counter-Offer Alert */}
      {pendingNegotiations.some((n) => n.status === 'countered') && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">
                A farmer has responded with a counter-offer on your price bid!
              </p>
              <p className="text-[11px] text-amber-800">
                Review their proposed price and quantity terms to finalize or counter.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setActiveNegotiation(pendingNegotiations.find((n) => n.status === 'countered') || null)
            }
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white whitespace-nowrap self-start sm:self-auto"
          >
            Review Counter-Offer
          </button>
        </div>
      )}

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Active Orders */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Active Orders</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-stone-900">{activeOrders.length}</p>
          <span className="text-[10px] text-amber-600 font-medium">In fulfillment/transit</span>
        </div>

        {/* In-Transit Shipments */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">In Transit</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-blue-900">{inTransitOrders.length}</p>
          <span className="text-[10px] text-blue-600 font-medium">En route to depot</span>
        </div>

        {/* Completed Orders */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Completed Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-stone-900">{completedOrders.length}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Successfully delivered</span>
        </div>

        {/* Active Price Negotiations */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Active Offers</span>
            <Scale className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-purple-900">{pendingNegotiations.length}</p>
          <span className="text-[10px] text-stone-400 font-medium">Price proposals</span>
        </div>

        {/* Total Spending */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Total Procured</span>
            <CreditCard className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-800 truncate">
            KES {(totalSpent ?? 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Direct wholesale</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Orders & Featured Produce */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders List */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-stone-900">Your Recent Produce Orders</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('orders')}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>All Orders ({myOrders.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {recentOrders.length === 0 ? (
                <div className="py-10 text-center text-xs text-stone-400">
                  No orders placed yet. Explore fresh harvests from direct farmers.
                </div>
              ) : (
                recentOrders.map((ord) => (
                  <div key={ord.id} className="p-4 sm:p-5 hover:bg-stone-50/70 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={ord.produceImage}
                          alt={ord.produceName}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-900">{ord.id}</span>
                            <span className="text-xs text-stone-600">• {ord.produceName}</span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Farmer: <b>{ord.farmerName}</b> • {ord.quantity} {ord.unit}
                          </p>
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            Destination: {ord.deliveryLocation}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                        <span className="text-xs font-extrabold text-stone-900">
                          KES {(ord.totalAmount ?? 0).toLocaleString()}
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'In Transit'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status}
                          </span>

                          {/* Quick delivery confirmation for buyer */}
                          {ord.status === 'In Transit' && (
                            <button
                              type="button"
                              onClick={() => confirmDeliveryBuyer(ord.id)}
                              className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs"
                            >
                              Confirm Received
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fresh Picks from Farmers */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm font-bold text-stone-900">Featured Farm Harvests</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('browse')}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>Browse Full Catalogue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featuredProduce.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduce(p)}
                  className="rounded-2xl border border-stone-200 p-3 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative rounded-xl overflow-hidden aspect-video mb-2.5">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs">
                        {p.category}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-stone-900 line-clamp-1">{p.name}</h3>
                    <p className="text-[10px] text-stone-500 mt-0.5">By {p.farmerName} • {p.county}</p>
                    <p className="text-xs font-black text-emerald-800 mt-2">
                      KES {(p.pricePerUnit ?? 0).toLocaleString()} / {p.unit}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                    <span>{p.quantity} {p.unit} left</span>
                    <span className="text-emerald-700 font-semibold">View Details →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Negotiations & Escrow Protection info */}
        <div className="space-y-6">
          {/* Active Offers & Negotiations Widget */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-stone-900">Price Negotiations</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {myNegotiations.length} total
              </span>
            </div>

            <div className="space-y-2.5">
              {myNegotiations.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6">
                  No active negotiations. Click "Make Offer" on any crop listing to propose your price.
                </p>
              ) : (
                myNegotiations.map((neg) => (
                  <div
                    key={neg.id}
                    onClick={() => setActiveNegotiation(neg)}
                    className="p-3 rounded-2xl bg-stone-50 hover:bg-amber-50/60 cursor-pointer border border-stone-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-900">{neg.produceName}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          neg.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : neg.status === 'countered'
                            ? 'bg-amber-200 text-amber-900 font-extrabold'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {neg.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      Offer: <b>{neg.desiredQuantity} {neg.unit}</b> @ KES {(neg.proposedPrice ?? 0).toLocaleString()}/{neg.unit}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-1">Farmer: {neg.farmerName}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Direct Escrow Protection Card */}
          <div className="p-5 rounded-3xl bg-emerald-900 text-white space-y-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <h3 className="text-xs font-bold">100% Escrow Guarantee</h3>
            </div>
            <p className="text-[11px] text-emerald-100 leading-relaxed">
              When ordering on Farm Produce Market, your funds are safely locked in platform escrow. We only disburse payment to the farmer once you receive and inspect your produce.
            </p>
            <div className="pt-1 flex items-center justify-between text-[10px] text-emerald-200 border-t border-emerald-800/80">
              <span>Verified Scale Weights</span>
              <span>Dispute Mediation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Negotiation Modal */}
      {activeNegotiation && (
        <NegotiationModal
          isOpen={true}
          onClose={() => setActiveNegotiation(null)}
          existingNegotiation={activeNegotiation}
        />
      )}

      {/* Produce Detail Modal */}
      {selectedProduce && (
        <ProduceDetailModal
          isOpen={true}
          onClose={() => setSelectedProduce(null)}
          produce={selectedProduce}
        />
      )}
    </div>
  );
};
