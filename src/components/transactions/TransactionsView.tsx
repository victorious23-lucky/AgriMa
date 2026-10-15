import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Transaction } from '../../types';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  FileText,
  DollarSign
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const { currentUser, transactions, showToast } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  if (!currentUser) return null;

  // Filter relevant transactions
  const relevantTxs = transactions.filter((t) => {
    if (currentUser.role === 'farmer') return t.farmerId === currentUser.id;
    if (currentUser.role === 'buyer') return t.buyerId === currentUser.id;
    return true; // Admin views all
  });

  const filtered = relevantTxs.filter((tx) => {
    const q = (searchQuery || '').trim().toLowerCase();
    const refCode = tx.referenceCode || (tx as any).referenceNumber || '';
    const matchesSearch =
      !q ||
      (tx.id || '').toLowerCase().includes(q) ||
      (tx.orderId || '').toLowerCase().includes(q) ||
      (refCode || '').toLowerCase().includes(q) ||
      (tx.farmerName || '').toLowerCase().includes(q) ||
      (tx.buyerName || '').toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'all' || tx.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalCompleted = relevantTxs
    .filter((t) => t.status === 'Completed' || t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalEscrowHeld = relevantTxs
    .filter((t) => t.status === 'Held in Escrow' || t.status === 'Pending' || t.status === 'pending')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {currentUser.role === 'farmer'
              ? 'Sales & Financial Settlements'
              : currentUser.role === 'buyer'
              ? 'Procurement Payments & Escrow Ledger'
              : 'Marketplace Financial Audit & Transactions'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time automated escrow settlement log with verifiable M-PESA & Bank transaction references.
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast('Exporting encrypted financial statements to CSV...', 'info')}
          className="px-4 py-2 text-xs font-bold rounded-2xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Statements</span>
        </button>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">
              {currentUser.role === 'farmer' ? 'Settled Earnings' : 'Total Settled Purchases'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-800">
            KES {(totalCompleted ?? 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-stone-400">Funds disbursed successfully</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Funds Held in Secure Escrow</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900">
            KES {(totalEscrowHeld ?? 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-600 font-medium">
            Pending buyer delivery confirmation
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Total Recorded Transactions</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{relevantTxs.length}</p>
          <span className="text-[11px] text-stone-400">All audit trail records</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by transaction ID, order ref, or counterparty..."
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
              <option value="all">All Settlement Statuses</option>
              <option value="Completed">Completed / Disbursed</option>
              <option value="Held in Escrow">Held in Escrow</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="px-5 py-3">Transaction ID / Ref</th>
                <th className="px-5 py-3">Order Code</th>
                <th className="px-5 py-3">
                  {currentUser.role === 'farmer' ? 'Buyer Client' : 'Farmer Producer'}
                </th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Payment Channel</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-stone-400">
                    No transaction entries found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-stone-900">{tx.id}</p>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Ref: {tx.referenceCode || (tx as any).referenceNumber || tx.id}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-stone-700">{tx.orderId}</td>

                    <td className="px-5 py-3.5">
                      <span className="font-medium text-stone-900">
                        {currentUser.role === 'farmer' ? tx.buyerName : tx.farmerName}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-sm font-black text-emerald-800">
                        KES {(tx.amount ?? 0).toLocaleString()}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-700">
                        {tx.paymentMethod}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'Held in Escrow'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-stone-400 text-[11px]">{tx.date}</td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTx(tx)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-stone-900">Official Settlement Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Transaction ID:</span>
                <span className="font-bold text-stone-900">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Bank / M-PESA Ref:</span>
                <span className="font-mono font-bold text-stone-900">{selectedTx.referenceCode || (selectedTx as any).referenceNumber || selectedTx.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Order ID:</span>
                <span className="font-bold text-stone-900">{selectedTx.orderId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Farmer:</span>
                <span className="font-bold text-stone-900">{selectedTx.farmerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Buyer:</span>
                <span className="font-bold text-stone-900">{selectedTx.buyerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Payment Gateway:</span>
                <span className="font-bold text-stone-900">{selectedTx.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Escrow Status:</span>
                <span className="font-bold text-emerald-800">{selectedTx.status}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-black">
                <span className="text-stone-900">Total Settlement:</span>
                <span className="text-emerald-800">KES {(selectedTx.amount ?? 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-black transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
