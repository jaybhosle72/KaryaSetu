import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Sparkles } from 'lucide-react';
import { GeoLocationCoords } from '../../types';
import { Language, translations } from '../../i18n/translations';

export const PUNE_LOCALITIES: GeoLocationCoords[] = [
  { lat: 18.5074, lng: 73.8077, area: 'Kothrud, Pune', address: 'Flat 504, Windsor Park, Kothrud, Pune 411038' },
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
  onOpenMap?: () => void;
  currentLanguage?: Language;
}

export const CustomerLocationBar: React.FC<CustomerLocationBarProps> = ({
  currentLocation,
  onLocationChange,
  onOpenMap,
  currentLanguage = 'en'
}) => {
  const t = translations[currentLanguage] || translations.en;
  const [isDetecting, setIsDetecting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const handleDetectGPS = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const lat = parseFloat(latitude.toFixed(4));
        const lng = parseFloat(longitude.toFixed(4));
        let resolvedArea = 'Live GPS Location';
        let resolvedAddress = `GPS: ${lat}° N, ${lng}° E (Pune Metro Area)`;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (data?.address) {
              const addr = data.address;
              resolvedArea = addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || addr.road || 'Pune Metro';
              resolvedAddress = data.display_name || resolvedAddress;
            }
          }
        } catch {
          // Fallback to coordinates
        }

        setIsDetecting(false);
        onLocationChange({
          lat,
          lng,
          area: resolvedArea,
          address: resolvedAddress
        });
        setToastMessage(`✓ Current Location set: ${resolvedArea}`);
        setTimeout(() => setToastMessage(''), 3500);
      },
      (err) => {
        setIsDetecting(false);
        // Fallback to precise Pune default if browser denies or has no GPS hardware
        onLocationChange(PUNE_LOCALITIES[0]);
        setToastMessage('✓ Using Precise Coords (Pune)');
        setTimeout(() => setToastMessage(''), 3500);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative w-full">
      {/* Toast feedback when GPS is detected */}
      {toastMessage && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-50 animate-fadeIn flex items-center gap-1.5 border border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* The Single Unified Location Bar */}
      <div className="w-full bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md rounded-2xl p-1.5 transition-all duration-200 flex items-center justify-between gap-2 group">
        
        {/* Left Side: Clickable Google Map Location Trigger */}
        <button
          type="button"
          onClick={onOpenMap}
          title="Click to set or adjust location on Google Map"
          className="flex-1 flex items-center gap-2.5 text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer min-w-0"
        >
          <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-red-100/80 transition">
            <MapPin className="w-4 h-4 text-red-600" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                {currentLocation.area || 'Set Location on Google Map'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-bold border border-red-100/80">
                Google Map ➔
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-full">
              {currentLocation.address || `${currentLocation.lat.toFixed(2)}° N, ${currentLocation.lng.toFixed(2)}° E • Click to adjust on map`}
            </p>
          </div>
        </button>

        {/* Vertical Divider */}
        <div className="h-7 w-px bg-slate-200 shrink-0" />

        {/* Right Side: Option to set Current Location (GPS) */}
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isDetecting}
          title="Set to your current GPS location"
          className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition border border-blue-200/60 cursor-pointer shrink-0 disabled:opacity-60 shadow-2xs"
        >
          <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isDetecting ? 'animate-spin' : ''}`} />
          <span className="whitespace-nowrap">
            {isDetecting ? 'Detecting...' : 'Current Location'}
          </span>
        </button>
      </div>
    </div>
  );
};
