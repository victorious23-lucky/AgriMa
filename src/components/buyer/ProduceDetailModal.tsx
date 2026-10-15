import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Produce } from '../../types';
import {
  X,
  MapPin,
  Calendar,
  ShieldCheck,
  Package,
  TrendingUp,
  MessageSquare,
  Scale,
  ShoppingBag,
  Eye,
  CheckCircle2,
  Info
} from 'lucide-react';
import { CreateOrderModal } from '../orders/CreateOrderModal';
import { NegotiationModal } from '../negotiation/NegotiationModal';

interface ProduceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  produce: Produce | null;
}

export const ProduceDetailModal: React.FC<ProduceDetailModalProps> = ({
  isOpen,
  onClose,
  produce
}) => {
  const { currentUser, marketPrices, openChatWithUser } = useMarketplace();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  if (!isOpen || !produce) return null;

  const pName = (produce.name || '').toLowerCase();
  const benchmark = marketPrices.find((mp) => {
    const cName = (mp?.crop || '').toLowerCase();
    return cName && pName && (cName.includes(pName) || pName.includes(cName));
  });

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                {produce.category}
              </span>
              <span className="text-xs text-stone-500">• {produce.county} County</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-stone-200 bg-stone-100">
                <img
                  src={produce.images[activeImageIndex] || produce.images[0]}
                  alt={produce.name}
                  className="w-full h-full object-cover"
                />
                <span
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-xs ${
                    produce.availabilityStatus === 'In Stock'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-800 text-white'
                  }`}
                >
                  {produce.availabilityStatus}
                </span>
              </div>

              {/* Thumbnails */}
              {produce.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {produce.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        activeImageIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-stone-200'
                      }`}
                    >
                      <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title, Pricing & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-stone-900">{produce.name}</h1>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {produce.location}, {produce.county}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    Harvested: {produce.harvestDate}
                  </span>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-2xl font-black text-emerald-800">
                  KES {(produce.pricePerUnit ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-stone-500">per {produce.unit}</p>
              </div>
            </div>

            {/* Market Price Benchmark Helper */}
            {benchmark && benchmark.averagePrice && (
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      National Market Benchmark: KES {(benchmark.averagePrice ?? 0).toLocaleString()} / {benchmark.unit}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      County range: KES {(benchmark.minPrice ?? 0).toLocaleString()} - KES {(benchmark.maxPrice ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap self-start sm:self-auto ${
                    produce.pricePerUnit <= (benchmark.averagePrice ?? 0)
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {produce.pricePerUnit <= benchmark.averagePrice
                    ? `✓ ${Math.round(((benchmark.averagePrice - produce.pricePerUnit) / benchmark.averagePrice) * 100)}% Under Market Avg`
                    : `+${Math.round(((produce.pricePerUnit - benchmark.averagePrice) / benchmark.averagePrice) * 100)}% Above Average`}
                </span>
              </div>
            )}

            {/* Produce Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Available Stock</span>
                <p className="text-xs font-bold text-stone-900 mt-0.5">
                  {produce.quantity} {produce.unit}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Min Order</span>
                <p className="text-xs font-bold text-stone-900 mt-0.5">
                  {produce.minOrderQuantity || 1} {produce.unit}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Farmer Status</span>
                <p className="text-xs font-bold text-emerald-800 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Buyer Inquiries</span>
                <p className="text-xs font-bold text-stone-900 mt-0.5">
                  {produce.inquiriesCount} received
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-stone-900 mb-1.5">Harvest Quality & Details</h3>
              <p className="text-xs text-stone-600 leading-relaxed bg-stone-50/50 p-3.5 rounded-2xl border border-stone-100">
                {produce.description || 'Graded fresh produce directly harvested from local acreage. Inspected for moisture and packaging integrity.'}
              </p>
            </div>

            {/* Farmer Profile Card */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                  {produce.farmerName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-stone-900">{produce.farmerName}</p>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Producer • {produce.county} County • Direct Farm Seller
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  openChatWithUser(
                    produce.farmerId,
                    produce.farmerName,
                    'farmer',
                    produce.name
                  );
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                <span>Chat Farmer</span>
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
            <div className="hidden sm:block text-xs text-stone-500">
              Total for min order: <b>KES {((produce.minOrderQuantity || 1) * (produce.pricePerUnit || 0)).toLocaleString()}</b>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <Scale className="w-4 h-4 text-amber-700" />
                <span>Make Price Offer</span>
              </button>

              <button
                id="btn-produce-buy-now"
                type="button"
                onClick={() => setIsOrderModalOpen(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Order Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Order Modal */}
      {isOrderModalOpen && (
        <CreateOrderModal
          isOpen={true}
          onClose={() => setIsOrderModalOpen(false)}
          produce={produce}
        />
      )}

      {/* Price Negotiation Modal */}
      {isOfferModalOpen && (
        <NegotiationModal
          isOpen={true}
          onClose={() => setIsOfferModalOpen(false)}
          produce={produce}
        />
      )}
    </>
  );
};
