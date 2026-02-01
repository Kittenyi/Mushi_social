import { useState, useEffect, Component, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import AuroraBackground from '@/components/3d/AuroraBackground';
import MushiAvatar3D from '@/components/3d/MushiAvatar3D';

/** WebGL/3D 出错时显示备用内容，避免人物介绍抽屉整块白屏 */
class Drawer3DFallback extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError = () => ({ hasError: true });
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// Soul type labels and colors
const SOUL_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  degen: { label: 'Degen', emoji: '🎰', color: '#9945FF' },
  whale: { label: 'Whale', emoji: '🐋', color: '#FFD700' },
  builder: { label: 'Builder', emoji: '🔧', color: '#00D4FF' },
  artist: { label: 'Artist', emoji: '🎨', color: '#FF6B9D' },
  explorer: { label: 'Explorer', emoji: '🧭', color: '#A3FF12' },
  collector: { label: 'Collector', emoji: '💎', color: '#FFD700' },
};

export interface MushiProfile {
  id: string;
  nickname: string;
  soulType: string;
  gender?: 'rounded' | 'angular';
  interests?: string[];
  walletLabel?: string;
  isFriend?: boolean;
}

interface MushiProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MushiProfile | null;
  onSayHi?: (profileId: string) => void;
  onMessage?: (profileId: string) => void;
  onGoToTa?: (profileId: string) => void;
}

// Spring animation config from memory
const springConfig = { stiffness: 300, damping: 20 };

const MushiProfileDrawer = ({
  isOpen,
  onClose,
  profile,
  onSayHi,
  onMessage,
  onGoToTa,
}: MushiProfileDrawerProps) => {
  const [breathPhase, setBreathPhase] = useState(0);

  // Breathing light effect
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setBreathPhase((prev) => (prev + 0.05) % (Math.PI * 2));
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen]);

  const soulInfo = profile ? SOUL_LABELS[profile.soulType] || SOUL_LABELS.explorer : null;
  const breathIntensity = Math.sin(breathPhase) * 0.3 + 0.7;

  return (
    <AnimatePresence>
      {isOpen && profile && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(5, 10, 5, 0.8)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Full-screen drawer */}
          <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', ...springConfig }}
          >
            {/* Glassmorphism container */}
            <div
              className="flex-1 flex flex-col relative overflow-hidden"
              style={{
                background: 'rgba(10, 26, 16, 0.85)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
              }}
            >
              {/* Breathing light border effect */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: `
                    inset 0 0 60px rgba(163, 255, 18, ${0.1 * breathIntensity}),
                    inset 0 0 120px rgba(139, 92, 246, ${0.08 * breathIntensity}),
                    0 0 40px rgba(163, 255, 18, ${0.15 * breathIntensity}),
                    0 0 80px rgba(139, 92, 246, ${0.1 * breathIntensity})
                  `,
                }}
              />

              {/* Top edge glow line */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: `linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(163, 255, 18, ${0.6 * breathIntensity}) 20%,
                    rgba(139, 92, 246, ${0.8 * breathIntensity}) 50%,
                    rgba(163, 255, 18, ${0.6 * breathIntensity}) 80%,
                    transparent 100%
                  )`,
                }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }}
              />

              {/* Aurora background（WebGL 异常时用渐变替代） */}
              <Drawer3DFallback
                fallback={
                  <div
                    className="absolute inset-0 opacity-60"
                    style={{
                      background: `linear-gradient(135deg, ${soulInfo?.color || '#A3FF12'}20, #8B5CF620)`,
                    }}
                  />
                }
              >
                <div className="absolute inset-0 opacity-40">
                  <AuroraBackground
                    primaryColor={soulInfo?.color || '#A3FF12'}
                    secondaryColor="#8B5CF6"
                  />
                </div>
              </Drawer3DFallback>

              {/* Close button */}
              <motion.button
                className="absolute top-6 right-6 z-10 p-3 rounded-full"
                style={{
                  background: 'rgba(10, 26, 16, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(163, 255, 18, 0.2)',
                }}
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', ...springConfig }}
              >
                <X className="w-6 h-6 text-primary/70" />
              </motion.button>

              {/* Content */}
              <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">
                {/* 3D Avatar（WebGL 异常时用 emoji 替代，与 GitHub 版点头像进人物介绍一致） */}
                <Drawer3DFallback
                  fallback={
                    <motion.div
                      className="w-32 h-32 rounded-full flex items-center justify-center text-6xl border-2 border-primary/30"
                      style={{ background: 'rgba(163, 255, 18, 0.15)' }}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', ...springConfig, delay: 0.2 }}
                    >
                      🍄
                    </motion.div>
                  }
                >
                  <motion.div
                    className="w-64 h-64 md:w-80 md:h-80"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', ...springConfig, delay: 0.2 }}
                  >
                    <MushiAvatar3D
                      soulType={profile.soulType}
                      gender={profile.gender || 'rounded'}
                    />
                  </motion.div>
                </Drawer3DFallback>

                {/* Name */}
                <motion.h2
                  className="text-3xl md:text-4xl font-serif text-primary mt-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', ...springConfig, delay: 0.3 }}
                >
                  {profile.nickname}
                </motion.h2>

                {/* Wallet label */}
                {profile.walletLabel && (
                  <motion.p
                    className="text-muted-foreground/50 text-sm mt-1 font-mono"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', ...springConfig, delay: 0.35 }}
                  >
                    {profile.walletLabel}
                  </motion.p>
                )}

                {/* Soul labels */}
                <motion.div
                  className="flex flex-wrap gap-2 mt-6 justify-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', ...springConfig, delay: 0.4 }}
                >
                  {soulInfo && (
                    <span
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{
                        background: `rgba(${parseInt(soulInfo.color.slice(1, 3), 16)}, ${parseInt(soulInfo.color.slice(3, 5), 16)}, ${parseInt(soulInfo.color.slice(5, 7), 16)}, 0.2)`,
                        border: `1px solid ${soulInfo.color}40`,
                        color: soulInfo.color,
                      }}
                    >
                      {soulInfo.emoji} {soulInfo.label}
                    </span>
                  )}

                  {/* Interest tags */}
                  {profile.interests?.slice(0, 3).map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-full text-xs bg-muted/20 text-muted-foreground/70 border border-border/20"
                    >
                      {interest}
                    </span>
                  ))}
                </motion.div>
              </div>

              {/* Bottom action buttons */}
              <motion.div
                className="p-6 pb-10 flex gap-4 justify-center relative z-10"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', ...springConfig, delay: 0.5 }}
              >
                {profile.isFriend ? (
                  /* Friend button */
                  <GlassButton
                    onClick={() => onGoToTa?.(profile.id)}
                    primary
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    Go to Ta
                  </GlassButton>
                ) : (
                  /* Non-friend buttons */
                  <>
                    <GlassButton
                      onClick={() => onSayHi?.(profile.id)}
                      icon={<Sparkles className="w-5 h-5" />}
                    >
                      Say Hi
                    </GlassButton>
                    <GlassButton
                      onClick={() => onMessage?.(profile.id)}
                      primary
                      icon={<MessageCircle className="w-5 h-5" />}
                    >
                      Message
                    </GlassButton>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Glassmorphism button component
const GlassButton = ({
  children,
  onClick,
  primary = false,
  icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  icon?: React.ReactNode;
}) => {
  return (
    <motion.button
      className="relative px-8 py-4 rounded-2xl font-serif text-lg flex items-center gap-3 overflow-hidden"
      style={{
        background: primary
          ? 'linear-gradient(135deg, rgba(163, 255, 18, 0.2), rgba(139, 92, 246, 0.15))'
          : 'rgba(10, 26, 16, 0.6)',
        backdropFilter: 'blur(20px)',
        border: primary
          ? '1px solid rgba(163, 255, 18, 0.4)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        color: primary ? '#A3FF12' : 'rgba(255, 255, 255, 0.7)',
        boxShadow: primary
          ? '0 0 30px rgba(163, 255, 18, 0.2), inset 0 0 20px rgba(163, 255, 18, 0.05)'
          : '0 4px 20px rgba(0, 0, 0, 0.2)',
      }}
      onClick={onClick}
      whileHover={{
        scale: 1.05,
        boxShadow: primary
          ? '0 0 40px rgba(163, 255, 18, 0.3), inset 0 0 30px rgba(163, 255, 18, 0.1)'
          : '0 8px 30px rgba(0, 0, 0, 0.3)',
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {icon}
      {children}
    </motion.button>
  );
};

export default MushiProfileDrawer;
