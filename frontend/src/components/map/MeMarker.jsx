import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { DEFAULT_CENTER } from '@/config/mapbox';

export function MeMarker({ map, position: positionProp }) {
  const markerRef = useRef(null);
  const position = positionProp ?? DEFAULT_CENTER;

  useEffect(() => {
    if (!map) return;

    const el = document.createElement('div');
    el.className = 'me-marker';
    el.innerHTML = `
      <div class="me-marker-glow"></div>
      <div class="me-marker-ring"></div>
      <div class="me-marker-core">🍄</div>
      <div class="me-marker-label">Me</div>
    `;

    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'center',
    })
      .setLngLat(position)
      .addTo(map);

    markerRef.current = marker;

    return () => {
      markerRef.current?.remove();
    };
  }, [map, position]);

  return null;
}
