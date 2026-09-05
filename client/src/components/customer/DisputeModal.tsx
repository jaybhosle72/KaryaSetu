import React, { useState } from 'react';
import { Booking } from '../../types';
import { AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSubmitDispute: (disputeData: any) => Promise<void>;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmitDispute
}) => {
  const { t, getSectorTitle } = useLanguage();
  const [issueType, setIssueType] = useState<'QUALITY_OF_WORK' | 'TIMELINESS_DELAY' | 'OVERCHARGING_QUERY' | 'SAFETY_CONCERN' | 'BEHAVIOUR_MISCONDUCT'>('QUALITY_OF_WORK');
  const [description, setDescription] = useState('The replaced switchboard is occasionally sparking. Requesting a cooperative inspector review.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitDispute({
        bookingId: booking._id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        workerId: booking.assignedWorkerId,
        workerName: booking.workerName,
        cooperativeId: booking.cooperativeId,
        cooperativeName: booking.cooperativeName,
        serviceCategory: booking.serviceCategory,
        issueType,
        description
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">{t.modals?.dispute?.title || 'Cooperative Grievance Redressal'}</h3>
              <p className="text-xs text-slate-400">{t.modals?.dispute?.subtitle || 'Tripartite Mediation • MSCS Act Standards'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.modals?.dispute?.relatedBooking || 'Related Service Booking'}</span>
            <p className="text-sm font-black text-slate-900 mt-0.5">
              {getSectorTitle(booking.serviceCategory, booking.serviceCategory)} {booking.subTrade ? `(${booking.subTrade})` : ''}
            </p>
            <p className="text-slate-500 text-[11px]">
              {t.modals?.dispute?.workerLabel || 'Worker:'} {booking.workerName} • {booking.cooperativeName}
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              {t.modals?.dispute?.selectCategory || 'Select Category of Grievance'}
            </label>
            <select
              value={issueType}
              onChange={(e: any) => setIssueType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold focus:ring-2 focus:ring-amber-500"
            >
              <option value="QUALITY_OF_WORK">{t.modals?.dispute?.quality || 'Quality of Work / Secondary Inspection'}</option>
              <option value="TIMELINESS_DELAY">{t.modals?.dispute?.delay || 'Significant Transit Delay without Notice'}</option>
              <option value="OVERCHARGING_QUERY">{t.modals?.dispute?.overcharging || 'Tariff or Parts Cost Discrepancy'}</option>
              <option value="SAFETY_CONCERN">{t.modals?.dispute?.safety || 'Safety Protocol Non-Compliance'}</option>
              <option value="BEHAVIOUR_MISCONDUCT">{t.modals?.dispute?.misconduct || 'Professional Conduct Issue'}</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              {t.modals?.dispute?.describeIssue || 'Describe the Issue in Detail'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
              placeholder="State what went wrong and what resolution you require..."
            />
          </div>

          <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-blue-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-blue-700" />
              <span>Democratic Cooperative Arbitration:</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              {t.modals?.dispute?.guaranteeText || 'Disputes are mediated by the Cooperative Board under the Multi-State Cooperative Societies Act. Customer escrow is protected until resolution.'}
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow transition cursor-pointer"
          >
            {isSubmitting ? (t.modals?.dispute?.submitting || 'Submitting Grievance...') : (t.modals?.dispute?.submitBtn || 'Submit Formal Grievance ➔')}
          </button>

        </form>

      </div>
    </div>
  );
};
