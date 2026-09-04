import React, { useState, useEffect } from 'react';
import { 
  Clock, ShieldCheck, Phone, MapPin, CheckCircle2, 
  Copy, Check, CreditCard, FileText, 
  Star, KeyRound, Sparkles, X
} from 'lucide-react';
import { Booking, Worker } from '../../types';
import { Language, translations } from '../../i18n/translations';

interface ActiveBookingTrackerCardProps {
  booking: Booking;
  allActiveBookings?: Booking[];
  onSelectBooking?: (booking: Booking) => void;
  onDismiss?: () => void;
  workers?: Worker[];
  onUpdateBookingStatus: (id: string, status: string) => Promise<void>;
  onVerifyOtp?: (id: string, otp: string) => Promise<any>;
  onOpenPayment: (booking: Booking) => void;
  onOpenInvoice: (booking: Booking) => void;
  onOpenRating: (booking: Booking) => void;
  currentLanguage?: Language;
}

export const ActiveBookingTrackerCard: React.FC<ActiveBookingTrackerCardProps> = ({
  booking,
  allActiveBookings = [],
  onSelectBooking,
  onDismiss,
  workers = [],
  onUpdateBookingStatus,
  onVerifyOtp,
  onOpenPayment,
  onOpenInvoice,
  onOpenRating,
  currentLanguage = 'en'
}) => {
  // Optimistic local status to guarantee smooth transition without jumps
  const [localStatus, setLocalStatus] = useState<string>(booking.status);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    setLocalStatus(booking.status);
  }, [booking.status, booking._id]);

  const effectiveStatus = localStatus || booking.status;
  const isCompleted = effectiveStatus === 'COMPLETED';
  const isInProgress = effectiveStatus === 'IN_PROGRESS';
  const isEnRoute = effectiveStatus === 'EN_ROUTE';

  // Live ETA countdown in minutes & seconds
  const initialMinutes = booking.etaMinutes || 14;
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);

  // Live work duration timer when IN_PROGRESS
  const [elapsedWorkSeconds, setElapsedWorkSeconds] = useState(45);

  useEffect(() => {
    let arrivalTimer: any = null;
    if (effectiveStatus === 'ALLOCATED' || effectiveStatus === 'EN_ROUTE') {
      arrivalTimer = setInterval(() => {
        setRemainingSeconds(prev => (prev > 60 ? prev - 1 : 60));
      }, 1000);
    }
    return () => {
      if (arrivalTimer) clearInterval(arrivalTimer);
    };
  }, [effectiveStatus]);

  useEffect(() => {
    let workTimer: any = null;
    if (effectiveStatus === 'IN_PROGRESS') {
      workTimer = setInterval(() => {
        setElapsedWorkSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (workTimer) clearInterval(workTimer);
    };
  }, [effectiveStatus]);

  const formatCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const formatElapsed = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    }
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Find worker details
  const assignedWorker = workers.find(w => w._id === booking.assignedWorkerId) || {
    _id: booking.assignedWorkerId || 'wrk_102',
    name: booking.workerName || 'Pravin Maruti Jadhav',
    phone: booking.workerPhone || '+91 98221 00102',
    trade: booking.serviceCategory || 'Electrical',
    customerRating: 4.88,
    completedJobs: 340,
    cooperativeName: booking.cooperativeName || 'Maha Jal Sahakari'
  };

  const otpCode = booking.otp || '4821';
  const otpDigits = otpCode.split('');

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(otpCode);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  const handleConfirmOtpAndStart = async (codeToVerify?: string) => {
    const finalCode = (codeToVerify || otpCode).trim();
    setIsVerifying(true);
    setLocalStatus('IN_PROGRESS');
    onSelectBooking?.(booking);
    try {
      if (onVerifyOtp) {
        await onVerifyOtp(booking._id, finalCode);
      } else {
        await onUpdateBookingStatus(booking._id, 'IN_PROGRESS');
      }
    } catch (err: any) {
      setLocalStatus(booking.status);
      alert(err.message || 'Incorrect OTP. Please check the code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteService = async () => {
    setIsCompleting(true);
    setLocalStatus('COMPLETED');
    onSelectBooking?.(booking);
    try {
      await onUpdateBookingStatus(booking._id, 'COMPLETED');
    } catch (err: any) {
      console.error('Failed to complete service:', err);
      setLocalStatus(booking.status);
    } finally {
      setIsCompleting(false);
    }
  };

  // STRICT RULE: Only render if service is PAID!
  if (booking.paymentStatus !== 'PAID') {
    return null;
  }

  return (
    <div className="bg-slate-950 text-white rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3.5 transition-all">
      


      {/* 2. Top Minimal Header: Status, Service, Address & Price */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : isInProgress
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-400' : isInProgress ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'}`} />
            <span>
              {isCompleted ? '✓ Completed' : isInProgress ? '⚡ In-Progress' : '🚗 En Route'}
            </span>
          </span>

          <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
            <span>{booking.serviceCategory}</span>
            <span className="text-slate-500 font-normal">/</span>
            <span className="text-emerald-400">{booking.subTrade}</span>
          </h3>

          <span className="text-xs text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate max-w-[180px] sm:max-w-[240px]">{booking.address}</span>
          </span>
        </div>

        {/* Right side: Amount & Paid Verification Badge */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <span className="text-base font-black text-white block leading-tight">
              ₹{booking.totalAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
              <span>Paid ✓</span>
            </span>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close Tracker"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Minimal 5-Stage Milestone Progress Bar */}
      <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-400 py-1.5 px-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-1 text-emerald-400 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>1. Confirmed</span>
        </div>
        <div className={`h-0.5 flex-1 mx-1.5 rounded ${isEnRoute || isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

        <div className={`flex items-center gap-1 whitespace-nowrap ${isEnRoute ? 'text-blue-400 font-black' : isInProgress || isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
          {isInProgress || isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <Clock className="w-3.5 h-3.5 flex-shrink-0" />}
          <span>2. En Route</span>
        </div>
        <div className={`h-0.5 flex-1 mx-1.5 rounded ${isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

        <div className={`flex items-center gap-1 whitespace-nowrap ${!isInProgress && !isCompleted ? 'text-amber-400 font-black' : 'text-emerald-400'}`}>
          {isInProgress || isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <KeyRound className="w-3.5 h-3.5 flex-shrink-0" />}
          <span>3. Doorstep OTP</span>
        </div>
        <div className={`h-0.5 flex-1 mx-1.5 rounded ${isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

        <div className={`flex items-center gap-1 whitespace-nowrap ${isInProgress ? 'text-emerald-400 font-black animate-pulse' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />}
          <span>4. In-Progress</span>
        </div>
        <div className={`h-0.5 flex-1 mx-1.5 rounded ${isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

        <div className={`flex items-center gap-1 whitespace-nowrap ${isCompleted ? 'text-emerald-400 font-black' : 'text-slate-500'}`}>
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>5. Completed</span>
        </div>
      </div>

      {/* 4. Streamlined Contextual Action Box */}
      
      {/* CASE A: COMPLETED -> Minimal celebration & review buttons (stays here, never jumps to OTP!) */}
      {isCompleted && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Service Completed Successfully!</span>
            </div>
            <p className="text-xs text-slate-300">
              Technician <strong>{assignedWorker.name}</strong> completed the work. Cooperative escrow payment released.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onOpenRating(booking)}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>Rate Service</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenInvoice(booking)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>GST Tax Invoice</span>
            </button>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* CASE B: IN_PROGRESS -> Active work timer & Complete Service button */}
      {isInProgress && (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-lg shadow-md flex-shrink-0">
              {assignedWorker.name.charAt(0)}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white">{assignedWorker.name}</h4>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  On-Site Working
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {assignedWorker.trade} Specialist • <strong>{assignedWorker.cooperativeName}</strong>
              </p>
              <p className="text-xs text-slate-400">
                Elapsed Time: <strong className="text-emerald-400 font-mono">{formatElapsed(elapsedWorkSeconds)}</strong> • Cooperative Escrow Protected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center">
            <a
              href={`tel:${assignedWorker.phone || '+91 98221 00102'}`}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Call</span>
            </a>

            <button
              type="button"
              disabled={isCompleting}
              onClick={handleCompleteService}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleting ? 'Completing...' : 'Work Done? Complete Service ➔'}</span>
            </button>
          </div>
        </div>
      )}

      {/* CASE C: ALLOCATED / EN_ROUTE -> Arrival Countdown & Clean Doorstep OTP */}
      {!isCompleted && !isInProgress && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fadeIn">
          {/* Worker Info & ETA */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md flex-shrink-0">
              {assignedWorker.name.charAt(0)}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white">{assignedWorker.name}</h4>
                <span className="text-[10px] text-blue-300 font-bold bg-blue-950 px-2 py-0.5 rounded-full border border-blue-800">
                  {assignedWorker.trade}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Arriving in <strong className="text-blue-400">~{formatCountdown(remainingSeconds)}</strong> (~1.1 km away)
              </p>
              <a
                href={`tel:${assignedWorker.phone || '+91 98221 00102'}`}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono"
              >
                <Phone className="w-3 h-3 inline" /> {assignedWorker.phone || '+91 98221 00102'}
              </a>
            </div>
          </div>

          {/* Minimal 4-Digit OTP Box */}
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-2.5 sm:px-3.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Doorstep OTP (Give to Worker upon Arrival)</span>
              </span>
              <div className="flex items-center gap-1.5 pt-1">
                {otpDigits.map((digit, idx) => (
                  <span
                    key={idx}
                    className="w-7 h-8 sm:w-8 sm:h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg font-mono shadow-xs"
                  >
                    {digit}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="ml-2 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedOtp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={isVerifying}
              onClick={() => handleConfirmOtpAndStart(otpCode)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap self-end lg:self-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isVerifying ? 'Verifying...' : 'Worker Arrived? Start Work ➔'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
