// Soul 展示配置（与后端 soulBrain 标签对应，用于 Onboarding 结果页）

const COLOR_MAP = {
  gold: ['#FFD700', '#FFA500', '#FFEC8B'],
  blue: ['#00D4FF', '#0080FF', '#80D0FF'],
  purple: ['#8B5CF6', '#A855F7', '#C4B5FD'],
  emerald: ['#A3FF12', '#22C55E', '#00D4FF'],
  gray: ['#94A3B8', '#64748B', '#CBD5E1'],
  silver: ['#C0C0C0', '#94A3B8', '#E2E8F0'],
  cyan: ['#00D4FF', '#06B6D4', '#67E8F9'],
  orange: ['#FF8C00', '#F97316', '#FDBA74'],
  green: ['#22C55E', '#16A34A', '#86EFAC'],
};

export const walletProfiles = {
  Whale: {
    label: 'Whale',
    displayName: '🐋 Whale',
    description: 'High-value holder with significant on-chain assets',
    primaryColor: '#FFD700',
    secondaryColor: '#FFA500',
    glowColor: '#FFEC8B',
  },
  Degen: {
    label: 'Degen',
    displayName: '🎰 Degen',
    description: 'Risk-taking trader with diverse DeFi activity',
    primaryColor: '#FF1493',
    secondaryColor: '#8B5CF6',
    glowColor: '#FF69B4',
  },
  Buidler: {
    label: 'Buidler',
    displayName: '🛠️ Buidler',
    description: 'Active contributor to Web3 protocols and DAOs',
    primaryColor: '#A3FF12',
    secondaryColor: '#8B5CF6',
    glowColor: '#00D4FF',
  },
  Explorer: {
    label: 'Explorer',
    displayName: '🧭 Explorer',
    description: 'Discovering Web3 step by step',
    primaryColor: '#A3FF12',
    secondaryColor: '#8B5CF6',
    glowColor: '#00D4FF',
  },
  'DAO Governor': {
    label: 'DAO Governor',
    displayName: '🏛️ DAO Governor',
    description: 'Active in protocol governance and proposals',
    primaryColor: '#FFD700',
    secondaryColor: '#FFA500',
    glowColor: '#FFEC8B',
  },
  'Active Voter': {
    label: 'Active Voter',
    displayName: '🗳️ Active Voter',
    description: 'Participates in Snapshot and community votes',
    primaryColor: '#94A3B8',
    secondaryColor: '#64748B',
    glowColor: '#E2E8F0',
  },
  'Alpha Hunter': {
    label: 'Alpha Hunter',
    displayName: '🎯 Alpha Hunter',
    description: 'Early to L2 airdrops and hackathon OATs',
    primaryColor: '#00D4FF',
    secondaryColor: '#06B6D4',
    glowColor: '#67E8F9',
  },
  'Social Star': {
    label: 'Social Star',
    displayName: '⭐ Social Star',
    description: 'Strong presence on Farcaster or Lens',
    primaryColor: '#F97316',
    secondaryColor: '#EA580C',
    glowColor: '#FDBA74',
  },
  Newbie: {
    label: 'Newbie',
    displayName: '🐣 Newbie',
    description: 'New to Web3, exploring the space',
    primaryColor: '#22C55E',
    secondaryColor: '#16A34A',
    glowColor: '#86EFAC',
  },
};

/** 从后端 Soul API 返回的 { address, raw, tags } 转成结果页需要的 { label, displayName, description, primaryColor, ... } */
export function soulToDisplay(soulData) {
  if (!soulData?.tags?.length) return walletProfiles.Explorer;
  const tag = soulData.tags[0];
  const labelKey = (tag.label || '').replace(/\s*[🐋🛠️⚡🐣🎯⭐🗳️🏛️]\s*/g, '').trim() || 'Explorer';
  const exact = walletProfiles[tag.label] || walletProfiles[labelKey];
  if (exact) return exact;
  const [primaryColor, secondaryColor, glowColor] = COLOR_MAP[tag.color] || COLOR_MAP.gray;
  return {
    label: tag.label,
    displayName: tag.label,
    description: 'On-chain identity from your wallet',
    primaryColor,
    secondaryColor,
    glowColor,
  };
}

export const getWalletProfile = (label) => {
  const key = (label || '').replace(/\s*[🐋🛠️⚡🐣🎯⭐🗳️🏛️]\s*/g, '').trim();
  return walletProfiles[key] || walletProfiles[label] || walletProfiles.Explorer;
};
