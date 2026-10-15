import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Produce, ProduceCategory } from '../../types';
import { COUNTIES, PRODUCE_CATEGORIES } from '../../data/mockData';
import { X, Upload, Plus, Trash2, Sprout, AlertCircle, MapPin } from 'lucide-react';
import { GoogleMapsViewer } from '../common/GoogleMapsViewer';

const countyDefaultCoords: Record<string, { lat: number; lng: number }> = {
  'Nakuru': { lat: -0.30, lng: 36.08 },
  'Kirinyaga': { lat: -0.5, lng: 37.28 },
  'Kiambu': { lat: -1.03, lng: 36.83 },
  'Murang\'a': { lat: -0.72, lng: 37.15 },
  'Nyandarua': { lat: -0.18, lng: 36.52 },
  'Uasin Gishu': { lat: 0.52, lng: 35.27 },
  'Trans Nzoia': { lat: 1.02, lng: 35.01 },
  'Machakos': { lat: -1.52, lng: 37.26 },
  'Meru': { lat: 0.05, lng: 37.65 },
  'Nyeri': { lat: -0.42, lng: 36.95 },
  'Mombasa': { lat: -4.04, lng: 39.67 },
  'Nairobi': { lat: -1.29, lng: 36.82 }
};

interface AddEditProduceModalProps {
  isOpen: boolean;
  onClose: () => void;
  produceToEdit?: Produce | null;
}

const PRESET_IMAGE_OPTIONS = [
  { name: 'Maize Grain', url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80' },
  { name: 'Potatoes', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80' },
  { name: 'Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80' },
  { name: 'Onions', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80' },
  { name: 'Cabbage', url: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800&auto=format&fit=crop&q=80' },
  { name: 'Beans', url: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=800&auto=format&fit=crop&q=80' },
  { name: 'Carrots', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop&q=80' },
  { name: 'Avocados', url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop&q=80' }
];

export const AddEditProduceModal: React.FC<AddEditProduceModalProps> = ({
  isOpen,
  onClose,
  produceToEdit
}) => {
  const { addProduce, updateProduce, currentUser, marketPrices } = useMarketplace();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProduceCategory>('Vegetables');
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState('bags (50kg)');
  const [pricePerUnit, setPricePerUnit] = useState<number>(2500);
  const [location, setLocation] = useState('');
  const [county, setCounty] = useState('Nakuru');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [availabilityStatus, setAvailabilityStatus] = useState<Produce['availabilityStatus']>('In Stock');
  const [description, setDescription] = useState('');
  const [minOrderQuantity, setMinOrderQuantity] = useState<number>(2);
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    if (produceToEdit) {
      setName(produceToEdit.name);
      setCategory(produceToEdit.category);
      setQuantity(produceToEdit.quantity);
      setUnit(produceToEdit.unit);
      setPricePerUnit(produceToEdit.pricePerUnit);
      setLocation(produceToEdit.location);
      setCounty(produceToEdit.county);
      setLatitude(produceToEdit.latitude ?? countyDefaultCoords[produceToEdit.county]?.lat);
      setLongitude(produceToEdit.longitude ?? countyDefaultCoords[produceToEdit.county]?.lng);
      setHarvestDate(produceToEdit.harvestDate);
      setAvailabilityStatus(produceToEdit.availabilityStatus);
      setDescription(produceToEdit.description);
      setMinOrderQuantity(produceToEdit.minOrderQuantity || 1);
      setImages(produceToEdit.images || []);
    } else {
      setName('');
      setCategory('Vegetables');
      setQuantity(50);
      setUnit('bags (50kg)');
      setPricePerUnit(2500);
      const defaultCounty = currentUser?.county || 'Nakuru';
      setLocation(currentUser?.location || 'Farm Depot');
      setCounty(defaultCounty);
      setLatitude(countyDefaultCoords[defaultCounty]?.lat ?? -0.3);
      setLongitude(countyDefaultCoords[defaultCounty]?.lng ?? 36.08);
      setHarvestDate(new Date().toISOString().split('T')[0]);
      setAvailabilityStatus('In Stock');
      setDescription('');
      setMinOrderQuantity(2);
      setImages([PRESET_IMAGE_OPTIONS[2].url]);
    }
  }, [produceToEdit, currentUser, isOpen]);

  if (!isOpen) return null;

  // Find related market price benchmark for comparison
  const normalizedName = (name || '').trim().toLowerCase();
  const relatedBenchmark = normalizedName
    ? marketPrices.find((mp) => {
        const cName = (mp?.crop || '').toLowerCase();
        return cName && (cName.includes(normalizedName) || normalizedName.includes(cName));
      })
    : null;

  const handleAddImage = (url: string) => {
    if (url && !images.includes(url)) {
      setImages([...images, url]);
      setCustomImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter the produce name / crop type.');
      return;
    }

    if (quantity <= 0) {
      setFormError('Quantity must be greater than 0.');
      return;
    }

    if (pricePerUnit <= 0) {
      setFormError('Price per unit must be greater than 0.');
      return;
    }

    if (images.length === 0) {
      setFormError('Please select or upload at least one produce image.');
      return;
    }

    if (produceToEdit) {
      updateProduce(produceToEdit.id, {
        name,
        category,
        quantity: Number(quantity),
        unit,
        pricePerUnit: Number(pricePerUnit),
        location,
        county,
        latitude,
        longitude,
        harvestDate,
        availabilityStatus,
        description,
        minOrderQuantity: Number(minOrderQuantity),
        images
      });
    } else {
      addProduce({
        name,
        category,
        quantity: Number(quantity),
        unit,
        pricePerUnit: Number(pricePerUnit),
        location,
        county,
        latitude,
        longitude,
        harvestDate,
        availabilityStatus,
        description,
        minOrderQuantity: Number(minOrderQuantity),
        images
      } as any);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {produceToEdit ? 'Edit Produce Listing' : 'Add New Produce Listing'}
              </h2>
              <p className="text-xs text-stone-500">Provide harvest specifications and pricing</p>
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
          {/* Crop Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Produce Name / Crop Type *
              </label>
              <input
                id="input-produce-name"
                type="text"
                required
                placeholder="e.g. Shangi Irish Potatoes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Category *</label>
              <select
                id="select-produce-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProduceCategory)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              >
                {PRODUCE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Available Quantity *</label>
              <input
                id="input-produce-quantity"
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Unit of Measure *</label>
              <select
                id="select-produce-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="bags (50kg)">Bags (50kg)</option>
                <option value="bags (90kg)">Bags (90kg)</option>
                <option value="crates (60kg)">Crates (60kg)</option>
                <option value="crates (10kg)">Crates (10kg)</option>
                <option value="net bags (25kg)">Net Bags (25kg)</option>
                <option value="heads">Heads (Cabbage/Lettuce)</option>
                <option value="tonnes">Metric Tonnes</option>
                <option value="bunches">Bunches</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Price per Unit (KES) *
              </label>
              <input
                id="input-produce-price"
                type="number"
                required
                min="1"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white font-bold text-emerald-800"
              />
            </div>
          </div>

          {/* Market Benchmark Helper Hint */}
          {relatedBenchmark && relatedBenchmark.averagePrice && (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <div>
                <span className="font-bold">Market Benchmark: </span>
                {relatedBenchmark.crop} averages <b>KES {(relatedBenchmark.averagePrice ?? 0).toLocaleString()}</b> / {relatedBenchmark.unit} (Range: KES {(relatedBenchmark.minPrice ?? 0).toLocaleString()} - {(relatedBenchmark.maxPrice ?? 0).toLocaleString()}).
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                {pricePerUnit <= (relatedBenchmark.averagePrice ?? 0) ? '✓ Competitive' : 'Above Avg'}
              </span>
            </div>
          )}

          {/* Location & County */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">County *</label>
              <select
                id="select-produce-county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              >
                {COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">Farm / Collection Location *</label>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3 h-3" />
                  {showMapPicker ? 'Hide Map Picker' : 'Pin on Google Map'}
                </button>
              </div>
              <input
                id="input-produce-location"
                type="text"
                required
                placeholder="e.g. Moiben Collection Depot"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Collapsible Google Maps Pinpoint Selector */}
          {showMapPicker && (
            <div className="p-3 bg-stone-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-700">
                <span className="font-semibold flex items-center gap-1 text-emerald-800">
                  <MapPin className="w-3.5 h-3.5" />
                  Interactive Farm Coordinate Pinpoint
                </span>
                {latitude && longitude && (
                  <span className="text-[11px] text-stone-500 font-mono">
                    Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
                  </span>
                )}
              </div>
              <GoogleMapsViewer
                selectable={true}
                height="240px"
                selectedCoords={latitude && longitude ? { latitude, longitude } : null}
                onSelectLocation={(coords) => {
                  setLatitude(coords.latitude);
                  setLongitude(coords.longitude);
                  if (coords.address) {
                    setLocation((prev) => prev ? `${prev} (${coords.address})` : coords.address!);
                  }
                }}
              />
            </div>
          )}

          {/* Harvest Date, Availability, Min Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Harvest Date *</label>
              <input
                id="input-produce-harvest-date"
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Availability Status</label>
              <select
                id="select-produce-availability"
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Sold">Sold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Min Order Qty</label>
              <input
                id="input-produce-min-order"
                type="number"
                min="1"
                value={minOrderQuantity}
                onChange={(e) => setMinOrderQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Produce Description</label>
            <textarea
              id="textarea-produce-description"
              rows={3}
              placeholder="Detail crop quality, variety (e.g. Shangi, Anna F1), moisture level, packing method, and transit advice..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Multiple Images Upload & Presets */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Produce Images (Multiple Supported) *
            </label>

            {/* Current Images Preview */}
            <div className="flex flex-wrap gap-2 mb-3">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-stone-200">
                  <img src={imgUrl} alt={`Produce ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/70 text-white text-[8px] font-bold rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Presets selector for realistic produce imagery */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <p className="text-[11px] font-bold text-stone-600">
                Click to attach high-resolution agricultural photos:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => handleAddImage(opt.url)}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-stone-300 hover:border-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    + {opt.name}
                  </button>
                ))}
              </div>

              {/* Custom Image URL input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="url"
                  placeholder="Or paste external image URL..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => handleAddImage(customImageUrl)}
                  className="px-3 py-1.5 text-xs font-semibold bg-stone-800 text-white rounded-xl hover:bg-stone-900"
                >
                  Add URL
                </button>
              </div>
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
              id="btn-save-produce"
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition-colors"
            >
              {produceToEdit ? 'Save Changes' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
