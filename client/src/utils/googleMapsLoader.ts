/**
 * Google Maps API Loader & Configuration Manager
 * Handles loading Google Maps JavaScript API with libraries (places, geometry, marker)
 * and supports user-provided or environment API keys.
 */

declare global {
  interface Window {
    google?: any;
    initGoogleMapsCallback?: () => void;
  }
}

const STORAGE_KEY = 'KARYASETU_GOOGLE_MAPS_API_KEY';

export const getGoogleMapsApiKey = (): string => {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored.trim().length > 0) return stored.trim();
  const envKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
  return envKey ? String(envKey).trim() : '';
};

export const setGoogleMapsApiKey = (key: string): void => {
  if (typeof window === 'undefined') return;
  if (key && key.trim().length > 0) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

let loadPromise: Promise<any> | null = null;

export const loadGoogleMapsApi = (customKey?: string): Promise<any> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window not available'));
  }

  // If already loaded
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (loadPromise) {
    return loadPromise;
  }

  const apiKey = customKey || getGoogleMapsApiKey();

  loadPromise = new Promise((resolve, reject) => {
    // Check if script element already exists
    const existingScript = document.getElementById('google-maps-js-api');
    if (existingScript) {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        existingScript.addEventListener('load', () => resolve(window.google?.maps));
        existingScript.addEventListener('error', (e) => reject(e));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-js-api';
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;

    const callbackName = `initGoogleMaps_${Date.now()}`;
    (window as any)[callbackName] = () => {
      delete (window as any)[callbackName];
      resolve(window.google?.maps);
    };

    const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';
    script.src = `https://maps.googleapis.com/maps/api/js?libraries=places,geometry,marker&callback=${callbackName}${keyParam}`;

    script.onerror = () => {
      delete (window as any)[callbackName];
      loadPromise = null;
      reject(new Error('Failed to load Google Maps JavaScript API'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};
