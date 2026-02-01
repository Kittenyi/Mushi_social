/**
 * 身份标签 (Soul Tags) - 与后端 soulBrain 判定逻辑对应
 * 参考：DAO Governor / Active Voter / Buidler / Degen / Whale / Alpha Hunter / Social Star / Newbie
 */
export const IDENTITY_TAGS = {
  DAO_GOVERNOR: { label: 'DAO Governor', color: 'gold' },
  ACTIVE_VOTER: { label: 'Active Voter', color: 'silver' },
  BUILDER: { label: 'Buidler 🛠️', color: 'amber' },
  DEGEN: { label: 'Degen ⚡', color: 'purple' },
  WHALE: { label: 'Whale 🐋', color: 'blue' },
  ALPHA_HUNTER: { label: 'Alpha Hunter', color: 'cyan' },
  SOCIAL_STAR: { label: 'Social Star', color: 'orange' },
  NEWBIE: { label: 'Newbie 🐣', color: 'green' },
  EXPLORER: { label: 'Explorer', color: 'gray' },
};

/** 后端 /api/soul/:address 返回的 tags 项 */
export function parseSoulTags(apiTags) {
  return Array.isArray(apiTags) ? apiTags : [];
}
