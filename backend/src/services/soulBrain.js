/**
 * 灵魂分类 (The Brain) - 身份标签判定逻辑矩阵
 * 连接钱包后根据 Miner 原始数据输出 Soul 标签
 * 参考：DAO Governor / Active Voter / Buidler / Degen / Whale / Alpha Hunter / Social Star / Newbie
 */

/** 蓝筹 NFT 合约（可扩展） */
const BLUE_CHIP_CONTRACTS = [
  '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', // BAYC
  '0x60e4d786628fea6478f785a6d7e704777c86a7c6', // MAYC
  '0xed5af388653567af2f388e6224dc7c4b3241c544', // Azuki
];

/**
 * 根据原始数据输出 Soul 标签列表（与身份矩阵一致）
 * @param {Object} rawData - getRawIdentityData 的返回值（Web3.bio + Snapshot + Alchemy + Tally）
 * @returns {Array<{ label: string, color: string }>}
 */
export function classifySoul(rawData) {
  if (!rawData) return [{ label: 'Explorer', color: 'gray' }];

  const {
    social = [],
    txCount = 0,
    nfts = [],
    voteCount = 0,
    proposalCount = 0,
    accountAgeDays,
    isDeployer = false,
    hasAirdropNFT = false,
  } = rawData;
  const tags = [];

  // 1. DAO Governor：治理发起者（Tally / Aave / Uniswap / ENS 提案）
  if (proposalCount > 0) {
    tags.push({ label: 'DAO Governor', color: 'gold' });
  }

  // 2. Active Voter：近 6 月内 Snapshot 投票 > 5 或 Gitcoin 捐赠投票
  if (voteCount > 5) {
    tags.push({ label: 'Active Voter', color: 'silver' });
  }

  // 3. Buidler：合约部署者（to === null）或持有 Gitcoin Passport
  if (isDeployer) {
    tags.push({ label: 'Buidler 🛠️', color: 'emerald' });
  }

  // 4. Degen：高频交易，月均交易极高
  if (txCount > 500) {
    tags.push({ label: 'Degen ⚡', color: 'purple' });
  }

  // 5. Whale：蓝筹 NFT 或净值 > 50k（净值需 Debank，此处仅蓝筹）
  const hasBlueChip = nfts.some(
    (n) => n.contract && BLUE_CHIP_CONTRACTS.includes(String(n.contract).toLowerCase())
  );
  if (hasBlueChip) {
    tags.push({ label: 'Whale 🐋', color: 'blue' });
  }

  // 6. Alpha Hunter：L2 空投凭证 / 黑客松 OAT（Galxe 等）
  if (hasAirdropNFT) {
    tags.push({ label: 'Alpha Hunter', color: 'cyan' });
  }

  // 7. Social Star：Farcaster 或 Lens 粉丝数高（Web3.bio 返回 social.follower）
  const fcProfile = social.find((p) => (p.platform || '').toLowerCase() === 'farcaster');
  const lensProfile = social.find((p) => (p.platform || '').toLowerCase() === 'lens');
  const followerCount =
    Number(fcProfile?.social?.follower ?? fcProfile?.follower_count ?? fcProfile?.followers ?? 0) ||
    Number(lensProfile?.social?.follower ?? lensProfile?.follower_count ?? lensProfile?.followers ?? 0);
  if (followerCount > 500) {
    tags.push({ label: 'Social Star', color: 'orange' });
  }

  // 8. Newbie：钱包 < 30 天且交互少（协议数 < 3 用 txCount 近似）
  if (accountAgeDays != null && accountAgeDays < 30 && txCount < 50) {
    tags.push({ label: 'Newbie 🐣', color: 'green' });
  }

  return tags.length > 0 ? tags : [{ label: 'Explorer', color: 'gray' }];
}
