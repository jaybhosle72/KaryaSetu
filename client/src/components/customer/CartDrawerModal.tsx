import React from 'react';
import { ShoppingBag, X, Trash2, HeartHandshake, ArrowRight, Plus, Minus } from 'lucide-react';

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  duration?: string;
  description?: string;
}

interface CartDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout: (cart: CartItem[], totalAmount: number) => Promise<void>;
}

export const CartDrawerModal: React.FC<CartDrawerModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      await onCheckout(cart, totalAmount);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Your Booking Cart</h3>
              <p className="text-xs text-slate-500">
                {totalItemsCount} {totalItemsCount === 1 ? 'service' : 'services'} selected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition px-2 py-1"
              >
                Clear Cart
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {cart.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-black text-slate-800">Your cart is empty</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Explore services like Electrician, AC Repair, or Bathroom Cleaning to add services to your cart.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Browse Services
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-2.5">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs font-extrabold text-slate-900">
                        ₹{item.price}{' '}
                        {item.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through font-normal">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-sm">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-black text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                        title="Remove service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Service Protection & Inclusions */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-950 pb-1 border-b border-emerald-200/60">
                  <span className="flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                    <span>Verified Cooperative Service</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 uppercase tracking-wider font-extrabold">
                    Govt-Certified Shramiks
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Doorstep OTP Verification</span>
                    </span>
                    <span className="font-semibold text-emerald-800">Included</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>Standard Rate Card & Fair Pricing</span>
                    </span>
                    <span className="font-semibold text-blue-800">Guaranteed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span>30-Day Cooperative Service Warranty</span>
                    </span>
                    <span className="font-semibold text-purple-800">Protected</span>
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Amount Payable</span>
                  <span className="text-2xl font-black text-white">₹{totalAmount}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">Cooperative Guarantee</span>
                  <span className="text-xs text-slate-300 font-medium">30 Days Free Rework</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white">
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Matching with Pune Cooperatives...' : `Book Now • ₹${totalAmount}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
