/**
 * Mushiverse-style onboarding: 3D mushroom scan → /onboarding/result
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MushroomScene from '@/components/3d/MushroomModel';
import { scanWallet } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.5 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function OnboardingScanPage() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState(null);

  const handleEnter = async () => {
    setIsScanning(true);
    setScanProgress(0);
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const result = await scanWallet();
      clearInterval(progressInterval);
      setScanProgress(100);
      setScanResult(result);
      setTimeout(() => {
        navigate('/onboarding/result', { state: { scanResult: result } });
      }, 1500);
    } catch (error) {
      clearInterval(progressInterval);
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const mushroomColor = scanResult?.primaryColor || '#A3FF12';
  const mushroomSecondary = scanResult?.secondaryColor || '#8B5CF6';
  const mushroomGlow = scanResult?.glowColor || '#00D4FF';
  const isWhale = scanResult?.label === 'Whale';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <MushroomScene
          className="w-full h-full"
          showParticleField={true}
          color={mushroomColor}
          secondaryColor={mushroomSecondary}
          glowColor={mushroomGlow}
          showOrbitalRing={isWhale}
        />
      </div>

      <motion.div
        className="flex flex-col items-center max-w-lg w-full z-10 px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="h-48 md:h-64" />
        <motion.div variants={itemVariants} className="text-center mb-6">
          <p className="text-muted-foreground/60 text-xs tracking-[0.4em] uppercase mb-4 font-sans">
            Web3 Social Identity
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-[0.15em] text-foreground">
            Mushi
          </h1>
        </motion.div>
        <motion.p
          variants={itemVariants}
          className="text-muted-foreground/70 text-sm tracking-[0.08em] text-center mb-24 max-w-xs leading-relaxed font-light"
        >
          Discover your on-chain identity.
          <br />
          Connect. Evolve. Belong.
        </motion.p>

        <motion.div variants={itemVariants} className="text-center min-h-[120px]">
          <AnimatePresence mode="wait">
            {!isScanning && !scanResult && (
              <motion.button
                key="connect"
                onClick={handleEnter}
                className="group relative text-primary text-base tracking-[0.25em] font-serif font-light"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <span className="relative z-10">Connect Wallet</span>
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-px bg-primary/50"
                  initial={{ scaleX: 0.3, opacity: 0.3 }}
                  whileHover={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
                <motion.div
                  className="flex justify-center mt-6 opacity-50"
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg width="12" height="20" viewBox="0 0 12 20" fill="none" className="text-primary">
                    <path d="M6 0V18M6 18L1 13M6 18L11 13" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </motion.div>
              </motion.button>
            )}
            {isScanning && !scanResult && (
              <motion.div
                key="scanning"
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-muted-foreground/80 text-sm tracking-[0.2em] uppercase font-sans">
                  Scanning Wallet...
                </p>
                <div className="w-48">
                  <Progress value={scanProgress} className="h-1 bg-muted/30" />
                </div>
                <motion.p
                  className="text-muted-foreground/50 text-xs tracking-wider"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Analyzing on-chain activity
                </motion.p>
              </motion.div>
            )}
            {scanResult && (
              <motion.div
                key="result"
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <motion.p
                  className="text-2xl font-serif tracking-wide"
                  style={{ color: scanResult.primaryColor }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  {scanResult.displayName}
                </motion.p>
                <p className="text-muted-foreground/60 text-xs tracking-wider max-w-xs text-center">
                  {scanResult.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-24 flex items-center gap-8 text-muted-foreground/30 text-[10px] tracking-[0.2em] uppercase font-sans"
        >
          <span>MetaMask</span>
          <span className="text-muted-foreground/15">·</span>
          <span>WalletConnect</span>
          <span className="text-muted-foreground/15">·</span>
          <span>Coinbase</span>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1.5 }}
      />
    </div>
  );
}
