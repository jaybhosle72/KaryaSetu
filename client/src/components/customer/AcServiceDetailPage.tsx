import React, { useState } from 'react';
import { 
  ArrowLeft, Star, ShieldCheck, Check, Plus, Minus, 
  Trash2, CreditCard, ChevronRight, Info, Wrench, Sparkles, AlertTriangle 
} from 'lucide-react';
import { BookingModal } from './BookingModal';

interface AcServiceDetailPageProps {
  onBack: () => void;
  onSubmitBooking: (bookingData: any) => Promise<void>;
  currentUser?: { name: string; phone: string; address?: string } | null;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  duration: string;
  description: string;
}

export const AcServiceDetailPage: React.FC<AcServiceDetailPageProps> = ({
  onBack,
  onSubmitBooking,
  currentUser
}) => {
  const [activeSection, setActiveSection] = useState<'SERVICE' | 'REPAIR' | 'INSTALL' | 'ANNUAL'>('SERVICE');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Cart operations
  const addToCart = (item: { id: string; name: string; price: number; originalPrice?: number; duration: string; description: string }) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // 4-way transparent split calculation
  const workerEarning = Math.round(totalAmount * 0.80);
  const coopShare = Math.round(totalAmount * 0.10);
  const welfareShare = Math.round(totalAmount * 0.06);
  const platformFee = totalAmount - workerEarning - coopShare - welfareShare;

  const handleProceedBooking = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    try {
      const primaryItem = cart[0];
      await onSubmitBooking({
        customerName: currentUser?.name || 'Registered Customer',
        customerPhone: currentUser?.phone || '+91 98229 00000',
        serviceCategory: 'Appliance Repair',
        subTrade: cart.map(i => `${i.name} (x${i.quantity})`).join(', '),
        urgency: 'STANDARD',
        address: currentUser?.address || 'Flat 402, Mayur Residency, Kothrud, Pune 411038',
        preferredTime: 'Immediate / Next Available Slot',
        estimatedPrice: totalAmount,
        notes: `Selected ${totalItemsCount} AC services. Split: ₹${workerEarning} direct to technician, ₹${welfareShare} to PM-JAY welfare.`
      });
      alert('AC service booked successfully with local Pune Electrical Cooperative! Check your active booking tracker.');
      onBack();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="space-y-8 pb-24 font-sans max-w-[1360px] mx-auto">
      
      {/* 1. Back Navigation & Header Breadcrumb */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-slate-700 flex items-center gap-1.5 text-xs font-bold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-semibold text-slate-500">Appliance repair & service</span>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-extrabold text-slate-900">AC</span>
      </div>

      {/* 2. Top Title & Co-pilot Free Gas Check Banner (Exact Match to Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sub-Header (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AC</h1>
            <div className="flex items-center gap-1.5 text-xs mt-1 text-slate-600">
              <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">★</span>
              <span className="font-extrabold text-slate-900">4.78</span>
              <span className="text-slate-400 font-medium">(14.0 M bookings)</span>
            </div>
          </div>

          {/* Warranty Cover Pill */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                  COOPERATIVE COVER
                </span>
                <p className="text-xs font-bold text-slate-800">Upto 30 days warranty on repairs</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Select a Service Vertical Mini-Grid (Exact Match to Image 2) */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Select a service
            </span>

            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'SERVICE', title: 'Service', icon: '❄️', sub: 'Foam-jet' },
                { key: 'REPAIR', title: 'Repair & gas refill', icon: '🔧', sub: 'Diagnosis' },
                { key: 'INSTALL', title: 'Installation / uninstallation', icon: '🛠️', sub: 'Mounting' },
                { key: 'ANNUAL', title: 'Annual plan', icon: '⭐', sub: '30% OFF' }
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    setActiveSection(s.key as any);
                    const el = document.getElementById(s.key);
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    activeSection === s.key
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl mb-1">{s.icon}</span>
                  <div>
                    <span className="text-xs font-bold leading-tight block">{s.title}</span>
                    <span className={`text-[10px] ${activeSection === s.key ? 'text-slate-300' : 'text-slate-400'}`}>
                      {s.sub}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Center/Right: Free Gas Check Co-pilot Banner (Exact Match to Image 2) */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-50 via-slate-50 to-blue-50 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="space-y-2 max-w-md z-10">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                FREE GAS CHECK
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                AC diagnosis with digital gauge
              </h2>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                No gas refill without a reading. Certified cooperative technicians verify exact refrigerant pressure before recommending any top-up.
              </p>
            </div>

            {/* Graphic of Handheld Diagnostic Device */}
            <div className="w-56 h-36 bg-slate-900 rounded-2xl shadow-xl border-4 border-slate-800 p-3 flex flex-col justify-between text-white flex-shrink-0 relative">
              <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
                <span>SS-COPILOT v2.4</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="bg-emerald-950/80 p-2 rounded-lg border border-emerald-500/30 text-emerald-300 font-mono text-xs">
                <p>PRESSURE: 65.4 PSI</p>
                <p className="text-[10px] text-emerald-400">R-32 GAS: OPTIMAL (98%)</p>
                <p className="text-[10px] text-white font-bold">DISCHARGE TEMP: 12.4°C</p>
              </div>
              <div className="text-[9px] text-slate-400 text-center font-bold">
                TESTED & CERTIFIED CO-OP READOUT
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Main Split View: Services List on Left (7 cols) | Cart & Guarantee on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        
        {/* Left Column: Categorized Services List (Exact Match to Images 3, 4, 5) */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* SECTION 1: Service (Foam-Jet AC Cleaning) */}
          <div id="SERVICE" className="space-y-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Service</h2>
              <p className="text-xs text-slate-500 mt-0.5">Deep vent cleaning with high-pressure water jet and foam jacket</p>
            </div>

            {/* Banner Card matching Image 4 */}
            <div className="rounded-2xl p-5 bg-gradient-to-r from-slate-100 to-emerald-50/50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase">
                  Free gas check
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">Foam-jet AC service</h3>
                <p className="text-xs text-slate-500">Deep clean AC vents for efficient cooling and power saving</p>
              </div>
            </div>

            {/* List of Service items */}
            <div className="space-y-3.5">
              {[
                {
                  id: 'ac-foam-1',
                  name: 'Foam-jet service (1 AC)',
                  rating: 4.75,
                  reviews: '2.9M',
                  price: 649,
                  originalPrice: 849,
                  duration: '1 hr 15 mins',
                  description: 'Applicable for window or split AC. Indoor unit deep cleaning with foam & pressure jet spray.'
                },
                {
                  id: 'ac-foam-2',
                  name: 'Foam-jet service (2 ACs)',
                  rating: 4.75,
                  reviews: '2.9M',
                  price: 1098,
                  originalPrice: 1298,
                  duration: '2 hrs',
                  description: 'Applicable for both window or split ACs. Includes indoor unit deep foam cleaning and free gas check.'
                },
                {
                  id: 'ac-foam-3',
                  name: 'Foam-jet service (3 ACs)',
                  rating: 4.75,
                  reviews: '2.9M',
                  price: 1647,
                  originalPrice: 1947,
                  duration: '3 hrs',
                  description: 'Multi-room bundle. Full condenser water flush and anti-bacterial coating.'
                },
                {
                  id: 'ac-foam-4',
                  name: 'Foam-jet service (4 ACs)',
                  rating: 4.75,
                  reviews: '2.9M',
                  price: 2196,
                  originalPrice: 2596,
                  duration: '4 hrs',
                  description: 'Large apartment bundle. Maximum cooling efficiency guarantee.'
                }
              ].map((item) => {
                const inCart = cart.find(i => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-lg">
                      <h4 className="text-sm font-extrabold text-slate-900">{item.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-extrabold text-slate-900">{item.rating}</span>
                        <span className="text-slate-400 text-[11px]">({item.reviews} reviews)</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-medium text-[11px]">{item.duration}</span>
                      </div>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base font-black text-slate-900">₹{item.price}</span>
                        <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center sm:flex-col justify-between sm:justify-center gap-2">
                      {inCart ? (
                        <div className="flex items-center gap-2 bg-slate-900 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center font-black"
                          >
                            -
                          </button>
                          <span className="px-1">{inCart.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center font-black"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-5 py-2 rounded-xl border border-purple-600 text-purple-700 hover:bg-purple-50 font-extrabold text-xs transition shadow-sm"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Repair & Gas Refill (Exact Match to Image 5) */}
          <div id="REPAIR" className="space-y-4 pt-6 border-t border-slate-200">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Repair & gas refill</h2>
              <p className="text-xs text-slate-500 mt-0.5">Component diagnosis, PCB repair, and digital gauge gas charging</p>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  id: 'ac-repair-diag',
                  name: 'AC repair & diagnosis',
                  rating: 4.73,
                  reviews: '859K',
                  price: 299,
                  originalPrice: 499,
                  duration: '45 mins',
                  description: 'Complete check-up to identify cooling issues, noise, or water leakage before repair.'
                },
                {
                  id: 'ac-gas-refill',
                  name: 'Gas refill & check-up',
                  rating: 4.77,
                  reviews: '112K',
                  price: 2800,
                  originalPrice: 3200,
                  duration: '2 hrs 30 mins',
                  description: 'Full leak test with soap bubble/pressure test followed by certified R-32/R-410A refrigerant charging.'
                }
              ].map((item) => {
                const inCart = cart.find(i => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-lg">
                      <h4 className="text-sm font-extrabold text-slate-900">{item.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-extrabold text-slate-900">{item.rating}</span>
                        <span className="text-slate-400 text-[11px]">({item.reviews} reviews)</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-medium text-[11px]">{item.duration}</span>
                      </div>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base font-black text-slate-900">₹{item.price}</span>
                        <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center sm:flex-col justify-between sm:justify-center gap-2">
                      {inCart ? (
                        <div className="flex items-center gap-2 bg-slate-900 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center font-black"
                          >
                            -
                          </button>
                          <span className="px-1">{inCart.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center font-black"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-5 py-2 rounded-xl border border-purple-600 text-purple-700 hover:bg-purple-50 font-extrabold text-xs transition shadow-sm"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Installation / Uninstallation (Exact Match to Image 5) */}
          <div id="INSTALL" className="space-y-4 pt-6 border-t border-slate-200">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Installation / uninstallation</h2>
              <p className="text-xs text-slate-500 mt-0.5">Bracket mounting, copper piping vacuuming, and safe dismantling</p>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  id: 'ac-install',
                  name: 'AC installation',
                  rating: 4.69,
                  reviews: '150K',
                  price: 799,
                  originalPrice: 1099,
                  duration: '2 hrs',
                  description: 'Installation of indoor & outdoor units with core hole drilling and free gas check.'
                },
                {
                  id: 'ac-uninstall',
                  name: 'AC uninstallation',
                  rating: 4.79,
                  reviews: '140K',
                  price: 649,
                  originalPrice: 899,
                  duration: '1 hr 30 mins',
                  description: 'Safe uninstallation of both indoor & outdoor units with zero gas leakage valve sealing.'
                }
              ].map((item) => {
                const inCart = cart.find(i => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-lg">
                      <h4 className="text-sm font-extrabold text-slate-900">{item.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-extrabold text-slate-900">{item.rating}</span>
                        <span className="text-slate-400 text-[11px]">({item.reviews} reviews)</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-medium text-[11px]">{item.duration}</span>
                      </div>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base font-black text-slate-900">₹{item.price}</span>
                        <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center sm:flex-col justify-between sm:justify-center gap-2">
                      {inCart ? (
                        <div className="flex items-center gap-2 bg-slate-900 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center font-black"
                          >
                            -
                          </button>
                          <span className="px-1">{inCart.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center font-black"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-5 py-2 rounded-xl border border-purple-600 text-purple-700 hover:bg-purple-50 font-extrabold text-xs transition shadow-sm"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: UC Promise & Live Cart Summary (Exact Match to Image 2 & 3) */}
        <div className="lg:col-span-4 space-y-6 sticky top-28">
          
          {/* Cooperative Promise Card (Matching UC Promise in Image 2) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Cooperative Promise
              </h3>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Quality Assured
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">100% Skill India Certified Shramiks</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Hassle-Free Direct Booking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Direct Verified Cooperative Booking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Upto 30 Days Cooperative Warranty</span>
              </li>
            </ul>
          </div>

          {/* Live Cart Card (Matching Image 2 right) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Your Booking Cart
            </h3>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  🛒
                </div>
                <p className="text-xs font-semibold">No items in your cart</p>
                <p className="text-[11px] text-slate-400">Select any AC service to view booking breakdown</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items List */}
                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1 text-xs">
                  {cart.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">
                          ₹{item.price * item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, -item.quantity)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total & 4-Way Split Preview */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-700">Total Payable:</span>
                    <span className="text-xl font-black text-slate-900">₹{totalAmount}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1 text-slate-600">
                    <div className="flex justify-between text-emerald-800 font-semibold">
                      <span>✓ Doorstep OTP Verification:</span>
                      <span>Included</span>
                    </div>
                    <div className="flex justify-between text-blue-700 font-semibold">
                      <span>✓ Certified Cooperative Technician:</span>
                      <span>Assigned</span>
                    </div>
                    <div className="flex justify-between text-purple-700 font-semibold">
                      <span>✓ Cooperative Guarantee:</span>
                      <span>30 Days Free Rework</span>
                    </div>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handleProceedBooking}
                  disabled={isCheckingOut}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isCheckingOut ? 'Matching Cooperative Technician...' : `Book Now • ₹${totalAmount}`}
                  </span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
