import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Produce, ProduceCategory } from '../../types';
import { PRODUCE_CATEGORIES } from '../../data/mockData';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  MessageSquare,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import { AddEditProduceModal } from './AddEditProduceModal';

interface MyProduceProps {
  initialOpenAdd?: boolean;
}

export const MyProduce: React.FC<MyProduceProps> = ({ initialOpenAdd = false }) => {
  const {
    currentUser,
    produceList,
    deleteProduce,
    markProduceSold,
    updateProduce,
    marketPrices,
    setActiveView
  } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenAdd);
  const [editingProduce, setEditingProduce] = useState<Produce | null>(null);

  // Quick Inline Price/Quantity update state
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newQty, setNewQty] = useState<number>(0);

  if (!currentUser) return null;

  const myProduce = produceList.filter((p) => p.farmerId === currentUser.id);

  const filteredProduce = myProduce.filter((item) => {
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (item.name || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesAvailability = selectedAvailability === 'all' || item.availabilityStatus === selectedAvailability;

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const handleStartInlineEdit = (p: Produce) => {
    setInlineEditId(p.id);
    setNewPrice(p.pricePerUnit);
    setNewQty(p.quantity);
  };

  const handleSaveInlineEdit = (id: string) => {
    updateProduce(id, {
      pricePerUnit: Number(newPrice),
      quantity: Number(newQty),
      availabilityStatus: Number(newQty) === 0 ? 'Out of Stock' : (Number(newQty) < 10 ? 'Low Stock' : 'In Stock')
    });
    setInlineEditId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            My Produce Listings
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your agricultural harvests, update stocks, adjust prices, and track buyer inquiries.
          </p>
        </div>

        <button
          id="btn-add-produce-header"
          type="button"
          onClick={() => {
            setEditingProduce(null);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Produce</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search bar */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by crop, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            >
              <option value="all">All Crop Categories</option>
              {PRODUCE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            >
              <option value="all">All Availability Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Produce Cards Grid */}
      {filteredProduce.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">No produce listings found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filters, or add a fresh crop listing to get started.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingProduce(null);
              setIsAddModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800"
          >
            Create Produce Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProduce.map((produce) => {
            const pName = (produce?.name || '').toLowerCase();
            const benchmark = marketPrices.find((mp) => {
              const cName = (mp?.crop || '').toLowerCase();
              return cName && pName && (cName.includes(pName) || pName.includes(cName));
            });

            const isInline = inlineEditId === produce.id;

            return (
              <div
                key={produce.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative aspect-video overflow-hidden group">
                    <img
                      src={produce.images[0]}
                      alt={produce.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                          produce.availabilityStatus === 'In Stock'
                            ? 'bg-emerald-600 text-white'
                            : produce.availabilityStatus === 'Low Stock'
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-800 text-white'
                        }`}
                      >
                        {produce.availabilityStatus}
                      </span>
                    </div>

                    {produce.images.length > 1 && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                        +{produce.images.length - 1} more photo(s)
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {produce.category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-stone-400">
                          <Eye className="w-3 h-3" />
                          <span>{produce.views || 140} views</span>
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 mt-1.5">{produce.name}</h3>
                    </div>

                    {/* Pricing & Quantity Display / Inline Editor */}
                    {isInline ? (
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-stone-600">
                              Price (KES / {produce.unit})
                            </label>
                            <input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(Number(e.target.value))}
                              className="w-full px-2 py-1 text-xs bg-white border border-stone-300 rounded-lg font-bold text-emerald-800"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-stone-600">
                              Available Qty ({produce.unit})
                            </label>
                            <input
                              type="number"
                              value={newQty}
                              onChange={(e) => setNewQty(Number(e.target.value))}
                              className="w-full px-2 py-1 text-xs bg-white border border-stone-300 rounded-lg font-medium"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setInlineEditId(null)}
                            className="px-2.5 py-1 text-[11px] text-stone-600 hover:bg-stone-200 rounded-md"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveInlineEdit(produce.id)}
                            className="px-3 py-1 text-[11px] font-bold bg-emerald-700 text-white rounded-md hover:bg-emerald-800"
                          >
                            Save Quick Update
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-base font-black text-emerald-800">
                            KES {(produce.pricePerUnit ?? 0).toLocaleString()}
                          </span>
                          <span className="text-xs text-stone-500 font-medium"> / {produce.unit}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-stone-800">
                            {produce.quantity} {produce.unit}
                          </p>
                          <span className="text-[10px] text-stone-400">Available Stock</span>
                        </div>
                      </div>
                    )}

                    {/* Market Price Benchmark Comparison */}
                    {benchmark && benchmark.averagePrice && (
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] flex items-center justify-between">
                        <span className="text-stone-500">
                          Ref: KES {(benchmark.averagePrice ?? 0).toLocaleString()} / {benchmark.unit}
                        </span>
                        <span
                          className={`font-bold ${
                            produce.pricePerUnit <= benchmark.averagePrice
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {produce.pricePerUnit <= benchmark.averagePrice
                            ? `✓ ${Math.round(((benchmark.averagePrice - produce.pricePerUnit) / benchmark.averagePrice) * 100)}% Below Market`
                            : `+${Math.round(((produce.pricePerUnit - benchmark.averagePrice) / benchmark.averagePrice) * 100)}% Above Market`}
                        </span>
                      </div>
                    )}

                    {/* Metadata: Location, Date, Inquiries */}
                    <div className="text-[11px] text-stone-500 space-y-1 pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        <span className="truncate">{produce.location}, {produce.county}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        <span>Harvested: {produce.harvestDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="text-emerald-700 font-semibold">
                          {produce.inquiriesCount} buyer inquiries received
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartInlineEdit(produce)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
                      title="Quick edit price and quantity"
                    >
                      Update Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduce(produce);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-stone-200 rounded-lg transition-colors"
                      title="Full edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduce(produce.id)}
                      className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {produce.availabilityStatus !== 'Sold' && (
                    <button
                      type="button"
                      onClick={() => markProduceSold(produce.id)}
                      className="px-3 py-1 text-[11px] font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
                    >
                      Mark as Sold
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddEditProduceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduce(null);
        }}
        produceToEdit={editingProduce}
      />
    </div>
  );
};
