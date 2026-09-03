import React, { useState } from 'react';
import { Cooperative, Worker, Booking, DemandForecast } from '../../types';
import { MapPin, Navigation, AlertTriangle, ShieldCheck, Flame, Users, Zap, Wrench, Sparkles, Building2 } from 'lucide-react';

interface InteractiveMapProps {
  cooperatives: Cooperative[];
  workers: Worker[];
  activeBookings: Booking[];
  forecasts: DemandForecast[];
  selectedWorkerId?: string;
  onSelectWorker?: (workerId: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  cooperatives,
  workers,
  activeBookings,
  forecasts,
  selectedWorkerId,
  onSelectWorker
}) => {
  const [filter, setFilter] = useState<'ALL' | 'WORKERS' | 'EMERGENCY' | 'HEATMAP'>('ALL');
  const [activePin, setActivePin] = useState<{ title: string; subtitle: string; type: string; badge?: string } | null>(null);

  // Map coordinates projection for Pune Metropolitan area (approx bounds: 18.48 to 18.60 lat, 73.74 to 73.92 lng)
  const mapCenter = { lat: 18.5300, lng: 73.8300 };

  const getPositionPercent = (lat: number = 18.5204, lng: number = 73.8567) => {
    // Normalizing between lat 18.48 - 18.60 and lng 73.74 - 73.90
    const minLat = 18.4800, maxLat = 18.6000;
    const minLng = 73.7400, maxLng = 73.9000;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    // Invert Y because latitude goes north (up) but SVG/CSS Y goes down
    const y = (1 - ((lat - minLat) / (maxLat - minLat))) * 100;

    return {
      left: `${Math.min(92, Math.max(8, x))}%`,
      top: `${Math.min(88, Math.max(12, y))}%`
    };
  };

  const zones = [
    { name: "Baner & Balewadi", lat: 18.5650, lng: 73.7850, risk: "HIGH", label: "+185% Plumbing Alert", color: "bg-red-500/20 border-red-500 text-red-700" },
    { name: "Hinjewadi IT Zone", lat: 18.5900, lng: 73.7450, risk: "MEDIUM", label: "Electrical Surge Zone", color: "bg-amber-500/20 border-amber-500 text-amber-800" },
    { name: "Kothrud Sector", lat: 18.5080, lng: 73.8150, risk: "MEDIUM", label: "Deep Cleaning Surge", color: "bg-blue-500/20 border-blue-500 text-blue-800" },
    { name: "Shivajinagar Central", lat: 18.5310, lng: 73.8480, risk: "NORMAL", label: "Cooperative HQ Hub", color: "bg-emerald-500/20 border-emerald-500 text-emerald-800" }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      
      {/* Map Header Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Cooperative Geospatial Live Radar
            </h3>
            <p className="text-xs text-slate-500">
              Pune Metropolitan District • Live Shramik tracking & AI demand heatmap
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              filter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Entities
          </button>
          <button
            onClick={() => setFilter('WORKERS')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              filter === 'WORKERS' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            👷 Workers ({workers.length})
          </button>
          <button
            onClick={() => setFilter('EMERGENCY')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              filter === 'EMERGENCY' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🚨 Emergency Dispatches
          </button>
          <button
            onClick={() => setFilter('HEATMAP')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              filter === 'HEATMAP' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🔥 AI Demand Heatmap
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[400px] bg-slate-900 overflow-hidden select-none">
        
        {/* Abstract Stylized Map Background Grid */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Simulated Road Arteries */}
        <svg className="absolute inset-0 w-full h-full stroke-slate-700/60 stroke-[1.5] fill-none">
          <path d="M 50 150 Q 250 200 500 180 T 950 260" strokeDasharray="6 4" />
          <path d="M 120 400 Q 300 280 480 220 T 880 120" strokeDasharray="4 4" />
          <path d="M 450 30 Q 480 180 490 320 T 520 400" strokeWidth="2" stroke="#334155" />
          <path d="M 750 60 Q 720 220 680 380" strokeWidth="1.5" stroke="#334155" />
          
          {/* Dispatch route line if active booking */}
          {activeBookings.filter(b => b.status === 'EN_ROUTE' || b.status === 'IN_PROGRESS').map((b, i) => (
            <g key={b._id || i}>
              <line 
                x1="45%" y1="62%" x2="68%" y2="35%" 
                stroke="#22c55e" strokeWidth="3" strokeDasharray="6 3" className="animate-pulse" 
              />
              <circle cx="68%" cy="35%" r="6" fill="#ef4444" className="animate-ping" />
            </g>
          ))}
        </svg>

        {/* Heatmap Zones */}
        {(filter === 'ALL' || filter === 'HEATMAP') && zones.map((z, idx) => {
          const pos = getPositionPercent(z.lat, z.lng);
          return (
            <div
              key={idx}
              style={{ left: pos.left, top: pos.top }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500"
            >
              <div className={`w-36 h-36 rounded-full blur-xl opacity-40 animate-pulse ${
                z.risk === 'HIGH' ? 'bg-red-500' : z.risk === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-sm whitespace-nowrap ${z.color}`}>
                  <Flame className="w-3 h-3" />
                  {z.name}: {z.label}
                </span>
              </div>
            </div>
          );
        })}

        {/* Cooperative Hub Pins */}
        {(filter === 'ALL') && cooperatives.map((coop) => {
          const pos = getPositionPercent(coop.location?.lat || 18.5204, coop.location?.lng || 73.8567);
          return (
            <div
              key={coop._id}
              style={{ left: pos.left, top: pos.top }}
              onClick={() => setActivePin({
                title: coop.name,
                subtitle: `${coop.totalWorkers} Registered Workers • Welfare Pool: ₹${coop.welfareFundBalance.toLocaleString('en-IN')}`,
                type: 'Cooperative Society HQ',
                badge: `Reg: ${coop.regNumber}`
              })}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 border-2 border-white transform transition group-hover:scale-110">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap shadow border border-slate-700">
                  {coop.shortName}
                </div>
              </div>
            </div>
          );
        })}

        {/* Workers Pins */}
        {(filter === 'ALL' || filter === 'WORKERS') && workers.map((worker) => {
          const pos = getPositionPercent(worker.location?.lat, worker.location?.lng);
          const isSelected = selectedWorkerId === worker._id;
          const isEmergency = worker.status === 'EMERGENCY_READY' || worker.isEmergencyDuty;

          return (
            <div
              key={worker._id}
              style={{ left: pos.left, top: pos.top }}
              onClick={() => {
                if (onSelectWorker) onSelectWorker(worker._id);
                setActivePin({
                  title: `${worker.name} (${worker.trade})`,
                  subtitle: `${worker.cooperativeName} • Reliability: ${worker.reliabilityScore}% • ${worker.completedJobs} Jobs`,
                  type: 'Verified Shramik',
                  badge: worker.status
                });
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
            >
              <div className="relative">
                {isEmergency && (
                  <div className="absolute -inset-1 rounded-full bg-red-500 animate-ping opacity-75" />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md border-2 border-white transition transform group-hover:scale-125 ${
                  isSelected 
                    ? 'ring-4 ring-emerald-400 bg-emerald-600' 
                    : isEmergency 
                    ? 'bg-red-600' 
                    : worker.status === 'AVAILABLE' 
                    ? 'bg-emerald-600' 
                    : 'bg-amber-600'
                }`}>
                  {worker.trade === 'Electrical' && <Zap className="w-4 h-4" />}
                  {worker.trade === 'Plumbing' && <Wrench className="w-4 h-4" />}
                  {worker.trade === 'Carpentry' && <Wrench className="w-4 h-4" />}
                  {worker.trade === 'Deep Cleaning' && <Sparkles className="w-4 h-4" />}
                  {!['Electrical', 'Plumbing', 'Carpentry', 'Deep Cleaning'].includes(worker.trade) && <Users className="w-4 h-4" />}
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-40">
                  {worker.name} ({worker.reliabilityScore}%)
                </div>
              </div>
            </div>
          );
        })}

        {/* Active Customer Bookings Pins */}
        {(filter === 'ALL' || filter === 'EMERGENCY') && activeBookings.filter(b => b.status !== 'COMPLETED').map((booking) => {
          return (
            <div
              key={booking._id}
              style={{ left: '68%', top: '35%' }}
              onClick={() => setActivePin({
                title: `${booking.customerName} - ${booking.subTrade}`,
                subtitle: `${booking.address} • ETA: ${booking.etaMinutes || 15} mins • Fee: ₹${booking.totalAmount}`,
                type: booking.urgency === 'EMERGENCY' ? '🚨 SOS EMERGENCY DISPATCH' : 'Standard Booking',
                badge: booking.status
              })}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-400 opacity-75" />
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center border-2 border-white shadow-lg">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-red-700 text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow">
                  {booking.urgency === 'EMERGENCY' ? '🚨 SOS EMERGENCY' : 'Active Job'}
                </div>
              </div>
            </div>
          );
        })}

      </div>

      {/* Pin Detail Tooltip Drawer */}
      {activePin && (
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{activePin.title}</span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activePin.type}
                </span>
                {activePin.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                    {activePin.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{activePin.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setActivePin(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* Map Legend Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
            <span>Cooperative Society</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            <span>Available Shramik</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block animate-pulse" />
            <span>Emergency Ready / SOS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span>High Demand Surge Zone</span>
          </div>
        </div>

        <span className="text-slate-400 text-[11px]">
          Live telemetry simulated from Pune Municipal Co-op Grid
        </span>
      </div>

    </div>
  );
};
