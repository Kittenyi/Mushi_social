/**
 * 地图主界面：暗色 Mapbox、我的头像、附近好友头像 + 状态气泡、悬停信息卡、点击平滑移动、点击头像进 Profile
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import { useProfileStore } from '../../stores/useProfileStore';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const DEFAULT_CENTER = [98.9853, 18.7883];
const DEFAULT_ZOOM = 14;
const DEFAULT_PITCH = 45;

// 模拟附近用户（带 0x 地址，便于从地图/Profile 直接「发消息」进聊天，无需手动输入地址）
const MOCK_NEARBY = [
  { id: '1', address: '0x1111111111111111111111111111111111111111', lng: 98.986, lat: 18.789, name: 'Alex', status: '在喝咖啡 ☕', isFriend: false },
  { id: '2', address: '0x2222222222222222222222222222222222222222', lng: 98.984, lat: 18.787, name: 'Sam', status: 'Yellow Coworking', isFriend: true },
  { id: '3', address: '0x3333333333333333333333333333333333333333', lng: 98.987, lat: 18.788, name: 'Jade', status: '写代码中 💻', isFriend: false },
];

/** 创建「我」的标记 DOM：有头像用 img，否则蘑菇 */
function createMeMarkerEl(avatarUrl) {
  const wrap = document.createElement('div');
  wrap.className = 'map-marker-me';
  if (avatarUrl) {
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = '';
    img.className = 'w-full h-full rounded-full object-cover';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';
    wrap.appendChild(img);
  } else {
    wrap.innerHTML = '🍄';
  }
  return wrap;
}

/** 更新「我」标记内容（头像变化时调用） */
function updateMeMarkerContent(wrap, avatarUrl) {
  if (!wrap) return;
  wrap.textContent = '';
  wrap.className = 'map-marker-me';
  if (avatarUrl) {
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = '';
    img.className = 'w-full h-full rounded-full object-cover';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';
    wrap.appendChild(img);
  } else {
    wrap.innerHTML = '🍄';
  }
}

function createUserMarkerEl(user, onHideCard, onAvatarClick) {
  const wrap = document.createElement('div');
  wrap.className = 'map-marker-wrapper';

  const avatar = document.createElement('div');
  avatar.className = 'map-marker-user';
  avatar.innerHTML = '🍄';
  if (onAvatarClick) {
    avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      onAvatarClick();
    });
  }

  const card = document.createElement('div');
  card.className = 'map-user-card';
  card.style.display = 'none';
  card.innerHTML = `
    <div style="font-weight:600;margin-bottom:4px;">${user.name}</div>
    <div class="status">${user.status}</div>
    <div class="actions">
      ${!user.isFriend ? '<button title="Add Friend">👤</button>' : ''}
      <button title="Message">💬</button>
      ${user.isFriend ? '<button title="Go to Their Location">📍</button>' : ''}
    </div>
  `;

  avatar.addEventListener('mouseenter', () => {
    card.style.display = 'block';
  });
  avatar.addEventListener('mouseleave', () => {
    card.style.display = 'none';
    onHideCard?.();
  });
  card.addEventListener('mouseenter', () => {
    card.style.display = 'block';
  });
  card.addEventListener('mouseleave', () => {
    card.style.display = 'none';
  });

  wrap.appendChild(avatar);
  wrap.appendChild(card);
  return wrap;
}

export function MapView() {
  const navigate = useNavigate();
  const { ghostMode, avatarUrl } = useProfileStore();
  const avatarUrlRef = useRef(avatarUrl);
  avatarUrlRef.current = avatarUrl;
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const meMarkerRef = useRef(null);
  const meCenterRef = useRef([...DEFAULT_CENTER]);
  const resizeTimeoutRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setError(null);
    setLoading(true);

    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_public_token') {
      setError('请设置 Mapbox Token：在 frontend 目录复制 .env.example 为 .env，填入 VITE_MAPBOX_ACCESS_TOKEN');
      setLoading(false);
      return;
    }

    // 不在此处读 containerRef.current：首帧 ref 可能尚未挂上，直接交给 tryInit（rAF 后执行）判断
    const MAX_TRY_INIT = 50; // 约 5 秒后放弃，避免无限重试导致卡顿
    let tryCount = 0;
    let rafId;
    let timeoutId;
    let loadTimeoutId;
    let resizeObserver;
    let mounted = true;

    function initMap(containerEl) {
      if (!containerEl || mapRef.current) return;
      mapboxgl.accessToken = MAPBOX_TOKEN;
      const map = new mapboxgl.Map({
        container: containerEl,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        pitch: DEFAULT_PITCH,
        bearing: 0,
      });

      map.on('error', (e) => {
        console.error('[MapView] Mapbox error', e);
        const msg = e.error?.message || e.error?.toString?.() || '';
        const hint = msg.includes('401') || msg.toLowerCase().includes('token')
          ? 'Token 无效或已过期，请到 Mapbox 后台检查并更新 .env 中的 VITE_MAPBOX_ACCESS_TOKEN'
          : msg || 'Mapbox 加载失败，请检查网络或 Token（地图数据来自 Mapbox，不经过本应用后端）';
        setError(hint);
        setLoading(false);
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.on('load', () => {
        if (loadTimeoutId) clearTimeout(loadTimeoutId);
        setLoading(false);
        setError(null);
        if (mounted) map.resize();

        let meCenter = [...DEFAULT_CENTER];
        meCenterRef.current = meCenter;

        const addMeMarker = () => {
          if (meMarkerRef.current) return;
          const meEl = createMeMarkerEl(avatarUrlRef.current);
          const meMarker = new mapboxgl.Marker({ element: meEl, anchor: 'center' })
            .setLngLat(meCenterRef.current)
            .addTo(map);
          meMarkerRef.current = meMarker;
          markersRef.current.push(meMarker);
        };
        const removeMeMarker = () => {
          if (!meMarkerRef.current) return;
          meMarkerRef.current.remove();
          markersRef.current = markersRef.current.filter((m) => m !== meMarkerRef.current);
          meMarkerRef.current = null;
        };

        if (!ghostMode) addMeMarker();

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              meCenterRef.current = [pos.coords.longitude, pos.coords.latitude];
              map.setCenter(meCenterRef.current);
              if (meMarkerRef.current) meMarkerRef.current.setLngLat(meCenterRef.current);
            },
            () => {},
            { enableHighAccuracy: true }
          );
        }

        MOCK_NEARBY.forEach((user) => {
          const el = createUserMarkerEl(user, undefined, () => navigate(`/profile/${user.id}`, { state: { address: user.address, name: user.name } }));
          const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([user.lng, user.lat])
            .addTo(map);
          markersRef.current.push(marker);
        });

        map.on('click', (e) => {
          map.flyTo({
            center: e.lngLat,
            duration: 1000,
            essential: true,
          });
        });

        resizeObserver = new ResizeObserver(() => {
          if (!mounted || !mapRef.current) return;
          if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
          resizeTimeoutRef.current = setTimeout(() => {
            resizeTimeoutRef.current = null;
            if (mounted && mapRef.current) mapRef.current.resize();
          }, 150);
        });
        resizeObserver.observe(containerEl);
      });

      // 若 12 秒内未触发 load，视为超时
      loadTimeoutId = setTimeout(() => {
        if (mapRef.current) {
          setError('地图加载超时，请重试');
          setLoading(false);
        }
      }, 12000);

      mapRef.current = map;
    }

    function tryInit() {
      if (!mounted) return;
      const el = containerRef.current;
      if (!el) {
        tryCount += 1;
        if (tryCount >= MAX_TRY_INIT && mounted) {
          setError('地图容器未就绪，请刷新页面');
          setLoading(false);
          return;
        }
        timeoutId = setTimeout(tryInit, 100);
        return;
      }
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        initMap(el);
        return;
      }
      tryCount += 1;
      if (tryCount >= MAX_TRY_INIT && mounted) {
        setError('地图容器无法获得尺寸，请刷新页面');
        setLoading(false);
        return;
      }
      timeoutId = setTimeout(tryInit, 100);
    }

    rafId = requestAnimationFrame(tryInit);

    return () => {
      mounted = false;
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
      if (loadTimeoutId) clearTimeout(loadTimeoutId);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      meMarkerRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [retryKey]);

  // 幽灵模式切换：打开时移除「我」标记，关闭时加回
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (ghostMode) {
      if (meMarkerRef.current) {
        meMarkerRef.current.remove();
        markersRef.current = markersRef.current.filter((m) => m !== meMarkerRef.current);
        meMarkerRef.current = null;
      }
    } else {
        if (!meMarkerRef.current) {
          const meEl = createMeMarkerEl(avatarUrlRef.current);
          const meMarker = new mapboxgl.Marker({ element: meEl, anchor: 'center' })
          .setLngLat(meCenterRef.current)
          .addTo(map);
        meMarkerRef.current = meMarker;
        markersRef.current.push(meMarker);
      }
    }
  }, [ghostMode]);

  // 头像变化时更新「我」标记
  useEffect(() => {
    if (!meMarkerRef.current) return;
    const el = meMarkerRef.current.getElement?.();
    if (el) updateMeMarkerContent(el, avatarUrl);
  }, [avatarUrl]);

  const handleRetry = () => {
    setRetryKey((k) => k + 1);
  };

  if (error) {
    return (
      <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <p className="text-amber-400 mb-2">地图加载异常</p>
        <p className="text-white/60 text-sm text-center max-w-md mb-4">{error}</p>
        <p className="text-white/40 text-xs text-center max-w-md mb-4">
          地图由 Mapbox 直接加载，不经过本应用后端。请打开浏览器 F12 → Console/Network 查看具体报错或对 api.mapbox.com 的请求状态。
        </p>
        <button type="button" onClick={handleRetry} className="btn-primary mb-2">
          重试
        </button>
        <a
          href="https://account.mapbox.com/access-tokens/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 text-sm underline"
        >
          获取/检查 Mapbox Token →
        </a>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col" style={{ minHeight: 0 }}>
      {loading && (
        <div className="absolute inset-0 z-10 bg-slate-800 flex items-center justify-center text-white/70">
          地图加载中…
        </div>
      )}
      <div
        key={retryKey}
        ref={containerRef}
        className="absolute inset-0 bg-slate-800"
        style={{ minHeight: 200 }}
      />
    </div>
  );
}
