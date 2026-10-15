import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toast } = useMarketplace();

  if (!toast) return null;

  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-300 bg-white text-emerald-950 shadow-emerald-100';
      case 'error':
        return 'border-red-300 bg-white text-red-950 shadow-red-100';
      case 'warning':
        return 'border-amber-300 bg-white text-amber-950 shadow-amber-100';
      default:
        return 'border-blue-300 bg-white text-blue-950 shadow-blue-100';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 pointer-events-none">
      <div
        id="toast-notification"
        className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl border shadow-lg transition-all transform translate-y-0 duration-200 ${getBorderColor()}`}
      >
        {getToastIcon()}
        <p className="text-xs font-semibold leading-relaxed flex-1">{toast.message}</p>
      </div>
    </div>
  );
};
