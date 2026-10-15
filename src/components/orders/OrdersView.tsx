import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Order, OrderStatus } from '../../types';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  FileText,
  MapPin,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { DisputeModal } from '../disputes/DisputeModal';
import { GoogleMapsViewer, MapLocationMarker } from '../common/GoogleMapsViewer';

const countyCoords: Record<string, { lat: number; lng: number }> = {
  'Kirinyaga': { lat: -0.5, lng: 37.28 },
  'Kiambu': { lat: -1.03, lng: 36.83 },
  'Murang\'a': { lat: -0.72, lng: 37.15 },
  'Nyandarua': { lat: -0.18, lng: 36.52 },
  'Nakuru': { lat: -0.30, lng: 36.08 },
  'Uasin Gishu': { lat: 0.52, lng: 35.27 },
  'Trans Nzoia': { lat: 1.02, lng: 35.01 },
  'Machakos': { lat: -1.52, lng: 37.26 },
  'Mombasa': { lat: -4.04, lng: 39.67 },
  'Kisumu': { lat: -0.10, lng: 34.76 },
  'Nairobi': { lat: -1.29, lng: 36.82 }
};

const ORDER_STATUS_STEPS: OrderStatus[] = [
  'Pending',
  'Accepted',
  'Preparing',
  'Ready for Collection',
  'In Transit',
  'Completed'
];

export const OrdersView: React.FC = () => {
  const {
    currentUser,
    orders,
    updateOrderStatus,
    openChatWithUser,
    confirmDeliveryBuyer
  } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [disputeOrder, setDisputeOrder] = useState<Order | null>(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);

  if (!currentUser) return null;

  // Filter orders relevant to current role
  const relevantOrders = orders.filter((o) => {
    if (currentUser.role === 'farmer') return o.farmerId === currentUser.id;
    if (currentUser.role === 'buyer') return o.buyerId === currentUser.id;
    return true; // Admin views all
  });

  const filteredOrders = relevantOrders.filter((ord) => {
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (ord.id || '').toLowerCase().includes(q) ||
      (ord.produceName || '').toLowerCase().includes(q) ||
      (ord.buyerName || '').toLowerCase().includes(q) ||
      (ord.farmerName || '').toLowerCase().includes(q) ||
      (ord.deliveryLocation || '').toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'all' || ord.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ready for Collection':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Preparing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Accepted':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    return ORDER_STATUS_STEPS.indexOf(status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {currentUser.role === 'farmer'
              ? 'Harvest Orders & Fulfillment'
              : currentUser.role === 'buyer'
              ? 'My Produce Orders & Shipments'
              : 'Marketplace Master Orders Log'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track order lifecycle, update logistics progress, inspect escrow status, and resolve issues.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by order ID, crop, counterparty or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            >
              <option value="all">All Order Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready for Collection">Ready for Collection</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">No matching orders found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {currentUser.role === 'buyer'
              ? 'Browse the produce catalogue to submit an order or make a price offer.'
              : 'New orders placed by buyers will be recorded here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const currentStepIdx = getStepIndex(order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:border-emerald-300 transition-all p-5 space-y-4"
              >
                {/* Header Row: ID, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg">
                      {order.id}
                    </span>
                    <span className="text-xs text-stone-500">
                      Ordered on <b>{order.orderDate}</b>
                    </span>
                    {order.disputeId && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Dispute Open
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Escrow badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        order.paymentStatus === 'Held in Escrow'
                          ? 'bg-amber-100 text-amber-800'
                          : order.paymentStatus === 'Paid to Farmer'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {order.paymentStatus}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Item preview */}
                  <div className="md:col-span-2 flex items-center gap-3">
                    <img
                      src={order.produceImage}
                      alt={order.produceName}
                      className="w-16 h-16 rounded-2xl object-cover border border-stone-200"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">{order.produceName}</h3>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Quantity: <b>{order.quantity} {order.unit}</b> @ KES {((order.pricePerUnit ?? (order as any).unitPrice) ?? 0).toLocaleString()}/{order.unit}
                      </p>
                      <p className="text-xs font-black text-emerald-800 mt-1">
                        Total: KES {(order.totalAmount ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Counterparty & Logistics */}
                  <div className="text-xs text-stone-600 space-y-1">
                    <p className="font-bold text-stone-800">
                      {currentUser.role === 'farmer' ? 'Buyer Details:' : 'Producer Farm:'}
                    </p>
                    <p className="font-medium text-stone-900">
                      {currentUser.role === 'farmer' ? order.buyerName : order.farmerName}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-stone-500">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{order.deliveryLocation}</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-col justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openChatWithUser(
                          currentUser.role === 'farmer' ? order.buyerId : order.farmerId,
                          currentUser.role === 'farmer' ? order.buyerName : order.farmerName,
                          currentUser.role === 'farmer' ? 'buyer' : 'farmer',
                          order.produceName,
                          order.id
                        )
                      }
                      className="w-full py-1.5 px-3 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat Counterparty</span>
                    </button>

                    {/* Live Map Tracking Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTrackingOrder(selectedTrackingOrder?.id === order.id ? null : order)
                      }
                      className="w-full py-1.5 px-3 text-xs font-semibold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedTrackingOrder?.id === order.id ? 'Hide Route Map' : 'Track on Live Map'}</span>
                    </button>

                    {/* Buyer Delivery Confirmation */}
                    {currentUser.role === 'buyer' &&
                      order.status === 'In Transit' && (
                        <button
                          type="button"
                          onClick={() => confirmDeliveryBuyer(order.id)}
                          className="w-full py-1.5 px-3 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Received & Release Escrow</span>
                        </button>
                      )}

                    {/* Open Dispute Button */}
                    {!order.disputeId && order.status !== 'Completed' && (
                      <button
                        type="button"
                        onClick={() => setDisputeOrder(order)}
                        className="text-[11px] text-red-600 hover:underline text-center"
                      >
                        Report an Issue / Dispute
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Timeline Stepper */}
                {order.status !== 'Cancelled' && (
                  <div className="pt-2">
                    <div className="relative flex items-center justify-between">
                      {ORDER_STATUS_STEPS.map((step, idx) => {
                        const isPast = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={step} className="flex-1 flex flex-col items-center relative">
                            {idx !== 0 && (
                              <div
                                className={`absolute left-0 right-1/2 top-3 -translate-y-1/2 h-0.5 -z-10 ${
                                  idx <= currentStepIdx ? 'bg-emerald-600' : 'bg-stone-200'
                                }`}
                              />
                            )}
                            {idx !== ORDER_STATUS_STEPS.length - 1 && (
                              <div
                                className={`absolute left-1/2 right-0 top-3 -translate-y-1/2 h-0.5 -z-10 ${
                                  idx < currentStepIdx ? 'bg-emerald-600' : 'bg-stone-200'
                                }`}
                              />
                            )}

                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                isPast
                                  ? 'bg-emerald-600 text-white'
                                  : isCurrent
                                  ? 'bg-emerald-700 text-white ring-4 ring-emerald-100'
                                  : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              {isPast ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-[9px] mt-1 text-center font-medium truncate max-w-[60px] sm:max-w-none ${
                                isCurrent
                                  ? 'text-emerald-900 font-bold'
                                  : isPast
                                  ? 'text-stone-700'
                                  : 'text-stone-400'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Farmer Status Control Bar */}
                {currentUser.role === 'farmer' && order.status !== 'Completed' && order.status !== 'Cancelled' && (
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 bg-stone-50/50 p-2.5 rounded-2xl">
                    <span className="text-xs font-semibold text-stone-700">
                      Update Fulfillment Status:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {order.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'Accepted', 'Order confirmed by farmer.')}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"
                        >
                          Accept Order
                        </button>
                      )}
                      {order.status === 'Accepted' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'Preparing', 'Produce is being harvested and cleaned.')}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                        >
                          Mark as Preparing
                        </button>
                      )}
                      {order.status === 'Preparing' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'Ready for Collection', 'Produce packed and ready for pickup.')}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-700 text-white hover:bg-teal-800"
                        >
                          Ready for Collection
                        </button>
                      )}
                      {(order.status === 'Ready for Collection' || order.status === 'Preparing') && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'In Transit', 'Produce dispatched in transit truck.')}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch In Transit</span>
                        </button>
                      )}
                      {order.status === 'In Transit' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'Completed', 'Delivery confirmed and completed.')}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Expandable Live Google Map Transit Route */}
                {selectedTrackingOrder?.id === order.id && (() => {
                  const farmCoord = countyCoords[order.county] || { lat: -0.5, lng: 37.28 };
                  const originLat = order.farmLatitude ?? farmCoord.lat;
                  const originLng = order.farmLongitude ?? farmCoord.lng;

                  const deliveryCoord = countyCoords['Nairobi'] || { lat: -1.29, lng: 36.82 };
                  const destLat = order.deliveryLatitude ?? deliveryCoord.lat;
                  const destLng = order.deliveryLongitude ?? deliveryCoord.lng;

                  const markers: MapLocationMarker[] = [
                    {
                      id: `farm-${order.id}`,
                      title: `Farm: ${order.farmerName}`,
                      subtitle: `${order.county} Origin`,
                      latitude: originLat,
                      longitude: originLng,
                      type: 'farm'
                    },
                    {
                      id: `buyer-${order.id}`,
                      title: `Delivery: ${order.buyerName}`,
                      subtitle: order.deliveryLocation,
                      latitude: destLat,
                      longitude: destLng,
                      type: 'buyer'
                    }
                  ];

                  const route = {
                    origin: { latitude: originLat, longitude: originLng, label: `${order.county} Farm` },
                    destination: { latitude: destLat, longitude: destLng, label: order.deliveryLocation }
                  };

                  return (
                    <div className="pt-3 border-t border-stone-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-emerald-600" />
                          Live Transit Route & Geolocation Tracking
                        </span>
                        <span className="text-xs text-stone-500">
                          Current Status: <b className="text-emerald-700">{order.status}</b>
                        </span>
                      </div>
                      <GoogleMapsViewer
                        markers={markers}
                        route={route}
                        center={{
                          latitude: (originLat + destLat) / 2,
                          longitude: (originLng + destLng) / 2
                        }}
                        zoom={8}
                        height="320px"
                      />
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}

      {/* Dispute Modal */}
      {disputeOrder && (
        <DisputeModal
          isOpen={true}
          onClose={() => setDisputeOrder(null)}
          order={disputeOrder}
        />
      )}
    </div>
  );
};
