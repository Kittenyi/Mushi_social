import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, DEFAULT_CENTER } from '@/config/mapbox';

mapboxgl.accessToken = MAPBOX_TOKEN;
const COMMUNITY_706_LOCATION: [number, number] = DEFAULT_CENTER as [number, number];

/** 真实街道图（Mapbox 官方，非虚拟） */
const STREETS_STYLE = 'mapbox://styles/mapbox/streets-v12?optimize=true';
const DARK_STYLE = 'mapbox://styles/mapbox/dark-v11?optimize=true';

const COLORS = {
  water: '#021019',
  landuse: '#0A1A10',
  roads: 'rgba(0, 212, 255, 0.4)',
  neonGlow: 'rgba(163, 255, 18, 0.4)',
  buildingBase: '#0A1A10',
  buildingTop: '#1A3A20',
};

interface ForestMapProps {
  className?: string;
  onZoomChange?: (zoom: number) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  onMapReady?: (map: mapboxgl.Map) => void;
  /** true = 真实街道图（Mapbox Streets）；false = 深色森林风格 */
  realMap?: boolean;
}

const ForestMap = ({
  className = '',
  onZoomChange,
  initialCenter = COMMUNITY_706_LOCATION,
  initialZoom = 14,
  onMapReady,
  realMap = true,
}: ForestMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pulseAnimationRef = useRef<number | null>(null);
  const isInitialized = useRef(false);
  const styleUrl = realMap ? STREETS_STYLE : DARK_STYLE;

  const handleZoomChange = useCallback(() => {
    if (map.current && onZoomChange) {
      onZoomChange(map.current.getZoom());
    }
  }, [onZoomChange]);

  useEffect(() => {
    if (!mapContainer.current || isInitialized.current) return;
    isInitialized.current = true;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: initialCenter,
      zoom: initialZoom,
      pitch: realMap ? 0 : 45,
      bearing: realMap ? 0 : -17.6,
      antialias: true,
      projection: 'mercator',
      fadeDuration: 0,
      preserveDrawingBuffer: true,
      refreshExpiredTiles: false,
      trackResize: true,
      renderWorldCopies: true,
    });

    map.current = mapInstance;

    mapInstance.on('load', () => {
      mapInstance.scrollZoom.enable();
      mapInstance.dragPan.enable();
      mapInstance.doubleClickZoom.enable();
      mapInstance.boxZoom.enable();
      mapInstance.keyboard.enable();
      mapInstance.touchZoomRotate.enable();

      if (!realMap) {
        applyForestTheme(mapInstance);
        addSkyAndLighting(mapInstance);
        add3DBuildingsWithGlow(mapInstance);
        addPulseEffect(mapInstance);
      }

      handleZoomChange();
      onMapReady?.(mapInstance);
    });

    mapInstance.on('zoom', handleZoomChange);
    mapInstance.on('zoomend', handleZoomChange);

    mapInstance.dragRotate.disable();
    mapInstance.touchZoomRotate.disableRotation();

    return () => {
      if (pulseAnimationRef.current) {
        cancelAnimationFrame(pulseAnimationRef.current);
        pulseAnimationRef.current = null;
      }
      mapInstance.remove();
      map.current = null;
      isInitialized.current = false;
    };
  }, []);

  function applyForestTheme(mapInstance: mapboxgl.Map) {
    const layers = mapInstance.getStyle()?.layers || [];
    layers.forEach((layer) => {
      const layerId = layer.id;
      const layerType = layer.type;
      if (layerId.includes('water') && layerType === 'fill') {
        mapInstance.setPaintProperty(layerId, 'fill-color', COLORS.water);
      }
      if ((layerId.includes('landuse') || layerId.includes('landcover') || layerId.includes('park') || layerId.includes('grass')) && layerType === 'fill') {
        mapInstance.setPaintProperty(layerId, 'fill-color', COLORS.landuse);
      }
      if (layerId.includes('waterway') && layerType === 'line') {
        try {
          mapInstance.setPaintProperty(layerId, 'line-color', COLORS.water);
        } catch {
          // ignore
        }
      }
      if ((layerId.includes('poi') || layerId.includes('place-label')) && layerType === 'symbol') {
        mapInstance.setLayoutProperty(layerId, 'visibility', 'none');
      }
      if (layerId.includes('road') && layerType === 'line') {
        const isMainRoad = layerId.includes('motorway') || layerId.includes('trunk') || layerId.includes('primary') || layerId.includes('secondary');
        if (isMainRoad) {
          mapInstance.setPaintProperty(layerId, 'line-color', COLORS.roads);
          mapInstance.setPaintProperty(layerId, 'line-opacity', 0.8);
        } else {
          mapInstance.setPaintProperty(layerId, 'line-opacity', 0.15);
          mapInstance.setPaintProperty(layerId, 'line-color', '#0A1A10');
        }
      }
      if ((layerId === 'background' || layerId.includes('land')) && (layerType === 'background' || layerType === 'fill')) {
        try {
          mapInstance.setPaintProperty(layerId, 'background-color', COLORS.landuse);
        } catch {
          try {
            mapInstance.setPaintProperty(layerId, 'fill-color', COLORS.landuse);
          } catch {
            // ignore
          }
        }
      }
    });
  }

  function addSkyAndLighting(mapInstance: mapboxgl.Map) {
    if (!mapInstance.getLayer('sky')) {
      mapInstance.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 5,
          'sky-atmosphere-color': '#021019',
          'sky-atmosphere-halo-color': '#0A1A10',
        },
      });
    }
    mapInstance.setLights([
      { id: 'ambient', type: 'ambient', properties: { color: '#0A1A10', intensity: 0.3 } },
      { id: 'directional', type: 'directional', properties: { color: '#A3FF12', intensity: 0.4, direction: [200, 40], 'cast-shadows': true, 'shadow-intensity': 0.8 } },
    ]);
  }

  function add3DBuildingsWithGlow(mapInstance: mapboxgl.Map) {
    const addLayers = () => {
      if (mapInstance.getLayer('3d-buildings-glow')) return;
      const layers = mapInstance.getStyle()?.layers;
      let labelLayerId: string | undefined;
      for (const layer of layers || []) {
        if (layer.type === 'symbol' && layer.layout?.['text-field']) {
          labelLayerId = layer.id;
          break;
        }
      }
      mapInstance.addLayer(
        {
          id: '3d-buildings-glow',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': COLORS.neonGlow,
            'fill-extrusion-height': ['interpolate', ['exponential', 1.5], ['zoom'], 15, 0, 15.5, ['*', ['get', 'height'], 1.02], 18, ['*', ['get', 'height'], 1.05]],
            'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.5, ['get', 'min_height']],
            'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 15, 0, 16, 0.15, 18, 0.25],
          },
        },
        labelLayerId
      );
      mapInstance.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'height'], 0, COLORS.buildingBase, 20, '#0D2515', 50, COLORS.buildingTop, 100, '#2A5A30'],
            'fill-extrusion-height': ['interpolate', ['exponential', 1.5], ['zoom'], 15, 0, 15.5, ['get', 'height'], 18, ['*', ['get', 'height'], 1.1]],
            'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.5, ['get', 'min_height']],
            'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.5, 0.6, 18, 0.85],
            'fill-extrusion-vertical-gradient': true,
          },
        },
        labelLayerId
      );
      mapInstance.addLayer(
        {
          id: '3d-buildings-edge',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'line',
          minzoom: 15.5,
          paint: {
            'line-color': ['interpolate', ['linear'], ['zoom'], 15.5, 'rgba(163, 255, 18, 0.2)', 17, 'rgba(163, 255, 18, 0.5)', 19, 'rgba(163, 255, 18, 0.7)'],
            'line-width': ['interpolate', ['linear'], ['zoom'], 15.5, 0.5, 18, 1.5],
            'line-opacity': ['interpolate', ['linear'], ['zoom'], 15.5, 0, 16, 0.4, 18, 0.8],
          },
        },
        labelLayerId
      );
    };
    if (mapInstance.isStyleLoaded()) addLayers();
    else mapInstance.once('styledata', addLayers);
  }

  function addPulseEffect(mapInstance: mapboxgl.Map) {
    const pulseData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: COMMUNITY_706_LOCATION }, properties: { ring: 1 } },
        { type: 'Feature', geometry: { type: 'Point', coordinates: COMMUNITY_706_LOCATION }, properties: { ring: 2 } },
        { type: 'Feature', geometry: { type: 'Point', coordinates: COMMUNITY_706_LOCATION }, properties: { ring: 3 } },
      ],
    };
    mapInstance.addSource('pulse-source', { type: 'geojson', data: pulseData });
    for (let i = 1; i <= 3; i++) {
      mapInstance.addLayer({
        id: `pulse-ring-${i}`,
        type: 'circle',
        source: 'pulse-source',
        filter: ['==', ['get', 'ring'], i],
        paint: {
          'circle-radius': 20,
          'circle-color': 'transparent',
          'circle-stroke-color': 'rgba(163, 255, 18, 0.6)',
          'circle-stroke-width': 2,
          'circle-opacity': 0.8,
        },
      });
    }
    mapInstance.addLayer({
      id: 'pulse-center',
      type: 'circle',
      source: 'pulse-source',
      filter: ['==', ['get', 'ring'], 1],
      paint: { 'circle-radius': 8, 'circle-color': 'rgba(163, 255, 18, 0.8)', 'circle-blur': 0.5 },
    });
    let startTime = performance.now();
    let lastFrame = 0;
    const animatePulse = (timestamp: number) => {
      if (timestamp - lastFrame < 33) {
        pulseAnimationRef.current = requestAnimationFrame(animatePulse);
        return;
      }
      lastFrame = timestamp;
      const elapsed = timestamp - startTime;
      for (let i = 1; i <= 3; i++) {
        const delay = (i - 1) * 500;
        const phase = ((elapsed + delay) % 3000) / 3000;
        const radius = 20 + phase * 80;
        const opacity = 0.8 * (1 - phase);
        if (mapInstance.getLayer(`pulse-ring-${i}`)) {
          mapInstance.setPaintProperty(`pulse-ring-${i}`, 'circle-radius', radius);
          mapInstance.setPaintProperty(`pulse-ring-${i}`, 'circle-stroke-opacity', opacity);
        }
      }
      const glowPhase = (elapsed % 2000) / 2000;
      const glowRadius = 8 + Math.sin(glowPhase * Math.PI * 2) * 4;
      if (mapInstance.getLayer('pulse-center')) {
        mapInstance.setPaintProperty('pulse-center', 'circle-radius', glowRadius);
      }
      pulseAnimationRef.current = requestAnimationFrame(animatePulse);
    };
    pulseAnimationRef.current = requestAnimationFrame(animatePulse);
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default ForestMap;
