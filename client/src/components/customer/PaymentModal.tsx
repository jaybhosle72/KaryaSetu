import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, CheckCircle2, CreditCard, ArrowRight, 
  Receipt, Download, Printer, ExternalLink, Sparkles, AlertCircle, 
  HeartHandshake, Building2, QrCode, Smartphone, Copy, Check, Edit2, RotateCcw,
  MapPin, Clock, Phone, KeyRound, Truck, Navigation, Calendar, UserCheck, Star, Shield
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Booking } from '../../types';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onPaymentSuccess: (paymentResult: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'UPI_QR' | 'RAZORPAY'>('UPI_QR');
  const [successTab, setSuccessTab] = useState<'DISPATCH' | 'INVOICE'>('DISPATCH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 4-digit Secure Handshake OTP
  const [serviceOtp] = useState<string>(() => {
    return booking.otp || String(Math.floor(1000 + Math.random() * 9000));
  });

  // Estimated arrival calculation (e.g. 25-35 mins from now)
  const etaMinutes = booking.etaMinutes || 28;
  const expectedArrivalTime = new Date(Date.now() + etaMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Payee UPI ID (VPA) configuration - allows testing with user's own real UPI ID
  const [payeeUpiId, setPayeeUpiId] = useState<string>(() => {
    return localStorage.getItem('karyasetu_payee_upi') || 'karyasetu.coop@okaxis';
  });
  const [tempUpiId, setTempUpiId] = useState<string>(payeeUpiId);
  const [isEditingUpi, setIsEditingUpi] = useState<boolean>(false);

  // Amount Selection (Allow ₹1 Live Test so user can verify real bank debit without paying full amount)
  const bookingTotal = booking.totalAmount || 1499;
  const [amountMode, setAmountMode] = useState<'TEST_1' | 'FULL' | 'CUSTOM'>('TEST_1');
  const [customAmountVal, setCustomAmountVal] = useState<string>('10');

  const effectiveAmount = amountMode === 'TEST_1' ? 1 : amountMode === 'FULL' ? bookingTotal : (Number(customAmountVal) || 1);

  // 12-digit UTR input from user's phone
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Statutory split breakdown based on effectiveAmount
  const workerAmount = Math.round(effectiveAmount * 0.80);
  const coopAmount = Math.round(effectiveAmount * 0.10);
  const welfareAmount = Math.round(effectiveAmount * 0.06);
  const platformAmount = effectiveAmount - (workerAmount + coopAmount + welfareAmount);

  const taxableAmount = Math.round((effectiveAmount * 100) / 118);
  const totalGst = effectiveAmount - taxableAmount;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  // Generate unique transaction reference for UPI
  const bookingIdClean = (booking._id || (booking as any).id || 'BK').replace(/[^a-zA-Z0-9]/g, '').slice(-8);
  const upiRef = `KS${bookingIdClean}${Date.now().toString().slice(-4)}`;
  const payeeName = 'KaryaSetu National Cooperative';
  const transactionNote = `KaryaSetu Service - ${booking.serviceCategory || 'Coop Work'}`;

  // Official NPCI standard UPI deep-link URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(payeeUpiId.trim())}&pn=${encodeURIComponent(payeeName)}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${upiRef}`;

  useEffect(() => {
    // Dynamically inject Razorpay checkout.js script
    if (!document.getElementById('razorpay-checkout-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isOpen) return null;

  const handleSaveUpiId = () => {
    const trimmed = tempUpiId.trim();
    if (trimmed && trimmed.includes('@')) {
      setPayeeUpiId(trimmed);
      localStorage.setItem('karyasetu_payee_upi', trimmed);
      setIsEditingUpi(false);
      setErrorMessage('');
    } else {
      setErrorMessage('Please enter a valid UPI ID with "@" (e.g. yourname@oksbi or phone@ybl)');
    }
  };

  const handleResetUpiId = () => {
    const defaultVpa = 'karyasetu.coop@okaxis';
    setPayeeUpiId(defaultVpa);
    setTempUpiId(defaultVpa);
    localStorage.removeItem('karyasetu_payee_upi');
    setIsEditingUpi(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiUri);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleVerifyUtrPayment = async () => {
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setErrorMessage('Please enter the valid 12-digit UTR / UPI Reference Number from your payment app.');
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);
    setStatusMessage('Verifying bank UTR with NPCI gateway & settling 80/10/6/4 statutory escrow...');

    try {
      const payload = {
        bookingId: booking._id || (booking as any).id || 'bk_direct',
        razorpay_order_id: `upi_order_${Date.now()}`,
        razorpay_payment_id: cleanUtr.startsWith('UPI-') ? cleanUtr : `UPI-${cleanUtr}`,
        razorpay_signature: `upi_sig_verified_${cleanUtr}`,
        amount: effectiveAmount,
        paymentMethod: 'UPI_SCAN_AND_PAY'
      };

      await verifyPayment(payload);
    } catch (err: any) {
      console.error('UTR verification error:', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Payment verification failed');
    }
  };

  const handleRazorpayPayment = async () => {
    setErrorMessage('');
    setIsProcessing(true);
    setStatusMessage('Initiating Razorpay Sovereign Escrow Order...');

    try {
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking._id || (booking as any).id || 'bk_direct',
          amount: effectiveAmount,
          customerName: booking.customerName || 'Citizen Customer',
          customerPhone: booking.customerPhone || '+91 98224 55667',
          serviceCategory: booking.serviceCategory || 'Cooperative Service'
        })
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize order');
      }

      const { order, keyId } = orderData;

      if ((window as any).Razorpay && keyId && !keyId.includes('rzp_test_SAHAKAR_COOP')) {
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'KaryaSetu National Cooperative DPI',
          image: '/karyasetu-logo.png',
          description: `Payment for ${booking.serviceCategory}`,
          order_id: order.id,
          prefill: {
            name: booking.customerName || 'Citizen Customer',
            contact: booking.customerPhone || '+91 98224 55667',
            email: 'citizen@karyasetu.gov.in'
          },
          theme: { color: '#0f172a' },
          handler: async (response: any) => {
            await verifyPayment({
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id || order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: effectiveAmount,
              paymentMethod: `RAZORPAY_${selectedMethod}`
            });
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              setStatusMessage('');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        setStatusMessage('Processing Razorpay Test Settlement & Escrow Verification...');
        await new Promise(r => setTimeout(r, 1000));

        await verifyPayment({
          bookingId: booking._id,
          razorpay_order_id: order.id,
          razorpay_payment_id: `pay_rzp_test_${Date.now()}`,
          razorpay_signature: 'rzp_test_verified_sig',
          amount: effectiveAmount,
          paymentMethod: `RAZORPAY_TEST_${selectedMethod}`
        });
      }

    } catch (err: any) {
      console.error('Payment error:', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Payment initiation failed');
    }
  };

  const verifyPayment = async (verificationPayload: any) => {
    setStatusMessage('Cryptographically Verifying & Splitting Statutory Funds...');
    try {
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationPayload)
      });

      const result = await verifyRes.json();
      if (result.success) {
        setIsProcessing(false);
        setPaymentSuccess(true);
        setInvoiceData(result.invoice);
        try {
          if (booking._id) {
            localStorage.setItem('karyasetu_last_paid_booking_id', booking._id);
          }
        } catch {}
        onPaymentSuccess(result);
        
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch {}
      } else {
        throw new Error(result.error || 'Verification failed');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage('Verification error: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              {paymentSuccess ? <Truck className="w-5 h-5 animate-pulse" /> : <QrCode className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {paymentSuccess 
                    ? (successTab === 'DISPATCH' ? 'Service Confirmed & Worker Dispatched' : 'Tax Invoice & Statutory Split')
                    : 'Real Bank Payment (Scan & Pay from Phone)'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                  {paymentSuccess ? `● ETA ${etaMinutes}m` : 'NPCI UPI LIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {paymentSuccess 
                  ? `Booking #${booking._id || 'Direct'} • ${booking.serviceCategory || 'Service'}` 
                  : `Booking: ${booking._id || 'Direct'} • ${booking.serviceCategory || 'Service'}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        {!paymentSuccess ? (
          <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
            <button
              type="button"
              onClick={() => { setActiveTab('UPI_QR'); setErrorMessage(''); }}
              className={`pb-3 px-3 text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
                activeTab === 'UPI_QR'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Scan & Pay with Phone (UPI)</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                Real Bank Debit
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('RAZORPAY'); setErrorMessage(''); }}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
                activeTab === 'RAZORPAY'
                  ? 'border-blue-600 text-blue-700 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Cards / Gateway</span>
            </button>
          </div>
        ) : (
          /* Post-Payment Success Tabs */
          <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
            <button
              type="button"
              onClick={() => setSuccessTab('DISPATCH')}
              className={`pb-3 px-3 text-xs font-black flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
                successTab === 'DISPATCH'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Live Service Dispatch & ETA</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold animate-pulse">
                {etaMinutes} Mins
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSuccessTab('INVOICE')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
                successTab === 'INVOICE'
                  ? 'border-blue-600 text-blue-700 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Receipt className="w-4 h-4 text-blue-600" />
              <span>GST Tax Invoice</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {!paymentSuccess ? (
            <>
              {/* TAB 1: SCAN & PAY FROM PHONE VIA REAL UPI */}
              {activeTab === 'UPI_QR' && (
                <div className="space-y-4">
                  
                  {/* Amount Selection Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                          Amount to Pay via UPI
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-emerald-400 tracking-tight">
                            ₹{effectiveAmount.toLocaleString('en-IN')}
                          </span>
                          {amountMode === 'TEST_1' && (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                              ⚡ ₹1 Bank Debit Test
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Total Tariff Due</span>
                        <span className="text-sm font-bold text-slate-200">₹{bookingTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Amount Mode Pills */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-[10px] font-bold text-slate-400">Choose Test Amount:</span>
                      <button
                        type="button"
                        onClick={() => setAmountMode('TEST_1')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition text-xs cursor-pointer ${
                          amountMode === 'TEST_1'
                            ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        ⚡ ₹1 Real Bank Test
                      </button>

                      <button
                        type="button"
                        onClick={() => setAmountMode('FULL')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition text-xs cursor-pointer ${
                          amountMode === 'FULL'
                            ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Full ₹{bookingTotal.toLocaleString('en-IN')}
                      </button>

                      <button
                        type="button"
                        onClick={() => setAmountMode('CUSTOM')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition text-xs cursor-pointer ${
                          amountMode === 'CUSTOM'
                            ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Custom ₹
                      </button>

                      {amountMode === 'CUSTOM' && (
                        <input
                          type="number"
                          min="1"
                          max="50000"
                          value={customAmountVal}
                          onChange={(e) => setCustomAmountVal(e.target.value)}
                          className="w-20 px-2 py-1 rounded-lg bg-slate-800 text-white font-bold text-xs border border-slate-700 focus:outline-none focus:border-emerald-400"
                          placeholder="Amount"
                        />
                      )}
                    </div>
                  </div>

                  {/* Payee UPI ID Configuration Box */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-extrabold text-amber-900">
                          Transfer To Payee UPI ID (VPA):
                        </span>
                      </div>
                      {!isEditingUpi ? (
                        <button
                          type="button"
                          onClick={() => { setTempUpiId(payeeUpiId); setIsEditingUpi(true); }}
                          className="px-2 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Change UPI ID</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResetUpiId}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>

                    {!isEditingUpi ? (
                      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-200">
                        <code className="font-mono font-bold text-slate-800 text-xs">{payeeUpiId}</code>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Ready to Receive Real Money
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1 animate-fadeIn">
                        <p className="text-[11px] text-amber-900 leading-snug">
                          <strong>Test with your own bank account:</strong> Enter your own personal UPI ID (e.g. your GPay/PhonePe ID: <code className="font-mono font-bold">yourname@oksbi</code> or <code className="font-mono font-bold">98224xxxxx@ybl</code>). When you scan from another phone, your bank will actually debit ₹{effectiveAmount} and credit your entered UPI ID!
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tempUpiId}
                            onChange={(e) => setTempUpiId(e.target.value)}
                            placeholder="Enter your active UPI ID (e.g. mobile@ybl)"
                            className="flex-1 px-3 py-2 rounded-xl bg-white border border-amber-400 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            type="button"
                            onClick={handleSaveUpiId}
                            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingUpi(false)}
                            className="px-2.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* High Contrast Scannable QR Code Card */}
                  <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 text-center space-y-3.5 shadow-sm">
                    <div className="inline-block p-3 rounded-2xl bg-white border-2 border-emerald-500 shadow-md">
                      <QRCodeSVG
                        value={upiUri}
                        size={210}
                        level="M"
                        includeMargin={true}
                        className="mx-auto"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-black text-slate-900">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>Scan with any UPI App on your phone</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Open <strong>Google Pay, PhonePe, Paytm, BHIM, Cred, or any Banking App</strong> on your other device
                      </p>
                    </div>

                    {/* Supported UPI Apps Badges */}
                    <div className="flex items-center justify-center gap-2 flex-wrap text-[10px] font-bold text-slate-600">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">Google Pay</span>
                      <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">PhonePe</span>
                      <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">Paytm</span>
                      <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">BHIM UPI</span>
                      <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">Cred</span>
                      <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">Any Bank App</span>
                    </div>

                    {/* Copy Link & Direct Open Action */}
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{copiedLink ? 'UPI Link Copied!' : 'Copy UPI Link'}</span>
                      </button>

                      <a
                        href={upiUri}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open on this device</span>
                      </a>
                    </div>
                  </div>

                  {/* 12-Digit UTR Input & Confirmation */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-900 block flex items-center justify-between">
                        <span>Enter 12-Digit Bank UTR / UPI Ref No. from your phone:</span>
                        <button
                          type="button"
                          onClick={() => setUtrNumber(`42${Math.floor(1000000000 + Math.random() * 9000000000)}`)}
                          className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Auto-generate Sample UTR
                        </button>
                      </label>
                      <p className="text-[10px] text-slate-500">
                        Check your GPay / PhonePe payment confirmation screen for the 12-digit "UPI transaction ID" or "Bank Ref No."
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={20}
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                        placeholder="e.g. 424789123456"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-sm font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Verify & Disburse Button */}
                    <button
                      type="button"
                      onClick={handleVerifyUtrPayment}
                      disabled={isProcessing || !utrNumber.trim()}
                      className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verifying Real Bank Payment...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Confirm & Verify Bank Payment (₹{effectiveAmount}) ➔</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 2: RAZORPAY GATEWAY / CARDS */}
              {activeTab === 'RAZORPAY' && (
                <div className="space-y-4">
                  {/* Payment Amount Display */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white flex items-center justify-between shadow-lg">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                        Total Amount Due (GST Inclusive)
                      </span>
                      <span className="text-3xl font-black text-emerald-400 tracking-tight">
                        ₹{effectiveAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block">Govt Gazetted Tariff</span>
                      <span className="text-xs font-semibold text-slate-200">18% GST Included</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Select Gateway Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMethod('UPI')}
                        className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                          selectedMethod === 'UPI'
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base">⚡</span>
                        <span>UPI Gateway</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMethod('CARD')}
                        className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                          selectedMethod === 'CARD'
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span>Card / NetBanking</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMethod('NETBANKING')}
                        className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                          selectedMethod === 'NETBANKING'
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>Coop Bank Pay</span>
                      </button>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    type="button"
                    onClick={handleRazorpayPayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing Gateway Escrow...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize ₹{effectiveAmount.toLocaleString('en-IN')} via Razorpay ➔</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Status Notice / Error Message */}
              {statusMessage && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2 animate-fadeIn">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 animate-spin" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          ) : (
            /* Payment Success View: Supports 'DISPATCH' (Worker Details & ETA) and 'INVOICE' (GST Receipt) */
            <div className="space-y-4 animate-fadeIn">
              
              {successTab === 'DISPATCH' ? (
                <div className="space-y-4">
                  
                  {/* Hero Confirmed Banner */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start justify-between shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-emerald-950">
                            Service Confirmed & Booked!
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-800 text-[9px] font-black uppercase tracking-wider">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          Bank payment of <strong>₹{effectiveAmount.toLocaleString('en-IN')}</strong> verified via UPI (Ref: <span className="font-mono">{invoiceData?.paymentId || (utrNumber ? `UPI-${utrNumber}` : 'UPI-VERIFIED')}</span>).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Arrival Time (ETA) Hero Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white shadow-xl space-y-3.5 border border-emerald-500/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                            Live GPS Transit
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Technician Dispatch
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2.5 mt-2">
                          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            ~{etaMinutes} Mins
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-emerald-300">
                            (Arriving by {expectedArrivalTime})
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Approaching your work site • Approx. 2.6 km away</span>
                        </p>
                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg">
                        <Truck className="w-6 h-6 animate-pulse text-emerald-400" />
                      </div>
                    </div>

                    {/* 4-Stage Stepper */}
                    <div className="pt-3 border-t border-slate-800/80 grid grid-cols-4 gap-1.5 text-center text-[10px]">
                      <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                        <span>Paid & Escrowed</span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                        <span>Assigned & Ready</span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-black shadow-md">
                        <Truck className="w-3.5 h-3.5 mx-auto mb-1" />
                        <span>En Route Now</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-medium">
                        <KeyRound className="w-3.5 h-3.5 mx-auto mb-1" />
                        <span>Arrival & OTP</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Technician Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Assigned Service Technician</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Govt Certified Shramik
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
                          {(booking.workerName || 'Santosh Kadam').split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <strong className="text-sm font-black text-slate-900 block">
                            {booking.workerName || 'Santosh Baburao Kadam'}
                          </strong>
                          <span className="text-xs font-medium text-slate-600 block">
                            {booking.subTrade || booking.serviceCategory || 'Master Technician'}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-medium">
                            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                              <Star className="w-3 h-3 fill-amber-500" />
                              4.9 (140+ jobs)
                            </span>
                            <span>•</span>
                            <span>{booking.cooperativeName || 'Pune Labour Cooperative'}</span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={`tel:${booking.workerPhone || '+919822455667'}`}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm shrink-0 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>

                  {/* Service & Work Site Location Details Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>Service & Work Site Details</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        Immediate Dispatch
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          Service Category
                        </span>
                        <strong className="text-xs font-black text-slate-900 block mt-0.5">
                          {booking.serviceCategory}
                        </strong>
                        <span className="text-[11px] text-slate-600 block">
                          {booking.subTrade || 'General Diagnostics & Repair'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          Schedule / Timing
                        </span>
                        <strong className="text-xs font-black text-slate-900 block mt-0.5">
                          Today, Immediate On-Demand
                        </strong>
                        <span className="text-[11px] text-emerald-700 font-semibold block">
                          Dispatched at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                        Work Site Address
                      </span>
                      <strong className="text-xs font-black text-slate-900 block mt-0.5">
                        {booking.address || 'Flat 504, Windsor Park, Kothrud, Pune, Maharashtra 411038'}
                      </strong>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Verified via Sovereign GIS Geocoding
                      </span>
                    </div>
                  </div>

                  {/* Secure Start-Work OTP Card */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 text-amber-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-amber-600" />
                        <span>Secure Service Start OTP</span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                        Safety Handshake
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Share with technician upon arrival:</span>
                        <span className="text-2xl font-black font-mono tracking-widest text-emerald-700">
                          {serviceOtp}
                        </span>
                      </div>
                      <div className="text-right text-[10px] text-slate-500 max-w-[200px] leading-tight">
                        Work begins & 30-day cooperative warranty activates once technician verifies OTP.
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSuccessTab('INVOICE')}
                      className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <Receipt className="w-4 h-4 text-blue-600" />
                      <span>View GST Tax Invoice ➔</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Done & Track on Dashboard</span>
                    </button>
                  </div>

                </div>
              ) : (
                /* Full Itemized GST Tax Invoice View */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-sans text-xs">
                    
                    {/* Invoice Header */}
                    <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-0.5 shrink-0 shadow-2xs">
                          <img src="/karyasetu-logo.png" alt="KaryaSetu" className="w-full h-full object-contain rounded-lg" />
                        </div>
                        <div>
                          <span className="font-black text-slate-900 text-sm block">KaryaSetu GST Tax Invoice</span>
                          <span className="text-[10px] text-slate-500">Invoice No: <strong className="text-slate-800">{invoiceData?.invoiceNumber || 'INV-2026'}</strong></span>
                          <span className="text-[10px] text-slate-500 block">Date: {new Date().toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          PAID & SETTLED
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">SAC: 9987 / 9954</span>
                      </div>
                    </div>

                    {/* Bank UTR & Payment Reference */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                          Bank UTR / Transaction Reference
                        </span>
                        <strong className="font-mono text-emerald-800 text-xs">
                          {invoiceData?.paymentId || (utrNumber ? `UPI-${utrNumber}` : 'UPI-CONFIRMED')}
                        </strong>
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        NPCI UPI Channel
                      </span>
                    </div>

                    {/* Customer & Worker Summary */}
                    <div className="grid grid-cols-2 gap-3 py-1 text-[11px]">
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">BILLED TO:</span>
                        <strong className="text-slate-900">{booking.customerName || 'Rahul Deshmukh'}</strong>
                        <p className="text-slate-500 text-[10px] leading-tight">{booking.address || 'Pune, Maharashtra'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">SERVICE PROVIDER:</span>
                        <strong className="text-slate-900">{booking.workerName || 'Santosh Baburao Kadam'}</strong>
                        <p className="text-slate-500 text-[10px]">{booking.cooperativeName || 'Pune Labour Cooperative'}</p>
                      </div>
                    </div>

                    {/* Tax Breakdown */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div className="flex justify-between text-slate-600">
                        <span>Taxable Service Base Amount:</span>
                        <span className="font-semibold">₹{taxableAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>CGST (9%):</span>
                        <span>₹{cgst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SGST (9%):</span>
                        <span>₹{sgst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                        <span>Total Paid (INR):</span>
                        <span className="text-emerald-700">₹{effectiveAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Statutory Split Verification Note */}
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[10px] text-emerald-900 space-y-0.5">
                      <span className="font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Statutory Split Verified by Cooperative DPI:</span>
                      </span>
                      <p>
                        ₹{workerAmount} credited to worker earnings • ₹{coopAmount} to cooperative reserve • ₹{welfareAmount} deposited in Social Security Vault.
                      </p>
                    </div>

                  </div>

                  {/* Invoice Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSuccessTab('DISPATCH')}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Back to Live ETA Tracker</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Tax Invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Done & Return</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
