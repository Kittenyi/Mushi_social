import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { DEFAULT_CENTER } from '@/config/mapbox';

/** 地图上「我」的标记：显示 profile 头像或默认蘑菇，点击进入 Me 页 */
export function MeMarker({ map, position: positionProp, avatarUrl, onMeClick }) {
  const markerRef = useRef(null);
  const position = positionProp ?? DEFAULT_CENTER;

  useEffect(() => {
    if (!map) return;

    const el = document.createElement('div');
    el.className = 'me-marker';
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Go to Me');
    el.innerHTML = `
      <div class="me-marker-glow"></div>
      <div class="me-marker-ring"></div>
      <div class="me-marker-core"></div>
      <div class="me-marker-label">Me</div>
    `;

    const core = el.querySelector('.me-marker-core');
    if (core) {
      if (avatarUrl) {
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = 'Me';
        img.className = 'me-marker-avatar';
        core.appendChild(img);
      } else {
        core.textContent = '🍄';
      }
    }

    if (typeof onMeClick === 'function') {
      el.addEventListener('click', onMeClick);
    }

    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'center',
    })
      .setLngLat(position)
      .addTo(map);

    markerRef.current = marker;

    return () => {
      if (typeof onMeClick === 'function') {
        el.removeEventListener('click', onMeClick);
      }
      markerRef.current?.remove();
    };
  }, [map, position, avatarUrl, onMeClick]);

  return null;
}
