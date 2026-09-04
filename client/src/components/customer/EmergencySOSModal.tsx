import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Clock, MapPin, Zap, Wrench, CheckCircle2 } from 'lucide-react';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitEmergency: (data: {
    customerName: string;
    customerPhone: string;
    emergencyType: string;
    address: string;
    notes: string;
  }) => Promise<void>;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  onSubmitEmergency
}) => {
  const [customerName, setCustomerName] = useState('Ananya Iyer');
  const [customerPhone, setCustomerPhone] = useState('+91 98229 88776');
  const [emergencyType, setEmergencyType] = useState('Water Leakage');
  const [address, setAddress] = useState('Row House 12, Baner-Pashan Link Road, Pune 411045');
  const [notes, setNotes] = useState('Severe main pipeline rupture; water flooding utility area');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const emergencyOptions = [
    {
      id: 'Water Leakage',
      title: 'Water Leakage / Pipe Rupture',
      trade: 'Plumbing',
      eta: '10-15 mins',
      price: '₹650',
      icon: <Wrench className="w-5 h-5 text-blue-600" />
    },
    {
      id: 'Short Circuit',
      title: 'Short Circuit / Sparking Meter',
      trade: 'Electrical',
      eta: '8-12 mins',
      price: '₹600',
      icon: <Zap className="w-5 h-5 text-amber-600" />
    },
    {
      id: 'Door Lockout',
      title: 'Broken Lock / Jammed Security Door',
      trade: 'Carpentry',
      eta: '15-20 mins',
      price: '₹550',
      icon: <ShieldAlert className="w-5 h-5 text-purple-600" />
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitEmergency({
        customerName,
        customerPhone,
        emergencyType,
        address,
        notes
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-red-200">
        
        {/* Emergency Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                🚨 Rapid Emergency SOS Dispatch
              </h2>
              <p className="text-xs text-red-100">
                Cooperative Rapid Response Squad • Under 15-Minute Target Arrival
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Emergency Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Emergency Scenario
            </label>
            <div className="grid grid-cols-1 gap-2">
              {emergencyOptions.map((opt) => {
                const isSelected = emergencyType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setEmergencyType(opt.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-red-500 bg-red-50/70 ring-2 ring-red-400'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        {opt.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{opt.title}</p>
                        <p className="text-xs text-slate-500">Trade: {opt.trade}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> {opt.eta}
                      </span>
                      <p className="text-xs font-bold text-slate-700 mt-1">{opt.price}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Your Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter complete flat / society address"
              />
            </div>
          </div>

          {/* Situation Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Describe Danger / Issue
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="e.g. Water flooding into rooms, sparks from main circuit breaker"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone (for Live Nav)</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Transparent Cooperative Assurance Notice */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cooperative Guarantee:</span>
            </div>
            <p className="text-[11px]">
              Allocates verified nearby cooperative shramiks with required safety equipment and transparent standard rates.
            </p>
          </div>

          {/* Dispatch Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            {isSubmitting ? (
              <span>Broadcasting to Nearest Cooperative...</span>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>CONFIRM & DISPATCH EMERGENCY WORKER</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
