import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Produce, Negotiation } from '../../types';
import {
  X,
  Scale,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  Send,
  AlertCircle
} from 'lucide-react';

interface NegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  produce?: Produce | null;
  existingNegotiation?: Negotiation | null;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({
  isOpen,
  onClose,
  produce,
  existingNegotiation
}) => {
  const {
    currentUser,
    createNegotiation,
    farmerCounterOffer,
    acceptOffer,
    rejectOffer,
    setActiveView
  } = useMarketplace();

  // Buyer initiation state
  const [desiredQty, setDesiredQty] = useState<number>(
    existingNegotiation?.desiredQuantity || (produce ? Math.min(10, produce.quantity) : 10)
  );
  const [proposedPrice, setProposedPrice] = useState<number>(
    existingNegotiation?.proposedPrice || (produce ? Math.round(produce.pricePerUnit * 0.9) : 1000)
  );
  const [offerMessage, setOfferMessage] = useState('');

  // Farmer counter state
  const [isCountering, setIsCountering] = useState(false);
  const [counterPrice, setCounterPrice] = useState<number>(
    existingNegotiation?.proposedPrice ? Math.round(existingNegotiation.proposedPrice * 1.05) : 1000
  );
  const [counterQty, setCounterQty] = useState<number>(
    existingNegotiation?.desiredQuantity || 10
  );
  const [counterMessage, setCounterMessage] = useState('');

  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const activeProduce = produce || null;
  const neg = existingNegotiation;

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduce) return;
    setFormError('');

    if (desiredQty <= 0) {
      setFormError('Desired quantity must be greater than 0.');
      return;
    }

    if (proposedPrice <= 0) {
      setFormError('Proposed price must be greater than 0.');
      return;
    }

    const created = createNegotiation(activeProduce.id, desiredQty, proposedPrice, offerMessage);
    if (created) {
      onClose();
    }
  };

  const handleFarmerCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!neg) return;
    setFormError('');

    if (counterPrice <= 0) {
      setFormError('Counter price must be greater than 0.');
      return;
    }

    farmerCounterOffer(neg.id, counterPrice, counterQty, counterMessage);
    onClose();
  };

  const handleAccept = () => {
    if (!neg) return;
    acceptOffer(neg.id);
    onClose();
    setActiveView('orders');
  };

  const handleReject = () => {
    if (!neg) return;
    rejectOffer(neg.id, 'Declined due to pricing or volume constraints.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {neg ? 'Price Negotiation Thread' : 'Make a Fair Price Offer'}
              </h2>
              <p className="text-xs text-stone-500">
                Direct producer-to-buyer negotiation channel
              </p>
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

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {/* Target Produce Card Summary */}
          {(activeProduce || neg) && (
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
              <img
                src={activeProduce?.images[0] || neg?.produceImage}
                alt="Produce"
                className="w-14 h-14 rounded-xl object-cover border border-stone-200"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-stone-900 truncate">
                  {activeProduce?.name || neg?.produceName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-stone-500">
                    Listing Price: <b>KES {(activeProduce?.pricePerUnit || neg?.originalPrice || 0).toLocaleString()}</b> / {activeProduce?.unit || neg?.unit}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-700 font-medium">
                  Producer: {activeProduce?.farmerName || neg?.farmerName}
                </p>
              </div>
            </div>
          )}

          {/* If existing negotiation: show audit timeline */}
          {neg && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-stone-800">Negotiation History</p>
              <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-stone-50 rounded-2xl border border-stone-200">
                {neg.history.map((h, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-xs ${
                      h.senderRole === 'farmer'
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-amber-50 border border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span className={h.senderRole === 'farmer' ? 'text-emerald-900' : 'text-amber-900'}>
                        {h.senderName} ({(h.senderRole || '').toUpperCase()})
                      </span>
                      <span className="text-[10px] text-stone-400">{h.timestamp}</span>
                    </div>
                    <p className="font-bold text-stone-900">
                      Proposed: {h.quantity} {neg.unit} @ KES {(h.price ?? 0).toLocaleString()}/{neg.unit}
                    </p>
                    {h.message && (
                      <p className="text-stone-600 mt-1 italic">"{h.message}"</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-100 text-xs">
                <span className="font-medium text-stone-600">Current Thread Status:</span>
                <span className="font-bold uppercase px-2.5 py-0.5 rounded-full bg-stone-800 text-white text-[10px]">
                  {neg.status}
                </span>
              </div>
            </div>
          )}

          {/* BUYER VIEW: Submitting New Offer */}
          {!neg && activeProduce && (
            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Desired Quantity ({activeProduce.unit}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={activeProduce.quantity}
                    value={desiredQty}
                    onChange={(e) => setDesiredQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-600 focus:bg-white font-medium"
                  />
                  <span className="text-[10px] text-stone-400">
                    Max: {activeProduce.quantity} {activeProduce.unit}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Proposed Price (KES / {activeProduce.unit}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-600 focus:bg-white font-bold text-amber-800"
                  />
                  <span className="text-[10px] text-stone-400">
                    Asking: KES {(activeProduce.pricePerUnit ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Total Calculation & Potential Savings */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <p className="text-amber-900 font-bold">Total Offer Value:</p>
                  <p className="text-[11px] text-stone-500">
                    {desiredQty} × KES {(proposedPrice ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-900">
                    KES {(desiredQty * proposedPrice).toLocaleString()}
                  </p>
                  {proposedPrice < activeProduce.pricePerUnit && (
                    <p className="text-[10px] text-emerald-700 font-semibold">
                      Savings: KES {((activeProduce.pricePerUnit - proposedPrice) * desiredQty).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Message / Context for Farmer (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Can collect today with our own pickup truck; interested in recurring weekly supply..."
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Submit Offer</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* FARMER / BUYER ACTION BAR (For Existing Thread) */}
          {neg && neg.status !== 'accepted' && neg.status !== 'rejected' && (
            <div className="space-y-3 pt-2 border-t border-stone-100">
              {currentUser?.role === 'farmer' && !isCountering && (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept Offer
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCountering(true)}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Scale className="w-4 h-4" />
                    Counter Offer
                  </button>

                  <button
                    type="button"
                    onClick={handleReject}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-700 border border-stone-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              )}

              {/* Farmer Counter Form */}
              {isCountering && (
                <form onSubmit={handleFarmerCounter} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <p className="text-xs font-bold text-stone-800">Your Counter-Offer Terms</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Counter Price (KES / {neg.unit})
                      </label>
                      <input
                        type="number"
                        required
                        value={counterPrice}
                        onChange={(e) => setCounterPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-xl font-bold text-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Counter Quantity ({neg.unit})
                      </label>
                      <input
                        type="number"
                        required
                        value={counterQty}
                        onChange={(e) => setCounterQty(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-xl font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Note to Buyer
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Can meet in the middle if collected by Friday..."
                      value={counterMessage}
                      onChange={(e) => setCounterMessage(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCountering(false)}
                      className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-200 rounded-lg"
                    >
                      Cancel Counter
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                    >
                      Send Counter-Offer
                    </button>
                  </div>
                </form>
              )}

              {/* Buyer Acceptance of Farmer Counter */}
              {currentUser?.role === 'buyer' && neg.status === 'countered' && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-900">Farmer sent a counter-offer!</p>
                    <p className="text-[11px] text-amber-700">
                      {neg.counterQuantity} {neg.unit} @ KES {(neg.counterPrice ?? 0).toLocaleString()}/{neg.unit}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAccept}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800"
                    >
                      Accept & Create Order
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-stone-600 border border-stone-300"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* If already accepted */}
          {neg && neg.status === 'accepted' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-emerald-900">Offer Accepted & Order Generated!</p>
              <p className="text-[11px] text-emerald-700 mt-1">
                You can now track harvesting, packaging, transit, and escrow payout in the Orders module.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveView('orders');
                }}
                className="mt-3 px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800"
              >
                Go to Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
