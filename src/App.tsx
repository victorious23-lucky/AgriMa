import React, { useState } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModals } from './components/auth/AuthModals';

// Dashboards
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { BuyerDashboard } from './components/buyer/BuyerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

// Farmer Views
import { MyProduce } from './components/farmer/MyProduce';

// Buyer & Marketplace Views
import { BrowseProduce } from './components/buyer/BrowseProduce';

// Shared / Transversal Views
import { OrdersView } from './components/orders/OrdersView';
import { ChatView } from './components/chat/ChatView';
import { MarketPriceView } from './components/prices/MarketPriceView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { ProfileView } from './components/profile/ProfileView';
import { GeminiAIChatbot } from './components/chat/GeminiAIChatbot';
import { ProduceMapView } from './components/maps/ProduceMapView';
import { Sparkles } from 'lucide-react';

// Administrator Views
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminDisputes } from './components/admin/AdminDisputes';
import { AdminReports } from './components/admin/AdminReports';

const MarketplaceApp: React.FC = () => {
  const { currentUser, activeView, setActiveView } = useMarketplace();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    initialTab: 'login' | 'register';
  }>({
    isOpen: false,
    initialTab: 'login'
  });
  const [isFloatingAiOpen, setIsFloatingAiOpen] = useState(false);

  const handleOpenAuth = (tab: 'login' | 'register') => {
    setAuthModal({ isOpen: true, initialTab: tab });
  };

  const handleCloseAuth = () => {
    setAuthModal({ ...authModal, isOpen: false });
  };

  // Render content dynamically based on activeView & role
  const renderActiveView = () => {
    // If not logged in and not on public views, fallback to browse
    if (!currentUser && (activeView === 'my-produce' || activeView === 'orders' || activeView === 'messages' || activeView === 'notifications' || activeView === 'profile' || activeView === 'users' || activeView === 'disputes' || activeView === 'reports')) {
      return <BrowseProduce />;
    }

    switch (activeView) {
      case 'dashboard':
        if (!currentUser) return <BrowseProduce />;
        if (currentUser.role === 'farmer') return <FarmerDashboard />;
        if (currentUser.role === 'buyer') return <BuyerDashboard />;
        if (currentUser.role === 'admin') return <AdminDashboard />;
        return <BrowseProduce />;

      case 'my-produce':
        return <MyProduce />;

      case 'add-produce':
        return <MyProduce initialOpenAdd={true} />;

      case 'browse':
      case 'search':
      case 'produce':
      case 'produce-listings':
        return <BrowseProduce />;

      case 'orders':
        return <OrdersView />;

      case 'messages':
        return <ChatView />;

      case 'market-prices':
        return <MarketPriceView />;

      case 'transactions':
      case 'sales':
        return <TransactionsView />;

      case 'notifications':
        return <NotificationsView />;

      case 'profile':
      case 'settings':
        return <ProfileView />;

      case 'ai-advisor':
        return <GeminiAIChatbot />;

      case 'map-view':
      case 'maps':
        return <ProduceMapView />;

      // Administrator Exclusive Views (Protected)
      case 'users':
        if (currentUser?.role !== 'admin') return <BrowseProduce />;
        return <AdminUsers initialRoleFilter="all" />;

      case 'farmers':
        if (currentUser?.role !== 'admin') return <BrowseProduce />;
        return <AdminUsers initialRoleFilter="farmer" />;

      case 'buyers':
        if (currentUser?.role !== 'admin') return <BrowseProduce />;
        return <AdminUsers initialRoleFilter="buyer" />;

      case 'produce-listings':
        return <BrowseProduce />;

      case 'disputes':
        if (currentUser?.role !== 'admin') return <BrowseProduce />;
        return <AdminDisputes />;

      case 'reports':
        if (currentUser?.role !== 'admin') return <BrowseProduce />;
        return <AdminReports />;

      default:
        return <BrowseProduce />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans antialiased selection:bg-emerald-200">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenAuth={handleOpenAuth}
      />

      <div className={`flex-1 flex overflow-hidden ${currentUser ? 'lg:pl-64' : ''}`}>
        {/* Persistent Sidebar */}
        <Sidebar
          isOpenMobile={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          onOpenAuth={handleOpenAuth}
        />

        {/* Main Work Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <AuthModals
        isOpen={authModal.isOpen}
        initialTab={authModal.initialTab}
        onClose={handleCloseAuth}
      />

      <ToastContainer />

      {/* Floating Gemini AI Assistant Launcher & Modal */}
      {activeView !== 'ai-advisor' && (
        <aside aria-label="AI Assistant" className="fixed bottom-5 right-5 z-40">
          {isFloatingAiOpen ? (
            <div className="w-[360px] sm:w-[420px] h-[540px] shadow-2xl rounded-2xl overflow-hidden border border-emerald-700/50 bg-white flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <GeminiAIChatbot initialCompact={true} onClose={() => setIsFloatingAiOpen(false)} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsFloatingAiOpen(true)}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 border-2 border-emerald-400/40 hover:scale-105 active:scale-95 transition cursor-pointer text-xs group"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-emerald-200 group-hover:rotate-12 transition">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>Ask AgriMa AI</span>
            </button>
          )}
        </aside>
      )}
    </div>
  );
};

export default function App() {
  return (
    <MarketplaceProvider>
      <MarketplaceApp />
    </MarketplaceProvider>
  );
}
