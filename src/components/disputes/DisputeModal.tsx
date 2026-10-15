import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Order, DisputeReason } from '../../types';
import { AlertTriangle, X, Send, ShieldAlert, AlertCircle } from 'lucide-react';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const DISPUTE_REASONS: DisputeReason[] = [
  'Produce quality mismatch',
  'Damaged in transit',
  'Quantity shortfall',
  'Late delivery',
  'Non-delivery',
  'Payment issue',
  'Other'
];

export const DisputeModal: React.FC<DisputeModalProps> = ({ isOpen, onClose, order }) => {
  const { createDispute, currentUser } = useMarketplace();

  const [reason, setReason] = useState<DisputeReason>('Produce quality mismatch');
  const [description, setDescription] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!description.trim() || description.length < 15) {
      setFormError('Please provide a detailed explanation of the issue (at least 15 characters).');
      return;
    }

    createDispute(
      order.id,
      reason,
      description,
      evidenceNote ? [evidenceNote] : []
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Open Order Dispute</h2>
              <p className="text-xs text-stone-500">Order: {order.id} • {order.produceName}</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-red-50 rounded-2xl border border-red-100 text-xs text-red-900">
            Escrow funds for this order will be placed on hold until both parties and a marketplace administrator review the claim.
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Reason for Dispute *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as DisputeReason)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-red-600 focus:bg-white"
            >
              {DISPUTE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Detailed Description of Issue *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe the discrepancy, inspection findings upon arrival, or missing items..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-red-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Evidence Reference / Photo URL (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Photo link or weighbridge receipt reference"
              value={evidenceNote}
              onChange={(e) => setEvidenceNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-red-600 focus:bg-white"
            />
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
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Submit Dispute</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
