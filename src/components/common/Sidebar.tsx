import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  MessageSquare,
  TrendingUp,
  CreditCard,
  Bell,
  User,
  Settings,
  LogOut,
  Users,
  AlertTriangle,
  BarChart3,
  Search,
  CheckCircle,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  MapPin
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenAuth?: (tab: 'login' | 'register') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile, onOpenAuth }) => {
  const {
    currentUser,
    activeView,
    setActiveView,
    logout,
    unreadNotificationCount,
    conversations
  } = useMarketplace();

  if (!currentUser) return null;

  // Total unread messages
  const unreadMessagesCount = conversations.reduce((acc, c) => {
    const unread = c.unreadCount?.[currentUser.id] || 0;
    return acc + unread;
  }, 0);

  // Farmer Navigation Items
  const farmerNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-produce', label: 'My Produce', icon: Package },
    { id: 'add-produce', label: 'Add Produce', icon: PlusCircle },
    { id: 'map-view', label: 'Produce Map', icon: MapPin },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'ai-advisor', label: 'AgriMa AI Advisor', icon: Sparkles },
    { id: 'market-prices', label: 'Market Prices', icon: TrendingUp },
    { id: 'sales', label: 'Sales', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationCount },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Buyer Navigation Items
  const buyerNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'browse', label: 'Browse Produce', icon: Package },
    { id: 'map-view', label: 'Farm Map & Hubs', icon: MapPin },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'ai-advisor', label: 'AgriMa AI Advisor', icon: Sparkles },
    { id: 'market-prices', label: 'Market Prices', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationCount },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Admin Navigation Items
  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'produce', label: 'Produce', icon: Package },
    { id: 'map-view', label: 'Produce Map', icon: MapPin },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'ai-advisor', label: 'AgriMa AI Advisor', icon: Sparkles },
    { id: 'market-prices', label: 'Market Prices', icon: TrendingUp },
    { id: 'disputes', label: 'Disputes', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getNavItems = (): NavItem[] => {
    if (currentUser.role === 'farmer') return farmerNavItems;
    if (currentUser.role === 'buyer') return buyerNavItems;
    if (currentUser.role === 'admin') return adminNavItems;
    return [];
  };

  const navItems = getNavItems();

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-stone-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* AgriMa Sidebar Brand Header */}
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-stone-100">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-2xs">
              🌱
            </div>
            <div>
              <span className="text-sm font-black text-stone-900 tracking-tight leading-none block">
                Agri<span className="text-emerald-600">Ma</span>
              </span>
              <span className="text-[10px] text-stone-400 font-medium leading-none">
                Direct Agricultural Hub
              </span>
            </div>
          </div>

          {/* User profile snippet in sidebar */}
          <div className="mb-5 p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border border-stone-300"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-stone-900 truncate">{currentUser.name}</p>
              <p className="text-[11px] text-stone-500 capitalize">{currentUser.role} Portal</p>
              <p className="text-[10px] text-emerald-700 font-medium truncate">{currentUser.county} County</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
              Menu Navigation
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  id={`nav-${item.id}`}
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? currentUser.role === 'farmer'
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-xs'
                        : currentUser.role === 'buyer'
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-xs'
                        : 'bg-purple-50 text-purple-900 font-bold border border-purple-200 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive
                          ? currentUser.role === 'farmer'
                            ? 'text-emerald-700'
                            : currentUser.role === 'buyer'
                            ? 'text-amber-700'
                            : 'text-purple-700'
                          : 'text-stone-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Sidebar: Secure Logout */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/50">
          <button
            id="btn-sidebar-logout"
            type="button"
            onClick={() => {
              logout();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
