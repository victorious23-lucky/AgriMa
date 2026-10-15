import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Produce, Order, Negotiation } from '../../types';
import {
  Package,
  CheckCircle,
  Clock,
  DollarSign,
  PlusCircle,
  TrendingUp,
  MessageSquare,
  ShoppingBag,
  ArrowRight,
  Scale,
  MapPin,
  Calendar,
  AlertCircle,
  Eye,
  Edit2,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { AddEditProduceModal } from './AddEditProduceModal';
import { NegotiationModal } from '../negotiation/NegotiationModal';

export const FarmerDashboard: React.FC = () => {
  const {
    currentUser,
    produceList,
    orders,
    negotiations,
    messages,
    notifications,
    marketPrices,
    setActiveView,
    markProduceSold,
    updateOrderStatus
  } = useMarketplace();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduce, setEditingProduce] = useState<Produce | null>(null);
  const [activeNegotiation, setActiveNegotiation] = useState<Negotiation | null>(null);

  if (!currentUser) return null;

  // Filter farmer-specific data
  const myProduce = produceList.filter((p) => p.farmerId === currentUser.id);
  const myActiveProduce = myProduce.filter(
    (p) => p.availabilityStatus !== 'Sold' && p.availabilityStatus !== 'Out of Stock'
  );
  const myOrders = orders.filter((o) => o.farmerId === currentUser.id);
  const pendingOrders = myOrders.filter((o) => o.status === 'Pending' || o.status === 'Preparing');
  const completedOrders = myOrders.filter((o) => o.status === 'Completed');
  const totalSalesValue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingNegotiations = negotiations.filter(
    (n) => n.farmerId === currentUser.id && (n.status === 'pending' || n.status === 'countered')
  );

  const recentOrders = myOrders.slice(0, 4);
  const recentProduce = myProduce.slice(0, 4);
  const recentMessages = messages.filter((m) => m.receiverId === currentUser.id).slice(-4).reverse();
  const farmerNotifs = notifications.filter((n) => n.userId === currentUser.id).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/60 uppercase tracking-wide border border-emerald-400/30">
                AgriMa Farmer Portal
              </span>
              {currentUser.isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Producer
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              {currentUser.farmName || 'Highland Organic Farm'} • {currentUser.county} County • {currentUser.location}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-farmer-add-crop"
              type="button"
              onClick={() => {
                setEditingProduce(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 shadow-xs transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>List New Harvest</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('market-prices')}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600/40 hover:bg-emerald-600/60 text-white border border-emerald-400/40 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Check Market Prices</span>
            </button>
          </div>
        </div>
      </div>

      {/* Outstanding Offers Alert Banner */}
      {pendingNegotiations.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">
                You have {pendingNegotiations.length} pending price negotiation offer(s)
              </p>
              <p className="text-[11px] text-amber-800">
                Buyers have proposed custom prices on your harvests. Accept, counter, or decline.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveNegotiation(pendingNegotiations[0])}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs whitespace-nowrap self-start sm:self-auto"
          >
            Review Offer
          </button>
        </div>
      )}

      {/* 5 Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Produce Listings */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Total Listings</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-stone-900">{myProduce.length}</p>
          <span className="text-[10px] text-stone-400 font-medium">All recorded crops</span>
        </div>

        {/* Active Listings */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Active Listings</span>
            <CheckCircle className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-stone-900">{myActiveProduce.length}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Available for orders</span>
        </div>

        {/* Pending Orders */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-900">{pendingOrders.length}</p>
          <span className="text-[10px] text-amber-600 font-medium">Requires fulfillment</span>
        </div>

        {/* Completed Sales */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Completed Sales</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-stone-900">{completedOrders.length}</p>
          <span className="text-[10px] text-stone-400 font-medium">Successfully delivered</span>
        </div>

        {/* Total Sales Value */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold">Total Sales Value</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-800 truncate">
            KES {(totalSalesValue ?? 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Earned directly</span>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Recent Produce Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Orders & Produce */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders Section */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm font-bold text-stone-900">Recent Customer Orders</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('orders')}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {recentOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400">
                  No orders received yet. Active listings will appear to wholesale and retail buyers.
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
                            Buyer: <b>{ord.buyerName}</b> • {ord.quantity} {ord.unit} • {ord.deliveryLocation}
                          </p>
                          <p className="text-[10px] text-stone-400 mt-0.5">Ordered on {ord.orderDate}</p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                        <span className="text-xs font-extrabold text-stone-900">
                          KES {(ord.totalAmount ?? 0).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'In Transit'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.status === 'Preparing'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {ord.status}
                          </span>

                          {/* Quick status stepper for farmer */}
                          {ord.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'Accepted', 'Farmer confirmed order.')}
                              className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"
                            >
                              Accept
                            </button>
                          )}
                          {ord.status === 'Accepted' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'Preparing', 'Harvesting and packing started.')}
                              className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                            >
                              Prepare
                            </button>
                          )}
                          {ord.status === 'Preparing' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'Ready for Collection', 'Bags weighed & ready at collection bay.')}
                              className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-teal-700 text-white hover:bg-teal-800"
                            >
                              Ready
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

          {/* Recent Produce Listings */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm font-bold text-stone-900">Your Harvest Listings</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('my-produce')}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>Manage All Listings ({myProduce.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentProduce.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-xs text-stone-400">
                  You haven't listed any produce yet. Click "List New Harvest" to start selling.
                </div>
              ) : (
                recentProduce.map((p) => {
                  const pName = (p?.name || '').toLowerCase();
                  const benchmark = marketPrices.find(
                    (mp) => {
                      const cName = (mp?.crop || '').toLowerCase();
                      return cName && pName && (cName.includes(pName) || pName.includes(cName));
                    }
                  );

                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-stone-200 p-4 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative rounded-xl overflow-hidden aspect-video mb-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                          <span
                            className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.availabilityStatus === 'In Stock'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-800 text-white'
                            }`}
                          >
                            {p.availabilityStatus}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-xs font-bold text-stone-900 line-clamp-1">{p.name}</h3>
                            <p className="text-[10px] text-stone-500">{p.category} • {p.county}</p>
                          </div>
                          <span className="text-xs font-black text-emerald-800 whitespace-nowrap">
                            KES {(p.pricePerUnit ?? 0).toLocaleString()} / {p.unit}
                          </span>
                        </div>

                        <p className="text-[11px] text-stone-600 mt-2 font-medium">
                          Available: <b>{p.quantity} {p.unit}</b>
                        </p>

                        {/* Benchmark Price comparison badge */}
                        {benchmark && benchmark.averagePrice && (
                          <div className="mt-2 text-[10px] text-stone-500 flex items-center justify-between bg-stone-50 px-2 py-1 rounded-lg">
                            <span>Market Avg: KES {(benchmark.averagePrice ?? 0).toLocaleString()}</span>
                            <span className={`font-bold ${p.pricePerUnit <= benchmark.averagePrice ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {p.pricePerUnit <= benchmark.averagePrice ? 'Competitive' : 'Above Avg'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduce(p);
                            setIsAddModalOpen(true);
                          }}
                          className="flex-1 py-1.5 px-2 text-center text-xs font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200"
                        >
                          Edit
                        </button>
                        {p.availabilityStatus !== 'Sold' && (
                          <button
                            type="button"
                            onClick={() => markProduceSold(p.id)}
                            className="py-1.5 px-2 text-center text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          >
                            Mark Sold
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Messages & Notifications */}
        <div className="space-y-6">
          {/* Notifications Widget */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-stone-900">Notifications</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('notifications')}
                className="text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                All
              </button>
            </div>

            <div className="space-y-2.5">
              {farmerNotifs.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-4">No new notifications</p>
              ) : (
                farmerNotifs.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (notif.type === 'offer') {
                        const targetNeg = negotiations.find((n) => n.id === notif.relatedId);
                        if (targetNeg) setActiveNegotiation(targetNeg);
                      } else if (notif.type === 'order') {
                        setActiveView('orders');
                      }
                    }}
                    className={`p-3 rounded-2xl cursor-pointer transition-colors ${
                      !notif.read ? 'bg-emerald-50/70 border border-emerald-200' : 'bg-stone-50 border border-stone-100'
                    }`}
                  >
                    <p className="text-xs font-bold text-stone-900">{notif.title}</p>
                    <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-2">{notif.message}</p>
                    <span className="text-[9px] text-stone-400 mt-1 block">{notif.createdAt}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Messages Widget */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-stone-900">Buyer Inquiries</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('messages')}
                className="text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                Open Chat
              </button>
            </div>

            <div className="space-y-3">
              {recentMessages.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6">No recent inquiries</p>
              ) : (
                recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setActiveView('messages')}
                    className="p-3 rounded-2xl bg-stone-50 hover:bg-emerald-50/50 cursor-pointer border border-stone-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-900">{msg.senderName}</span>
                      <span className="text-[10px] text-stone-400">{msg.timestamp.split(' ')[1] || msg.timestamp}</span>
                    </div>
                    {msg.produceName && (
                      <span className="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-semibold mb-1">
                        {msg.produceName}
                      </span>
                    )}
                    <p className="text-xs text-stone-600 line-clamp-2">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Produce Modal */}
      <AddEditProduceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduce(null);
        }}
        produceToEdit={editingProduce}
      />

      {/* Negotiation Modal */}
      {activeNegotiation && (
        <NegotiationModal
          isOpen={true}
          onClose={() => setActiveNegotiation(null)}
          existingNegotiation={activeNegotiation}
        />
      )}
    </div>
  );
};
