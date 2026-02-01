import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView } from '../../components/map/MapView';
import { NavBar } from '../../components/layout/NavBar';
import { useProfileStore } from '../../stores/useProfileStore';
import { useTheme } from '../../context/ThemeContext';

const WELCOME_BACK_FLAG = 'mushi_show_welcome_back';
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export function MapPage() {
  const navigate = useNavigate();
  const { nightMode, toggleNightMode } = useTheme();
  const { displayName } = useProfileStore();
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('Locating…');

  useEffect(() => {
    try {
      if (sessionStorage.getItem(WELCOME_BACK_FLAG) === '1') {
        sessionStorage.removeItem(WELCOME_BACK_FLAG);
        setShowWelcome(true);
        const t = setTimeout(() => setShowWelcome(false), 4000);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!navigator.geolocation || !MAPBOX_TOKEN) {
      setCurrentAddress('Location unavailable');
      return;
    }
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const { longitude, latitude } = pos.coords;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&language=en&limit=1`;
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            if (cancelled) return;
            const place = data?.features?.[0];
            if (place?.place_name) {
              setCurrentAddress(place.place_name);
            } else {
              setCurrentAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          })
          .catch(() => {
            if (!cancelled) setCurrentAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          });
      },
      () => {
        if (!cancelled) setCurrentAddress('Location unavailable');
      },
      { enableHighAccuracy: true }
    );
    return () => { cancelled = true; };
  }, []);

  const name = (displayName || '').trim() || 'Mushi';

  return (
    <div className="h-full w-full flex flex-col overflow-hidden" style={{ height: '100vh', minHeight: '100%' }}>
      <div className="flex-1 min-h-0 relative flex flex-col" style={{ minHeight: 300 }}>
        <MapView key={nightMode ? 'dark' : 'light'} nightMode={nightMode} />

        <div className="absolute top-4 left-4 z-20 max-w-[60%]">
          <div className="px-3 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white text-sm truncate shadow-lg">
            📍 {currentAddress}
          </div>
        </div>

        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={toggleNightMode}
            className="w-10 h-10 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white flex items-center justify-center shadow-lg hover:ring-2 hover:ring-violet-400/50 transition-all"
            title={nightMode ? 'Day mode' : 'Night mode'}
            aria-label={nightMode ? 'Switch to day mode' : 'Switch to night mode'}
          >
            {nightMode ? '☀️' : '🌙'}
          </button>
        </div>

        {showWelcome && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-bounce-in"
            role="status"
            aria-live="polite"
          >
            <div
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-md ${
                nightMode
                  ? 'bg-white/10 border border-white/20 text-white'
                  : 'bg-slate-800/95 border border-slate-600/50 text-white'
              }`}
            >
              <span className="text-2xl" aria-hidden>🍄</span>
              <span className="font-medium text-base">
                Welcome back, <span className={nightMode ? 'text-violet-200 font-semibold' : 'text-amber-200 font-semibold'}>{name}</span>
              </span>
            </div>
          </div>
        )}
      </div>
      <NavBar />
    </div>
  );
}
