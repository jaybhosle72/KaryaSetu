import React, { useState, useEffect } from 'react';
import { 
  Clock, ShieldCheck, Phone, MapPin, CheckCircle2, 
  Copy, Check, CreditCard, FileText, 
  Star, KeyRound, Sparkles, X, Users, Briefcase, ChevronRight, Radio
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
  onApproveProposal?: (bookingId: string) => Promise<any>;
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
  onApproveProposal,
  currentLanguage = 'en'
}) => {
  const [localStatus, setLocalStatus] = useState<string>(booking.status);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    setLocalStatus(booking.status);
  }, [booking.status, booking._id]);

  const effectiveStatus = localStatus || booking.status;
  const isContractorTeam = booking.bookingMode === 'CONTRACTOR_TEAM';
  const isCompleted = effectiveStatus === 'COMPLETED';
  const isInProgress = effectiveStatus === 'IN_PROGRESS';
  const isEnRoute = effectiveStatus === 'EN_ROUTE';
  const isAllocated = effectiveStatus === 'ALLOCATED';
  const isMatching = effectiveStatus === 'MATCHING';
  const isProposalPending = effectiveStatus === 'PROPOSAL_PENDING';
  const isProposalReceived = effectiveStatus === 'PROPOSAL_RECEIVED';

  // Live ETA countdown in minutes & seconds
  const initialMinutes = booking.etaMinutes || 15;
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
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

  // Find worker details from real database workers
  const assignedWorker = workers.find(w => w._id === booking.assignedWorkerId) || {
    _id: booking.assignedWorkerId,
    name: booking.workerName || 'Assigned Cooperative Technician',
    phone: booking.workerPhone || '+91 98221 00101',
    trade: booking.serviceCategory || 'Electrical',
    customerRating: 4.88,
    completedJobs: 0,
    cooperativeName: booking.cooperativeName || 'Maharashtra Labour Cooperative'
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

  const handleApproveProposalClick = async () => {
    setIsApproving(true);
    try {
      if (onApproveProposal) {
        await onApproveProposal(booking._id);
      } else {
        await onUpdateBookingStatus(booking._id, 'MATCHING');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to approve proposal');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3.5 transition-all">
      
      {/* Multi-booking switcher if customer has more than 1 active job */}
      {allActiveBookings && allActiveBookings.length > 1 && (
        <div className="flex items-center gap-2 pb-2.5 overflow-x-auto border-b border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
            Active Bookings ({allActiveBookings.length}):
          </span>
          {allActiveBookings.map((b) => (
            <button
              key={b._id}
              type="button"
              onClick={() => onSelectBooking?.(b)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                b._id === booking._id
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{b.serviceCategory}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                b.paymentStatus === 'PAID' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
              }`}>
                {b.status === 'COMPLETED' ? (b.paymentStatus === 'PAID' ? 'Paid ✓' : 'Pay Due') : b.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Top Header: Status, Service, Address & Price */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : isInProgress
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : isProposalReceived
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : isProposalPending
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
              : isMatching
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse'
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isCompleted ? 'bg-emerald-400' 
              : isInProgress ? 'bg-emerald-400 animate-ping' 
              : isMatching ? 'bg-indigo-400 animate-ping'
              : isProposalReceived ? 'bg-amber-400 animate-bounce'
              : 'bg-blue-400'
            }`} />
            <span>
              {isCompleted ? '✓ Completed' 
               : isInProgress ? '⚡ In-Progress' 
               : isEnRoute ? '🚗 En Route' 
               : isAllocated ? '👷 Technician Assigned'
               : isProposalReceived ? '📋 Proposal Received'
               : isProposalPending ? '⏳ Awaiting Proposal'
               : isContractorTeam ? '✓ Proposal Approved'
               : '📡 Matching Professional'}
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

        {/* Right side: Amount & Payment Status Badge */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <span className="text-base font-black text-white block leading-tight">
              ₹{Number(booking.totalAmount || 0).toLocaleString('en-IN')}
            </span>
            {booking.paymentStatus === 'PAID' ? (
              <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1 justify-end">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
                <span>Paid ✓</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-amber-400 inline" />
                <span>{isCompleted ? 'Pay Now' : 'Pay After Service'}</span>
              </span>
            )}
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

      {/* Milestone Progress Bar */}
      {isContractorTeam ? (
        /* 5-Stage Contractor Team Milestone */
        <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-400 py-1.5 px-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1 text-emerald-400 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>1. Requirement</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 rounded ${isProposalReceived || isMatching || isAllocated || isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

          <div className={`flex items-center gap-1 whitespace-nowrap ${isProposalReceived ? 'text-amber-400 font-black' : isMatching || isAllocated || isInProgress || isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isMatching || isAllocated || isInProgress || isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            <span>2. Proposal</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 rounded ${isMatching || isAllocated || isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

          <div className={`flex items-center gap-1 whitespace-nowrap ${isMatching ? 'text-emerald-400 font-black' : isAllocated || isInProgress || isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isAllocated || isInProgress || isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
            <span>3. Approved</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 rounded ${isAllocated || isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

          <div className={`flex items-center gap-1 whitespace-nowrap ${isAllocated || isInProgress ? 'text-blue-400 font-black' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            <span>4. Crew Dispatched</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 rounded ${isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

          <div className={`flex items-center gap-1 whitespace-nowrap ${isCompleted ? 'text-emerald-400 font-black' : 'text-slate-500'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>5. Completed</span>
          </div>
        </div>
      ) : (
        /* 5-Stage Solo Worker Milestone */
        <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-400 py-1.5 px-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <div className={`flex items-center gap-1 whitespace-nowrap ${isMatching ? 'text-indigo-400 font-black animate-pulse' : 'text-emerald-400'}`}>
            {isAllocated || isEnRoute || isInProgress || isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5" />}
            <span>1. Matching</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 rounded ${isAllocated || isEnRoute || isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

          <div className={`flex items-center gap-1 whitespace-nowrap ${isAllocated || isEnRoute ? 'text-blue-400 font-black' : isInProgress || isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isInProgress || isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <Clock className="w-3.5 h-3.5 flex-shrink-0" />}
            <span>2. En Route</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 rounded ${isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

          <div className={`flex items-center gap-1 whitespace-nowrap ${isAllocated || isEnRoute ? 'text-amber-400 font-black' : isInProgress || isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
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
      )}

      {/* Contextual Action Cards */}

      {/* ================= CASE 1: CONTRACTOR PROPOSAL RECEIVED ================= */}
      {isContractorTeam && isProposalReceived && (
        <div className="bg-amber-950/40 border-2 border-amber-500/60 rounded-2xl p-5 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/30 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-900/60 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                Action Required • Review Contractor Plan
              </span>
              <h4 className="text-lg font-black text-white mt-1">
                Mukaddam Workforce Proposal Formulated
              </h4>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Proposed Total</span>
              <span className="text-2xl font-black text-white">₹{Number(booking.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Workforce Sizing</span>
              <span className="text-sm font-black text-emerald-400 mt-0.5 block">
                {booking.teamSize || 3} Verified Shramiks
              </span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Duration</span>
              <span className="text-sm font-black text-white mt-0.5 block">
                {booking.projectDurationDays || 2} Days
              </span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Equipment / Depot</span>
              <span className="text-xs font-semibold text-slate-300 mt-0.5 block truncate">
                {booking.proposal?.notes || 'Cooperative Depot Included'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-300">
              Contractor <strong>{booking.contractorName || 'Mukaddam'}</strong> has submitted this plan. Approving authorizes crew dispatch from the cooperative.
            </p>
            <button
              type="button"
              disabled={isApproving}
              onClick={handleApproveProposalClick}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:scale-[1.02] active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApproving ? 'Approving Plan...' : 'Approve Proposal & Dispatch Crew ➔'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= CASE 2: CONTRACTOR PROPOSAL PENDING ================= */}
      {isContractorTeam && isProposalPending && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black flex-shrink-0 animate-pulse">
              📋
            </div>
            <div>
              <h4 className="text-sm font-black text-white">
                Project Requirement Submitted to Mukaddam
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Contractor <strong>{booking.contractorName || 'Mukaddam'}</strong> is evaluating your site specs and sizing master craftsmen + helpers.
              </p>
            </div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400">
            <strong>Scope:</strong> {booking.projectScope?.taskDescription || booking.subTrade} ({booking.projectScope?.propertyType || 'Residential'}, ~{booking.projectScope?.approxAreaSqFt || 1200} sq.ft)
          </div>
        </div>
      )}

      {/* ================= CASE 3: SOLO WORKER MATCHING ================= */}
      {!isContractorTeam && isMatching && !booking.assignedWorkerId && (
        <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-black text-xl flex-shrink-0 relative">
              <span className="animate-spin text-2xl">📡</span>
              <span className="absolute -inset-1 rounded-2xl border-2 border-indigo-400/40 border-t-transparent animate-spin" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white">
                  Broadcasting to Verified Cooperative Professionals
                </h4>
                <span className="text-[10px] text-indigo-300 font-bold bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800 animate-pulse">
                  Pool Active
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Your request for <strong>{booking.serviceCategory}</strong> is available to certified shramiks in Pune.
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Target Response: &lt; 3 mins • Escrow protected
              </p>
            </div>
          </div>

          <div className="text-xs text-indigo-200 bg-indigo-900/40 px-3.5 py-2.5 rounded-xl border border-indigo-500/30 self-start sm:self-auto">
            <span>Waiting for eligible worker to click <strong>Accept Job</strong> on their device.</span>
          </div>
        </div>
      )}

      {/* ================= CASE 4: COMPLETED ================= */}
      {isCompleted && (
        <div className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn ${
          booking.paymentStatus === 'PAID'
            ? 'bg-emerald-950/40 border-emerald-500/40'
            : 'bg-amber-950/30 border-amber-500/40'
        }`}>
          <div className="space-y-0.5">
            <div className={`flex items-center gap-2 font-black text-sm ${
              booking.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>
                {booking.paymentStatus === 'PAID'
                  ? 'Service Completed & Escrow Released!'
                  : 'Service Completed! Please Settle Payment'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {booking.paymentStatus === 'PAID'
                ? `Technician ${assignedWorker.name} completed the work. Rate your experience or download your official tax invoice.`
                : `Technician ${assignedWorker.name} has finished work. Settle ₹${Number(booking.totalAmount || 0).toLocaleString('en-IN')} payment to release worker escrow before reviewing.`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {booking.paymentStatus !== 'PAID' ? (
              <button
                type="button"
                onClick={() => onOpenPayment(booking)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.99] transition cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Now (₹{Number(booking.totalAmount || 0).toLocaleString('en-IN')}) ➔</span>
              </button>
            ) : (
              <>
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
              </>
            )}
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

      {/* ================= CASE 5: IN_PROGRESS ================= */}
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

      {/* ================= CASE 6: ALLOCATED / EN_ROUTE ================= */}
      {!isCompleted && !isInProgress && (isAllocated || isEnRoute) && (
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
                {isEnRoute ? 'En Route to your location' : 'Assigned from Cooperative'} • Arriving in <strong className="text-blue-400">~{formatCountdown(remainingSeconds)}</strong>
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
