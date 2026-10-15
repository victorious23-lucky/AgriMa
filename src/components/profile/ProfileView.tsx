import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { COUNTIES } from '../../data/mockData';
import {
  User,
  ShieldCheck,
  Building,
  MapPin,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, updateUserProfile } = useMarketplace();

  if (!currentUser) return null;

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [county, setCounty] = useState(currentUser.county);
  const [location, setLocation] = useState(currentUser.location);
  const [farmName, setFarmName] = useState(currentUser.farmName || '');
  const [farmSize, setFarmSize] = useState(currentUser.farmSize || '');
  const [businessName, setBusinessName] = useState(currentUser.businessName || '');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isSaved, setIsSaved] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone,
      county,
      location,
      farmName: currentUser.role === 'farmer' ? farmName : undefined,
      farmSize: currentUser.role === 'farmer' ? farmSize : undefined,
      businessName: currentUser.role === 'buyer' ? businessName : undefined
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPass.length < 6) {
      setPasswordFeedback({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPass !== confirmPass) {
      setPasswordFeedback({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordFeedback({ type: 'success', text: 'Security credentials successfully updated.' });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          Account Profile & Preferences
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Manage your verified contact coordinates, enterprise identifiers, and login security credentials.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-stone-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900">{currentUser.name}</h2>
              {currentUser.isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 capitalize">{currentUser.role} Account</p>
            <p className="text-xs text-stone-600 mt-0.5">
              {currentUser.county} County • {currentUser.location}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1 sm:text-right">
          <p className="text-[10px] uppercase font-bold text-stone-400">Account ID</p>
          <p className="font-mono font-bold text-stone-900">{currentUser.id}</p>
          <p className="text-[10px] text-stone-400">Joined: {currentUser.joinedDate}</p>
        </div>
      </div>

      {/* Main Profile Edit Form */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="text-sm font-bold text-stone-900">Personal & Business Details</h3>
          {isSaved && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Changes Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-stone-400">Primary login identifier (locked)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">County</label>
              <select
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
              <label className="block text-xs font-bold text-stone-700 mb-1">Town / Specific Area</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Role specific info */}
          {currentUser.role === 'farmer' && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <p className="text-xs font-bold text-emerald-950">Agricultural Holding Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Farm / Cooperative Name
                  </label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Acreage / Farm Size
                  </label>
                  <input
                    type="text"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {currentUser.role === 'buyer' && (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3">
              <p className="text-xs font-bold text-amber-950">Buyer Commercial Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Enterprise / Outlet Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Procurement Type
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.buyerType || 'Wholesale Buyer'}
                    className="w-full px-3 py-2 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              id="btn-save-profile"
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Details</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Reset Section */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <KeyRound className="w-4 h-4 text-stone-600" />
          <h3 className="text-sm font-bold text-stone-900">Security Credentials & Password</h3>
        </div>

        {passwordFeedback && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              passwordFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {passwordFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{passwordFeedback.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">New Password</label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Confirm new"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-stone-800 hover:bg-stone-900 text-white rounded-xl transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
