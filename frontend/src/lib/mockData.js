// Mock wallet labels (mushiverse-connect)

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
};

export const scanWallet = () => {
  return new Promise((resolve) => {
    const delay = 2000 + Math.random() * 1500;
    setTimeout(() => {
      const rand = Math.random();
      let label;
      if (rand < 0.5) label = 'Whale';
      else if (rand < 0.75) label = 'Degen';
      else label = 'Buidler';
      resolve(walletProfiles[label]);
    }, delay);
  });
};

export const getWalletProfile = (label) => walletProfiles[label] || walletProfiles.Buidler;
