import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface SabaiStatusBadgeProps {
  className?: string;
}

const SabaiStatusBadge = ({ className = '' }: SabaiStatusBadgeProps) => {
  const [showWelcome, setShowWelcome] = useState(false);

  const handleClick = () => {
    setShowWelcome(true);
    setTimeout(() => setShowWelcome(false), 3000);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Badge */}
      <motion.button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border border-primary/20 cursor-pointer"
        style={{
          backgroundColor: 'rgba(10, 26, 16, 0.8)',
          boxShadow: '0 0 20px rgba(163, 255, 18, 0.1)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-primary"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
        />
        <span className="text-primary text-sm font-serif tracking-wide">
          Sabai Chiang Mai
        </span>
        <MapPin className="h-3.5 w-3.5 text-primary/70" />
      </motion.button>

      {/* Thai welcome animation overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop glow */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at center, rgba(163, 255, 18, 0.15) 0%, transparent 50%)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Main Thai text */}
            <motion.div
              className="relative"
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            >
              {/* Glow effect behind text */}
              <motion.div
                className="absolute inset-0 blur-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(163, 255, 18, 0.5), rgba(0, 212, 255, 0.3))',
                  transform: 'scale(2)',
                }}
                animate={{
                  scale: [2, 2.5, 2],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                }}
              />

              {/* Thai text */}
              <motion.h1
                className="relative text-6xl md:text-8xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #A3FF12 0%, #00D4FF 50%, #A3FF12 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 0 40px rgba(163, 255, 18, 0.5)',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                }}
              >
                สวัสดี
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-center text-primary/70 text-lg mt-4 font-serif"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Welcome to Chiang Mai
              </motion.p>
            </motion.div>

            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${30 + Math.random() * 40}%`,
                  boxShadow: '0 0 10px #A3FF12',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  y: [0, -50 - Math.random() * 50],
                  x: [(Math.random() - 0.5) * 30],
                }}
                transition={{
                  duration: 2,
                  delay: 0.2 + i * 0.1,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SabaiStatusBadge;
