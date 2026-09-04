import React from 'react';
import { Booking } from '../../types';
import { ShieldCheck, Printer, CheckCircle2, FileText } from 'lucide-react';

interface TransparentInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const TransparentInvoiceModal: React.FC<TransparentInvoiceModalProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  if (!isOpen || !booking) return null;

  const split = booking.paymentBreakdown;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold">Official Cooperative Service Invoice</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold ml-2">
              ✕
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-6 bg-white space-y-5 text-slate-800" id="invoice-sheet">
          
          {/* Header & Logo */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-0.5 shrink-0 shadow-2xs">
                <img src="/karyasetu-logo.png" alt="KaryaSetu Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  KaryaSetu Accredited Labour Cooperative Society
                </span>
                <h2 className="text-base font-black text-slate-900 mt-1">
                  {booking.cooperativeName || 'Pune Electrical & Mechanical Shramik Sahakari Sanstha Ltd.'}
                </h2>
                <p className="text-xs text-slate-500">
                  Reg No: MAH/PNE/LBR/2018/8842 • District: Pune • Under MSCS Act
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                PAID IN FULL
              </span>
              <p className="text-xs font-mono text-slate-500 mt-1">
                {booking.invoiceNumber || 'INV-KARYA-2026-9041'}
              </p>
              <p className="text-[11px] text-slate-400">
                Date: {new Date(booking.completedAt || booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Customer & Worker Summary */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Service Rendered To</p>
              <p className="font-bold text-slate-900 mt-0.5">{booking.customerName}</p>
              <p className="text-slate-600">{booking.address}</p>
              <p className="text-slate-500 mt-1">{booking.customerPhone}</p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Allocated Cooperative Worker</p>
              <p className="font-bold text-emerald-800 mt-0.5">{booking.workerName || 'Santosh Baburao Kadam'}</p>
              <p className="text-slate-600">Trade: {booking.serviceCategory} ({booking.subTrade})</p>
              <p className="text-slate-500 mt-1">Coop Badge: Level-4 Verified</p>
            </div>
          </div>

          {/* Itemized Service Invoice Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Itemized Service & Billing Summary
              </h4>
              <span className="text-[10px] text-emerald-700 font-semibold">
                ✓ Official Cooperative Tax Invoice
              </span>
            </div>

            <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="py-2.5 px-3 text-left">Service Item & Description</th>
                  <th className="py-2.5 px-3 text-center">SAC Code</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-white">
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-slate-900">{booking.serviceCategory} — {booking.subTrade}</p>
                    <p className="text-[10px] text-slate-500">Certified doorstep maintenance with verified materials & tools</p>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600">998719</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-700">1</td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900">₹{booking.totalAmount}</td>
                </tr>

                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3">
                    <p className="font-medium text-slate-700">Doorstep OTP Handshake & Safety Protocol</p>
                    <p className="text-[10px] text-slate-500">Aadhaar verified artisan with safety kit & equipment</p>
                  </td>
                  <td className="py-2 px-3 text-center font-mono text-slate-500">998721</td>
                  <td className="py-2 px-3 text-center text-slate-500">1</td>
                  <td className="py-2 px-3 text-right font-semibold text-emerald-700">Included</td>
                </tr>

                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3">
                    <p className="font-medium text-slate-700">Cooperative Quality Warranty (30 Days)</p>
                    <p className="text-[10px] text-slate-500">Free rework protection covered under Society rules</p>
                  </td>
                  <td className="py-2 px-3 text-center font-mono text-slate-500">WTY-30</td>
                  <td className="py-2 px-3 text-center text-slate-500">1</td>
                  <td className="py-2 px-3 text-right font-semibold text-emerald-700">Covered</td>
                </tr>

                <tr className="bg-slate-100 font-extrabold text-slate-900">
                  <td colSpan={3} className="py-2.5 px-3 text-right font-bold text-slate-700">Total Invoice Value (Paid):</td>
                  <td className="py-2.5 px-3 text-right text-sm font-black text-emerald-800">₹{booking.totalAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
