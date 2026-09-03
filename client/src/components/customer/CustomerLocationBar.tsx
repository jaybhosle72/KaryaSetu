import React, { useState } from 'react';
import { MapPin, Navigation, ChevronDown, Check, Compass } from 'lucide-react';
import { GeoLocationCoords } from '../../types';

export const PUNE_LOCALITIES: GeoLocationCoords[] = [
  { lat: 18.5074, lng: 73.8077, area: 'Kothrud', address: 'Flat 504, Windsor Park, Kothrud, Pune 411038' },
  { lat: 18.5590, lng: 73.7868, area: 'Baner', address: 'Plot 12, Baner-Pashan Link Road, Baner, Pune 411045' },
  { lat: 18.5987, lng: 73.7607, area: 'Hinjewadi / Wakad', address: 'Phase 1, Blue Ridge, Hinjewadi IT Park, Pune 411057' },
  { lat: 18.5308, lng: 73.8475, area: 'Shivajinagar', address: 'Sahakar Bhavan, FC Road, Shivajinagar, Pune 411005' },
  { lat: 18.4912, lng: 73.8185, area: 'Karve Nagar', address: 'Hingne Home Colony, Karve Nagar, Pune 411052' },
  { lat: 18.5089, lng: 73.9260, area: 'Hadapsar', address: 'Tower 4, Magarpatta City, Hadapsar, Pune 411028' },
  { lat: 18.5679, lng: 73.9143, area: 'Viman Nagar', address: 'Row House 8, Clover Park, Viman Nagar, Pune 411014' },
  { lat: 18.5580, lng: 73.8075, area: 'Aundh', address: 'DP Road, Near Brehmen Chowk, Aundh, Pune 411007' }
];

interface CustomerLocationBarProps {
  currentLocation: GeoLocationCoords;
  onLocationChange: (location: GeoLocationCoords) => void;
}

export const CustomerLocationBar: React.FC<CustomerLocationBarProps> = ({
  currentLocation,
  onLocationChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetecting(false);
        const { latitude, longitude } = pos.coords;
        onLocationChange({
          lat: parseFloat(latitude.toFixed(4)),
          lng: parseFloat(longitude.toFixed(4)),
          area: 'Live GPS Pin',
          address: `GPS: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E (Pune Metro Area)`
        });
        setIsOpen(false);
      },
      (err) => {
        setIsDetecting(false);
        // Fallback to Kothrud if denied or on local development
        onLocationChange(PUNE_LOCALITIES[0]);
        setIsOpen(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative inline-block text-left z-30">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 shadow-2xs transition text-xs font-bold text-slate-800 cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 animate-bounce" />
          <span className="truncate max-w-[180px] sm:max-w-[240px]">
            {currentLocation.area} ({currentLocation.lat.toFixed(2)}°, {currentLocation.lng.toFixed(2)}°)
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
        </button>

        <button
          type="button"
          onClick={handleDetectGPS}
          title="Detect Current GPS Location"
          disabled={isDetecting}
          className="p-1.5 rounded-xl bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold border border-slate-200 shadow-2xs"
        >
          <Compass className={`w-3.5 h-3.5 text-blue-600 ${isDetecting ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">GPS Radar</span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white shadow-2xl border border-slate-200 py-2 z-50 text-xs animate-fadeIn">
          <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="font-black text-slate-900 text-[11px] uppercase tracking-wider">
              Select Customer Service Hub
            </span>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
              Pune Municipal (PMC/PCMC)
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto py-1 space-y-0.5">
            {PUNE_LOCALITIES.map((loc) => {
              const isSelected = loc.area === currentLocation.area;
              return (
                <button
                  key={loc.area}
                  type="button"
                  onClick={() => {
                    onLocationChange(loc);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 flex items-start justify-between hover:bg-slate-50 transition cursor-pointer ${
                    isSelected ? 'bg-blue-50/80 font-black text-blue-900' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <strong className="block text-xs">{loc.area}</strong>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{loc.address}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <button
              type="button"
              onClick={handleDetectGPS}
              className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isDetecting ? 'Detecting GPS...' : 'Use Precise GPS Coords 📍'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
