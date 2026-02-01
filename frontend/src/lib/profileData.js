/**
 * Shared profile data: MOCK_USERS + SOUL_COLORS for ProfilePage and MushiInfoCard full view
 */

export const MOCK_USERS = {
  '1': { name: 'Alex', address: '0x1111111111111111111111111111111111111111', bio: 'Digital nomad in Chiang Mai, coffee & code', soulType: 'Degen', status: 'Having coffee ☕', isFriend: false, tags: ['Coffee', 'Photography', 'Writing'], following: 12, followers: 89, activityCount: 28, activityLabel: 'Posts' },
  '2': { name: 'Sam', address: '0x2222222222222222222222222222222222222222', bio: 'Yellow Coworking regular', soulType: 'Builder', status: 'Yellow Coworking', isFriend: true, tags: ['Coworking', 'Design', 'Running'], following: 24, followers: 156, activityCount: 14, activityLabel: 'Check-ins' },
  '3': { name: 'Jade', address: '0x3333333333333333333333333333333333333333', bio: 'Coding & building', soulType: 'Explorer', status: 'Coding 💻', isFriend: false, tags: ['Code', 'Yoga', 'Foodie'], following: 8, followers: 42, activityCount: 6, activityLabel: 'Trips' },
  'mushi-1': { name: 'CryptoNomad', address: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t', bio: 'DeFi, Travel & Coffee enthusiast in Chiang Mai', soulType: 'Explorer', status: 'Exploring cafés ☕', isFriend: false, tags: ['DeFi', 'Travel', 'Coffee'], following: 18, followers: 92, activityCount: 12, activityLabel: 'Explorations' },
  'mushi-2': { name: 'DegenKing', address: '0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x', bio: 'NFTs, Memes & Gaming. Here for the vibes', soulType: 'Degen', status: 'Grinding in-game 🎮', isFriend: true, tags: ['NFTs', 'Memes', 'Gaming'], following: 42, followers: 210, activityCount: 56, activityLabel: 'Moments' },
  'mushi-3': { name: 'WhaleWatcher', address: '0x9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b', bio: 'Analytics, Trading & on-chain data', soulType: 'Whale', status: 'Watching the charts 📊', isFriend: false, tags: ['Analytics', 'Trading', 'Data'], following: 8, followers: 156, activityCount: 8, activityLabel: 'Reports' },
  'mushi-4': { name: 'ArtistSoul', address: '0x3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f', bio: 'Generative Art, Music & Design', soulType: 'Artist', status: 'Making art 🎨', isFriend: false, tags: ['Generative Art', 'Music', 'Design'], following: 36, followers: 88, activityCount: 24, activityLabel: 'Works' },
  'mushi-5': { name: 'BuilderDAO', address: '0x7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j', bio: 'Smart Contracts, DAOs & Open Source', soulType: 'Builder', status: 'Buidling in the forest 🌲', isFriend: true, tags: ['Smart Contracts', 'DAOs', 'Open Source'], following: 24, followers: 120, activityCount: 36, activityLabel: 'Contributions' },
  sherry: { name: 'Sherry', address: '0x5300000000000000000000000000000000000001', bio: 'Based in Chengdu, Sichuan. Web3 & specialty coffee.', soulType: 'Explorer', status: 'Chengdu, Sichuan', isFriend: true, tags: ['Coworking', 'Coffee', 'Web3'], following: 24, followers: 88, activityCount: 18, activityLabel: 'Check-ins' },
};

export const SOUL_COLORS = {
  Degen: { primary: '#9945FF', glow: '#9945FF40' },
  Builder: { primary: '#00D4FF', glow: '#00D4FF40' },
  Explorer: { primary: '#A3FF12', glow: '#A3FF1240' },
  Whale: { primary: '#FFD700', glow: '#FFD70040' },
  Artist: { primary: '#FF6B9D', glow: '#FF6B9D40' },
};
export const defaultSoul = { primary: '#A3FF12', glow: '#A3FF1240' };

export function shortId(address) {
  if (!address || !address.startsWith('0x')) return '—';
  return `${address.slice(2, 6)}…${address.slice(-4)}`;
}

export function handleFromName(name) {
  return name ? `@${name.toLowerCase().replace(/\s/g, '_')}` : '@mushi';
}
