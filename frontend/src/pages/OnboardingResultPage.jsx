/**
 * Mushiverse-style onboarding result: nickname, gender, interests → /map
 * Integrates setOnboardingDone and useProfileStore for Mushi_social.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import MushroomScene from '@/components/3d/MushroomModel';
import { SceneErrorBoundary } from '@/components/SceneErrorBoundary';
import { Input } from '@/components/ui/input';
import { Check, Sparkles, User, Users, EyeOff } from 'lucide-react';
import { setOnboardingDone } from '@/lib/onboarding';
import { useProfileStore } from '@/stores/useProfileStore';

const springConfig = { stiffness: 300, damping: 20 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const genderOptions = [
  { id: 'feminine', label: 'Feminine', icon: Sparkles, morphFactor: 0, hue: 330 },
  { id: 'masculine', label: 'Masculine', icon: User, morphFactor: 0.8, hue: 220 },
  { id: 'nonbinary', label: 'Non-binary', icon: Users, morphFactor: 0.4, hue: 280 },
  { id: 'secret', label: 'Secret', icon: EyeOff, morphFactor: 0.2, hue: 180 },
];

const interestTags = [
  { id: 'defi', label: 'DeFi Degen', color: '#00D4FF' },
  { id: 'nft', label: 'NFT Collector', color: '#FF6B6B' },
  { id: 'dao', label: 'DAO Governor', color: '#8B5CF6' },
  { id: 'alpha', label: 'Alpha Hunter', color: '#FFD700' },
  { id: 'airdrop', label: 'Airdrop Farmer', color: '#A3FF12' },
  { id: 'buidler', label: 'Web3 Buidler', color: '#FF8C00' },
  { id: 'gamefi', label: 'GameFi Player', color: '#FF1493' },
  { id: 'security', label: 'Security Researcher', color: '#00FF7F' },
  { id: 'infra', label: 'Infrastructure Nerd', color: '#4169E1' },
  { id: 'zk', label: 'ZK Believer', color: '#9400D3' },
  { id: 'meme', label: 'Meme Enthusiast', color: '#FFE135' },
  { id: 'metaverse', label: 'Metaverse Resident', color: '#00CED1' },
];

const tagPositions = [
  { x: 0, y: 0, scale: 1.05 },
  { x: -100, y: -8, scale: 0.95 },
  { x: 105, y: 5, scale: 1 },
  { x: -50, y: 32, scale: 1 },
  { x: 60, y: -32, scale: 0.92 },
  { x: -115, y: 38, scale: 0.88 },
  { x: 120, y: -38, scale: 0.9 },
  { x: -15, y: -38, scale: 0.95 },
  { x: 30, y: 42, scale: 0.88 },
  { x: -85, y: -42, scale: 0.92 },
  { x: 90, y: 48, scale: 0.85 },
  { x: -40, y: 52, scale: 0.88 },
];

const defaultResult = {
  label: 'Buidler',
  displayName: '🛠️ Buidler',
  description: 'Active contributor to Web3 protocols and DAOs',
  primaryColor: '#A3FF12',
  secondaryColor: '#8B5CF6',
  glowColor: '#00D4FF',
};

export function OnboardingResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected } = useAccount();
  const { setDisplayName } = useProfileStore();
  const scanResult = location.state?.scanResult;
  const result = scanResult || defaultResult;

  const [nickname, setNickname] = useState('');
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isExiting, setIsExiting] = useState(false);
  const [triggerExplosion, setTriggerExplosion] = useState(false);

  const isWhale = result.label === 'Whale';
  const morphFactor = useMemo(() => {
    const g = genderOptions.find((x) => x.id === selectedGender);
    return g?.morphFactor ?? 0;
  }, [selectedGender]);
  const companionColors = useMemo(() => {
    return selectedInterests
      .map((id) => interestTags.find((t) => t.id === id)?.color)
      .filter(Boolean);
  }, [selectedInterests]);
  const dynamicColor = result.primaryColor;

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (!nickname.trim()) return;
    setTriggerExplosion(true);
  };

  const handleExplosionComplete = () => {
    setDisplayName(nickname.trim());
    if (!isConnected) {
      // 未连接真实钱包则先跳转欢迎页连接，不设置 onboarding done
      navigate('/', { replace: true });
      return;
    }
    setOnboardingDone();
    setIsExiting(true);
    setTimeout(() => {
      navigate('/map', {
        state: {
          nickname: nickname.trim(),
          gender: selectedGender,
          interests: selectedInterests,
          walletLabel: result.label,
          soulType: result.label?.toLowerCase() || 'explorer',
        },
      });
    }, 200);
  };

  const isValid = nickname.trim().length > 0;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="min-h-screen flex flex-col items-center relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="absolute inset-0 z-0">
            <SceneErrorBoundary>
              <MushroomScene
                className="w-full h-full"
                showParticleField={true}
                showMycelium={false}
                color={dynamicColor}
                secondaryColor={result.secondaryColor}
                glowColor={result.glowColor}
                showOrbitalRing={isWhale}
                morphFactor={morphFactor}
                companionColors={companionColors}
                triggerExplosion={triggerExplosion}
              onExplosionComplete={handleExplosionComplete}
            />
            </SceneErrorBoundary>
          </div>

          <div className="relative z-10 w-full max-w-2xl px-6 py-8 overflow-y-auto">
            <div className="h-48 md:h-56" />
            <motion.div variants={itemVariants} className="flex justify-center mb-4">
              <motion.div
                className="px-6 py-2 rounded-full backdrop-blur-xl border"
                style={{
                  backgroundColor: `${result.primaryColor}15`,
                  borderColor: `${result.primaryColor}40`,
                  boxShadow: `0 0 30px ${result.primaryColor}20`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 20px ${result.primaryColor}20`,
                    `0 0 40px ${result.primaryColor}30`,
                    `0 0 20px ${result.primaryColor}20`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <p className="text-lg font-serif tracking-wide" style={{ color: result.primaryColor }}>
                  {result.displayName}
                </p>
              </motion.div>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-muted-foreground/60 text-sm text-center mb-8 tracking-wide"
            >
              {result.description}
            </motion.p>

            <motion.div variants={itemVariants} className="mb-8">
              <label className="block text-muted-foreground/50 text-xs tracking-[0.2em] uppercase mb-4 text-center">
                Identity Expression
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {genderOptions.map((gender) => {
                  const isSelected = selectedGender === gender.id;
                  const Icon = gender.icon;
                  return (
                    <motion.button
                      key={gender.id}
                      onClick={() => setSelectedGender(gender.id)}
                      className={`relative p-4 rounded-2xl backdrop-blur-xl border flex flex-col items-center gap-2 transition-all duration-300 ${
                        isSelected ? 'border-primary/60' : 'border-border/20 hover:border-border/40'
                      }`}
                      style={{
                        backgroundColor: isSelected ? `${result.primaryColor}15` : 'rgba(255,255,255,0.03)',
                        boxShadow: isSelected
                          ? `0 0 25px ${result.primaryColor}25, inset 0 1px 0 rgba(255,255,255,0.1)`
                          : 'inset 0 1px 0 rgba(255,255,255,0.05)',
                        transform: isSelected ? 'perspective(500px) rotateX(5deg)' : 'none',
                      }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={springConfig}
                    >
                      {isSelected && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: `radial-gradient(circle at 50% 0%, ${result.primaryColor}20 0%, transparent 70%)`,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )}
                      <Icon
                        size={24}
                        className={isSelected ? 'text-primary' : 'text-muted-foreground/50'}
                      />
                      <span
                        className={`text-sm tracking-wide ${
                          isSelected ? 'text-primary' : 'text-muted-foreground/60'
                        }`}
                      >
                        {gender.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-8">
              <label className="block text-muted-foreground/50 text-xs tracking-[0.2em] uppercase mb-3 text-center">
                Your Alias
              </label>
              <Input
                type="text"
                placeholder="Enter your name..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="bg-background/30 backdrop-blur-xl border-border/30 text-center text-lg font-serif tracking-wide placeholder:text-muted-foreground/30 focus:border-primary/50 transition-colors h-14 rounded-2xl"
                style={{ boxShadow: nickname ? `0 0 20px ${result.primaryColor}10` : 'none' }}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="mb-10">
              <label className="block text-muted-foreground/50 text-xs tracking-[0.2em] uppercase mb-4 text-center">
                Web3 Interests
              </label>
              <div className="flex flex-wrap justify-center gap-2 md:hidden">
                {interestTags.map((tag) => {
                  const isSelected = selectedInterests.includes(tag.id);
                  return (
                    <motion.button
                      key={tag.id}
                      onClick={() => toggleInterest(tag.id)}
                      className="px-3 py-1.5 rounded-full text-xs font-sans tracking-wide backdrop-blur-xl border transition-all duration-300 whitespace-nowrap"
                      style={{
                        backgroundColor: isSelected ? `${tag.color}20` : 'rgba(255,255,255,0.03)',
                        borderColor: isSelected ? tag.color : 'rgba(255,255,255,0.1)',
                        color: isSelected ? tag.color : 'rgba(255,255,255,0.5)',
                        boxShadow: isSelected ? `0 0 15px ${tag.color}35` : 'none',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={springConfig}
                    >
                      <span className="flex items-center gap-1">
                        {isSelected && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={springConfig}>
                            <Check size={12} />
                          </motion.span>
                        )}
                        {tag.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              <div className="hidden md:block relative h-[160px]">
                {interestTags.map((tag, index) => {
                  const isSelected = selectedInterests.includes(tag.id);
                  const pos = tagPositions[index];
                  return (
                    <motion.button
                      key={tag.id}
                      onClick={() => toggleInterest(tag.id)}
                      className="absolute px-4 py-2 rounded-full text-sm font-sans tracking-wide backdrop-blur-xl border transition-all duration-300 whitespace-nowrap"
                      style={{
                        left: `calc(50% + ${pos.x}px)`,
                        top: `calc(50% + ${pos.y}px)`,
                        transform: `translate(-50%, -50%) scale(${pos.scale})`,
                        backgroundColor: isSelected ? `${tag.color}20` : 'rgba(255,255,255,0.03)',
                        borderColor: isSelected ? tag.color : 'rgba(255,255,255,0.1)',
                        color: isSelected ? tag.color : 'rgba(255,255,255,0.5)',
                        boxShadow: isSelected
                          ? `0 0 20px ${tag.color}40, 0 0 40px ${tag.color}20`
                          : 'none',
                      }}
                      whileHover={{ scale: pos.scale * 1.1, boxShadow: `0 0 15px ${tag.color}30` }}
                      whileTap={{ scale: pos.scale * 0.95 }}
                      transition={springConfig}
                    >
                      <span className="flex items-center gap-1.5">
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={springConfig}
                          >
                            <Check size={14} />
                          </motion.span>
                        )}
                        {tag.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-center">
              <motion.button
                onClick={handleContinue}
                disabled={!isValid || triggerExplosion}
                className={`group relative text-base tracking-[0.15em] font-serif px-12 py-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
                  isValid && !triggerExplosion
                    ? 'border-primary/50 text-primary cursor-pointer'
                    : 'border-border/20 text-muted-foreground/30 cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: isValid ? `${result.primaryColor}15` : 'transparent',
                  boxShadow: isValid ? `0 0 40px ${result.primaryColor}20` : 'none',
                }}
                whileHover={isValid ? { scale: 1.02 } : {}}
                whileTap={isValid ? { scale: 0.98 } : {}}
                transition={springConfig}
              >
                <span className="relative z-10">Enter AuraCity</span>
                {isValid && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${result.primaryColor}15 0%, transparent 70%)`,
                    }}
                    animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            </motion.div>

            <motion.button
              variants={itemVariants}
              onClick={() => {
                setOnboardingDone();
                navigate('/map');
              }}
              className="w-full mt-6 text-muted-foreground/30 text-xs tracking-[0.15em] uppercase hover:text-muted-foreground/50 transition-colors text-center"
            >
              Skip for now
            </motion.button>
            <div className="h-8" />
          </div>

          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          />
        </motion.div>
      )}

      {isExiting && (
        <motion.div
          className="fixed inset-0 z-50 bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </AnimatePresence>
  );
}
