import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Soul type color mapping
const SOUL_COLORS: Record<string, string> = {
  degen: '#9945FF',    // Purple for Degen
  whale: '#FFD700',    // Gold for Whale
  builder: '#00D4FF',  // Cyan for Builder
  artist: '#FF6B9D',   // Pink for Artist
  explorer: '#A3FF12', // Neon green for Explorer
  default: '#A3FF12',  // Default neon green
};

interface Ripple {
  id: string;
  x: number;
  y: number;
  color: string;
}

interface MapRippleLayerProps {
  className?: string;
  soulType?: string;
  onRipple?: (x: number, y: number) => void;
}

type MapRippleEventDetail = {
  x: number;
  y: number;
  soulType?: string;
};

const MAP_RIPPLE_EVENT = 'mushi-map-ripple';

const MapRippleLayer = ({ 
  className = '', 
  soulType = 'default',
  onRipple,
}: MapRippleLayerProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const onMapRipple = (event: Event) => {
      const detail = (event as CustomEvent<MapRippleEventDetail>).detail;
      if (!detail) return;

      const effectiveSoulType = detail.soulType ?? soulType;
      const color = SOUL_COLORS[effectiveSoulType] || SOUL_COLORS.default;
      const id = `ripple-${Date.now()}-${Math.random()}`;

      setRipples((prev) => [...prev, { id, x: detail.x, y: detail.y, color }]);
      onRipple?.(detail.x, detail.y);

      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 2000);
    };

    window.addEventListener(MAP_RIPPLE_EVENT, onMapRipple as EventListener);
    return () => window.removeEventListener(MAP_RIPPLE_EVENT, onMapRipple as EventListener);
  }, [onRipple, soulType]);

  return (
    <div 
      className={`absolute inset-0 ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Three expanding rings */}
            {[0, 1, 2].map((ringIndex) => (
              <motion.div
                key={ringIndex}
                className="absolute rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  border: `2px solid ${ripple.color}`,
                  boxShadow: `0 0 20px ${ripple.color}40, inset 0 0 10px ${ripple.color}20`,
                }}
                initial={{ 
                  width: 10, 
                  height: 10, 
                  opacity: 0.8,
                }}
                animate={{ 
                  width: 200 + ringIndex * 60, 
                  height: 200 + ringIndex * 60, 
                  opacity: 0,
                }}
                transition={{ 
                  duration: 1.5 + ringIndex * 0.3,
                  delay: ringIndex * 0.15,
                  ease: 'easeOut',
                }}
              />
            ))}
            
            {/* Center pulse */}
            <motion.div
              className="absolute rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: ripple.color,
                boxShadow: `0 0 30px ${ripple.color}, 0 0 60px ${ripple.color}80`,
              }}
              initial={{ width: 20, height: 20, opacity: 1 }}
              animate={{ width: 40, height: 40, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MapRippleLayer;
