import React, { useState } from 'react';
import { Booking } from '../../types';
import { Star, ShieldCheck, HeartHandshake, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSubmitRating: (bookingId: string, ratingData: {
    score: number;
    comment: string;
    quality: number;
    punctuality: number;
    safety: number;
    cooperativeEndorsement?: boolean;
  }) => Promise<void>;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmitRating
}) => {
  const { t, getSectorTitle } = useLanguage();
  const [score, setScore] = useState(5);
  const [quality, setQuality] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [safety, setSafety] = useState(5);
  const [comment, setComment] = useState('Excellent work, prompt arrival and very respectful behavior. Proud to support our local worker cooperative!');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitRating(booking._id, {
        score,
        comment,
        quality,
        punctuality,
        safety,
        cooperativeEndorsement: true
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">{t.modals?.rating?.title || 'Rate Worker & Service'}</h3>
            <p className="text-xs text-emerald-200">{t.modals?.rating?.subtitle || 'Holistic reputation beyond simple 5-stars'}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl font-bold cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="text-center pb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t.modals?.rating?.overallExp || 'Overall Experience with'}</p>
            <p className="text-sm font-bold text-slate-800">{booking.workerName} ({getSectorTitle(booking.serviceCategory, booking.serviceCategory)})</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  onClick={() => setScore(s)}
                  className={`w-7 h-7 cursor-pointer transition ${
                    s <= score ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">{t.modals?.rating?.technicalQuality || 'Technical Quality:'}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setQuality(v)}
                    className={`w-6 h-6 rounded text-xs font-bold cursor-pointer ${quality === v ? 'bg-emerald-600 text-white' : 'bg-white border'}`}
                  >{v}</button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">{t.modals?.rating?.punctuality || 'Punctuality & ETA:'}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPunctuality(v)}
                    className={`w-6 h-6 rounded text-xs font-bold cursor-pointer ${punctuality === v ? 'bg-emerald-600 text-white' : 'bg-white border'}`}
                  >{v}</button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">{t.modals?.rating?.safetyTools || 'Safety Protocols & Equipment:'}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSafety(v)}
                    className={`w-6 h-6 rounded text-xs font-bold cursor-pointer ${safety === v ? 'bg-emerald-600 text-white' : 'bg-white border'}`}
                  >{v}</button>
                ))}
              </div>
            </div>
          </div>


          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.common?.feedback || 'Feedback & Review'}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder={t.modals?.rating?.commentPlaceholder || 'Share details of the cooperative work done...'}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition cursor-pointer"
          >
            {isSubmitting ? (t.modals?.rating?.submitting || 'Submitting Rating...') : (t.modals?.rating?.submitBtn || 'Submit Official Review ➔')}
          </button>
        </form>
      </div>
    </div>
  );
};
