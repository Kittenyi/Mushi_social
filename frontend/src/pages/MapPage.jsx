/**
 * 地图页：纯 Mapbox 地图 + 我的位置标记 + 地址显示 + 底部导航
 * 无 3D 粒子/霓虹等叠加层，避免 THREE/WebGL 报错
 */
import { useState, useCallback, useEffect } from 'react';
import ForestMap from '@/components/map/ForestMap';
import { MeMarker } from '@/components/map/MeMarker';
import { NavBar } from '@/components/layout/NavBar';
import { MAPBOX_TOKEN, DEFAULT_CENTER } from '@/config/mapbox';

export function MapPage() {
  const [mapInstance, setMapInstance] = useState(null);
  const [myPosition, setMyPosition] = useState(DEFAULT_CENTER);
  const [myAddress, setMyAddress] = useState('Locating…');

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

  const handleMapReady = useCallback((map) => setMapInstance(map), []);

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden min-h-0">
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <ForestMap
          className="w-full h-full"
          onMapReady={handleMapReady}
          initialCenter={myPosition}
          initialZoom={14}
          realMap
        />
        <MeMarker map={mapInstance} position={myPosition} />

        <div className="absolute top-4 left-4 right-4 pointer-events-none flex justify-between items-start">
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
        </div>
      </div>

      <div className="flex-shrink-0">
        <NavBar />
      </div>
    </div>
  );
}
