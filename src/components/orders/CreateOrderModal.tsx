import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Produce } from '../../types';
import {
  X,
  ShoppingBag,
  ShieldCheck,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Phone
} from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  produce: Produce;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  produce
}) => {
  const { createDirectOrder, currentUser, setActiveView } = useMarketplace();

  const [quantity, setQuantity] = useState<number>(
    produce.minOrderQuantity ? Math.max(produce.minOrderQuantity, 5) : 5
  );
  const [deliveryLocation, setDeliveryLocation] = useState(
    currentUser?.location ? `${currentUser.location}, ${currentUser.county}` : 'Nairobi Wholesale Market, Marikiti'
  );
  const [paymentMethod, setPaymentMethod] = useState<'M-PESA' | 'Bank Transfer / Pesalink' | 'Card'>('M-PESA');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || '+254 712 345 678');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalAmount = quantity * produce.pricePerUnit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (quantity <= 0) {
      setFormError('Quantity must be greater than 0.');
      return;
    }

    if (produce.minOrderQuantity && quantity < produce.minOrderQuantity) {
      setFormError(`Minimum order quantity is ${produce.minOrderQuantity} ${produce.unit}.`);
      return;
    }

    if (quantity > produce.quantity) {
      setFormError(`Only ${produce.quantity} ${produce.unit} available in current harvest.`);
      return;
    }

    if (!deliveryLocation.trim()) {
      setFormError('Please specify the delivery address / collection depot.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      createDirectOrder(produce.id, quantity, deliveryLocation, paymentMethod);
      setIsSubmitting(false);
      onClose();
      setActiveView('orders');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Place Produce Order</h2>
              <p className="text-xs text-stone-500">Secured with Farmer Direct Escrow</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Produce summary card */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
            <img
              src={produce.images[0]}
              alt={produce.name}
              className="w-16 h-16 rounded-xl object-cover border border-stone-200"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-stone-900 truncate">{produce.name}</p>
              <p className="text-[11px] text-stone-500">
                Farmer: <span className="font-semibold text-stone-800">{produce.farmerName}</span>
              </p>
              <p className="text-xs font-black text-emerald-800 mt-0.5">
                KES {(produce.pricePerUnit ?? 0).toLocaleString()} / {produce.unit}
              </p>
              <p className="text-[10px] text-stone-400">
                Location: {produce.location}, {produce.county}
              </p>
            </div>
          </div>

          {/* Quantity selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Order Quantity ({produce.unit}) *
              </label>
              <span className="text-[11px] text-stone-500">
                In Stock: <b>{produce.quantity}</b> {produce.unit}
              </span>
            </div>
            <input
              type="number"
              required
              min={produce.minOrderQuantity || 1}
              max={produce.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white font-bold text-stone-900"
            />
            {produce.minOrderQuantity && (
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Minimum wholesale order: {produce.minOrderQuantity} {produce.unit}
              </span>
            )}
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Delivery Destination / Collection Address *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g. Westlands Commercial Depot, Nairobi"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Payment & Escrow Protection
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('M-PESA')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'M-PESA'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-stone-200 text-stone-600'
                }`}
              >
                <span className="text-xs block">M-PESA Express</span>
                <span className="text-[9px] text-stone-400">STK Push</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer / Pesalink')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'Bank Transfer / Pesalink'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-stone-200 text-stone-600'
                }`}
              >
                <span className="text-xs block">Pesalink / Bank</span>
                <span className="text-[9px] text-stone-400">Direct RTGS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'Card'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-stone-200 text-stone-600'
                }`}
              >
                <span className="text-xs block">Debit / Visa</span>
                <span className="text-[9px] text-stone-400">Instant</span>
              </button>
            </div>
          </div>

          {paymentMethod === 'M-PESA' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                M-PESA Phone Number for Prompt
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Pricing & Escrow Guarantee Box */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Item Subtotal ({quantity} × KES {(produce.pricePerUnit ?? 0).toLocaleString()}):</span>
              <span>KES {(totalAmount ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Platform Escrow Security:</span>
              <span className="text-emerald-700 font-bold">Free (0 KES)</span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900">Total Payable:</span>
              <span className="text-base font-black text-emerald-800">
                KES {(totalAmount ?? 0).toLocaleString()}
              </span>
            </div>

            <div className="pt-2 flex items-start gap-2 text-[11px] text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <span>
                <b>Buyer Protection:</b> Your payment remains safe in Marketplace Escrow. The farmer is only paid after you inspect and confirm delivery.
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-order-payment"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Securing Escrow...' : 'Confirm Order & Pay'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
