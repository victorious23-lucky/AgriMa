import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { UserRole } from '../../types';
import { COUNTIES, PRODUCE_CATEGORIES } from '../../data/mockData';
import {
  X,
  Sprout,
  ShoppingBag,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  MapPin,
  Building,
  KeyRound,
  ArrowRight,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface AuthModalsProps {
  isOpen: boolean;
  initialMode: 'login' | 'register' | 'forgot';
  onClose: () => void;
}

export const AuthModals: React.FC<AuthModalsProps> = ({ isOpen, initialMode, onClose }) => {
  const { login, register, resetPassword, loginAsRole } = useMarketplace();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [county, setCounty] = useState('Nakuru');
  const [location, setLocation] = useState('');

  // Farmer specific
  const [farmName, setFarmName] = useState('');
  const [farmSize, setFarmSize] = useState('5 Acres');

  // Buyer specific
  const [businessName, setBusinessName] = useState('');
  const [buyerType, setBuyerType] = useState<'Wholesaler' | 'Retailer' | 'Household' | 'Processor'>('Wholesaler');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [newPassword, setNewPassword] = useState('');

  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!loginEmail) {
      setFormError('Please enter your email address');
      return;
    }
    const success = login(loginEmail, loginPassword);
    if (success) {
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password) {
      setFormError('Name, email, and password are required.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    const success = register({
      name,
      email,
      phone,
      password,
      role,
      county,
      location,
      farmName: role === 'farmer' ? farmName || `${name}'s Farm` : undefined,
      farmSize: role === 'farmer' ? farmSize : undefined,
      businessName: role === 'buyer' ? businessName || `${name}'s Enterprise` : undefined,
      buyerType: role === 'buyer' ? buyerType : undefined
    });

    if (success) {
      onClose();
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!forgotEmail) {
      setFormError('Please enter your account email.');
      return;
    }

    if (forgotStep === 'request') {
      const ok = resetPassword(forgotEmail, 'newpass');
      if (ok) {
        setForgotStep('reset');
      }
    } else {
      if (!newPassword || newPassword.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }
      login(forgotEmail);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Close */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {mode === 'login' && 'Sign in to Your Account'}
                {mode === 'register' && 'Create Marketplace Account'}
                {mode === 'forgot' && 'Reset Your Password'}
              </h2>
              <p className="text-xs text-stone-500">AgriMa Digital Farm Marketplace</p>
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
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            {formError}
          </div>
        )}

        {/* 1. Quick Demo Personas Bar (Great for quick evaluation) */}
        {mode === 'login' && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-stone-50 border border-stone-200">
            <p className="text-[11px] font-bold text-stone-600 mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-700" /> Instant Demo Personas (1-Click Login):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  loginAsRole('farmer');
                  onClose();
                }}
                className="px-2 py-1.5 rounded-xl text-xs font-semibold bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 transition-colors text-center shadow-2xs"
              >
                🌾 Farmer (David)
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsRole('buyer');
                  onClose();
                }}
                className="px-2 py-1.5 rounded-xl text-xs font-semibold bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 transition-colors text-center shadow-2xs"
              >
                🛒 Buyer (Sarah)
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsRole('admin');
                  onClose();
                }}
                className="px-2 py-1.5 rounded-xl text-xs font-semibold bg-white border border-purple-300 text-purple-800 hover:bg-purple-50 transition-colors text-center shadow-2xs"
              >
                🛡️ Admin (Alex)
              </button>
            </div>
          </div>
        )}

        {/* 2. Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  id="input-login-email"
                  type="email"
                  required
                  placeholder="e.g. david.farmer@farmmarket.co.ke"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setForgotStep('request');
                  }}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  id="input-login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-stone-500">Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Register as Farmer or Buyer
              </button>
            </div>
          </form>
        )}

        {/* 3. Registration Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    role === 'farmer'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      role === 'farmer' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Farmer</p>
                    <p className="text-[10px] text-stone-500">Sell crop harvests directly</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    role === 'buyer'
                      ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      role === 'buyer' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Buyer</p>
                    <p className="text-[10px] text-stone-500">Procure wholesale or retail</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Kiprop"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+254 712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>

            {/* Location & County */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <label className="block text-xs font-bold text-stone-700 mb-1">Town / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Eldoret West / Moiben"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Role specific fields */}
            {role === 'farmer' ? (
              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
                <p className="text-xs font-bold text-emerald-900">Farm Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Farm Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Highland Valley Farm"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Farm Size (Acres)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10 Acres"
                      value={farmSize}
                      onChange={(e) => setFarmSize(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-3">
                <p className="text-xs font-bold text-amber-900">Buyer Business Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Business / Enterprise Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Grocers Ltd"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Buyer Category
                    </label>
                    <select
                      value={buyerType}
                      onChange={(e) => setBuyerType(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl"
                    >
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Processor">Food Processor</option>
                      <option value="Household">Household Consumer</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min. 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <button
              id="btn-submit-register"
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Complete Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-1">
              <span className="text-xs text-stone-500">Already registered? </span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Sign In to existing account
              </button>
            </div>
          </form>
        )}

        {/* 4. Forgot / Reset Password Form */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="p-6 space-y-4">
            {forgotStep === 'request' ? (
              <>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Enter your registered email address to receive password reset authorization.
                </p>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
                >
                  Send Reset Link / Verification Code
                </button>
              </>
            ) : (
              <>
                <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 border border-emerald-200">
                  Verification verified for <b>{forgotEmail}</b>. Please specify your new password below:
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
                >
                  Update Password & Sign In
                </button>
              </>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
