import React, { useState } from 'react';
import { 
  User, Phone, Mail, MapPin, ShieldCheck, FileText, CheckCircle2, 
  Clock, Award, LogOut, X, Edit3, Check, HeartHandshake, CreditCard, 
  ChevronRight, Sparkles, Building, ExternalLink, RefreshCw
} from 'lucide-react';
import { Booking } from '../../types';
import { TransparentInvoiceModal } from './TransparentInvoiceModal';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  bookings: Booking[];
  onLogout: () => void;
  onUpdateUser?: (updated: any) => void;
  onPayBooking?: (bookingId: string) => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  bookings,
  onLogout,
  onUpdateUser,
  onPayBooking
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BOOKINGS' | 'ADDRESSES' | 'SETTINGS'>('OVERVIEW');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || 'Citizen Customer');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [primaryAddress, setPrimaryAddress] = useState(
    currentUser?.address || ''
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);

  if (!isOpen) return null;

  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'CC';

  // Customer bookings calculation
  const customerBookings = bookings.filter(b => 
    (!phone || b.customerPhone === phone || b.customerName === name)
  );

  const completedJobsCount = customerBookings.filter(b => b.status === 'COMPLETED').length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      name,
      phone,
      email,
      address: primaryAddress
    };
    onUpdateUser?.(updated);
    try {
      localStorage.setItem('karyasetu_current_user', JSON.stringify(updated));
      localStorage.setItem('sahakar_current_user', JSON.stringify(updated));
    } catch {}
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans">
        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
          
          {/* Top Header Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-lg flex items-center justify-center shadow-lg ring-2 ring-white/20 flex-shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">{name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>DigiLocker KYC Verified</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cooperative Consumer ID: <span className="font-mono text-slate-200 font-bold">COOP-CITIZEN-{phone.slice(-4) || 'PUN'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/60 px-4 sm:px-6 gap-1 sm:gap-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'OVERVIEW'
                  ? 'border-orange-600 text-orange-700 bg-white/70'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview &amp; Impact
            </button>
            <button
              onClick={() => setActiveTab('BOOKINGS')}
              className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'BOOKINGS'
                  ? 'border-orange-600 text-orange-700 bg-white/70'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Service Bookings</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
                {customerBookings.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('ADDRESSES')}
              className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'ADDRESSES'
                  ? 'border-orange-600 text-orange-700 bg-white/70'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Saved Addresses
            </button>
            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'SETTINGS'
                  ? 'border-orange-600 text-orange-700 bg-white/70'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Account Settings
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            
            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Profile details successfully updated and saved!</span>
              </div>
            )}

            {/* TAB 1: OVERVIEW & FAIR SHARE IMPACT */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-5">
                
                {/* Contact Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                      Verified Contact Credentials
                    </span>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
                    </button>
                  </div>

                  {!isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Mobile Number</span>
                          <strong className="text-slate-900 font-bold">{phone}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Email Address</span>
                          <strong className="text-slate-900 font-bold">{email}</strong>
                        </div>
                      </div>

                      <div className="sm:col-span-2 flex items-start gap-2.5 pt-1">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Registered Primary Address</span>
                          <strong className="text-slate-900 font-bold">{primaryAddress}</strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="space-y-3 pt-1 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Primary Address</label>
                          <input
                            type="text"
                            value={primaryAddress}
                            onChange={(e) => setPrimaryAddress(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-orange-600 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Citizen Activity & Service Summary Panel */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h4 className="text-xs font-black text-slate-900">Citizen Service &amp; Booking Activity</h4>
                        <p className="text-[10px] text-slate-500">Verified consumer account records and doorstep dispatches</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active Account
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-500 block">Total Bookings</span>
                      <strong className="text-sm sm:text-base font-black text-slate-900 block mt-0.5">
                        {customerBookings.length} Bookings
                      </strong>
                      <span className="text-[9px] text-slate-400">All service requests</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-500 block">Completed Jobs</span>
                      <strong className="text-sm sm:text-base font-black text-emerald-700 block mt-0.5">
                        {completedJobsCount} Jobs
                      </strong>
                      <span className="text-[9px] text-slate-400">Verified &amp; certified</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-500 block">Saved Addresses</span>
                      <strong className="text-sm sm:text-base font-black text-blue-700 block mt-0.5">
                        3 Addresses
                      </strong>
                      <span className="text-[9px] text-slate-400">Home &amp; workplaces</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-500 block">Cooperative Zone</span>
                      <strong className="text-sm sm:text-base font-black text-slate-800 block mt-0.5 truncate">
                        PMC Ward 32
                      </strong>
                      <span className="text-[9px] text-emerald-600 font-bold">Kothrud Division</span>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('BOOKINGS')}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span>View Active &amp; Past Bookings</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('ADDRESSES')}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>Manage Service Addresses</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

              </div>
            )}

            {/* TAB 2: MY BOOKINGS & INVOICES */}
            {activeTab === 'BOOKINGS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Your Service History &amp; Active Requests
                    </h3>
                    <p className="text-[10px] text-slate-500">Track technician arrival, verification OTP, and official tax invoices</p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {customerBookings.length} Total Bookings
                  </span>
                </div>

                {customerBookings.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700">No bookings found yet</p>
                    <p className="text-[11px] text-slate-400">Browse gazetted trade services and book your first verified cooperative shramik.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerBookings.map((b) => {
                      const amount = b.totalAmount || b.estimatedAmount || b.estimatedPrice || 299;
                      const isPaid = b.paymentStatus === 'PAID';
                      return (
                        <div key={b._id || b.id} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs space-y-3 transition">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900">{b.serviceCategory}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  b.status === 'COMPLETED'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}>
                                  {b.status}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  isPaid
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  {isPaid ? '✓ PAID' : 'PENDING'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 font-medium mt-0.5">
                                {b.subTrade || b.serviceCategory}
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <span className="text-sm font-black text-slate-900 block">
                                ₹{amount.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {b.preferredTime || 'Scheduled Slot'}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-3 text-slate-500">
                              <span className="flex items-center gap-1 text-[11px]">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>{b.workerName || (b.status === 'MATCHING' ? 'Awaiting Worker Dispatch' : 'Assigned Technician')}</span>
                              </span>
                              {b.status !== 'COMPLETED' && (
                                <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                                  <span>OTP:</span>
                                  <strong className="text-xs">{b.otp || '----'}</strong>
                                </span>
                              )}
                              {b.status !== 'COMPLETED' && (
                                <span className="flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-semibold">
                                  <span>{b.etaMinutes ? `ETA: ~${b.etaMinutes}m` : 'Immediate Dispatch'}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {!isPaid && onPayBooking && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onPayBooking(b._id || b.id || '');
                                    onClose();
                                  }}
                                  className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer"
                                >
                                  Pay ₹{amount}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceBooking(b)}
                                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 shadow-2xs transition cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-500" />
                                <span>GST Invoice</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: SAVED SERVICE ADDRESSES */}
            {activeTab === 'ADDRESSES' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Saved Service Locations (Pune District)
                    </h3>
                    <p className="text-[10px] text-slate-500">Service visits and GPS dispatch pins are routed to these premises</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {primaryAddress ? (
                    <div className="p-4 rounded-2xl bg-white border-2 border-slate-900 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs">🏠</span>
                          <h4 className="text-xs font-black text-slate-900">Residence / Home</h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[9px] uppercase">
                            Default Primary
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Maharashtra</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        {primaryAddress}
                      </p>
                      <p className="text-[10px] text-slate-400">Contact: {name} • {phone}</p>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                      No service address saved yet. Update your address in the profile tab above.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: ACCOUNT SETTINGS */}
            {activeTab === 'SETTINGS' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Preferences &amp; Notifications</h4>
                  
                  <div className="space-y-2.5 text-xs text-slate-700">
                    <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
                      <div>
                        <strong className="block font-bold">WhatsApp Service Dispatch Updates</strong>
                        <span className="text-[10px] text-slate-400">Receive live technician ETA and OTP alerts on WhatsApp</span>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
                      <div>
                        <strong className="block font-bold">Direct Cooperative Invoicing (Email PDF)</strong>
                        <span className="text-[10px] text-slate-400">Auto-mail GST tax invoice as soon as payment is settled</span>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
                    </label>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Role &amp; Session Management</h4>
                  <p className="text-xs text-slate-500">
                    Signed in as <strong className="text-slate-900">{name}</strong> ({currentUser?.roleName || 'Citizen Customer'}). You can switch perspectives or sign out below.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onLogout();
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Switch Role / Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>National Cooperative Digital Infrastructure</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </div>

      {/* Invoice Modal for individual booking sheet */}
      {selectedInvoiceBooking && (
        <TransparentInvoiceModal
          isOpen={Boolean(selectedInvoiceBooking)}
          onClose={() => setSelectedInvoiceBooking(null)}
          booking={selectedInvoiceBooking}
        />
      )}
    </>
  );
};
