import React, { useState } from 'react';
import { 
  User, Phone, Mail, MapPin, ShieldCheck, FileText, CheckCircle2, 
  Clock, Award, LogOut, ArrowLeft, Edit3, Check, HeartHandshake, CreditCard, 
  ChevronRight, Sparkles, Building, ExternalLink, RefreshCw, KeyRound, Star, Plus, Trash2
} from 'lucide-react';
import { Booking } from '../../types';
import { TransparentInvoiceModal } from './TransparentInvoiceModal';

interface CustomerProfilePageProps {
  currentUser: any;
  bookings: Booking[];
  onBack: () => void;
  onLogout: () => void;
  onUpdateUser?: (updated: any) => void;
  onPayBooking?: (bookingId: string) => void;
}

export const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({
  currentUser,
  bookings,
  onBack,
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

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<any[]>(() => {
    if (currentUser?.address) {
      return [{
        id: 'addr_1',
        label: 'Home (Primary)',
        address: currentUser.address,
        locality: 'Primary Residence',
        isDefault: true
      }];
    }
    return [];
  });

  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressText, setNewAddressText] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);

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

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLabel.trim() || !newAddressText.trim()) return;
    setSavedAddresses(prev => [
      ...prev,
      {
        id: `addr_${Date.now()}`,
        label: newAddressLabel.trim(),
        address: newAddressText.trim(),
        locality: 'Pune Central',
        isDefault: false
      }
    ]);
    setNewAddressLabel('');
    setNewAddressText('');
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (id: string) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 pb-20 font-sans max-w-6xl mx-auto animate-fadeIn">
      
      {/* 1. Breadcrumb & Navigation Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>← Back to Services &amp; Home</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Home</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400 font-medium">Citizen Portal</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900">Consumer Profile</span>
        </div>
      </div>

      {/* 2. Full Page Profile Hero Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl ring-4 ring-white/10 flex-shrink-0">
              {initials}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{name}</h1>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DigiLocker KYC Verified</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-400">
                Citizen Consumer ID: <span className="font-mono text-emerald-400 font-bold">COOP-CITIZEN-{phone.slice(-4) || 'PUN'}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>{primaryAddress ? primaryAddress.split(',')[0] : 'Maharashtra'}</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Active Member</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 self-start sm:self-center">
            <button
              onClick={() => {
                setActiveTab('SETTINGS');
                setIsEditing(true);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-orange-400" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="pt-2 border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-2.5 px-4 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'OVERVIEW'
                ? 'bg-orange-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Overview &amp; Impact</span>
          </button>

          <button
            onClick={() => setActiveTab('BOOKINGS')}
            className={`py-2.5 px-4 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'BOOKINGS'
                ? 'bg-orange-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Service Bookings</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono">
              {customerBookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ADDRESSES')}
            className={`py-2.5 px-4 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'ADDRESSES'
                ? 'bg-orange-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono">
              {savedAddresses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`py-2.5 px-4 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'SETTINGS'
                ? 'bg-orange-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Account Settings</span>
          </button>
        </div>
      </div>

      {/* 3. Tab Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        
        {/* ================= TAB 1: OVERVIEW & FAIR SHARE IMPACT ================= */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8">
            
            {/* Contact Credentials Card */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Verified Contact Credentials
                </span>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Mobile Number</span>
                      <strong className="text-slate-900 font-bold text-sm">{phone}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Email Address</span>
                      <strong className="text-slate-900 font-bold text-sm">{email}</strong>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-start gap-3 pt-2">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Registered Primary Address</span>
                      <strong className="text-slate-900 font-bold text-sm">{primaryAddress}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4 pt-1 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Primary Address</label>
                      <input
                        type="text"
                        value={primaryAddress}
                        onChange={(e) => setPrimaryAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Profile credentials saved successfully!</span>
                </div>
              )}
            </div>

            {/* Citizen Activity & Service Summary */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Citizen Service &amp; Booking Activity</span>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full self-start sm:self-auto border border-emerald-200">
                  Active Consumer Account
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Total Bookings</span>
                  <strong className="text-xl font-black text-slate-900 block">
                    {customerBookings.length}
                  </strong>
                  <span className="text-[10px] text-slate-400">All service requests</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Completed Services</span>
                  <strong className="text-xl font-black text-emerald-700 block">
                    {completedJobsCount}
                  </strong>
                  <span className="text-[10px] text-slate-400">Verified &amp; certified</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Saved Addresses</span>
                  <strong className="text-xl font-black text-blue-700 block">
                    {savedAddresses.length}
                  </strong>
                  <span className="text-[10px] text-slate-400">Doorstep locations</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Cooperative Zone</span>
                  <strong className="text-sm font-black text-slate-800 block truncate mt-1">
                    Pune Municipal (PMC)
                  </strong>
                  <span className="text-[10px] text-emerald-600 font-bold">✓ Ward 32 Active</span>
                </div>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
              <button
                onClick={() => setActiveTab('BOOKINGS')}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-between transition cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-black text-slate-900">View Active &amp; Past Bookings</span>
                    <span className="text-[11px] text-slate-500 font-normal">Track worker arrivals, OTP codes &amp; invoices</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('ADDRESSES')}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-between transition cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-black text-slate-900">Manage Service Addresses</span>
                    <span className="text-[11px] text-slate-500 font-normal">Home, office, and family properties</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>

          </div>
        )}

        {/* ================= TAB 2: MY BOOKINGS & INVOICES ================= */}
        {activeTab === 'BOOKINGS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Your Service History &amp; Active Requests
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track technician live arrival, 4-digit doorstep verification OTP, and official GST tax invoices
                </p>
              </div>
              <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                {customerBookings.length} Total Bookings
              </span>
            </div>

            {customerBookings.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 space-y-3">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 text-sm">No bookings found yet</p>
                <p className="text-xs text-slate-400">Browse gazetted trade services and book your first verified cooperative shramik.</p>
                <button
                  onClick={onBack}
                  className="px-4 py-2 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  Browse Services
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {customerBookings.map((b) => {
                  const amount = b.totalAmount || b.estimatedAmount || b.estimatedPrice || 299;
                  const isPaid = b.paymentStatus === 'PAID';
                  const isInProgress = b.status === 'IN_PROGRESS';
                  const isCompleted = b.status === 'COMPLETED';

                  return (
                    <div 
                      key={b._id || b.id} 
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm space-y-4 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-slate-900">{b.serviceCategory}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isInProgress
                                ? 'bg-emerald-500 text-white animate-pulse'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {b.status}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {isPaid ? '✓ PAID' : 'PENDING'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 font-medium">
                            {b.subTrade || b.serviceCategory}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{b.address || 'Kothrud, Pune'}</span>
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-base sm:text-lg font-black text-slate-900 block">
                            ₹{amount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {b.preferredTime || 'Immediate Dispatch'}
                          </span>
                        </div>
                      </div>

                      {/* Detail row: Worker details, Doorstep OTP, ETA, Actions */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-3 text-slate-600">
                          <span className="flex items-center gap-1.5 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>Technician: <strong>{b.workerName || (b.status === 'MATCHING' ? 'Awaiting Worker Dispatch' : 'Assigned Technician')}</strong></span>
                          </span>

                          {/* 4-Digit OTP Badge */}
                          {!isCompleted && (
                            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3 py-1 rounded-xl border border-amber-300 font-mono">
                              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-[11px] font-bold">Doorstep OTP:</span>
                              <strong className="text-xs font-black tracking-widest bg-white px-1.5 py-0.5 rounded border border-amber-300">
                                {b.otp || '----'}
                              </strong>
                            </div>
                          )}

                          {/* Live ETA Arrival Time */}
                          {!isCompleted && !isInProgress && (
                            <span className="flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200 font-bold">
                              <Clock className="w-3 h-3" />
                              <span>{b.etaMinutes ? `Arriving in ~${b.etaMinutes}m` : 'Immediate Dispatch'}</span>
                            </span>
                          )}

                          {isInProgress && (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 font-bold animate-pulse">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Work In-Progress On-Site</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!isPaid && onPayBooking && (
                            <button
                              type="button"
                              onClick={() => onPayBooking(b._id || b.id || '')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Pay ₹{amount}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceBooking(b)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer border border-slate-200"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            <span>GST Tax Invoice</span>
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

        {/* ================= TAB 3: SAVED ADDRESSES ================= */}
        {activeTab === 'ADDRESSES' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Saved Service Delivery Addresses
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pinpoint exact service addresses for rapid dispatch across Pune municipal wards
                </p>
              </div>

              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddAddress ? 'Cancel' : 'Add New Address'}</span>
              </button>
            </div>

            {/* Add Address Form */}
            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-fadeIn">
                <h4 className="text-xs font-black uppercase text-slate-700">Add New Service Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Address Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Vacation Villa, Rental Property"
                      value={newAddressLabel}
                      onChange={(e) => setNewAddressLabel(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Locality</label>
                    <input
                      type="text"
                      defaultValue="Baner / Balewadi"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Complete Address</label>
                    <input
                      type="text"
                      placeholder="House/Flat No, Building, Street, Landmark, Pincode"
                      value={newAddressText}
                      onChange={(e) => setNewAddressText(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            {savedAddresses.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No addresses saved yet. Click 'Add New Address' above to save your service location.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-orange-600" />
                        <span>{addr.label}</span>
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {addr.address}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-slate-400 font-semibold">{addr.locality}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-slate-400 hover:text-rose-600 transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}

          </div>
        )}

        {/* ================= TAB 4: ACCOUNT SETTINGS & SECURITY ================= */}
        {activeTab === 'SETTINGS' && (
          <div className="space-y-8">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                Account Settings &amp; Citizen Preferences
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your sovereign credentials, KYC documentation, and privacy preferences
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 max-w-2xl text-xs">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Full Legal Name (as per Aadhaar)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Primary Mobile (OTP Verified)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Email Address for GST Invoices</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Primary Service Delivery Address</label>
                  <input
                    type="text"
                    value={primaryAddress}
                    onChange={(e) => setPrimaryAddress(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-orange-500/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  Save Account Settings
                </button>
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Updated!</span>
                  </span>
                )}
              </div>
            </form>

            {/* Sovereign Security & DigiLocker Status Card */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <strong className="text-xs font-black text-slate-900">DigiLocker Consent &amp; Privacy Rail</strong>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Your data is cryptographically protected under India's Digital Personal Data Protection (DPDP) Act 2023. 
                Service technicians only receive your doorstep address upon booking dispatch.
              </p>
            </div>

            {/* Danger Zone: Sign out */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-xs font-black text-slate-900 block">Session Management</strong>
                <p className="text-[11px] text-slate-500">Sign out of this browser session</p>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Official GST Tax Invoice Modal */}
      {selectedInvoiceBooking && (
        <TransparentInvoiceModal
          isOpen={!!selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
          booking={{
            ...selectedInvoiceBooking,
            paymentStatus: 'PAID',
            status: 'COMPLETED',
            invoiceNumber: selectedInvoiceBooking.invoiceNumber || `INV-KARYA-${selectedInvoiceBooking._id.slice(-6).toUpperCase()}`
          }}
        />
      )}

    </div>
  );
};
