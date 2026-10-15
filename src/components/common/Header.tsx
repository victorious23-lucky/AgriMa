import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import {
  Menu,
  Bell,
  MessageSquare,
  Search,
  User as UserIcon,
  ChevronDown,
  ShieldCheck,
  LogOut,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenAuth }) => {
  const {
    currentUser,
    notifications,
    conversations,
    setActiveView,
    logout,
    loginAsDemoUser,
    loginAsRole
  } = useMarketplace();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const handleRoleSwitch = (role: 'farmer' | 'buyer' | 'admin') => {
    if (loginAsRole) {
      loginAsRole(role);
    } else if (loginAsDemoUser) {
      loginAsDemoUser(role);
    }
    setRoleSwitcherOpen(false);
  };

  const unreadNotificationsCount = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id && !n.read).length
    : 0;

  const unreadMessagesCount = currentUser
    ? conversations.reduce((sum, c) => sum + (c.unreadCount?.[currentUser.id] || 0), 0)
    : 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-sidebar"
            type="button"
            onClick={onToggleSidebar}
            className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveView(currentUser ? 'dashboard' : 'browse')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white font-black shadow-xs text-base">
              🌱
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-black text-stone-900 tracking-tight block leading-tight">
                Agri<span className="text-emerald-600">Ma</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 block uppercase tracking-wider">
                Digital Farm Marketplace
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search trigger */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <button
            type="button"
            onClick={() => setActiveView('browse')}
            className="w-full text-left px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/70 border border-stone-200 text-stone-400 text-xs flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-stone-400" />
              <span>Search fresh harvests, farmers, or counties...</span>
            </div>
            <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200 text-stone-500">
              Browse
            </span>
          </button>
        </div>

        {/* Right: Role Switcher Demo Bar, Notifications, & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              id="btn-role-switcher"
              type="button"
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Role Switcher:</span>
              <span className="capitalize font-black text-amber-950">
                {currentUser ? currentUser.role : 'Guest'}
              </span>
              <ChevronDown className="w-3 h-3 text-amber-700" />
            </button>

            {roleSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-stone-200 shadow-xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-stone-100">
                  <p className="font-bold text-stone-900 text-xs">Switch User Persona</p>
                  <p className="text-[10px] text-stone-500">Test role-specific dashboards & permissions</p>
                </div>

                <div className="space-y-1 py-1">
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('farmer')}
                    className={`w-full text-left p-2 rounded-xl transition-colors flex items-center justify-between ${
                      currentUser?.role === 'farmer' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">David Kiprop (Farmer)</p>
                      <p className="text-[10px] text-stone-400">Highland Organic Farm • Uasin Gishu</p>
                    </div>
                    {currentUser?.role === 'farmer' && <span className="text-emerald-700">✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('buyer')}
                    className={`w-full text-left p-2 rounded-xl transition-colors flex items-center justify-between ${
                      currentUser?.role === 'buyer' ? 'bg-amber-50 text-amber-900 font-bold' : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">Sarah Wambui (Buyer)</p>
                      <p className="text-[10px] text-stone-400">GreenLeaf Grocers • Nairobi</p>
                    </div>
                    {currentUser?.role === 'buyer' && <span className="text-amber-700">✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('admin')}
                    className={`w-full text-left p-2 rounded-xl transition-colors flex items-center justify-between ${
                      currentUser?.role === 'admin' ? 'bg-purple-50 text-purple-900 font-bold' : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">Alex Mwangi (Admin)</p>
                      <p className="text-[10px] text-stone-400">Marketplace Authority</p>
                    </div>
                    {currentUser?.role === 'admin' && <span className="text-purple-700">✓</span>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {currentUser ? (
            <>
              {/* Messages button */}
              <button
                type="button"
                onClick={() => setActiveView('messages')}
                className="relative p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
                title="Direct Messages"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              {/* Notifications button */}
              <button
                id="btn-header-notifications"
                type="button"
                onClick={() => setActiveView('notifications')}
                className="relative p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* User Profile Pill & Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-100 transition-colors border border-transparent hover:border-stone-200"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-stone-200"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-stone-900 leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-stone-400 capitalize">{currentUser.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden lg:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-stone-200 shadow-xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2.5 border-b border-stone-100">
                      <p className="font-bold text-stone-900">{currentUser.name}</p>
                      <p className="text-[10px] text-stone-500">{currentUser.email}</p>
                      <span className="mt-1 inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-stone-100 text-stone-700">
                        {currentUser.role} Account
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveView('profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-stone-700 hover:bg-stone-50 rounded-xl font-medium"
                      >
                        Profile Settings
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveView('transactions');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-stone-700 hover:bg-stone-50 rounded-xl font-medium"
                      >
                        Financial Ledger
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center gap-2 border-t border-stone-100 mt-1 pt-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Guest Auth Buttons */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
