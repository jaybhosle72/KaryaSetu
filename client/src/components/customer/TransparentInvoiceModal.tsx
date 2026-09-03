import React from 'react';
import { Booking } from '../../types';
import { ShieldCheck, Printer, CheckCircle2, QrCode, FileText } from 'lucide-react';

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
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Registered Labour Cooperative Society
              </span>
              <h2 className="text-base font-black text-slate-900 mt-1">
                {booking.cooperativeName || 'Pune Electrical & Mechanical Shramik Sahakari Sanstha Ltd.'}
              </h2>
              <p className="text-xs text-slate-500">
                Reg No: MAH/PNE/LBR/2018/8842 • District: Pune • Under MSCS Act
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                PAID IN FULL
              </span>
              <p className="text-xs font-mono text-slate-500 mt-1">
                {booking.invoiceNumber || 'INV-SAHAKAR-2026-9041'}
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

          {/* Transparent 4-Way Breakdown Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Transparent Social Breakdown of Your ₹{booking.totalAmount}
              </h4>
              <span className="text-[10px] text-emerald-700 font-semibold">
                ✓ 100% Audited Financial Ledger
              </span>
            </div>

            <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="py-2 px-3 text-left">Allocation Beneficiary</th>
                  <th className="py-2 px-3 text-center">Share %</th>
                  <th className="py-2 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-emerald-50/40">
                  <td className="py-2 px-3">
                    <p className="font-bold text-emerald-900">Direct Worker Take-Home Pay</p>
                    <p className="text-[10px] text-slate-500">Instant UPI payout to worker's personal account</p>
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-emerald-800">80%</td>
                  <td className="py-2 px-3 text-right font-black text-emerald-900">₹{split.workerAmount}</td>
                </tr>

                <tr>
                  <td className="py-2 px-3">
                    <p className="font-semibold text-slate-800">Cooperative Society Operations</p>
                    <p className="text-[10px] text-slate-500">Equipment maintenance, local branch office & dispute mediation</p>
                  </td>
                  <td className="py-2 px-3 text-center font-semibold text-slate-700">10%</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-800">₹{split.coopAmount}</td>
                </tr>

                <tr className="bg-amber-50/40">
                  <td className="py-2 px-3">
                    <p className="font-bold text-amber-950">Worker Welfare & Social Security Fund</p>
                    <p className="text-[10px] text-slate-500">Ayushman Bharat top-up, accident cover & child scholarships</p>
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-amber-800">6%</td>
                  <td className="py-2 px-3 text-right font-black text-amber-950">₹{split.welfareAmount}</td>
                </tr>

                <tr>
                  <td className="py-2 px-3">
                    <p className="font-medium text-slate-600">Platform Technology Infrastructure</p>
                    <p className="text-[10px] text-slate-500">Cloud servers, automated dispatch & payment gateway</p>
                  </td>
                  <td className="py-2 px-3 text-center text-slate-500">4%</td>
                  <td className="py-2 px-3 text-right font-semibold text-slate-700">₹{split.platformAmount}</td>
                </tr>

                <tr className="bg-slate-100 font-extrabold text-slate-900">
                  <td className="py-2.5 px-3">Total Amount Paid</td>
                  <td className="py-2.5 px-3 text-center">100%</td>
                  <td className="py-2.5 px-3 text-right text-sm">₹{booking.totalAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cooperative Stamp & Digital Verification */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-600 border-dashed flex items-center justify-center text-center p-1 rotate-[-12deg]">
                <span className="text-[8px] font-black uppercase text-emerald-800 leading-tight">
                  COOP SEAL<br />VERIFIED
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-700">
                  Certified by Maharashtra Labour Cooperative Union
                </p>
                <p className="text-[10px] text-slate-400">
                  GST Exempt under Co-operative Welfare Provision §12(A)
                </p>
              </div>
            </div>

            <div className="text-right flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-100 border border-slate-300 rounded flex items-center justify-center">
                <QrCode className="w-8 h-8 text-slate-700" />
              </div>
              <div className="text-left text-[10px] text-slate-500">
                <p className="font-mono font-bold">VERIFIED PAYOUT</p>
                <p>Scan to verify on blockchain / registry</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
