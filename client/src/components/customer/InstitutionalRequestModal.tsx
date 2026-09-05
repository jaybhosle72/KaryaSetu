import React, { useState } from 'react';
import { Building2, Users, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface InstitutionalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitContract: (contractData: any) => Promise<void>;
}

export const InstitutionalRequestModal: React.FC<InstitutionalRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmitContract
}) => {
  const { t } = useLanguage();
  const [clientName, setClientName] = useState('Green Meadows Co-operative Housing Society (RWA)');
  const [clientType, setClientType] = useState<'Housing Society' | 'Educational Institution' | 'Commercial Complex' | 'Healthcare / Hospital'>('Housing Society');
  const [address, setAddress] = useState('Pan Card Club Road, Baner, Pune 411045');
  const [contractTitle, setContractTitle] = useState('Annual Facility & Pump Station Comprehensive Maintenance');
  const [electriciansCount, setElectriciansCount] = useState(2);
  const [plumbersCount, setPlumbersCount] = useState(2);
  const [cleanersCount, setCleanersCount] = useState(3);
  const [durationMonths, setDurationMonths] = useState(12);
  const [monthlyBudget, setMonthlyBudget] = useState(48000);
  const [notes, setNotes] = useState('Bi-weekly scheduled preventive audit, 15-minute emergency response SLA.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const requestedCrew = [
        { trade: 'Electrical', count: electriciansCount, role: 'Daily Society Technicians' },
        { trade: 'Plumbing', count: plumbersCount, role: 'Pump & Overhead Tank Specialists' },
        { trade: 'Deep Cleaning', count: cleanersCount, role: 'Clubhouse & Common Area Sanitization' }
      ].filter(c => c.count > 0);

      await onSubmitContract({
        clientName,
        clientType,
        address,
        contractTitle,
        requestedCrew,
        durationMonths,
        monthlyBudget,
        notes
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-blue-200">
                {t.modals?.institutional?.tag || 'Institutional & Society Market'}
              </span>
              <h2 className="text-lg font-black tracking-tight">
                {t.modals?.institutional?.title || 'Request Dedicated Cooperative Crew SLA'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl font-bold p-1 cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Institution Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.modals?.institutional?.instName || 'Institution / Society Name'}
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.modals?.institutional?.instType || 'Institution Type'}
              </label>
              <select
                value={clientType}
                onChange={(e: any) => setClientType(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Housing Society">Cooperative Housing Society (RWA)</option>
                <option value="Educational Institution">School / College Campus</option>
                <option value="Commercial Complex">Tech Park / Commercial Complex</option>
                <option value="Healthcare / Hospital">Hospital / Clinic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {t.modals?.institutional?.serviceAddress || 'Campus / Society Address'}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Requested Crew Configuration */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-700" />
              {t.modals?.institutional?.requestedTrades || 'Configure Multi-Trade Dedicated Workforce'}
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-800">{t.modals?.institutional?.electricians || 'Electricians'}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setElectriciansCount(Math.max(0, electriciansCount - 1))}
                    className="w-6 h-6 rounded bg-slate-100 font-bold cursor-pointer"
                  >-</button>
                  <span className="font-extrabold text-sm">{electriciansCount}</span>
                  <button
                    type="button"
                    onClick={() => setElectriciansCount(electriciansCount + 1)}
                    className="w-6 h-6 rounded bg-slate-100 font-bold cursor-pointer"
                  >+</button>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-800">{t.modals?.institutional?.plumbers || 'Plumbers'}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setPlumbersCount(Math.max(0, plumbersCount - 1))}
                    className="w-6 h-6 rounded bg-slate-100 font-bold cursor-pointer"
                  >-</button>
                  <span className="font-extrabold text-sm">{plumbersCount}</span>
                  <button
                    type="button"
                    onClick={() => setPlumbersCount(plumbersCount + 1)}
                    className="w-6 h-6 rounded bg-slate-100 font-bold cursor-pointer"
                  >+</button>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-800">{t.modals?.institutional?.cleaners || 'Cleaners'}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setCleanersCount(Math.max(0, cleanersCount - 1))}
                    className="w-6 h-6 rounded bg-slate-100 font-bold cursor-pointer"
                  >-</button>
                  <span className="font-extrabold text-sm">{cleanersCount}</span>
                  <button
                    type="button"
                    onClick={() => setCleanersCount(cleanersCount + 1)}
                    className="w-6 h-6 rounded bg-slate-100 font-bold cursor-pointer"
                  >+</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">{t.modals?.institutional?.durationMonths || 'Contract Duration'}</label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value={6}>6 Months Pilot</option>
                  <option value={12}>12 Months Annual SLA</option>
                  <option value={24}>24 Months Multi-Year</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">{t.modals?.institutional?.monthlyBudget || 'Monthly Retainer (₹)'}</label>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-900 bg-blue-50 p-2.5 rounded-lg border border-blue-200">
            <CheckCircle2 className="w-4 h-4 text-blue-700 flex-shrink-0" />
            <span>
              Includes 6% (₹{Math.round(monthlyBudget * 0.06)}/mo) mandatory contribution to the Workers Social Security & Insurance Fund.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-700/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {isSubmitting ? (t.modals?.institutional?.submitting || 'Registering Institutional Contract...') : (t.modals?.institutional?.submitBtn || 'Submit Institutional Contract Request')}
          </button>

        </form>
      </div>
    </div>
  );
};
