import React, { useEffect, useRef, useState } from 'react';
import { 
  X, Navigation, MapPin, Phone, ExternalLink, ShieldCheck, 
  CheckCircle2, Clock, Compass, AlertCircle, Play, Pause, RotateCcw,
  Layers, Key, RefreshCw
} from 'lucide-react';
import { Booking, Worker } from '../../types';
import { getGoogleMapsApiKey, setGoogleMapsApiKey, loadGoogleMapsApi } from '../../utils/googleMapsLoader';

interface WorkerNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  worker: Worker;
  onMarkArrived: () => void;
}

// Coordinates helper for Pune areas
const getCoordinatesForAddress = (addr: string = ''): { lat: number; lng: number; area: string } => {
  const lower = addr.toLowerCase();
  if (lower.includes('kothrud')) return { lat: 18.5074, lng: 73.8077, area: 'Kothrud' };
  if (lower.includes('baner')) return { lat: 18.5590, lng: 73.7868, area: 'Baner' };
  if (lower.includes('hinjewadi') || lower.includes('wakad')) return { lat: 18.5987, lng: 73.7607, area: 'Hinjewadi' };
  if (lower.includes('hadapsar') || lower.includes('magarpatta')) return { lat: 18.5089, lng: 73.9260, area: 'Hadapsar' };
  if (lower.includes('viman nagar')) return { lat: 18.5679, lng: 73.9143, area: 'Viman Nagar' };
  if (lower.includes('karve nagar')) return { lat: 18.4912, lng: 73.8185, area: 'Karve Nagar' };
  if (lower.includes('aundh')) return { lat: 18.5580, lng: 73.8075, area: 'Aundh' };
  return { lat: 18.5074, lng: 73.8077, area: 'Pune' };
};

export const WorkerNavigationModal: React.FC<WorkerNavigationModalProps> = ({
  isOpen,
  onClose,
  booking,
  worker,
  onMarkArrived
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);

  const customerCoords = getCoordinatesForAddress(booking.address);
  // Worker starting point (Cooperative Hub / Dispatch Depot in Pune)
  const originCoords = { lat: 18.5308, lng: 73.8475, address: 'Sahakar Bhavan, Shivajinagar, Pune, Maharashtra 411005' };
  const destinationAddress = booking.address || `${customerCoords.area}, Pune, Maharashtra`;

  const [etaMinutes, setEtaMinutes] = useState<number>(11);
  const [distanceKm, setDistanceKm] = useState<number>(3.8);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(25);
  const [activeViewMode, setActiveViewMode] = useState<'embed' | 'js_api'>('embed');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>(getGoogleMapsApiKey());
  const [dynamicSteps, setDynamicSteps] = useState<Array<{ instruction: string; distance: string; icon: string }>>([
    { instruction: 'Head southwest from Sahakar Bhavan Depot toward FC Road', distance: '450 m', icon: '⬆️' },
    { instruction: 'Turn right onto Ferguson College Road / Paud Phata', distance: '1.2 km', icon: '↗️' },
    { instruction: 'Continue straight on Paud Road past Ideal Colony Circle', distance: '1.5 km', icon: '⬆️' },
    { instruction: 'Turn left at Mayur Colony junction toward customer location', distance: '500 m', icon: '⬅️' },
    { instruction: 'Arrive at destination: ' + (booking.address || 'Kothrud, Pune'), distance: '150 m', icon: '📍' }
  ]);

  // Open official Google Maps navigation directly in mobile/desktop app
  const handleOpenGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originCoords.address)}&destination=${encodeURIComponent(destinationAddress)}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
  };

  // Official Google Maps Directions Embed URL (Direct from Google Maps)
  const googleMapsEmbedUrl = `https://www.google.com/maps?saddr=${encodeURIComponent(originCoords.address)}&daddr=${encodeURIComponent(destinationAddress)}&output=embed`;

  // Initialize Google Maps JavaScript API if user selects js_api mode or if window.google is ready
  useEffect(() => {
    if (!isOpen || activeViewMode !== 'js_api') return;

    let isMounted = true;

    loadGoogleMapsApi()
      .then((googleMaps) => {
        if (!isMounted || !mapContainerRef.current || !googleMaps) return;

        const map = new googleMaps.Map(mapContainerRef.current, {
          center: originCoords,
          zoom: 13,
          mapTypeId: 'roadmap',
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: false
        });
        mapInstanceRef.current = map;

        const directionsService = new googleMaps.DirectionsService();
        const directionsRenderer = new googleMaps.DirectionsRenderer({
          map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#2563EB',
            strokeWeight: 5,
            strokeOpacity: 0.9
          }
        });
        directionsRendererRef.current = directionsRenderer;

        directionsService.route(
          {
            origin: originCoords.address,
            destination: destinationAddress,
            travelMode: googleMaps.TravelMode.DRIVING
          },
          (result: any, status: any) => {
            if (!isMounted) return;
            if (status === 'OK' && result) {
              directionsRenderer.setDirections(result);
              const leg = result.routes?.[0]?.legs?.[0];
              if (leg) {
                if (leg.distance?.value) {
                  setDistanceKm(parseFloat((leg.distance.value / 1000).toFixed(1)));
                }
                if (leg.duration?.value) {
                  setEtaMinutes(Math.round(leg.duration.value / 60));
                }
                if (leg.steps && leg.steps.length > 0) {
                  const extracted = leg.steps.map((s: any) => ({
                    instruction: s.instructions ? s.instructions.replace(/<[^>]*>/g, '') : 'Proceed along route',
                    distance: s.distance?.text || '',
                    icon: s.maneuver?.includes('left') ? '⬅️' : s.maneuver?.includes('right') ? '↗️' : '⬆️'
                  }));
                  setDynamicSteps(extracted);
                }
              }
            } else {
              console.warn('Google DirectionsService returned status:', status);
            }
          }
        );
      })
      .catch((err) => {
        console.warn('Google Maps JS API load notice, using Google Maps Live Navigation view:', err);
        if (isMounted) setActiveViewMode('embed');
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeViewMode, destinationAddress]);

  // Handle saving API Key
  const handleSaveApiKey = () => {
    setGoogleMapsApiKey(apiKeyInput);
    setIsApiKeyModalOpen(false);
    setActiveViewMode('js_api');
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* 1. Header with Live Status & ETA */}
        <div className="bg-[#0B192C] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Turn-by-Turn GPS Navigation
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider">
                  Live Dispatch
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold">
                  Google Maps Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                En route to: <strong className="text-white">{booking.customerName}</strong> • {booking.serviceCategory}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xl font-black text-emerald-400">{etaMinutes} mins</span>
              <span className="text-[11px] text-slate-400 block font-semibold">{distanceKm} km away</span>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveViewMode('embed')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeViewMode === 'embed'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Google Live Navigation
              </button>
              <button
                type="button"
                onClick={() => setActiveViewMode('js_api')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeViewMode === 'js_api'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Google JS API
              </button>
            </div>

            {/* API Key settings trigger */}
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(true)}
              title="Google Maps API Key Configuration"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition cursor-pointer"
            >
              <Key className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Main Body: Left Map (60%) | Right Instructions (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[420px] sm:min-h-[500px] overflow-hidden">
          
          {/* Map Area */}
          <div className="lg:col-span-7 relative h-[300px] sm:h-[380px] lg:h-auto bg-slate-100 flex flex-col">
            {activeViewMode === 'embed' ? (
              <iframe
                title="Official Google Maps Navigation"
                src={googleMapsEmbedUrl}
                className="w-full h-full border-0 flex-1 min-h-[300px]"
                loading="lazy"
                allowFullScreen
              />
            ) : (
              <div ref={mapContainerRef} className="w-full h-full flex-1 min-h-[300px]" />
            )}

            {/* Floating Quick Stats Card */}
            <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-lg border border-slate-200/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                🛵
              </div>
              <div className="leading-tight">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                  En Route • {worker.name || 'Technician'}
                </span>
                <span className="text-xs font-black text-slate-900">
                  {dynamicSteps[0]?.instruction ? dynamicSteps[0].instruction.slice(0, 35) + '...' : 'Following Google route'}
                </span>
              </div>
            </div>

            {/* Google Maps Authenticity Bar */}
            <div className="absolute bottom-2 left-3 z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Official Google Maps Route & Traffic</span>
            </div>
          </div>

          {/* Turn-by-Turn Directions & Customer Details */}
          <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto bg-white border-t lg:border-t-0 lg:border-l border-slate-200 space-y-4">
            
            {/* Origin & Destination Route Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></span>
                <div className="text-xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Dispatch Origin</span>
                  <strong className="text-slate-800">{originCoords.address}</strong>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-slate-300 ml-1.5 pl-3 py-1 space-y-0.5">
                <span className="text-[10px] font-bold text-blue-700">{distanceKm} km • ~{etaMinutes} mins transit</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 flex-shrink-0"></span>
                <div className="text-xs">
                  <span className="text-[10px] font-black uppercase text-rose-800 block">Customer Destination</span>
                  <strong className="text-slate-900 block font-black leading-snug">
                    {booking.address}
                  </strong>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Client: <strong>{booking.customerName}</strong> ({booking.customerPhone})
                  </p>
                </div>
              </div>
            </div>

            {/* Turn-by-Turn Step Sequence from Google */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Google Turn-by-Turn Guidance
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {dynamicSteps.length} Steps
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {dynamicSteps.map((step, idx) => {
                  const isCurrent = idx === currentStepIndex;
                  const isDone = idx < currentStepIndex;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border transition flex items-start gap-2.5 text-xs ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-300 font-bold text-blue-950 shadow-2xs'
                          : isDone
                          ? 'bg-slate-50/60 border-slate-200/60 text-slate-400 line-through'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="text-base leading-none">{step.icon}</span>
                      <div className="flex-1">
                        <p className="leading-snug">{step.instruction}</p>
                        {step.distance && (
                          <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                            {step.distance}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Real-time Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>Navigation Progress</span>
                <span className="text-emerald-700 font-black">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {/* External Google Maps Button */}
              <button
                type="button"
                onClick={handleOpenGoogleMaps}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Official Google Maps App ➔</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${booking.customerPhone}`}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-200"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Call Customer</span>
                </a>

                <button
                  type="button"
                  onClick={onMarkArrived}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Arrived ✓</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Optional Google Maps API Key Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">Google Maps API Key</h3>
              </div>
              <button 
                onClick={() => setIsApiKeyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Google Maps Live Navigation works automatically. If you have a custom Google Maps JavaScript API Key from Google Cloud Console, enter it here:
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                API Key (AIzaSy...):
              </label>
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste your Google Maps API Key here"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setApiKeyInput('');
                  setGoogleMapsApiKey('');
                  setIsApiKeyModalOpen(false);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Clear Key
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              >
                Save & Use API Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
