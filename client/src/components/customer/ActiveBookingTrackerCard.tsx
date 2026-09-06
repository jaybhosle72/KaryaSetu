import React, { useState, useEffect } from 'react';
import { 
  Clock, ShieldCheck, Phone, MapPin, CheckCircle2, 
  Copy, Check, CreditCard, FileText, 
  Star, KeyRound, Sparkles, X, Users, Briefcase, ChevronRight, Radio
} from 'lucide-react';
import { Booking, Worker } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { useLanguage } from '../../i18n/LanguageContext';

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
  currentLanguage: propLanguage = 'en'
}) => {
  const { t, getServiceName, language } = useLanguage();
  const currentLanguage = propLanguage || language;
  const [localStatus, setLocalStatus] = useState<string>(booking.status);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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

  const handleCompleteService = () => {
    // Open the payment popup — payment confirmation triggers status update to COMPLETED
    onOpenPayment(booking);
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
            {language === 'mr' ? `सक्रिय बुकिंग (${allActiveBookings.length}):` : language === 'hi' ? `सक्रिय बुकिंग (${allActiveBookings.length}):` : `Active Bookings (${allActiveBookings.length}):`}
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
              <span>{getServiceName(b.serviceCategory)}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                b.paymentStatus === 'PAID' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
              }`}>
                {b.status === 'COMPLETED' ? (b.paymentStatus === 'PAID' ? (language === 'mr' ? 'भरणा पूर्ण ✓' : language === 'hi' ? 'भुगतान पूर्ण ✓' : 'Paid ✓') : (language === 'mr' ? 'देयक बाकी' : language === 'hi' ? 'भुगतान देय' : 'Pay Due')) : b.status}
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
              {isCompleted ? (language === 'mr' ? '✓ काम पूर्ण' : language === 'hi' ? '✓ सेवा पूर्ण' : '✓ Completed') 
               : isInProgress ? (language === 'mr' ? '⚡ काम सुरू' : language === 'hi' ? '⚡ कार्य प्रगति पर' : '⚡ In-Progress') 
               : isEnRoute ? (language === 'mr' ? '🚗 कामगार रस्त्यात आहे' : language === 'hi' ? '🚗 श्रमिक रास्ते में है' : '🚗 En Route') 
               : isAllocated ? (language === 'mr' ? '👷 तंत्रज्ञ नियुक्त' : language === 'hi' ? '👷 तकनीशियन नियुक्त' : '👷 Technician Assigned')
               : isProposalReceived ? (language === 'mr' ? '📋 प्रस्ताव प्राप्त' : language === 'hi' ? '📋 प्रस्ताव प्राप्त' : '📋 Proposal Received')
               : isProposalPending ? (language === 'mr' ? '⏳ प्रस्तावाची वाट पाहत आहे' : language === 'hi' ? '⏳ प्रस्ताव की प्रतीक्षा' : '⏳ Awaiting Proposal')
               : isContractorTeam ? (language === 'mr' ? '✓ प्रस्ताव मंजूर' : language === 'hi' ? '✓ प्रस्ताव स्वीकृत' : '✓ Proposal Approved')
               : (language === 'mr' ? '📡 कामगार शोधत आहे' : language === 'hi' ? '📡 तकनीशियन से मिलान जारी' : '📡 Matching Professional')}
            </span>
          </span>

          <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
            <span>{getServiceName(booking.serviceCategory)}</span>
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
                <span>{language === 'mr' ? 'भरणा पूर्ण ✓' : language === 'hi' ? 'भुगतान पूर्ण ✓' : 'Paid ✓'}</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-amber-400 inline" />
                <span>{isCompleted ? (language === 'mr' ? 'आता भरा' : language === 'hi' ? 'अभी भुगतान करें' : 'Pay Now') : (language === 'mr' ? 'कामानंतर भरा' : language === 'hi' ? 'काम के बाद भुगतान करें' : 'Pay After Service')}</span>
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
        <div className="overflow-x-auto scrollbar-none rounded-xl border border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 py-1.5 px-3 min-w-max">
          <div className="flex items-center gap-1 text-emerald-400 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{language === 'mr' ? '१. आवश्यकता' : language === 'hi' ? '1. आवश्यकता' : '1. Requirement'}</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 rounded ${isProposalReceived || isMatching || isAllocated || isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

          <div className={`flex items-center gap-1 whitespace-nowrap ${isProposalReceived ? 'text-amber-400 font-black' : isMatching || isAllocated || isInProgress || isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isMatching || isAllocated || isInProgress || isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            <span>{language === 'mr' ? '२. प्रस्ताव' : language === 'hi' ? '2. प्रस्ताव' : '2. Proposal'}</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 rounded ${isMatching || isAllocated || isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

          <div className={`flex items-center gap-1 whitespace-nowrap ${isMatching ? 'text-emerald-400 font-black' : isAllocated || isInProgress || isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isAllocated || isInProgress || isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
            <span>{language === 'mr' ? '३. मंजूर' : language === 'hi' ? '3. स्वीकृत' : '3. Approved'}</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 rounded ${isAllocated || isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

          <div className={`flex items-center gap-1 whitespace-nowrap ${isAllocated || isInProgress ? 'text-blue-400 font-black' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            <span>{language === 'mr' ? '४. पथक रवाना' : language === 'hi' ? '4. दस्ता रवाना' : '4. Crew Dispatched'}</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 rounded ${isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

          <div className={`flex items-center gap-1 whitespace-nowrap ${isCompleted ? 'text-emerald-400 font-black' : 'text-slate-500'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? '५. पूर्ण' : language === 'hi' ? '5. पूर्ण' : '5. Completed'}</span>
          </div>
        </div>
        </div>
      ) : (
        /* 5-Stage Solo Worker Milestone */
        <div className="overflow-x-auto scrollbar-none rounded-xl border border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 py-1.5 px-3 min-w-max">
          <div className={`flex items-center gap-1 whitespace-nowrap ${isMatching ? 'text-indigo-400 font-black animate-pulse' : 'text-emerald-400'}`}>
            {isAllocated || isEnRoute || isInProgress || isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5" />}
            <span>{language === 'mr' ? '१. शोधत आहे' : language === 'hi' ? '1. मिलान जारी' : '1. Matching'}</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 rounded ${isAllocated || isEnRoute || isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

          <div className={`flex items-center gap-1 whitespace-nowrap ${isAllocated || isEnRoute ? 'text-blue-400 font-black' : isInProgress || isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isInProgress || isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <Clock className="w-3.5 h-3.5 flex-shrink-0" />}
            <span>{language === 'mr' ? '२. रस्त्यात आहे' : language === 'hi' ? '2. रास्ते में' : '2. En Route'}</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 rounded ${isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

          <div className={`flex items-center gap-1 whitespace-nowrap ${isAllocated || isEnRoute ? 'text-amber-400 font-black' : isInProgress || isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isInProgress || isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <KeyRound className="w-3.5 h-3.5 flex-shrink-0" />}
            <span>{language === 'mr' ? '३. आगमन ओटीपी' : language === 'hi' ? '3. आगमन ओटीपी' : '3. Doorstep OTP'}</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 rounded ${isInProgress || isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

          <div className={`flex items-center gap-1 whitespace-nowrap ${isInProgress ? 'text-emerald-400 font-black animate-pulse' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />}
            <span>{language === 'mr' ? '४. काम सुरू' : language === 'hi' ? '4. कार्य प्रगति पर' : '4. In-Progress'}</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 rounded ${isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />

          <div className={`flex items-center gap-1 whitespace-nowrap ${isCompleted ? 'text-emerald-400 font-black' : 'text-slate-500'}`}>
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{language === 'mr' ? '५. पूर्ण' : language === 'hi' ? '5. पूर्ण' : '5. Completed'}</span>
          </div>
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
                {language === 'mr' ? 'कृती आवश्यक • कंत्राटदार योजना तपासा' : language === 'hi' ? 'कार्रवाई आवश्यक • ठेकेदार योजना की समीक्षा करें' : 'Action Required • Review Contractor Plan'}
              </span>
              <h4 className="text-lg font-black text-white mt-1">
                {language === 'mr' ? 'मुकादम कार्यबल प्रस्ताव तयार' : language === 'hi' ? 'मुकादम कार्यबल प्रस्ताव तैयार' : 'Mukaddam Workforce Proposal Formulated'}
              </h4>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">
                {language === 'mr' ? 'प्रस्तावित एकूण' : language === 'hi' ? 'प्रस्तावित कुल' : 'Proposed Total'}
              </span>
              <span className="text-2xl font-black text-white">₹{Number(booking.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {language === 'mr' ? 'कामगार संख्या' : language === 'hi' ? 'कार्यबल संख्या' : 'Workforce Sizing'}
              </span>
              <span className="text-sm font-black text-emerald-400 mt-0.5 block">
                {booking.teamSize || 3} {language === 'mr' ? 'प्रमाणित श्रमिक' : language === 'hi' ? 'सत्यापित श्रमिक' : 'Verified Shramiks'}
              </span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {t.tracker.estDuration}
              </span>
              <span className="text-sm font-black text-white mt-0.5 block">
                {booking.projectDurationDays || 2} {language === 'mr' ? 'दिवस' : language === 'hi' ? 'दिन' : 'Days'}
              </span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {language === 'mr' ? 'उपकरणे / डेपो' : language === 'hi' ? 'उपकरण / डिपो' : 'Equipment / Depot'}
              </span>
              <span className="text-xs font-semibold text-slate-300 mt-0.5 block truncate">
                {booking.proposal?.notes || t.tracker.toolsDepot}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-300">
              {language === 'mr' ? (
                <>कंत्राटदार <strong>{booking.contractorName || 'मुकादम'}</strong> यांनी हा आराखडा सादर केला आहे. मंजुरी दिल्यास सहकारी समितीकडून कामगारांचे पथक रवाना होईल.</>
              ) : language === 'hi' ? (
                <>ठेकेदार <strong>{booking.contractorName || 'मुकादम'}</strong> ने यह योजना प्रस्तुत की है। स्वीकृति देने पर सहकारी समिति से दस्ता रवाना होगा।</>
              ) : (
                <>Contractor <strong>{booking.contractorName || 'Mukaddam'}</strong> has submitted this plan. Approving authorizes crew dispatch from the cooperative.</>
              )}
            </p>
            <button
              type="button"
              disabled={isApproving}
              onClick={handleApproveProposalClick}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:scale-[1.02] active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApproving ? (language === 'mr' ? 'मंजूर करत आहे...' : language === 'hi' ? 'स्वीकृत हो रहा है...' : 'Approving Plan...') : (language === 'mr' ? 'प्रस्ताव मंजूर करा आणि पथक बोलवा ➔' : language === 'hi' ? 'प्रस्ताव स्वीकृत करें और दस्ता रवाना करें ➔' : 'Approve Proposal & Dispatch Crew ➔')}</span>
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
                {language === 'mr' ? 'प्रकल्प आवश्यकता मुकादमाकडे सादर' : language === 'hi' ? 'परियोजना आवश्यकता मुकादम को प्रस्तुत' : 'Project Requirement Submitted to Mukaddam'}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === 'mr' ? (
                  <>कंत्राटदार <strong>{booking.contractorName || 'मुकादम'}</strong> आपल्या जागेचे मूल्यांकन करत आहेत आणि कुशल कारागीर व सहाय्यक निश्चित करत आहेत.</>
                ) : language === 'hi' ? (
                  <>ठेकेदार <strong>{booking.contractorName || 'मुकादम'}</strong> आपकी साइट का मूल्यांकन कर रहे हैं और कुशल कारीगर व सहायकों का निर्धारण कर रहे हैं।</>
                ) : (
                  <>Contractor <strong>{booking.contractorName || 'Mukaddam'}</strong> is evaluating your site specs and sizing master craftsmen + helpers.</>
                )}
              </p>
            </div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400">
            <strong>{language === 'mr' ? 'कामाचे स्वरूप:' : language === 'hi' ? 'कार्य का दायरा:' : 'Scope:'}</strong> {booking.projectScope?.taskDescription || booking.subTrade} ({booking.projectScope?.propertyType || 'Residential'}, ~{booking.projectScope?.approxAreaSqFt || 1200} sq.ft)
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
                  {t.tracker.matchingTechnician}
                </h4>
                <span className="text-[10px] text-indigo-300 font-bold bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800 animate-pulse">
                  {language === 'mr' ? 'पूल सक्रिय' : language === 'hi' ? 'पूल सक्रिय' : 'Pool Active'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {language === 'mr' ? (
                  <>तुमची <strong>{getServiceName(booking.serviceCategory)}</strong> साठीची विनंती प्रमाणित श्रमिकांना पाठवली जात आहे.</>
                ) : language === 'hi' ? (
                  <>आपका <strong>{getServiceName(booking.serviceCategory)}</strong> के लिए अनुरोध प्रमाणित श्रमिकों को भेजा जा रहा है।</>
                ) : (
                  <>Your request for <strong>{getServiceName(booking.serviceCategory)}</strong> is available to certified shramiks in Pune.</>
                )}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                {language === 'mr' ? 'अपेक्षित प्रतिसाद: < ३ मिनिटे • एस्क्रो सुरक्षित' : language === 'hi' ? 'लक्षित प्रतिक्रिया: < 3 मिनट • एस्क्रो सुरक्षित' : 'Target Response: < 3 mins • Escrow protected'}
              </p>
            </div>
          </div>

          <div className="text-xs text-indigo-200 bg-indigo-900/40 px-3.5 py-2.5 rounded-xl border border-indigo-500/30 self-start sm:self-auto">
            <span>
              {language === 'mr' ? (
                <>पात्र कामगाराने डिव्हाइसवर <strong>काम स्वीकारा</strong> दाबायची वाट पाहत आहे.</>
              ) : language === 'hi' ? (
                <>योग्य श्रमिक द्वारा डिवाइस पर <strong>काम स्वीकारें</strong> दबाने की प्रतीक्षा है।</>
              ) : (
                <>Waiting for eligible worker to click <strong>Accept Job</strong> on their device.</>
              )}
            </span>
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
                  ? (language === 'mr' ? 'सेवा पूर्ण व एस्क्रो रक्कम वितरित!' : language === 'hi' ? 'सेवा पूर्ण और एस्क्रो जारी!' : 'Service Completed & Escrow Released!')
                  : (language === 'mr' ? 'काम पूर्ण! कृपया देयक भरा' : language === 'hi' ? 'काम पूरा हुआ! कृपया भुगतान करें' : 'Service Completed! Please Settle Payment')}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {language === 'mr' ? (
                booking.paymentStatus === 'PAID'
                  ? `तंत्रज्ञ ${assignedWorker.name} यांनी काम पूर्ण केले. आपला अनुभव नोंदवा किंवा कर बीजक डाउनलोड करा.`
                  : `तंत्रज्ञ ${assignedWorker.name} यांनी काम संपवले आहे. कामगाराचे एस्क्रो देयक देण्यासाठी ₹${Number(booking.totalAmount || 0).toLocaleString('en-IN')} चा भरणा करा.`
              ) : language === 'hi' ? (
                booking.paymentStatus === 'PAID'
                  ? `तकनीशियन ${assignedWorker.name} ने काम पूरा कर दिया है। अपने अनुभव को रेट करें या आधिकारिक टैक्स इनवॉइस डाउनलोड करें।`
                  : `तकनीशियन ${assignedWorker.name} ने काम पूरा कर लिया है। श्रमिक एस्क्रो जारी करने के लिए ₹${Number(booking.totalAmount || 0).toLocaleString('en-IN')} का भुगतान करें।`
              ) : (
                booking.paymentStatus === 'PAID'
                  ? `Technician ${assignedWorker.name} completed the work. Rate your experience or download your official tax invoice.`
                  : `Technician ${assignedWorker.name} has finished work. Settle ₹${Number(booking.totalAmount || 0).toLocaleString('en-IN')} payment to release worker escrow before reviewing.`
              )}
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
                <span>{t.tracker.payNow.replace('{amount}', Number(booking.totalAmount || 0).toLocaleString('en-IN'))} ➔</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onOpenRating(booking)}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{t.tracker.rateWorker}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenInvoice(booking)}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.tracker.viewInvoice}</span>
                </button>
              </>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                {t.common.close}
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
                  {language === 'mr' ? 'कार्यस्थळी उपस्थित' : language === 'hi' ? 'कार्यस्थल पर उपस्थित' : 'On-Site Working'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {assignedWorker.trade} {language === 'mr' ? 'तज्ज्ञ' : language === 'hi' ? 'विशेषज्ञ' : 'Specialist'} • <strong>{assignedWorker.cooperativeName}</strong>
              </p>
              <p className="text-xs text-slate-400">
                {t.tracker.timeElapsed}: <strong className="text-emerald-400 font-mono">{formatElapsed(elapsedWorkSeconds)}</strong> • {language === 'mr' ? 'सहकारी एस्क्रो सुरक्षित' : language === 'hi' ? 'सहकारी एस्क्रो संरक्षित' : 'Cooperative Escrow Protected'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center">
            <a
              href={`tel:${assignedWorker.phone || '+91 98221 00102'}`}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.payment.call}</span>
            </a>

            <button
              type="button"
              onClick={handleCompleteService}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'mr' ? 'काम पूर्ण झाले? सेवा समाप्त करा ➔' : language === 'hi' ? 'काम पूरा हुआ? सेवा समाप्त करें ➔' : 'Work Done? Complete Service ➔'}</span>
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
                {isEnRoute ? t.tracker.technicianEnRoute : t.tracker.technicianAllocated} • {t.tracker.etaRemaining} <strong className="text-blue-400">~{formatCountdown(remainingSeconds)}</strong>
              </p>
              <a
                href={`tel:${assignedWorker.phone || '+91 98221 00102'}`}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono"
              >
                <Phone className="w-3 h-3 inline" /> {assignedWorker.phone || '+91 98221 00102'}
              </a>
            </div>
          </div>

          {/* Doorstep Security OTP Box (Customer Handshake) */}
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3 sm:p-4 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>{t.tracker.securityOtp || 'Doorstep Security OTP'}</span>
                </span>
                <div className="flex items-center gap-1.5 pt-1.5">
                  {otpDigits.map((digit, idx) => (
                    <span
                      key={idx}
                      className="w-8 h-9 sm:w-9 sm:h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl font-mono shadow-md border border-amber-300"
                    >
                      {digit}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="ml-2 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-amber-500/30"
                  >
                    {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOtp ? (language === 'mr' ? 'कॉपी केले!' : language === 'hi' ? 'कॉपी किया!' : 'Copied!') : (language === 'mr' ? 'ओटीपी कॉपी करा' : language === 'hi' ? 'ओटीपी कॉपी करें' : 'Copy OTP')}</span>
                  </button>
                </div>
              </div>

              {/* Status Badge: Worker will ask for OTP at the doorstep */}
              <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/40 px-3.5 py-2.5 rounded-xl text-xs self-start sm:self-auto shadow-sm">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
                <div className="text-left">
                  <span className="font-black text-amber-300 block text-[11px]">
                    {language === 'mr' ? 'दारात आगमनाची प्रतीक्षा' : language === 'hi' ? 'दरवाजे पर आगमन की प्रतीक्षा' : 'Awaiting Doorstep Arrival'}
                  </span>
                  <span className="text-[10px] text-slate-300 block">
                    {language === 'mr' ? 'काम सुरू करण्यासाठी तंत्रज्ञाला हा ओटीपी द्या' : language === 'hi' ? 'काम शुरू करने के लिए तकनीशियन को यह ओटीपी दें' : 'Technician will ask for this OTP to start work'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-amber-200/90 bg-amber-950/60 rounded-xl px-3 py-2 border border-amber-500/25 flex items-start gap-2 leading-relaxed">
              <span className="text-amber-400 font-bold">ℹ️</span>
              <span>
                {language === 'mr'
                  ? `सुरक्षा सूचना: तंत्रज्ञ ${assignedWorker.name} प्रत्यक्ष तुमच्या दारात आल्यावरच हा ४-अंकी ओटीपी त्यांच्याशी शेअर करा. तंत्रज्ञ त्यांच्या मोबाईलमध्ये हा ओटीपी प्रविष्ट करून काम सुरू करेल.`
                  : language === 'hi'
                  ? `सुरक्षा निर्देश: तकनीशियन ${assignedWorker.name} के दरवाजे पर पहुंचने पर ही यह 4-अंकों का ओटीपी साझा करें। तकनीशियन अपने ऐप में यह कोड दर्ज करके काम शुरू करेगा।`
                  : `Security instruction: Share this 4-digit OTP with technician ${assignedWorker.name} ONLY when they arrive at your doorstep. The technician will enter it on their device to begin service.`}
              </span>
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
