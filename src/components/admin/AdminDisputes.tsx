import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Dispute } from '../../types';
import {
  AlertTriangle,
  Scale,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export const AdminDisputes: React.FC = () => {
  const { disputes, orders, resolveDispute } = useMarketplace();

  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionAction, setResolutionAction] = useState<
    'Refund Buyer' | 'Release to Farmer' | 'Split Escrow'
  >('Refund Buyer');
  const [resolutionNote, setResolutionNote] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredDisputes = disputes.filter((d) => {
    if (filterStatus === 'all') return true;
    return d.status === filterStatus;
  });

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;

    resolveDispute(selectedDispute.id, resolutionAction, resolutionNote);
    setSelectedDispute(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Trade Disputes & Escrow Mediation
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Independent arbitration portal for produce quality claims, transit damage, and escrow settlement release.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'Open', 'Under Review', 'Resolved'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterStatus === st
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {st === 'all' ? 'All Disputes' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Disputes List Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="px-5 py-3">Dispute ID</th>
                <th className="px-5 py-3">Order Ref</th>
                <th className="px-5 py-3">Raised By</th>
                <th className="px-5 py-3">Reason / Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date Raised</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredDisputes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-stone-400">
                    No trade disputes logged in this view.
                  </td>
                </tr>
              ) : (
                filteredDisputes.map((d) => (
                  <tr key={d.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-stone-900">{d.id}</td>

                    <td className="px-5 py-3.5 font-mono text-stone-700">{d.orderId}</td>

                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-stone-900">{d.raisedByName}</span>
                      <span className="block text-[10px] text-stone-400 capitalize">{d.raisedByRole}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-stone-800">{d.reason}</p>
                      <p className="text-[11px] text-stone-500 line-clamp-1 italic">
                        "{d.description}"
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'Under Review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-stone-400 text-[11px]">{d.createdAt}</td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedDispute(d)}
                        className="px-3 py-1 text-xs font-bold rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200"
                      >
                        {d.status === 'Resolved' ? 'View Resolution' : 'Arbitrate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispute Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900">
                    Dispute Mediation: {selectedDispute.id}
                  </h2>
                  <p className="text-xs text-stone-500">Order Reference: {selectedDispute.orderId}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDispute(null)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Claim Description Box */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-stone-700">
                  <span>Claimant: {selectedDispute.raisedByName} ({selectedDispute.raisedByRole})</span>
                  <span>Reason: {selectedDispute.reason}</span>
                </div>
                <p className="text-stone-800 bg-white p-3 rounded-xl border border-stone-200/80 leading-relaxed italic">
                  "{selectedDispute.description}"
                </p>
                {selectedDispute.evidence && selectedDispute.evidence.length > 0 && (
                  <p className="text-[11px] text-stone-500">
                    <b>Attached Evidence:</b> {selectedDispute.evidence.join(', ')}
                  </p>
                )}
              </div>

              {/* If already resolved */}
              {selectedDispute.status === 'Resolved' ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dispute Successfully Resolved</span>
                  </div>
                  <p>
                    <b>Binding Resolution:</b> {selectedDispute.resolution}
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    <b>Arbitrator Note:</b> {selectedDispute.resolutionNote || 'Settlement executed in accordance with platform trading standards.'}
                  </p>
                </div>
              ) : (
                /* Admin Action Form */
                <form onSubmit={handleResolve} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Binding Administrator Resolution Ruling *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setResolutionAction('Refund Buyer')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          resolutionAction === 'Refund Buyer'
                            ? 'border-red-600 bg-red-50 text-red-900 font-bold'
                            : 'border-stone-200 text-stone-600'
                        }`}
                      >
                        <span className="text-xs block">Refund Buyer</span>
                        <span className="text-[9px] text-stone-400">Cancel payout</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setResolutionAction('Release to Farmer')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          resolutionAction === 'Release to Farmer'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-stone-200 text-stone-600'
                        }`}
                      >
                        <span className="text-xs block">Release Escrow</span>
                        <span className="text-[9px] text-stone-400">Pay producer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setResolutionAction('Split Escrow')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          resolutionAction === 'Split Escrow'
                            ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
                            : 'border-stone-200 text-stone-600'
                        }`}
                      >
                        <span className="text-xs block">50/50 Split</span>
                        <span className="text-[9px] text-stone-400">Compromise</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Mediation Notes & Rationale
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detail inspection report, transit liability finding, or settlement terms..."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-purple-600 focus:bg-white"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setSelectedDispute(null)}
                      className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-xs transition-colors"
                    >
                      Execute Ruling & Release Escrow
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
