import { useState, useEffect } from 'react';
import { MapView } from '../../components/map/MapView';
import { NavBar } from '../../components/layout/NavBar';
import { useProfileStore } from '../../stores/useProfileStore';

const WELCOME_BACK_FLAG = 'mushi_show_welcome_back';

export function MapPage() {
  const { displayName } = useProfileStore();
  const [showWelcome, setShowWelcome] = useState(false);

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

  const name = (displayName || '').trim() || '蘑菇君';

  return (
    <div className="h-full w-full flex flex-col overflow-hidden" style={{ height: '100vh', minHeight: '100%' }}>
      <div className="flex-1 min-h-0 relative flex flex-col" style={{ minHeight: 300 }}>
        <MapView />
        {showWelcome && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-bounce-in"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border border-white/20 bg-white/10 backdrop-blur-xl text-white">
              <span className="text-2xl" aria-hidden>🍄</span>
              <span className="font-medium text-base">
                欢迎回来，<span className="text-violet-200 font-semibold">{name}</span>～
              </span>
            </div>
          </div>
        )}
      </div>
      <NavBar />
    </div>
  );
}
