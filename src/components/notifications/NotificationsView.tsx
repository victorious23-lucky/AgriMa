import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Notification } from '../../types';
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  Scale,
  AlertTriangle,
  Info,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { NegotiationModal } from '../negotiation/NegotiationModal';

export const NotificationsView: React.FC = () => {
  const {
    currentUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveView,
    negotiations
  } = useMarketplace();

  const [activeNeg, setActiveNeg] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('all');

  if (!currentUser) return null;

  const myNotifications = notifications.filter((n) => n.userId === currentUser.id);

  const filtered = myNotifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.read;
    return n.type === filterType;
  });

  const getNotifIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case 'offer':
        return <Scale className="w-5 h-5 text-amber-600" />;
      case 'dispute':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    markNotificationAsRead(notif.id);

    if (notif.type === 'offer' && notif.relatedId) {
      const found = negotiations.find((n) => n.id === notif.relatedId);
      if (found) {
        setActiveNeg(found);
      }
    } else if (notif.type === 'order') {
      setActiveView('orders');
    } else if (notif.type === 'dispute') {
      if (currentUser.role === 'admin') setActiveView('disputes');
      else setActiveView('orders');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time activity alerts on order updates, buyer inquiries, price bids, and escrow releases.
          </p>
        </div>

        <button
          type="button"
          onClick={markAllNotificationsAsRead}
          className="px-3.5 py-2 text-xs font-bold rounded-2xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'unread', 'order', 'offer', 'dispute'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterType(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors ${
              filterType === tab
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {tab === 'all' ? 'All Alerts' : tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">
            <Bell className="w-10 h-10 mx-auto mb-2 text-stone-300" />
            No notifications in this category.
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 sm:p-5 flex items-start gap-4 cursor-pointer hover:bg-stone-50 transition-colors ${
                !notif.read ? 'bg-emerald-50/40' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                {getNotifIcon(notif.type)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`text-xs ${
                      !notif.read ? 'font-black text-stone-900' : 'font-bold text-stone-700'
                    }`}
                  >
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-stone-400 whitespace-nowrap">
                    {notif.createdAt}
                  </span>
                </div>

                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{notif.message}</p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1">
                    <span>View Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {!notif.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Negotiation Modal if opened */}
      {activeNeg && (
        <NegotiationModal
          isOpen={true}
          onClose={() => setActiveNeg(null)}
          existingNegotiation={activeNeg}
        />
      )}
    </div>
  );
};
