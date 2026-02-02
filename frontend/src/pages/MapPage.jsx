/**
 * 地图页：Mapbox + 蘑菇标记，点击蘑菇弹出半屏信息卡（身份 + 图标操作），可上滑展开
 */
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ForestMap from '@/components/map/ForestMap';
import { MeMarker } from '@/components/map/MeMarker';
import MushiUserMarkers from '@/components/map/MushiUserMarkers';
import { MushiInfoCard } from '@/components/map/MushiInfoCard';
import { NavBar } from '@/components/layout/NavBar';
import { useProfileStore } from '@/stores/useProfileStore';
import { useTheme } from '@/context/ThemeContext';
import { addAcceptedFriend } from '@/lib/friendsData';
import { MOCK_USERS } from '@/lib/profileData';
import { MAPBOX_TOKEN, DEFAULT_CENTER } from '@/config/mapbox';

const MUSHI_ID_TO_ADDRESS = {
  'mushi-1': '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
  'mushi-2': '0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x',
  'mushi-3': '0x9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b',
  'mushi-4': '0x3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f',
  'mushi-5': '0x7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j',
  sherry: '0x5300000000000000000000000000000000000001',
};

const CHIANGMAI_WELCOME_KEY = 'mushi_chiangmai_welcomed';
const CHIANGMAI_WELCOME_MS = 3000;
/** 泰文：欢迎来到清迈 */
const CHIANGMAI_WELCOME_TH = 'ยินดีต้อนรับสู่เชียงใหม่';

export function MapPage() {
  const navigate = useNavigate();
  const { avatarUrl } = useProfileStore();
  const { nightMode, toggleNightMode } = useTheme();
  const [mapInstance, setMapInstance] = useState(null);
  const [myPosition, setMyPosition] = useState(DEFAULT_CENTER);
  const [myAddress, setMyAddress] = useState('Locating…');
  const [showChiangMaiWelcome, setShowChiangMaiWelcome] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation || !MAPBOX_TOKEN) {
      setMyAddress('Location unavailable');
      setMyPosition(DEFAULT_CENTER);
      return;
    }
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        setMyPosition([lng, lat]);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=en&limit=1`;
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            if (cancelled) return;
            const place = data?.features?.[0];
            setMyAddress(place?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          })
          .catch(() => {
            if (!cancelled) setMyAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          });
      },
      () => {
        if (!cancelled) {
          setMyAddress('Location unavailable');
          setMyPosition(DEFAULT_CENTER);
        }
      },
      { enableHighAccuracy: true }
    );
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!mapInstance || !myPosition) return;
    mapInstance.flyTo({ center: myPosition, zoom: 14, duration: 1500 });
  }, [mapInstance, myPosition]);

  const [selectedMushi, setSelectedMushi] = useState(null);

  const handleMapReady = useCallback((map) => setMapInstance(map), []);
  const goToMe = useCallback(() => navigate('/settings'), [navigate]);
  const handleMushiClick = useCallback((profile, position) => {
    setSelectedMushi({ profile, position });
  }, []);
  const handleAddFriend = useCallback((profile) => {
    if (profile?.id) addAcceptedFriend(profile.id);
    setSelectedMushi(null);
    navigate('/friends');
  }, [navigate]);
  const handleMessage = useCallback((profile) => {
    const address = MUSHI_ID_TO_ADDRESS[profile?.id] || profile?.id;
    const peerName = MOCK_USERS[profile?.id]?.name || profile?.nickname || null;
    setSelectedMushi(null);
    if (address) navigate(`/chat/${address}`, { state: peerName ? { peerName } : undefined });
  }, [navigate]);

  // 用户一登陆：显示泰文「欢迎来到清迈」3s 后淡出消失（每 session 一次）
  useEffect(() => {
    try {
      if (sessionStorage.getItem(CHIANGMAI_WELCOME_KEY)) return;
      setShowChiangMaiWelcome(true);
      const t = setTimeout(() => {
        setShowChiangMaiWelcome(false);
        sessionStorage.setItem(CHIANGMAI_WELCOME_KEY, '1');
      }, CHIANGMAI_WELCOME_MS);
      return () => clearTimeout(t);
    } catch {
      setShowChiangMaiWelcome(false);
    }
  }, []);

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden min-h-0">
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <ForestMap
          key={nightMode ? 'night' : 'day'}
          className="w-full h-full"
          onMapReady={handleMapReady}
          initialCenter={myPosition}
          initialZoom={14}
          realMap
          nightMode={nightMode}
        />
        <MeMarker
          map={mapInstance}
          position={myPosition}
          avatarUrl={avatarUrl}
          onMeClick={goToMe}
        />
        <MushiUserMarkers map={mapInstance} onMushiClick={handleMushiClick} />

        <AnimatePresence>
          {selectedMushi && (
            <MushiInfoCard
              key={selectedMushi.profile.id}
              profile={selectedMushi.profile}
              position={selectedMushi.position}
              myPosition={myPosition}
              mapInstance={mapInstance}
              onClose={() => setSelectedMushi(null)}
              onAddFriend={handleAddFriend}
              onMessage={handleMessage}
            />
          )}
        </AnimatePresence>

        <div className="absolute top-4 left-4 right-4 pointer-events-none flex justify-between items-start z-10">
          <div
            className="px-4 py-2 rounded-2xl max-w-[70%]"
            style={{
              backgroundColor: 'rgba(10, 26, 16, 0.85)',
              color: 'rgba(163, 255, 18, 0.95)',
              boxShadow: '0 0 20px rgba(163, 255, 18, 0.1)',
            }}
          >
            <p className="text-sm font-medium truncate" title={myAddress}>
              📍 {myAddress}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleNightMode}
            className="pointer-events-auto w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-white/10 shadow-lg"
            style={{
              backgroundColor: nightMode ? 'rgba(30, 20, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              color: nightMode ? '#e9d5ff' : '#4c1d95',
            }}
            title={nightMode ? '日间模式' : '夜间模式'}
            aria-label={nightMode ? '日间模式' : '夜间模式'}
          >
            {nightMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* 清迈黑客松：欢迎来到清迈（泰文），显示 3s 后消失 */}
        {showChiangMaiWelcome && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            aria-live="polite"
          >
            <div
              className="px-6 py-4 rounded-2xl text-center shadow-xl animate-in fade-in duration-300"
              style={{
                backgroundColor: 'rgba(10, 26, 16, 0.92)',
                color: 'rgba(163, 255, 18, 0.98)',
                boxShadow: '0 0 40px rgba(163, 255, 18, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.3)',
              }}
            >
              <p className="text-xl font-semibold">{CHIANGMAI_WELCOME_TH}</p>
              <p className="text-sm mt-1 opacity-80">Welcome to Chiang Mai</p>
            </div>
          </div>
        )}
      </div>

      {!selectedMushi && (
        <div className="flex-shrink-0">
          <NavBar />
        </div>
      )}
    </div>
  );
}
