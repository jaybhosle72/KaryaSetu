import React, { useState, useEffect } from 'react';
import { UserRole, Cooperative, Worker, Booking, InstitutionalContract, DemandForecast, WelfareClaim, Dispute } from './types';
import { Language, translations } from './i18n/translations';
import { api } from './services/api';
import { DemoHeader } from './components/common/DemoHeader';
import { Navbar } from './components/common/Navbar';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { WorkerPortal } from './components/worker/WorkerPortal';
import { CooperativeDashboard } from './components/cooperative/CooperativeDashboard';
import { FederationDashboard } from './components/federation/FederationDashboard';
import { ContractorPortal } from './components/contractor/ContractorPortal';
import { LoginScreen } from './components/auth/LoginScreen';
import { CartDrawerModal, CartItem } from './components/customer/CartDrawerModal';
import confetti from 'canvas-confetti';

export function App() {
  const [currentUser, setCurrentUser] = useState<{
    role: UserRole;
    name: string;
    phone: string;
    roleName: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('sahakar_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(currentUser?.role || 'customer');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  const handleLogin = (role: UserRole, userDetails: { name: string; phone: string; roleName: string }) => {
    const user = { role, ...userDetails };
    setCurrentUser(user);
    setCurrentRole(role);
    try {
      localStorage.setItem('sahakar_current_user', JSON.stringify(user));
    } catch {}
    showToast(`Welcome, ${user.name}! Signed in to ${role.toUpperCase()} portal.`, 'info');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('sahakar_current_user');
    } catch {}
    showToast('Signed out. Please select your role to continue.', 'info');
  };

  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contracts, setContracts] = useState<InstitutionalContract[]>([]);
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [welfareLedger, setWelfareLedger] = useState<WelfareClaim[]>([]);
  const [welfareCorpusTotal, setWelfareCorpusTotal] = useState<number>(0);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('wrk_101');
  const [selectedCoopId, setSelectedCoopId] = useState<string>('coop_pune_elec');
  const [selectedLocality, setSelectedLocality] = useState<string>('Amanora & Baner, Pune');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openCategoryNavTrigger, setOpenCategoryNavTrigger] = useState<string>('HOMES');
  const [openActiveBookingTrigger, setOpenActiveBookingTrigger] = useState<number>(0);
  const [externalCategorySelect, setExternalCategorySelect] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'emergency' | 'info' } | null>(null);

  // Unified Persistent Cart State across navigation
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sahakar_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('sahakar_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const handleAddToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast(`Added "${item.name}" to your booking cart!`, 'success');
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
    showToast('Service removed from cart', 'info');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCartCheckout = async (items: CartItem[], totalAmount: number) => {
    const primaryCategory = items[0]?.category || 'Cooperative Gig Services';
    const subTradeSummary = items.map(i => `${i.name} (x${i.quantity})`).join(', ');
    await handleBookService({
      customerName: currentUser?.name || 'Rahul Sharma',
      customerPhone: currentUser?.phone || '+91 98229 33445',
      serviceCategory: primaryCategory,
      subTrade: subTradeSummary,
      urgency: 'STANDARD',
      address: 'Flat 402, Mayur Residency, Kothrud, Pune 411038',
      preferredTime: 'Tomorrow, 10:00 AM',
      estimatedPrice: totalAmount,
      notes: `Cart checkout for ${items.length} items (${subTradeSummary}). 80% to technician, 6% to PM-JAY.`
    });
    setCart([]);
    setIsCartOpen(false);
  };

  // Synthesized Web Audio chime (safe, no external files required)
  const playAlertSound = (type: 'emergency' | 'success') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'emergency') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio policy fallback
    }
  };

  const showToast = (message: string, type: 'success' | 'emergency' | 'info' = 'info') => {
    setNotification({ message, type });
    if (type === 'emergency') playAlertSound('emergency');
    setTimeout(() => setNotification(null), 5000);
  };

  // Load all initial data from MERN backend
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [coopsData, workersData, bookingsData, contractsData, forecastRes, welfareRes, disputesData] = await Promise.all([
        api.getCooperatives(),
        api.getWorkers(),
        api.getBookings(),
        api.getContracts(),
        api.getForecast(),
        api.getWelfareLedger(),
        api.getDisputes()
      ]);

      setCooperatives(coopsData);
      setWorkers(workersData);
      setBookings(bookingsData);
      setContracts(contractsData);
      setForecasts(forecastRes.data);
      setWelfareLedger(welfareRes.records);
      setWelfareCorpusTotal(welfareRes.totalCorpus);
      setDisputes(disputesData);

      if (workersData.length > 0 && !selectedWorkerId) {
        setSelectedWorkerId(workersData[0]._id);
      }
      if (coopsData.length > 0 && !selectedCoopId) {
        setSelectedCoopId(coopsData[0]._id);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      showToast('Could not fetch from backend. Ensure server is running.', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Customer
  const handleBookService = async (bookingData: any) => {
    try {
      const res = await api.createBooking(bookingData);
      setBookings(prev => [res.booking, ...prev]);
      showToast(`Matched via ${res.booking.cooperativeName} • Worker: ${res.booking.workerName}`, 'success');
      playAlertSound('success');
    } catch (e: any) {
      showToast(e.message, 'info');
    }
  };

  const handleEmergencyBooking = async (emergencyData: any) => {
    try {
      const res = await api.createEmergencyBooking(emergencyData);
      setBookings(prev => [res.booking, ...prev]);
      showToast(`🚨 SOS DISPATCHED: ${res.booking.workerName} en route (${res.etaMinutes} mins ETA)`, 'emergency');
      playAlertSound('emergency');
      setSelectedWorkerId(res.booking.assignedWorkerId || 'wrk_102');
    } catch (e: any) {
      showToast(e.message, 'info');
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const updated = await api.updateBookingStatus(id, status);
      setBookings(prev => prev.map(b => b._id === id ? updated : b));
      showToast(`Booking moved to milestone: ${status}`, 'info');
      
      if (status === 'COMPLETED') {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        playAlertSound('success');
      }
    } catch (e: any) {
      showToast(e.message, 'info');
    }
  };

  const handleAllocateWorkers = async (bookingId: string, workerIds: string[]) => {
    try {
      const updated = await api.allocateTeamWorkers(bookingId, workerIds);
      setBookings(prev => prev.map(b => b._id === bookingId ? updated : b));
      showToast(`Crew Allocated! ${workerIds.length} community shramiks dispatched to job.`, 'success');
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      playAlertSound('success');
    } catch (e: any) {
      showToast(e.message, 'info');
    }
  };

  const handleOnboardWorker = async (workerData: any) => {
    try {
      const created = await api.createWorker(workerData);
      setWorkers(prev => [created, ...prev]);
      showToast(`Shramik ${created.name} onboarded to community with verified KYC!`, 'success');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      playAlertSound('success');
      return created;
    } catch (e: any) {
      showToast(e.message, 'info');
      throw e;
    }
  };

  const handleSubmitProposal = async (bookingId: string, proposalData: any) => {
    try {
      const updated = await api.submitProposal(bookingId, proposalData);
      setBookings(prev => prev.map(b => b._id === bookingId ? updated : b));
      showToast(`Workforce Proposal Sent to Customer: ₹${proposalData.estimatedCost?.toLocaleString('en-IN')}`, 'success');
      playAlertSound('success');
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      return updated;
    } catch (e: any) {
      showToast(e.message, 'info');
      throw e;
    }
  };

  const handleApproveProposal = async (bookingId: string) => {
    try {
      const updated = await api.approveProposal(bookingId);
      setBookings(prev => prev.map(b => b._id === bookingId ? updated : b));
      showToast(`Contractor Plan Approved! Mukaddam will now allocate the verified crew.`, 'success');
      playAlertSound('success');
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      return updated;
    } catch (e: any) {
      showToast(e.message, 'info');
      throw e;
    }
  };

  const handlePayBooking = async (id: string) => {
    try {
      const res = await api.payBooking(id);
      setBookings(prev => prev.map(b => b._id === id ? res.booking : b));
      showToast(`Payment Settled: 80% to Worker, 6% to Social Security Fund`, 'success');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      playAlertSound('success');
      loadData();
    } catch (e: any) {
      showToast(e.message, 'info');
    }
  };

  const handleRateBooking = async (id: string, ratings: any) => {
    try {
      const updated = await api.rateBooking(id, ratings);
      setBookings(prev => prev.map(b => b._id === id ? updated : b));
      showToast(`Review recorded and Cooperative endorsed!`, 'success');
    } catch (e: any) {
      showToast(e.message, 'info');
    }
  };

  const handleRequestContract = async (contractData: any) => {
    try {
      const newContract = await api.createContract(contractData);
      setContracts(prev => [newContract, ...prev]);
      showToast(`Housing Society Facility SLA Registered!`, 'success');
    } catch (e: any) {
      showToast(e.message, 'info');
    }
  };

  const handleSubmitDispute = async (disputeData: any) => {
    try {
      const res = await api.createDispute(disputeData);
      setDisputes(prev => [res.data, ...prev]);
      showToast(`Grievance registered. Assigned to Cooperative Mediation Committee.`, 'info');
    } catch (e: any) {
      showToast(e.message, 'info');
    }
  };

  // Handlers for Worker
  const handleUpdateWorkerStatus = async (id: string, status: string, isEmergencyDuty?: boolean) => {
    try {
      const updated = await api.updateWorkerStatus(id, status, isEmergencyDuty);
      setWorkers(prev => prev.map(w => w._id === id ? updated : w));
      showToast(`Worker duty status set to ${status}`, 'info');
    } catch (e: any) {
      showToast(e.message, 'info');
    }
  };

  // Handlers for Cooperative
  const handleVerifySkill = async (workerId: string, skillName: string, issuer: string) => {
    try {
      const updated = await api.verifyWorkerSkill(workerId, skillName, issuer);
      setWorkers(prev => prev.map(w => w._id === workerId ? updated : w));
      showToast(`Skill Verified: ${skillName} authenticated!`, 'success');
    } catch (e: any) {
      showToast(e.message, 'info');
    }
  };

  const handleUpdateSplit = async (coopId: string, split: any) => {
    try {
      const updated = await api.updateCooperativeSplit(coopId, split);
      setCooperatives(prev => prev.map(c => c._id === coopId ? updated : c));
      showToast(`Cooperative Bylaw Split updated!`, 'success');
    } catch (e: any) {
      showToast(e.message, 'info');
    }
  };

  const handleDisburseWelfare = async (claimData: any) => {
    try {
      const newClaim = await api.submitWelfareClaim(claimData);
      setWelfareLedger(prev => [newClaim, ...prev]);
      showToast(`Welfare Disbursed: ₹${newClaim.amount}`, 'success');
      loadData();
    } catch (e: any) {
      showToast(e.message, 'info');
    }
  };

  const handleResolveDispute = async (disputeId: string, resolution: string) => {
    try {
      const updated = await api.resolveDispute(disputeId, resolution);
      setDisputes(prev => prev.map(d => d._id === disputeId ? updated : d));
      showToast(`Dispute resolved by Cooperative Tripartite Committee.`, 'success');
    } catch (e: any) {
      showToast(e.message, 'info');
    }
  };

  const handleResetDemo = async () => {
    if (confirm('Reset all demo bookings, disputes, and forecasts to initial hackathon seed state?')) {
      await api.resetDemoData();
      await loadData();
      showToast('All demonstration data reset to pristine state.', 'info');
    }
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-tricolor-gradient ambient-tricolor-glow text-slate-900 flex flex-col font-sans relative">
      {/* Sovereign National Tricolor Accent Ribbon */}
      <div className="tricolor-ribbon w-full sticky top-0 z-50 shadow-xs" />
      
      {/* Role-Oriented Main Navbar */}
      <Navbar
        currentRole={currentUser.role}
        currentUser={currentUser}
        onLogout={handleLogout}
        welfareCorpusTotal={welfareCorpusTotal}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        activeBookingsCount={bookings.filter(b => b.status !== 'COMPLETED').length}
        cartItemsCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategoryNav={(nav) => setOpenCategoryNavTrigger(nav)}
        onOpenActiveBooking={() => setOpenActiveBookingTrigger(prev => prev + 1)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLocality={selectedLocality}
        onSelectLocality={(loc) => {
          setSelectedLocality(loc);
          showToast(`Service zone switched to: ${loc}`, 'info');
        }}
        onQuickCategorySelect={(catId) => setExternalCategorySelect(catId)}
      />

      {/* Real-Time Toast Notification Banner */}
      {notification && (
        <div className={`sticky top-[80px] z-50 text-center py-2 px-4 text-xs font-black transition-all shadow-md ${
          notification.type === 'emergency'
            ? 'bg-rose-600 text-white animate-pulse'
            : notification.type === 'success'
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-900 text-slate-100'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Main Content View based on Role */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-black text-slate-700">Initializing SahakarSetu National Cooperative DPI...</p>
            </div>
          </div>
        ) : (
          <>
            {currentRole === 'customer' && (
              <CustomerPortal
                cooperatives={cooperatives}
                workers={workers}
                bookings={bookings}
                forecasts={forecasts}
                currentLanguage={currentLanguage}
                onBookService={handleBookService}
                onEmergencyBooking={handleEmergencyBooking}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onPayBooking={handlePayBooking}
                onRateBooking={handleRateBooking}
                onRequestContract={handleRequestContract}
                onSubmitDispute={handleSubmitDispute}
                openCategoryNavTrigger={openCategoryNavTrigger}
                openActiveBookingTrigger={openActiveBookingTrigger}
                externalCategorySelect={externalCategorySelect}
                cart={cart}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onOpenCart={() => setIsCartOpen(true)}
                onApproveProposal={handleApproveProposal}
              />
            )}

            {currentRole === 'worker' && (
              <WorkerPortal
                workers={workers}
                selectedWorkerId={selectedWorkerId}
                onSelectWorker={setSelectedWorkerId}
                bookings={bookings}
                welfareRecords={welfareLedger}
                onUpdateWorkerStatus={handleUpdateWorkerStatus}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onAddSkill={(wId, skill) => handleVerifySkill(wId, skill, 'Brihan-Maharashtra Cooperative Board')}
              />
            )}

            {currentRole === 'contractor' && (
              <ContractorPortal
                contractorUser={currentUser || undefined}
                bookings={bookings}
                workers={workers}
                onAllocateWorkers={handleAllocateWorkers}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onOnboardWorker={handleOnboardWorker}
                onSubmitProposal={handleSubmitProposal}
              />
            )}

            {(currentRole === 'admin' || currentRole === 'cooperative') && (
              <CooperativeDashboard
                cooperatives={cooperatives}
                selectedCoopId={selectedCoopId}
                onSelectCoop={setSelectedCoopId}
                workers={workers}
                contracts={contracts}
                forecasts={forecasts}
                welfareLedger={welfareLedger}
                disputes={disputes}
                onVerifySkill={handleVerifySkill}
                onUpdateSplit={handleUpdateSplit}
                onDisburseWelfare={handleDisburseWelfare}
                onResolveDispute={handleResolveDispute}
              />
            )}

            {currentRole === 'federation' && (
              <FederationDashboard
                cooperatives={cooperatives}
                workers={workers}
                bookings={bookings}
                contracts={contracts}
                welfareRecords={welfareLedger}
              />
            )}
          </>
        )}
      </main>

      {/* Sovereign DPI Footer */}
      <footer className="bg-[#0B192C] text-slate-400 text-xs border-t border-slate-800 py-6 mt-12 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-black text-slate-200">
              SahakarSetu (सहकार सेतू) — Smart India Hackathon 2024-2026
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              National Digital Public Infrastructure for Labour Cooperatives & Federations
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>MERN Stack (MongoDB + Express + React + Node.js)</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">80% Statutory Worker Take-Home</span>
          </div>
        </div>
      </footer>

      {/* Global Unified Cart Drawer Modal */}
      <CartDrawerModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onCheckout={handleCartCheckout}
      />

    </div>
  );
}

export default App;
