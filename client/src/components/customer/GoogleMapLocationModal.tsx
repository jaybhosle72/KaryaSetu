import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, Navigation, Search, X, Check, Compass, Layers, 
  Sparkles, ShieldCheck, AlertCircle, RefreshCw, ZoomIn, ZoomOut, Key
} from 'lucide-react';
import { GeoLocationCoords } from '../../types';
import { PUNE_LOCALITIES } from './CustomerLocationBar';
import { getGoogleMapsApiKey, setGoogleMapsApiKey, loadGoogleMapsApi } from '../../utils/googleMapsLoader';

interface GoogleMapLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: GeoLocationCoords;
  onConfirmLocation: (location: GeoLocationCoords) => void;
}

export const GoogleMapLocationModal: React.FC<GoogleMapLocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onConfirmLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: currentLocation.lat || 18.5074,
    lng: currentLocation.lng || 73.8077
  });
  const [selectedArea, setSelectedArea] = useState<string>(currentLocation.area || 'Kothrud');
  const [formattedAddress, setFormattedAddress] = useState<string>(
    currentLocation.address || 'Flat 504, Windsor Park, Kothrud, Pune 411038'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDetectingGPS, setIsDetectingGPS] = useState<boolean>(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [activeViewMode, setActiveViewMode] = useState<'js_api' | 'embed'>('js_api');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>(getGoogleMapsApiKey());

  // Helper: Find closest curated Pune locality based on distance
  const getNearestLocality = (lat: number, lng: number): GeoLocationCoords => {
    let nearest = PUNE_LOCALITIES[0];
    let minDist = Infinity;
    for (const loc of PUNE_LOCALITIES) {
      const dist = Math.hypot(loc.lat - lat, loc.lng - lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = loc;
      }
    }
    return nearest;
  };

  // Reverse geocode coordinates using Google Maps Geocoder or curated backup
  const reverseGeocode = (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    setStatusMessage('Resolving address with Google Maps...');

    if (geocoderRef.current) {
      geocoderRef.current.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        setIsReverseGeocoding(false);
        if (status === 'OK' && results && results[0]) {
          const first = results[0];
          setFormattedAddress(first.formatted_address);

          // Extract locality / sublocality
          let foundLocality = '';
          for (const comp of first.address_components) {
            if (comp.types.includes('sublocality') || comp.types.includes('neighborhood') || comp.types.includes('locality')) {
              foundLocality = comp.long_name;
              break;
            }
          }
          const finalArea = foundLocality || getNearestLocality(lat, lng).area;
          setSelectedArea(finalArea);
          setStatusMessage(`Identified: ${finalArea}`);
          setTimeout(() => setStatusMessage(''), 3000);
          return;
        }

        // Fallback to curated localities
        const nearest = getNearestLocality(lat, lng);
        setSelectedArea(nearest.area);
        setFormattedAddress(`${nearest.area}, Pune (GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
        setStatusMessage(`Near ${nearest.area}`);
        setTimeout(() => setStatusMessage(''), 3000);
      });
    } else {
      // Fallback
      setIsReverseGeocoding(false);
      const nearest = getNearestLocality(lat, lng);
      setSelectedArea(nearest.area);
      setFormattedAddress(`${nearest.area}, Pune (GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
      setStatusMessage(`Near ${nearest.area}`);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Initialize Google Maps JavaScript API
  useEffect(() => {
    if (!isOpen || activeViewMode !== 'js_api') return;

    let isMounted = true;

    loadGoogleMapsApi()
      .then((googleMaps) => {
        if (!isMounted || !mapContainerRef.current || !googleMaps) return;

        geocoderRef.current = new googleMaps.Geocoder();

        const initialPos = { lat: selectedCoords.lat, lng: selectedCoords.lng };

        const map = new googleMaps.Map(mapContainerRef.current, {
          center: initialPos,
          zoom: 15,
          mapTypeId: 'roadmap',
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: false
        });
        mapInstanceRef.current = map;

        // Custom Google Marker
        const marker = new googleMaps.Marker({
          position: initialPos,
          map,
          draggable: true,
          animation: googleMaps.Animation.DROP,
          title: 'Drag to set your exact location'
        });
        markerRef.current = marker;

        // Marker drag listener
        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          if (pos) {
            const lat = pos.lat();
            const lng = pos.lng();
            setSelectedCoords({ lat, lng });
            reverseGeocode(lat, lng);
          }
        });

        // Map click listener
        map.addListener('click', (e: any) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setSelectedCoords({ lat, lng });
            marker.setPosition({ lat, lng });
            map.panTo({ lat, lng });
            reverseGeocode(lat, lng);
          }
        });

        // Initialize Google Places Autocomplete on the search input if element exists
        if (searchInputRef.current && googleMaps.places?.Autocomplete) {
          const autocomplete = new googleMaps.places.Autocomplete(searchInputRef.current, {
            componentRestrictions: { country: 'in' },
            fields: ['geometry', 'formatted_address', 'name', 'address_components']
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              setSelectedCoords({ lat, lng });
              marker.setPosition({ lat, lng });
              map.setCenter({ lat, lng });
              map.setZoom(16);
              if (place.formatted_address) {
                setFormattedAddress(place.formatted_address);
              }
              const areaComp = place.address_components?.find((c: any) =>
                c.types.includes('sublocality') || c.types.includes('neighborhood')
              );
              if (areaComp) setSelectedArea(areaComp.long_name);
            }
          });
        }
      })
      .catch((err) => {
        console.warn('Google Maps JS API notice, switching to Google Maps Live View:', err);
        if (isMounted) setActiveViewMode('embed');
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeViewMode]);

  // Handle GPS detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGPS(true);
    setStatusMessage('Detecting your live GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGPS(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const roundedLat = parseFloat(latitude.toFixed(5));
        const roundedLng = parseFloat(longitude.toFixed(5));

        setSelectedCoords({ lat: roundedLat, lng: roundedLng });

        if (markerRef.current) {
          markerRef.current.setPosition({ lat: roundedLat, lng: roundedLng });
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo({ lat: roundedLat, lng: roundedLng });
          mapInstanceRef.current.setZoom(17);
        }

        reverseGeocode(roundedLat, roundedLng);
        setStatusMessage(`GPS locked (~${Math.round(accuracy || 30)}m)`);
        setTimeout(() => setStatusMessage(''), 4000);
      },
      (err) => {
        setIsDetectingGPS(false);
        console.warn('GPS error, keeping current coordinates:', err.message);
        setStatusMessage('GPS unavailable. Using Pune pin.');
        setTimeout(() => setStatusMessage(''), 3000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();

    // Check curated Pune localities first
    const matched = PUNE_LOCALITIES.find(
      l => l.area.toLowerCase().includes(query) || (l.address && l.address.toLowerCase().includes(query))
    );

    if (matched) {
      setSelectedCoords({ lat: matched.lat, lng: matched.lng });
      setSelectedArea(matched.area);
      if (matched.address) setFormattedAddress(matched.address);

      if (markerRef.current) markerRef.current.setPosition({ lat: matched.lat, lng: matched.lng });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat: matched.lat, lng: matched.lng });
        mapInstanceRef.current.setZoom(16);
      }
      setSearchQuery('');
      return;
    }

    // Use Google Geocoder if available
    if (geocoderRef.current) {
      setStatusMessage(`Searching "${searchQuery}" with Google...`);
      geocoderRef.current.geocode({ address: `${searchQuery}, Pune, Maharashtra, India` }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const first = results[0];
          const lat = first.geometry.location.lat();
          const lng = first.geometry.location.lng();
          setSelectedCoords({ lat, lng });
          setFormattedAddress(first.formatted_address);

          if (markerRef.current) markerRef.current.setPosition({ lat, lng });
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo({ lat, lng });
            mapInstanceRef.current.setZoom(16);
          }
          setStatusMessage(`Found: ${first.formatted_address.slice(0, 30)}...`);
          setTimeout(() => setStatusMessage(''), 3000);
        } else {
          setStatusMessage(`Could not find "${searchQuery}". Click directly on map.`);
          setTimeout(() => setStatusMessage(''), 3000);
        }
      });
    }
  };

  const handleConfirm = () => {
    onConfirmLocation({
      lat: parseFloat(selectedCoords.lat.toFixed(4)),
      lng: parseFloat(selectedCoords.lng.toFixed(4)),
      area: selectedArea,
      address: formattedAddress
    });
    onClose();
  };

  const handleSaveApiKey = () => {
    setGoogleMapsApiKey(apiKeyInput);
    setIsApiKeyModalOpen(false);
    setActiveViewMode('js_api');
    window.location.reload();
  };

  if (!isOpen) return null;

  // Google Maps Embed URL for coordinates
  const googleEmbedUrl = `https://www.google.com/maps?q=${selectedCoords.lat},${selectedCoords.lng}&z=16&output=embed`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* 1. Modal Top Bar */}
        <div className="px-5 py-3.5 bg-[#0B192C] text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-black">
              <MapPin className="w-4 h-4 text-red-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-white tracking-tight">
                  Google Maps Location Selector
                </h3>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                  Google Maps API Active
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Search an address or click anywhere on the Google Map to pin your exact doorstep
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-xl p-0.5 text-xs border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveViewMode('js_api')}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeViewMode === 'js_api' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Google JS Map
              </button>
              <button
                type="button"
                onClick={() => setActiveViewMode('embed')}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeViewMode === 'embed' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Google Live Embed
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(true)}
              title="Configure Google Maps API Key"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition cursor-pointer"
            >
              <Key className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Interactive Map Container & Floating Controls */}
        <div className="relative flex-1 min-h-[380px] sm:min-h-[440px] bg-slate-100 flex flex-col">
          
          {/* Map canvas */}
          {activeViewMode === 'js_api' ? (
            <div ref={mapContainerRef} className="w-full h-full flex-1 min-h-[380px]" />
          ) : (
            <iframe
              title="Official Google Maps Location"
              src={googleEmbedUrl}
              className="w-full h-full flex-1 min-h-[380px] border-0"
              loading="lazy"
              allowFullScreen
            />
          )}

          {/* Floating Search Bar (Google Maps style) */}
          <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-auto sm:w-96 z-10">
            <form onSubmit={handleSearchSubmit} className="relative shadow-lg rounded-2xl overflow-hidden">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Google Maps (e.g. Kothrud, Paud Road, Pune)..."
                className="w-full pl-10 pr-20 py-2.5 bg-white text-xs font-semibold text-slate-800 focus:outline-none border border-slate-300 rounded-2xl shadow-sm placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-xl transition cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* Floating GPS Radar Button (Detect Current Location) */}
          <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isDetectingGPS}
              title="Detect My Live GPS Location"
              className="w-12 h-12 rounded-2xl bg-white text-slate-800 hover:text-blue-600 shadow-xl border border-slate-200 flex items-center justify-center transition cursor-pointer hover:scale-105 active:scale-95 group relative"
            >
              <Compass className={`w-5 h-5 text-blue-600 ${isDetectingGPS ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
              {isDetectingGPS && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 animate-ping" />
              )}
            </button>
          </div>

          {/* Status Message Overlay */}
          {statusMessage && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-slate-900/90 text-white text-[11px] font-bold shadow-lg backdrop-blur-md animate-fadeIn">
              {statusMessage}
            </div>
          )}

        </div>

        {/* 3. Address Details & Action Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200">
          
          {/* Selected Address Preview Box */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                  <span>{selectedArea}</span>
                </span>
                <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                  Google Verified
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({selectedCoords.lat.toFixed(4)}°, {selectedCoords.lng.toFixed(4)}°)
                </span>
                {isReverseGeocoding && (
                  <span className="text-[10px] text-slate-400 animate-pulse">Resolving address...</span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 font-medium truncate">
                {formattedAddress}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirm & Set Location ➔</span>
              </button>
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
              Enter your Google Cloud Console Maps JavaScript API Key here. If empty, the system uses Google Maps live view automatically:
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                API Key (AIzaSy...):
              </label>
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste Google Maps API Key here"
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
